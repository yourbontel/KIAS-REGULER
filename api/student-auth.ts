import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const hashPassword = (password: string, studentId: string) => {
  if (/^v1_[a-f0-9]{16}$/i.test(password)) return password;
  return scryptSync(password, studentId, 64).toString('hex');
};
const legacyHashPassword = (password: string) => {
  const input = `albarkah_shorof_2026:${password}`;
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const candidate = `v1_${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
  return candidate;
};
const signAdminSession = (username: string) => createHmac('sha256', process.env.SESSION_SECRET || process.env.DATABASE_URL || 'local-session-key').update(username).digest('hex');

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS student_credentials (
      student_id TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'POST' && req.body?.action === 'admin-login') {
    try {
      await ensureTable();
      await pool.query(`CREATE TABLE IF NOT EXISTS superadmin_credentials (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
      const { rows } = await pool.query('SELECT username, password_hash FROM superadmin_credentials LIMIT 1');
      const username = rows[0]?.username || process.env.SUPERADMIN_USERNAME || 'superadmin';
      const submittedUsername = req.body.username;
      const password = req.body.password;
      if (submittedUsername !== username || typeof password !== 'string') {
        return res.status(401).json({ error: 'Username atau password superadmin salah.' });
      }
      const valid = rows[0]
        ? (() => {
            const actual = Buffer.from(hashPassword(password, username), 'hex');
            const expected = Buffer.from(rows[0].password_hash, 'hex');
            return actual.length === expected.length && timingSafeEqual(actual, expected);
          })()
        : username === (process.env.SUPERADMIN_USERNAME || 'superadmin') && password === (process.env.SUPERADMIN_PASSWORD || 'albarkah2026');
      if (!valid) return res.status(401).json({ error: 'Username atau password superadmin salah.' });
      if (!rows[0]) {
        await pool.query('INSERT INTO superadmin_credentials (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING', [username, hashPassword(password, username)]);
      }
      return res.status(200).json({ ok: true, token: signAdminSession(username) });
    } catch (error) {
      console.error('Superadmin authentication failed', error);
      return res.status(500).json({ error: 'Layanan akun sedang bermasalah. Silakan coba lagi.' });
    }
  }
  if (req.method === 'GET') {
    try {
      await ensureTable();
      if (req.query.action === 'login') {
        const studentId = req.query.studentId;
        if (typeof studentId !== 'string' || !studentId) return res.status(400).json({ error: 'Data siswa tidak valid.' });
        const { rows } = await pool.query('SELECT 1 FROM student_credentials WHERE student_id = $1', [studentId]);
        return res.status(200).json({ hasPassword: Boolean(rows[0]) });
      }
      if (req.query.action === 'admin') {
        const { rows } = await pool.query('SELECT username FROM superadmin_credentials LIMIT 1').catch((): { rows: { username: string }[] } => ({ rows: [] }));
        return res.status(200).json({ username: rows[0]?.username || process.env.SUPERADMIN_USERNAME || 'superadmin' });
      }
      const { rows } = await pool.query('SELECT student_id FROM student_credentials');
      return res.status(200).json({ activeStudentIds: rows.map((row) => row.student_id) });
    } catch (error) {
      console.error('Failed to load student credentials', error);
      return res.status(500).json({ error: 'Gagal memuat status akun siswa.' });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Metode tidak didukung.' });
  }

  const { action, studentId, password, newPassword } = req.body ?? {};
  if (action === 'import-legacy') {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS superadmin_credentials (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
      const { rows } = await pool.query('SELECT username FROM superadmin_credentials LIMIT 1');
      const adminUsername = rows[0]?.username || process.env.SUPERADMIN_USERNAME || 'superadmin';
      const provided = req.headers.authorization?.replace(/^Bearer\\s+/i, '') || '';
      const expected = signAdminSession(adminUsername);
      const actual = Buffer.from(provided);
      const expectedBuffer = Buffer.from(expected);
      if (actual.length !== expectedBuffer.length || !timingSafeEqual(actual, expectedBuffer)) {
        return res.status(401).json({ error: 'Sesi superadmin tidak valid.' });
      }
      const hashes = req.body.passwordHashes;
      if (!hashes || typeof hashes !== 'object' || Array.isArray(hashes)) return res.status(400).json({ error: 'Data migrasi tidak valid.' });
      for (const [id, legacyHash] of Object.entries(hashes)) {
        if (typeof legacyHash !== 'string' || !/^v1_[a-f0-9]{16}$/i.test(legacyHash) || id.length > 128) continue;
        await pool.query('INSERT INTO student_credentials (student_id, password_hash) VALUES ($1, $2) ON CONFLICT (student_id) DO NOTHING', [id, legacyHash]);
      }
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Legacy credential import failed', error);
      return res.status(500).json({ error: 'Migrasi akun lama gagal.' });
    }
  }
  if (typeof studentId !== 'string' || !studentId || studentId.length > 128) {
    return res.status(400).json({ error: 'Data siswa tidak valid.' });
  }

  try {
    await ensureTable();
    if (action === 'register') {
      if (typeof newPassword !== 'string' || newPassword.length < 4 || newPassword.length > 256) {
        return res.status(400).json({ error: 'Password minimal 4 karakter.' });
      }
      const legacyHash = legacyHashPassword(newPassword);
      const result = await pool.query(
        'INSERT INTO student_credentials (student_id, password_hash) VALUES ($1, $2) ON CONFLICT (student_id) DO NOTHING RETURNING student_id',
        [studentId, legacyHash]
      );
      if (result.rowCount === 0) {
        return res.status(409).json({ error: 'Siswa ini sudah memiliki password. Silakan login menggunakan password Anda.' });
      }
      return res.status(200).json({ ok: true });
    }

    if (action === 'login') {
      if (typeof password !== 'string') return res.status(400).json({ error: 'Masukkan password Anda.' });
      await pool.query(`CREATE TABLE IF NOT EXISTS superadmin_credentials (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
      const { rows: adminRows } = await pool.query('SELECT username, password_hash FROM superadmin_credentials LIMIT 1');
      const admin = adminRows[0];
      if (admin && studentId === 'superadmin') {
        const actual = Buffer.from(hashPassword(password, admin.username), 'hex');
        const expected = Buffer.from(admin.password_hash, 'hex');
        if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
          return res.status(401).json({ error: 'Password superadmin salah.' });
        }
        return res.status(200).json({ ok: true });
      }
      const { rows } = await pool.query(
        'SELECT password_hash FROM student_credentials WHERE student_id = $1',
        [studentId]
      );
      if (!rows[0]) return res.status(404).json({ error: 'Akun belum memiliki password. Silakan buat password baru.' });
      const actual = Buffer.from(hashPassword(password, studentId), 'hex');
      const expected = Buffer.from(rows[0].password_hash, 'hex');
      const legacyActual = Buffer.from(legacyHashPassword(password));
      const legacyExpected = Buffer.from(rows[0].password_hash);
      const validLegacy = rows[0].password_hash.startsWith('v1_') && legacyActual.length === legacyExpected.length && timingSafeEqual(legacyActual, legacyExpected);
      const validModern = actual.length === expected.length && timingSafeEqual(actual, expected);
      if (!validLegacy && !validModern) {
        return res.status(401).json({ error: 'Password salah. Silakan coba lagi atau hubungi Superadmin untuk reset.' });
      }
      if (validLegacy) await pool.query('UPDATE student_credentials SET password_hash = $2, updated_at = NOW() WHERE student_id = $1', [studentId, scryptSync(password, studentId, 64).toString('hex')]);
      return res.status(200).json({ ok: true });
    }

    if (action === 'change') {
      if (typeof password !== 'string' || typeof newPassword !== 'string' || newPassword.length < 4 || newPassword.length > 256) {
        return res.status(400).json({ error: 'Password baru minimal 4 karakter.' });
      }
      const { rows } = await pool.query(
        'SELECT password_hash FROM student_credentials WHERE student_id = $1',
        [studentId]
      );
      if (!rows[0]) return res.status(404).json({ error: 'Akun belum memiliki password.' });
      const actual = Buffer.from(hashPassword(password, studentId), 'hex');
      const expected = Buffer.from(rows[0].password_hash, 'hex');
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        return res.status(401).json({ error: 'Password saat ini salah.' });
      }
      await pool.query(
        'UPDATE student_credentials SET password_hash = $2, updated_at = NOW() WHERE student_id = $1',
        [studentId, scryptSync(newPassword, studentId, 64).toString('hex')]
      );
      return res.status(200).json({ ok: true });
    }

    if (action === 'reset') {
      const { rows } = await pool.query('SELECT username FROM superadmin_credentials LIMIT 1').catch((): { rows: { username: string }[] } => ({ rows: [] }));
      const adminUsername = rows[0]?.username || process.env.SUPERADMIN_USERNAME || 'superadmin';
      const provided = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
      const expected = signAdminSession(adminUsername);
      const actualBuffer = Buffer.from(provided);
      const expectedBuffer = Buffer.from(expected);
      if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
        return res.status(401).json({ error: 'Sesi superadmin tidak valid. Silakan login kembali.' });
      }
      await pool.query('DELETE FROM student_credentials WHERE student_id = $1', [studentId]);
      return res.status(200).json({ ok: true });
    }

    if (action === 'change-admin-password') {
      await pool.query(`CREATE TABLE IF NOT EXISTS superadmin_credentials (
        username TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
      const { rows } = await pool.query('SELECT username, password_hash FROM superadmin_credentials LIMIT 1');
      const adminUsername = rows[0]?.username || process.env.SUPERADMIN_USERNAME || 'superadmin';
      const providedToken = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
      const expectedToken = signAdminSession(adminUsername);
      const providedBuffer = Buffer.from(providedToken);
      const expectedTokenBuffer = Buffer.from(expectedToken);
      if (providedBuffer.length !== expectedTokenBuffer.length || !timingSafeEqual(providedBuffer, expectedTokenBuffer)) {
        return res.status(401).json({ error: 'Sesi superadmin tidak valid. Silakan login kembali.' });
      }
      const storedHash = rows[0]?.password_hash;
      const currentHash = hashPassword(password || '', adminUsername);
      const actual = Buffer.from(currentHash, 'hex');
      const expected = storedHash ? Buffer.from(storedHash, 'hex') : Buffer.alloc(0);
      const passwordIsValid = storedHash
        ? actual.length === expected.length && timingSafeEqual(actual, expected)
        : password === (process.env.SUPERADMIN_PASSWORD || 'albarkah2026');
      if (req.body.adminUsername !== adminUsername || !passwordIsValid) {
        return res.status(401).json({ error: 'Password saat ini salah.' });
      }
      if (typeof newPassword !== 'string' || newPassword.length < 4 || newPassword.length > 256) {
        return res.status(400).json({ error: 'Password baru minimal 4 karakter.' });
      }
      await pool.query(`INSERT INTO superadmin_credentials (username, password_hash)
        VALUES ($1, $2) ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
        [adminUsername, hashPassword(newPassword, adminUsername)]);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Aksi tidak dikenal.' });
  } catch (error) {
    console.error('Student credential operation failed', error);
    return res.status(500).json({ error: 'Layanan akun siswa sedang bermasalah. Silakan coba lagi.' });
  }
}
