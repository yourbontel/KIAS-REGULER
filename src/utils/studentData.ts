import type {
  QuizAttempt,
  QuizAttemptReviewItem,
  SetoranRecord,
  Student,
} from '../data/students';

export interface StudentDataSnapshot {
  attempts: QuizAttempt[];
  setoranMap: Record<string, SetoranRecord>;
  studentRecords: Student[];
}

export async function loadStudentData(): Promise<StudentDataSnapshot> {
  const response = await fetch('/api/student-data', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Gagal memuat data nilai siswa dari server.');
  }
  return response.json();
}

export async function loadAttemptReviewFromDb(
  attemptId: string
): Promise<QuizAttemptReviewItem[] | null> {
  const response = await fetch(
    `/api/student-data?attemptId=${encodeURIComponent(attemptId)}`,
    { cache: 'no-store' }
  );
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.error || 'Gagal memuat rincian jawaban ujian dari server.');
  }
  const data = (await response.json()) as {
    id: string;
    reviewItems: QuizAttemptReviewItem[] | null;
  };
  return Array.isArray(data.reviewItems) ? data.reviewItems : null;
}

async function postStudentData<T = { ok: boolean }>(
  payload: Record<string, unknown>,
  adminToken?: string | null
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch('/api/student-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => null);
    if (response.ok) {
      return { data: result as T, error: null };
    }
    return {
      data: null,
      error: result?.error || 'Gagal menyimpan data ke database.',
    };
  } catch {
    return {
      data: null,
      error: 'Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.',
    };
  }
}

export async function saveQuizAttemptToDb(attempt: QuizAttempt): Promise<string | null> {
  const { error } = await postStudentData({ action: 'save-attempt', attempt });
  return error;
}

export async function toggleSetoranInDb(
  studentId: string,
  babCode: string,
  adminToken: string | null
): Promise<{ record: SetoranRecord | null; error: string | null }> {
  const { data, error } = await postStudentData<{ ok: boolean; record: SetoranRecord }>(
    { action: 'toggle-setoran', studentId, babCode },
    adminToken
  );
  return { record: data?.record ?? null, error };
}

export async function upsertStudentInDb(
  student: Student,
  adminToken: string | null
): Promise<string | null> {
  const { error } = await postStudentData({ action: 'upsert-student', student }, adminToken);
  return error;
}

export async function clearAttemptsInDb(adminToken: string | null): Promise<string | null> {
  const { error } = await postStudentData({ action: 'clear-attempts' }, adminToken);
  return error;
}
