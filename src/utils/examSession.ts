import {
  DEMO_STUDENTS,
  INITIAL_STUDENTS,
  type QuizAttempt,
  type Student,
} from '../data/students';
import type { QuizQuestion } from './quizGenerator';

const EXAM_DRAFT_PREFIX = 'albarkah_shorof_exam_draft_v1';

export const STUDENT_DATA_STORAGE_KEYS = {
  STUDENTS: 'albarkah_shorof_students_v1',
  ATTEMPTS: 'albarkah_shorof_attempts_v1',
  SETORAN: 'albarkah_shorof_setoran_v1',
};

export interface ExamDraft {
  studentId: string;
  babId: string;
  sectionNumber: number | null;
  questions: QuizQuestion[];
  answers: Record<number, string>;
  currentIdx: number;
  startedAt: string;
}

export function buildExamUrl(params: {
  babId: string;
  sectionNumber?: number | null;
  studentId?: string | null;
}): string {
  const search = new URLSearchParams();
  search.set('bab', params.babId);
  if (params.sectionNumber) {
    search.set('bagian', String(params.sectionNumber));
  }
  if (params.studentId) {
    search.set('student', params.studentId);
  }
  return `/ujian.html?${search.toString()}`;
}

export function buildReviewUrl(params: {
  attemptId: string;
  studentId?: string | null;
}): string {
  const search = new URLSearchParams();
  search.set('id', params.attemptId);
  if (params.studentId) {
    search.set('student', params.studentId);
  }
  return `/jawaban.html?${search.toString()}`;
}

export function mergeStudentRecords(base: Student[], dbRecords: Student[]): Student[] {
  if (dbRecords.length === 0) return base;
  const recordMap = new Map(dbRecords.map((r) => [r.id, r]));
  const merged = base.map((st) => {
    const override = recordMap.get(st.id);
    if (override) {
      recordMap.delete(st.id);
      return override;
    }
    return st;
  });
  return [...merged, ...recordMap.values()];
}

export function loadLocalStudents(): Student[] {
  try {
    const saved = localStorage.getItem(STUDENT_DATA_STORAGE_KEYS.STUDENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((s: Student) => s.id));
        const missingDemos = DEMO_STUDENTS.filter((d) => !existingIds.has(d.id));
        return [...missingDemos, ...parsed];
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_STUDENTS;
}

export function loadLocalAttempts(): QuizAttempt[] {
  try {
    const saved = localStorage.getItem(STUDENT_DATA_STORAGE_KEYS.ATTEMPTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveLocalAttempts(attempts: QuizAttempt[]): void {
  try {
    localStorage.setItem(STUDENT_DATA_STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  } catch {
    // ignore
  }
}

function getDraftKey(
  studentId: string,
  babId: string,
  sectionNumber: number | null
): string {
  return `${EXAM_DRAFT_PREFIX}:${studentId}:${babId}:${sectionNumber ?? 'full'}`;
}

export function loadExamDraft(
  studentId: string,
  babId: string,
  sectionNumber: number | null
): ExamDraft | null {
  try {
    const raw = localStorage.getItem(getDraftKey(studentId, babId, sectionNumber));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ExamDraft;
    if (
      parsed &&
      parsed.studentId === studentId &&
      parsed.babId === babId &&
      Array.isArray(parsed.questions) &&
      parsed.questions.length > 0 &&
      parsed.answers &&
      typeof parsed.answers === 'object'
    ) {
      return parsed;
    }
  } catch {
    // ignore malformed draft
  }
  return null;
}

export function saveExamDraft(draft: ExamDraft): void {
  try {
    localStorage.setItem(
      getDraftKey(draft.studentId, draft.babId, draft.sectionNumber),
      JSON.stringify(draft)
    );
  } catch {
    // ignore storage errors
  }
}

export function clearExamDraft(
  studentId: string,
  babId: string,
  sectionNumber: number | null
): void {
  try {
    localStorage.removeItem(getDraftKey(studentId, babId, sectionNumber));
  } catch {
    // ignore storage errors
  }
}
