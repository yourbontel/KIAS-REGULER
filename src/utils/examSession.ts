import {
  DEMO_STUDENTS,
  INITIAL_STUDENTS,
  type QuizAttempt,
  type Student,
} from '../data/students';
import type { QuizQuestion } from './quizGenerator';

const EXAM_DRAFT_PREFIX = 'albarkah_shorof_exam_draft_v2';

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

function isDraftCompatible(questions: QuizQuestion[]): boolean {
  const majhulPattern = /majhul|مجهول|مَجْهُول|kata kerja pasif/i;
  for (const q of questions) {
    const combined = [
      q.id,
      q.promptId,
      q.arabicHighlight,
      q.arabicSubtext,
      q.explanation,
      ...(q.options || []).flatMap((o) => [o.textAr, o.textSub || '']),
    ].join(' ');
    if (majhulPattern.test(combined)) return false;
    const textArs = (q.options || []).map((o) => o.textAr);
    if (new Set(textArs).size !== textArs.length) return false;
  }
  return true;
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
      isDraftCompatible(parsed.questions) &&
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

import type { ResetAttemptsParams } from './attemptFilter';

export function clearLocalExamDrafts(params: ResetAttemptsParams): void {
  try {
    const prefix = `${EXAM_DRAFT_PREFIX}:`;
    const studentSet =
      params.studentIds && params.studentIds.length > 0
        ? new Set(params.studentIds)
        : null;
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;
      const rest = key.slice(prefix.length);
      const [keyStudentId, keyBabId, keySection] = rest.split(':');
      if (!keyStudentId || !keyBabId || !keySection) continue;

      if (params.studentId && params.studentId !== 'all' && keyStudentId !== params.studentId) {
        continue;
      }
      if (studentSet && !studentSet.has(keyStudentId)) {
        continue;
      }
      if (params.babId && keyBabId !== params.babId) {
        continue;
      }
      if (params.sectionNumber === null && keySection !== 'full') {
        continue;
      }
      if (typeof params.sectionNumber === 'number' && keySection !== String(params.sectionNumber)) {
        continue;
      }
      if (params.tashrifType === 'istilahi') {
        const n = Number(keySection);
        if (!Number.isInteger(n) || n < 1 || n > 6) continue;
      } else if (params.tashrifType === 'lughawi') {
        const n = Number(keySection);
        if (!Number.isInteger(n) || n < 7 || n > 12) continue;
      }
      toRemove.push(key);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore storage errors
  }
}
