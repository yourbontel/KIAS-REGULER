import {
  ManualScoreRecord,
  PASSING_SCORE,
  QuizAttempt,
  Student,
} from '../data/students';
import { getBabsForClass } from '../data/shorofData';
import { summarizeBabAttempts } from './babScores';

export const GRADE_WEIGHTS = {
  WEB: 0.5,
  UTS: 0.1,
  UAS: 0.4,
} as const;

export interface FinalGradeSummary {
  webScore: number | null;
  utsScore: number | null;
  uasScore: number | null;
  webWeighted: number | null;
  utsWeighted: number | null;
  uasWeighted: number | null;
  /** Akumulasi nilai berbobot: 50% Ujian Web + 10% UTS + 40% UAS (null bila ketiga komponen kosong) */
  finalScore: number | null;
  /** True hanya bila Ujian Web, UTS, dan UAS ketiganya sudah terisi */
  isComplete: boolean;
  /** True bila ketiga komponen lengkap dan finalScore >= PASSING_SCORE */
  passed: boolean;
}

function roundOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Format nilai angka agar bulat tampil tanpa desimal dan pecahan tampil 1 angka di belakang koma. */
export function formatGradeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const rounded = roundOneDecimal(value);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/** Hitung rata-rata nilai terbaik Ujian Website dari Bab yang sudah selesai penuh oleh siswa. */
export function computeStudentWebAverage(
  student: Student,
  studentAttempts: QuizAttempt[]
): number | null {
  const classBabs = getBabsForClass(student.kelas);
  let total = 0;
  let completedCount = 0;
  for (const bab of classBabs) {
    const summary = summarizeBabAttempts(bab, studentAttempts);
    if (summary.bestScore !== null) {
      total += summary.bestScore;
      completedCount += 1;
    }
  }
  return completedCount > 0 ? Math.round(total / completedCount) : null;
}

/** Hitung rincian Nilai Akhir dengan bobot 50% Ujian Web, 10% UTS, dan 40% UAS. */
export function computeFinalGradeSummary(
  webScore: number | null,
  manualScore?: Pick<ManualScoreRecord, 'utsScore' | 'uasScore'> | null
): FinalGradeSummary {
  const utsScore =
    manualScore?.utsScore !== null &&
    manualScore?.utsScore !== undefined &&
    Number.isFinite(manualScore.utsScore)
      ? manualScore.utsScore
      : null;
  const uasScore =
    manualScore?.uasScore !== null &&
    manualScore?.uasScore !== undefined &&
    Number.isFinite(manualScore.uasScore)
      ? manualScore.uasScore
      : null;

  const webWeighted =
    webScore !== null ? roundOneDecimal(webScore * GRADE_WEIGHTS.WEB) : null;
  const utsWeighted =
    utsScore !== null ? roundOneDecimal(utsScore * GRADE_WEIGHTS.UTS) : null;
  const uasWeighted =
    uasScore !== null ? roundOneDecimal(uasScore * GRADE_WEIGHTS.UAS) : null;

  const hasAny = webScore !== null || utsScore !== null || uasScore !== null;
  const isComplete = webScore !== null && utsScore !== null && uasScore !== null;

  const finalScore = hasAny
    ? roundOneDecimal(
        (webScore ?? 0) * GRADE_WEIGHTS.WEB +
          (utsScore ?? 0) * GRADE_WEIGHTS.UTS +
          (uasScore ?? 0) * GRADE_WEIGHTS.UAS
      )
    : null;

  return {
    webScore,
    utsScore,
    uasScore,
    webWeighted,
    utsWeighted,
    uasWeighted,
    finalScore,
    isComplete,
    passed: isComplete && finalScore !== null && finalScore >= PASSING_SCORE,
  };
}
