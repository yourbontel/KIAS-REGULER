import { PASSING_SCORE, QuizAttempt } from '../data/students';
import type { ShorofBab } from '../data/shorofData';

export const SECTION_NUMBERS = [1, 2, 3, 4, 5, 6] as const;

export interface BabScoreSummary {
  attemptCount: number;
  /** Nilai terbaik Bab. Untuk Bab per-Bagian: rata-rata nilai terbaik 6 Bagian (null jika belum lengkap) */
  bestScore: number | null;
  latestScore: number | null;
  latestTime: string | null;
  passed: boolean;
  sectioned: boolean;
  completedSections: number;
  totalSections: number;
  sectionBest: Record<number, number | undefined>;
  sectionAttemptCount: Record<number, number>;
}

/**
 * Ringkasan nilai satu Bab dari daftar attempt milik satu siswa (urutan terbaru lebih dulu).
 */
export function summarizeBabAttempts(
  bab: ShorofBab,
  studentAttempts: QuizAttempt[]
): BabScoreSummary {
  const babAttempts = studentAttempts.filter((a) => a.babId === bab.id);
  const sectioned = Boolean(bab.sectionedExam);

  if (!sectioned) {
    const bestScore =
      babAttempts.length > 0 ? Math.max(...babAttempts.map((a) => a.score)) : null;
    return {
      attemptCount: babAttempts.length,
      bestScore,
      latestScore: babAttempts[0]?.score ?? null,
      latestTime: babAttempts[0]?.timestamp ?? null,
      passed: bestScore !== null && bestScore >= PASSING_SCORE,
      sectioned: false,
      completedSections: 0,
      totalSections: 0,
      sectionBest: {},
      sectionAttemptCount: {},
    };
  }

  const sectionAttempts = babAttempts.filter((a) => typeof a.sectionNumber === 'number');
  const sectionBest: Record<number, number | undefined> = {};
  const sectionAttemptCount: Record<number, number> = {};
  SECTION_NUMBERS.forEach((n) => {
    const list = sectionAttempts.filter((a) => a.sectionNumber === n);
    sectionAttemptCount[n] = list.length;
    sectionBest[n] = list.length > 0 ? Math.max(...list.map((a) => a.score)) : undefined;
  });

  const completedSections = SECTION_NUMBERS.filter((n) => sectionBest[n] !== undefined).length;
  const totalSections = SECTION_NUMBERS.length;
  const bestScore =
    completedSections === totalSections
      ? Math.round(
          SECTION_NUMBERS.reduce((sum, n) => sum + (sectionBest[n] ?? 0), 0) / totalSections
        )
      : null;

  return {
    attemptCount: sectionAttempts.length,
    bestScore,
    latestScore: sectionAttempts[0]?.score ?? null,
    latestTime: sectionAttempts[0]?.timestamp ?? null,
    passed: bestScore !== null && bestScore >= PASSING_SCORE,
    sectioned: true,
    completedSections,
    totalSections,
    sectionBest,
    sectionAttemptCount,
  };
}
