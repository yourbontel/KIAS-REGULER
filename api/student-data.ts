import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { createHmac, timingSafeEqual } from 'node:crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const VALID_MODES = new Set([
  'ujian_bab',
  'istilahi',
  'lughawi',
  'tebak_shighat',
  'susun_tashrif',
]);

const VALID_CLASSES = new Set(['Reguler 1', 'Reguler 2']);
const VALID_GENDERS = new Set(['Ikhwan', 'Akhwat']);

let tablesReadyPromise: Promise<void> | null = null;

function ensureTables(): Promise<void> {
  if (!tablesReadyPromise) {
    tablesReadyPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS quiz_attempts (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          bab_id TEXT NOT NULL,
          bab_label TEXT NOT NULL,
          section_number INTEGER,
          mode TEXT NOT NULL,
          score INTEGER NOT NULL,
          correct_count INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          review_items JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        ALTER TABLE quiz_attempts
        ADD COLUMN IF NOT EXISTS review_items JSONB
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at
        ON quiz_attempts (created_at DESC)
      `);
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_attempts_unique_section
        ON quiz_attempts (student_id, bab_id, section_number)
        WHERE section_number IS NOT NULL
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS student_setoran (
          student_id TEXT PRIMARY KEY,
          completed_babs JSONB NOT NULL DEFAULT '[]'::jsonb,
          last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          notes TEXT
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS student_records (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          kelas TEXT NOT NULL,
          gender TEXT NOT NULL,
          kota TEXT NOT NULL,
          catatan TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
    })().catch((err) => {
      tablesReadyPromise = null;
      throw err;
    });
  }
  return tablesReadyPromise;
}

const signAdminSession = (username: string) =>
  createHmac(
    'sha256',
    process.env.SESSION_SECRET || process.env.DATABASE_URL || 'local-session-key'
  )
    .update(username)
    .digest('hex');

async function isValidAdminRequest(req: VercelRequest): Promise<boolean> {
  const { rows } = await pool
    .query('SELECT username FROM superadmin_credentials LIMIT 1')
    .catch((): { rows: { username: string }[] } => ({ rows: [] }));
  const adminUsername = rows[0]?.username || process.env.SUPERADMIN_USERNAME || 'superadmin';
  const provided = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
  const expected = signAdminSession(adminUsername);
  const actualBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function validateStudentPayload(raw: unknown) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const candidate = raw as Record<string, unknown>;
  const { id, name, kelas, gender, kota, catatan } = candidate;
  if (
    typeof id !== 'string' ||
    !id ||
    id.length > 128 ||
    typeof name !== 'string' ||
    !name.trim() ||
    name.length > 200 ||
    typeof kelas !== 'string' ||
    !VALID_CLASSES.has(kelas) ||
    typeof gender !== 'string' ||
    !VALID_GENDERS.has(gender) ||
    typeof kota !== 'string' ||
    kota.length > 120
  ) {
    return null;
  }
  return {
    id,
    name: name.trim(),
    kelas,
    gender,
    kota: kota.trim() || '-',
    catatan: typeof catatan === 'string' && catatan.trim() ? catatan.trim() : null,
  };
}

function sanitizeReviewItems(raw: unknown) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 200) return null;
  const sanitized = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const obj = item as Record<string, unknown>;
    if (
      typeof obj.questionId !== 'string' ||
      !obj.questionId ||
      typeof obj.babKode !== 'string' ||
      typeof obj.promptId !== 'string' ||
      typeof obj.arabicHighlight !== 'string' ||
      typeof obj.selectedOptionId !== 'string' ||
      typeof obj.correctOptionId !== 'string' ||
      typeof obj.explanation !== 'string' ||
      !Array.isArray(obj.options)
    ) {
      return null;
    }
    const options = [];
    for (const opt of obj.options) {
      if (!opt || typeof opt !== 'object' || Array.isArray(opt)) return null;
      const o = opt as Record<string, unknown>;
      if (typeof o.id !== 'string' || typeof o.textAr !== 'string') return null;
      options.push({
        id: o.id,
        textAr: o.textAr,
        ...(typeof o.textSub === 'string' && o.textSub ? { textSub: o.textSub } : {}),
      });
    }
    sanitized.push({
      questionId: obj.questionId,
      ...(typeof obj.sectionNumber === 'number' && Number.isInteger(obj.sectionNumber)
        ? { sectionNumber: obj.sectionNumber }
        : {}),
      ...(typeof obj.sectionTitle === 'string' && obj.sectionTitle
        ? { sectionTitle: obj.sectionTitle }
        : {}),
      babKode: obj.babKode,
      promptId: obj.promptId,
      arabicHighlight: obj.arabicHighlight,
      ...(typeof obj.arabicSubtext === 'string' && obj.arabicSubtext
        ? { arabicSubtext: obj.arabicSubtext }
        : {}),
      options,
      selectedOptionId: obj.selectedOptionId,
      correctOptionId: obj.correctOptionId,
      explanation: obj.explanation,
    });
  }
  return sanitized;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      await ensureTables();

      const requestedAttemptId =
        typeof req.query?.attemptId === 'string' ? req.query.attemptId.trim() : '';
      if (requestedAttemptId) {
        if (requestedAttemptId.length > 128) {
          return res.status(400).json({ error: 'ID riwayat ujian tidak valid.' });
        }
        const detailResult = await pool.query(
          'SELECT id, review_items FROM quiz_attempts WHERE id = $1 LIMIT 1',
          [requestedAttemptId]
        );
        if (!detailResult.rows[0]) {
          return res.status(404).json({ error: 'Riwayat pengerjaan ujian tidak ditemukan.' });
        }
        const row = detailResult.rows[0];
        return res.status(200).json({
          id: row.id,
          reviewItems: Array.isArray(row.review_items) ? row.review_items : null,
        });
      }

      const [attemptResult, setoranResult, studentResult] = await Promise.all([
        pool.query(`
          SELECT
            id, student_id, timestamp, bab_id, bab_label, section_number,
            mode, score, correct_count, total_questions,
            (review_items IS NOT NULL) AS has_review
          FROM quiz_attempts
          ORDER BY created_at DESC, id DESC
        `),
        pool.query(`
          SELECT student_id, completed_babs, last_updated, notes
          FROM student_setoran
        `),
        pool.query(`
          SELECT id, name, kelas, gender, kota, catatan
          FROM student_records
          ORDER BY updated_at ASC, id ASC
        `),
      ]);

      const attempts = attemptResult.rows.map((row) => ({
        id: row.id,
        studentId: row.student_id,
        timestamp: row.timestamp,
        babId: row.bab_id,
        babLabel: row.bab_label,
        ...(row.section_number !== null && row.section_number !== undefined
          ? { sectionNumber: Number(row.section_number) }
          : {}),
        mode: row.mode,
        score: Number(row.score),
        correctCount: Number(row.correct_count),
        totalQuestions: Number(row.total_questions),
        hasReview: Boolean(row.has_review),
      }));

      const setoranMap: Record<
        string,
        { studentId: string; completedBabs: string[]; lastUpdated?: string; notes?: string }
      > = {};
      for (const row of setoranResult.rows) {
        const babs = Array.isArray(row.completed_babs)
          ? row.completed_babs.filter((b: unknown): b is string => typeof b === 'string')
          : [];
        setoranMap[row.student_id] = {
          studentId: row.student_id,
          completedBabs: babs,
          ...(row.last_updated ? { lastUpdated: new Date(row.last_updated).toISOString() } : {}),
          ...(row.notes ? { notes: row.notes } : {}),
        };
      }

      const studentRecords = studentResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        kelas: row.kelas,
        gender: row.gender,
        kota: row.kota,
        ...(row.catatan ? { catatan: row.catatan } : {}),
      }));

      return res.status(200).json({ attempts, setoranMap, studentRecords });
    } catch (error) {
      console.error('Failed to load student data', error);
      return res.status(500).json({ error: 'Gagal memuat data nilai & setoran dari database.' });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Metode tidak didukung.' });
  }

  const body = req.body ?? {};
  const action = body.action;

  try {
    await ensureTables();

    if (action === 'save-attempt') {
      const attempt = body.attempt;
      if (!attempt || typeof attempt !== 'object' || Array.isArray(attempt)) {
        return res.status(400).json({ error: 'Data hasil ujian tidak valid.' });
      }
      const {
        id,
        studentId,
        timestamp,
        babId,
        babLabel,
        sectionNumber,
        mode,
        score,
        correctCount,
        totalQuestions,
        reviewItems,
      } = attempt as Record<string, unknown>;

      if (
        typeof id !== 'string' ||
        !id ||
        id.length > 128 ||
        typeof studentId !== 'string' ||
        !studentId ||
        studentId.length > 128 ||
        typeof timestamp !== 'string' ||
        !timestamp ||
        timestamp.length > 80 ||
        typeof babId !== 'string' ||
        !babId ||
        babId.length > 128 ||
        typeof babLabel !== 'string' ||
        !babLabel ||
        babLabel.length > 200 ||
        typeof mode !== 'string' ||
        !VALID_MODES.has(mode) ||
        typeof score !== 'number' ||
        !Number.isFinite(score) ||
        typeof correctCount !== 'number' ||
        !Number.isFinite(correctCount) ||
        typeof totalQuestions !== 'number' ||
        !Number.isFinite(totalQuestions)
      ) {
        return res.status(400).json({ error: 'Format hasil ujian tidak valid.' });
      }

      const cleanSection =
        typeof sectionNumber === 'number' && Number.isInteger(sectionNumber)
          ? sectionNumber
          : null;

      if (cleanSection !== null) {
        const existing = await pool.query(
          'SELECT 1 FROM quiz_attempts WHERE student_id = $1 AND bab_id = $2 AND section_number = $3 LIMIT 1',
          [studentId, babId, cleanSection]
        );
        if (existing.rows[0]) {
          return res.status(409).json({
            error: 'Bagian ini sudah pernah dikerjakan dan hanya boleh dikerjakan satu kali.',
          });
        }
      }

      const cleanReviewItems = sanitizeReviewItems(reviewItems);

      await pool.query(
        `
        INSERT INTO quiz_attempts (
          id, student_id, timestamp, bab_id, bab_label, section_number, mode, score, correct_count, total_questions, review_items
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
        ON CONFLICT (id) DO NOTHING
        `,
        [
          id,
          studentId,
          timestamp,
          babId,
          babLabel,
          cleanSection,
          mode,
          Math.round(score),
          Math.round(correctCount),
          Math.round(totalQuestions),
          cleanReviewItems ? JSON.stringify(cleanReviewItems) : null,
        ]
      );
      return res.status(200).json({ ok: true });
    }

    if (!(await isValidAdminRequest(req))) {
      return res.status(401).json({
        error: 'Sesi superadmin tidak valid atau telah berakhir. Silakan login kembali.',
      });
    }

    if (action === 'toggle-setoran') {
      const { studentId, babCode } = body;
      if (
        typeof studentId !== 'string' ||
        !studentId ||
        studentId.length > 128 ||
        typeof babCode !== 'string' ||
        !babCode ||
        babCode.length > 128
      ) {
        return res.status(400).json({ error: 'Data setoran tidak valid.' });
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const { rows } = await client.query(
          'SELECT completed_babs FROM student_setoran WHERE student_id = $1 FOR UPDATE',
          [studentId]
        );
        const existing: string[] = Array.isArray(rows[0]?.completed_babs)
          ? rows[0].completed_babs.filter((b: unknown): b is string => typeof b === 'string')
          : [];
        const updated = existing.includes(babCode)
          ? existing.filter((b) => b !== babCode)
          : [...existing, babCode];

        const upsertRes = await client.query(
          `
          INSERT INTO student_setoran (student_id, completed_babs, last_updated)
          VALUES ($1, $2::jsonb, NOW())
          ON CONFLICT (student_id)
          DO UPDATE SET completed_babs = EXCLUDED.completed_babs, last_updated = NOW()
          RETURNING last_updated
          `,
          [studentId, JSON.stringify(updated)]
        );
        await client.query('COMMIT');
        return res.status(200).json({
          ok: true,
          record: {
            studentId,
            completedBabs: updated,
            lastUpdated: new Date(upsertRes.rows[0].last_updated).toISOString(),
          },
        });
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    }

    if (action === 'upsert-student') {
      const student = validateStudentPayload(body.student);
      if (!student) {
        return res.status(400).json({ error: 'Data siswa tidak valid.' });
      }
      await pool.query(
        `
        INSERT INTO student_records (id, name, kelas, gender, kota, catatan, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          name = EXCLUDED.name,
          kelas = EXCLUDED.kelas,
          gender = EXCLUDED.gender,
          kota = EXCLUDED.kota,
          catatan = EXCLUDED.catatan,
          updated_at = NOW()
        `,
        [student.id, student.name, student.kelas, student.gender, student.kota, student.catatan]
      );
      return res.status(200).json({ ok: true });
    }

    if (action === 'clear-attempts') {
      await pool.query('DELETE FROM quiz_attempts');
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Aksi tidak dikenal.' });
  } catch (error) {
    if ((error as { code?: string })?.code === '23505') {
      return res.status(409).json({
        error: 'Bagian ini sudah pernah dikerjakan dan hanya boleh dikerjakan satu kali.',
      });
    }
    console.error('Student data operation failed', error);
    return res.status(500).json({ error: 'Gagal menyimpan data ke database.' });
  }
}
