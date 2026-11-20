import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { SHOROF_BABS_REGULER_1 } from '../src/data/babs/reguler1';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

pool.on('error', (err) => {
  console.error('PostgreSQL idle client error (student-data):', err.message);
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
      await pool.query(`
        CREATE TABLE IF NOT EXISTS exam_access_config (
          id TEXT PRIMARY KEY,
          config JSONB NOT NULL DEFAULT '{"babs":{},"sections":{}}'::jsonb,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS student_manual_scores (
          student_id TEXT PRIMARY KEY,
          uts_score DOUBLE PRECISION,
          uas_score DOUBLE PRECISION,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query(`CREATE TABLE IF NOT EXISTS question_issues (
        question_id TEXT PRIMARY KEY, bab_id TEXT NOT NULL, bab_kode TEXT NOT NULL,
        prompt_id TEXT NOT NULL, note TEXT, marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), marked_by TEXT NOT NULL
      )`);
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

function sanitizeExamAccess(raw: unknown) {
  const babs: Record<string, boolean> = {};
  const sections: Record<string, boolean> = {};
  const tashrifTypes: Record<string, boolean> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { babs, sections, tashrifTypes };
  }
  const obj = raw as Record<string, unknown>;
  if (obj.babs && typeof obj.babs === 'object' && !Array.isArray(obj.babs)) {
    for (const [k, v] of Object.entries(obj.babs)) {
      if (typeof k === 'string' && k.length <= 128 && typeof v === 'boolean') {
        babs[k] = v;
      }
    }
  }
  if (obj.sections && typeof obj.sections === 'object' && !Array.isArray(obj.sections)) {
    for (const [k, v] of Object.entries(obj.sections)) {
      if (typeof k === 'string' && k.length <= 140 && typeof v === 'boolean') {
        sections[k] = v;
      }
    }
  }
  if (obj.tashrifTypes && typeof obj.tashrifTypes === 'object' && !Array.isArray(obj.tashrifTypes)) {
    for (const [key, value] of Object.entries(obj.tashrifTypes)) {
      if (
        ['Reguler 1:istilahi', 'Reguler 1:lughawi', 'Reguler 2:istilahi', 'Reguler 2:lughawi'].includes(key) &&
        typeof value === 'boolean'
      ) {
        tashrifTypes[key] = value;
      }
    }
  }
  const semester1EndBabId = typeof obj.semester1EndBabId === 'string' && obj.semester1EndBabId.length <= 128
    ? obj.semester1EndBabId
    : undefined;
  return { babs, sections, tashrifTypes, semester1EndBabId };
}

function isExamOpenServer(
  access: { babs: Record<string, boolean>; sections: Record<string, boolean>; tashrifTypes: Record<string, boolean>; semester1EndBabId?: string },
  babId: string,
  sectionNumber: number | null,
  studentClass?: string
): boolean {
  if (access.babs[babId] === false) return false;
  if (studentClass === 'Reguler 1' && access.semester1EndBabId) {
    const semesterBabs = SHOROF_BABS_REGULER_1;
    const endIndex = semesterBabs.findIndex((bab) => bab.id === access.semester1EndBabId);
    const babIndex = semesterBabs.findIndex((bab) => bab.id === babId);
    if (endIndex >= 0 && (babIndex < 0 || babIndex > endIndex)) return false;
  }
  if (sectionNumber !== null && access.sections[`${babId}:${sectionNumber}`] === false) {
    return false;
  }
  if (sectionNumber !== null && studentClass && sectionNumber >= 1 && sectionNumber <= 12) {
    const type = sectionNumber <= 6 ? 'istilahi' : 'lughawi';
    if (access.tashrifTypes[`${studentClass}:${type}`] === false) return false;
  }
  return true;
}

function sanitizeOptionalManualScore(raw: unknown): number | null | 'invalid' {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0 || raw > 100) {
    return 'invalid';
  }
  return Math.round(raw * 100) / 100;
}

function sanitizeManualScoreEntries(raw: unknown) {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 500) return null;
  const result: { studentId: string; utsScore: number | null; uasScore: number | null }[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const obj = item as Record<string, unknown>;
    if (typeof obj.studentId !== 'string' || !obj.studentId.trim() || obj.studentId.length > 128) {
      return null;
    }
    const utsScore = sanitizeOptionalManualScore(obj.utsScore);
    const uasScore = sanitizeOptionalManualScore(obj.uasScore);
    if (utsScore === 'invalid' || uasScore === 'invalid') return null;
    result.push({
      studentId: obj.studentId.trim(),
      utsScore,
      uasScore,
    });
  }
  return result;
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
      ...(typeof obj.markedAsProblem === 'boolean'
        ? { markedAsProblem: obj.markedAsProblem }
        : {}),
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

      const [attemptResult, setoranResult, studentResult, accessResult, manualScoresResult, issueResult] =
        await Promise.all([
          pool.query(`
            SELECT
              id, student_id, timestamp, bab_id, bab_label, section_number,
              mode, score, correct_count, total_questions,
              COALESCE((
                SELECT COUNT(*)
                FROM jsonb_array_elements(COALESCE(review_items, '[]'::jsonb)) AS review_item
                WHERE review_item->>'markedAsProblem' = 'true'
              ), 0) AS marked_question_count,
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
          pool.query(`
            SELECT config
            FROM exam_access_config
            WHERE id = 'global'
            LIMIT 1
          `),
          pool.query(`
            SELECT student_id, uts_score, uas_score, updated_at
            FROM student_manual_scores
          `),
          pool.query('SELECT question_id, bab_id, bab_kode, prompt_id, note, marked_at, marked_by FROM question_issues'),
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
        markedQuestionCount: Number(row.marked_question_count),
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

      const examAccess = sanitizeExamAccess(accessResult.rows[0]?.config);

      const manualScoresMap: Record<
        string,
        { studentId: string; utsScore: number | null; uasScore: number | null; updatedAt?: string }
      > = {};
      for (const row of manualScoresResult.rows) {
        const utsScore =
          row.uts_score !== null && row.uts_score !== undefined ? Number(row.uts_score) : null;
        const uasScore =
          row.uas_score !== null && row.uas_score !== undefined ? Number(row.uas_score) : null;
        manualScoresMap[row.student_id] = {
          studentId: row.student_id,
          utsScore,
          uasScore,
          ...(row.updated_at ? { updatedAt: new Date(row.updated_at).toISOString() } : {}),
        };
      }

      const questionIssues: Record<string, object> = {};
      for (const row of issueResult.rows) {
        questionIssues[row.question_id] = {
          questionId: row.question_id, babId: row.bab_id, babKode: row.bab_kode, promptId: row.prompt_id,
          ...(row.note ? { note: row.note } : {}), markedAt: new Date(row.marked_at).toISOString(), markedBy: row.marked_by,
        };
      }

      return res
        .status(200)
        .json({ attempts, setoranMap, studentRecords, examAccess, manualScoresMap, questionIssues });
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

    if (action === 'register-unlisted-student') {
      const raw = body.student;
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return res.status(400).json({ error: 'Data siswa tidak valid.' });
      }
      const input = raw as Record<string, unknown>;
      const name = typeof input.name === 'string' ? input.name.trim() : '';
      const kelas = input.kelas;
      const gender = input.gender;
      const kota = typeof input.kota === 'string' ? input.kota.trim() : '';
      if (
        !name || name.length > 200 ||
        (kelas !== 'Reguler 1' && kelas !== 'Reguler 2') ||
        (gender !== 'Ikhwan' && gender !== 'Akhwat') ||
        kota.length > 120
      ) {
        return res.status(400).json({ error: 'Nama, kelas, kelompok, atau kota tidak valid.' });
      }
      const duplicate = await pool.query(
        'SELECT id FROM student_records WHERE LOWER(name) = LOWER($1) AND kelas = $2 LIMIT 1',
        [name, kelas]
      );
      if (duplicate.rows[0]) {
        return res.status(409).json({ error: 'Nama tersebut sudah terdaftar. Silakan cari di daftar siswa.' });
      }
      const student = {
        id: `reg-${randomUUID()}`,
        name,
        kelas,
        gender,
        kota: kota || '-',
      };
      await pool.query(
        'INSERT INTO student_records (id, name, kelas, gender, kota, updated_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [student.id, student.name, student.kelas, student.gender, student.kota]
      );
      return res.status(201).json({ ok: true, student });
    }

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

      const accessRow = await pool.query(
        "SELECT config FROM exam_access_config WHERE id = 'global' LIMIT 1"
      );
      const currentAccess = sanitizeExamAccess(accessRow.rows[0]?.config);
      const studentRow = await pool.query('SELECT kelas FROM student_records WHERE id = $1 LIMIT 1', [studentId]);
      const studentClass = studentRow.rows[0]?.kelas || null;
      if (cleanSection !== null && !studentClass) {
        return res.status(403).json({ error: 'Kelas siswa tidak dapat diverifikasi. Hubungi Superadmin.' });
      }
      if (!isExamOpenServer(currentAccess, babId, cleanSection, studentClass)) {
        return res.status(403).json({
          error: 'Akses soal ini sedang ditutup oleh Superadmin.',
        });
      }

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

    if (action === 'sync-seed-students') {
      const { INITIAL_STUDENTS } = await import('../src/data/students');
      const values: unknown[] = [];
      const placeholders = INITIAL_STUDENTS.map((student, index) => {
        const offset = index * 6;
        values.push(student.id, student.name, student.kelas, student.gender, student.kota, student.catatan ?? null);
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, NOW())`;
      });
      if (placeholders.length > 0) {
        await pool.query(
          `INSERT INTO student_records (id, name, kelas, gender, kota, catatan, updated_at)
           VALUES ${placeholders.join(', ')}
           ON CONFLICT (id) DO NOTHING`,
          values
        );
      }
      return res.status(200).json({ ok: true });
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

    if (action === 'delete-attempt') {
      const attemptId = typeof body.attemptId === 'string' ? body.attemptId.trim() : '';
      if (!attemptId || attemptId.length > 128) {
        return res.status(400).json({ error: 'ID pengerjaan soal tidak valid.' });
      }
      const { rows } = await pool.query(
        'DELETE FROM quiz_attempts WHERE id = $1 RETURNING id',
        [attemptId]
      );
      return res.status(200).json({
        ok: true,
        deletedIds: rows.map((r) => String(r.id)),
      });
    }

    if (action === 'reset-student-attempts') {
      const rawStudentId = typeof body.studentId === 'string' ? body.studentId.trim() : '';
      const studentId = rawStudentId && rawStudentId !== 'all' ? rawStudentId : '';
      const studentIds = Array.isArray(body.studentIds)
        ? body.studentIds
            .filter(
              (id: unknown): id is string =>
                typeof id === 'string' && id.trim().length > 0 && id.trim().length <= 128
            )
            .map((id: string) => id.trim())
        : [];
      const babId = typeof body.babId === 'string' ? body.babId.trim() : '';
      const hasNullSection = body.sectionNumber === null;
      const sectionNumber =
        typeof body.sectionNumber === 'number' &&
        Number.isInteger(body.sectionNumber) &&
        body.sectionNumber >= 1 &&
        body.sectionNumber <= 12
          ? body.sectionNumber
          : null;
      const tashrifType =
        body.tashrifType === 'istilahi' || body.tashrifType === 'lughawi'
          ? body.tashrifType
          : '';
      const mode =
        typeof body.mode === 'string' && VALID_MODES.has(body.mode.trim())
          ? body.mode.trim()
          : '';

      if (studentId.length > 128) {
        return res.status(400).json({ error: 'ID siswa tidak valid.' });
      }
      if (studentIds.length > 500) {
        return res.status(400).json({ error: 'Daftar ID siswa melebihi batas.' });
      }
      if (babId.length > 128) {
        return res.status(400).json({ error: 'ID Bab tidak valid.' });
      }
      if (
        body.sectionNumber !== undefined &&
        body.sectionNumber !== null &&
        sectionNumber === null
      ) {
        return res.status(400).json({ error: 'Nomor bagian tidak valid.' });
      }
      if (body.tashrifType !== undefined && !tashrifType) {
        return res.status(400).json({ error: 'Jenis tashrif tidak valid.' });
      }
      if (body.mode !== undefined && !mode) {
        return res.status(400).json({ error: 'Mode soal tidak valid.' });
      }

      const conditions: string[] = [];
      const values: unknown[] = [];

      if (studentId) {
        values.push(studentId);
        conditions.push(`student_id = $${values.length}`);
      } else if (studentIds.length > 0) {
        values.push(studentIds);
        conditions.push(`student_id = ANY($${values.length}::text[])`);
      }
      if (babId) {
        values.push(babId);
        conditions.push(`bab_id = $${values.length}`);
      }
      if (hasNullSection) {
        conditions.push('section_number IS NULL');
      } else if (sectionNumber !== null) {
        values.push(sectionNumber);
        conditions.push(`section_number = $${values.length}`);
      }
      if (tashrifType === 'istilahi') {
        conditions.push('((section_number BETWEEN 1 AND 6) OR mode = \'istilahi\')');
      } else if (tashrifType === 'lughawi') {
        conditions.push('((section_number BETWEEN 7 AND 12) OR mode = \'lughawi\')');
      }
      if (mode) {
        values.push(mode);
        conditions.push(`mode = $${values.length}`);
      }

      if (conditions.length === 0) {
        return res.status(400).json({
          error: 'Pilih minimal satu target siswa, bab, atau jenis soal untuk direset.',
        });
      }

      const result = await pool.query(
        `DELETE FROM quiz_attempts WHERE ${conditions.join(' AND ')} RETURNING id`,
        values
      );

      return res.status(200).json({
        ok: true,
        deletedIds: result.rows.map((r) => String(r.id)),
      });
    }

    if (action === 'update-exam-access') {
      const nextAccess = sanitizeExamAccess(body.config);
      await pool.query(
        `
        INSERT INTO exam_access_config (id, config, updated_at)
        VALUES ('global', $1::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET config = EXCLUDED.config, updated_at = NOW()
        `,
        [JSON.stringify(nextAccess)]
      );
      return res.status(200).json({ ok: true, examAccess: nextAccess });
    }

    if (action === 'save-manual-scores') {
      const entries = sanitizeManualScoreEntries(body.entries);
      if (!entries) {
        return res.status(400).json({
          error: 'Format nilai UTS/UAS tidak valid. Nilai harus berupa angka 0 sampai 100 atau dikosongkan.',
        });
      }

      const client = await pool.connect();
      const saved: Record<
        string,
        { studentId: string; utsScore: number | null; uasScore: number | null; updatedAt?: string } | null
      > = {};
      try {
        await client.query('BEGIN');
        for (const item of entries) {
          if (item.utsScore === null && item.uasScore === null) {
            await client.query('DELETE FROM student_manual_scores WHERE student_id = $1', [
              item.studentId,
            ]);
            saved[item.studentId] = null;
          } else {
            const upsertRes = await client.query(
              `
              INSERT INTO student_manual_scores (student_id, uts_score, uas_score, updated_at)
              VALUES ($1, $2, $3, NOW())
              ON CONFLICT (student_id)
              DO UPDATE SET
                uts_score = EXCLUDED.uts_score,
                uas_score = EXCLUDED.uas_score,
                updated_at = NOW()
              RETURNING updated_at
              `,
              [item.studentId, item.utsScore, item.uasScore]
            );
            saved[item.studentId] = {
              studentId: item.studentId,
              utsScore: item.utsScore,
              uasScore: item.uasScore,
              updatedAt: new Date(upsertRes.rows[0].updated_at).toISOString(),
            };
          }
        }
        await client.query('COMMIT');
        return res.status(200).json({ ok: true, saved });
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    }

    if (action === 'upsert-question-issue') {
      const issue = body.issue;
      if (!issue || typeof issue !== 'object' || Array.isArray(issue)) return res.status(400).json({ error: 'Data penandaan soal tidak valid.' });
      const item = issue as Record<string, unknown>;
      const required = ['questionId', 'babId', 'babKode', 'promptId', 'markedBy'];
      if (required.some((key) => typeof item[key] !== 'string' || !(item[key] as string).trim())) return res.status(400).json({ error: 'Identitas soal tidak valid.' });
      const result = await pool.query(
        `INSERT INTO question_issues (question_id, bab_id, bab_kode, prompt_id, note, marked_by, marked_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (question_id) DO UPDATE SET bab_id=EXCLUDED.bab_id, bab_kode=EXCLUDED.bab_kode,
         prompt_id=EXCLUDED.prompt_id, note=EXCLUDED.note, marked_by=EXCLUDED.marked_by, marked_at=NOW()
         RETURNING question_id, bab_id, bab_kode, prompt_id, note, marked_at, marked_by`,
        [item.questionId, item.babId, item.babKode, item.promptId, typeof item.note === 'string' ? item.note.trim() || null : null, item.markedBy]
      );
      const row = result.rows[0];
      return res.status(200).json({ ok: true, issue: { questionId: row.question_id, babId: row.bab_id, babKode: row.bab_kode, promptId: row.prompt_id, note: row.note || undefined, markedAt: new Date(row.marked_at).toISOString(), markedBy: row.marked_by } });
    }

    if (action === 'delete-question-issue') {
      const questionId = typeof body.questionId === 'string' ? body.questionId.trim() : '';
      if (!questionId || questionId.length > 200) return res.status(400).json({ error: 'ID soal tidak valid.' });
      await pool.query('DELETE FROM question_issues WHERE question_id = $1', [questionId]);
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
