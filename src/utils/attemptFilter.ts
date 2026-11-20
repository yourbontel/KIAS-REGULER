import type { QuizAttempt } from '../data/students';
import { getSectionMeta } from './quizGenerator';

export type QuestionTypeFilter =
  | 'all'
  | 'tashrif:istilahi'
  | 'tashrif:lughawi'
  | `sec:${number}`
  | `mode:${QuizAttempt['mode']}`;

export interface ResetAttemptsParams {
  studentId?: string;
  studentIds?: string[];
  babId?: string;
  sectionNumber?: number | null;
  tashrifType?: 'istilahi' | 'lughawi';
  mode?: QuizAttempt['mode'];
}

export interface QuestionTypeOption {
  value: QuestionTypeFilter;
  label: string;
  shortLabel: string;
  count: number;
}

const MODE_LABELS: Record<QuizAttempt['mode'], string> = {
  ujian_bab: 'Ujian Per Bab (Utuh)',
  istilahi: 'Latihan: Tashrif Istilahi',
  lughawi: 'Latihan: Tashrif Lughawi',
  tebak_shighat: 'Latihan: Tebak Shighat',
  susun_tashrif: 'Latihan: Susun Tabel',
};

/**
 * Mengonversi pilihan filter jenis soal UI menjadi parameter reset backend/state.
 */
export function questionTypeToParams(
  filter: QuestionTypeFilter
): Pick<ResetAttemptsParams, 'sectionNumber' | 'tashrifType' | 'mode'> {
  if (filter === 'all') return {};
  if (filter === 'tashrif:istilahi') return { tashrifType: 'istilahi' };
  if (filter === 'tashrif:lughawi') return { tashrifType: 'lughawi' };
  if (filter.startsWith('sec:')) {
    const secNum = Number(filter.slice(4));
    if (Number.isInteger(secNum) && secNum >= 1 && secNum <= 12) {
      return { sectionNumber: secNum };
    }
    return {};
  }
  if (filter.startsWith('mode:')) {
    const mode = filter.slice(5) as QuizAttempt['mode'];
    return { sectionNumber: null, mode };
  }
  return {};
}

/**
 * Mengecek apakah sebuah sesi pengerjaan cocok dengan parameter reset yang dipilih.
 */
export function matchesResetParams(
  attempt: QuizAttempt,
  params: ResetAttemptsParams
): boolean {
  if (params.studentId && params.studentId !== 'all' && attempt.studentId !== params.studentId) {
    return false;
  }
  if (params.studentIds && params.studentIds.length > 0) {
    if (!params.studentIds.includes(attempt.studentId)) return false;
  }
  if (params.babId && attempt.babId !== params.babId) {
    return false;
  }
  if (params.sectionNumber === null) {
    if (typeof attempt.sectionNumber === 'number') return false;
  } else if (typeof params.sectionNumber === 'number') {
    if (attempt.sectionNumber !== params.sectionNumber) return false;
  }
  if (params.tashrifType === 'istilahi') {
    const isIstilahiSec =
      typeof attempt.sectionNumber === 'number' &&
      attempt.sectionNumber >= 1 &&
      attempt.sectionNumber <= 6;
    if (!isIstilahiSec && attempt.mode !== 'istilahi') return false;
  } else if (params.tashrifType === 'lughawi') {
    const isLughawiSec =
      typeof attempt.sectionNumber === 'number' &&
      attempt.sectionNumber >= 7 &&
      attempt.sectionNumber <= 12;
    if (!isLughawiSec && attempt.mode !== 'lughawi') return false;
  }
  if (params.mode && attempt.mode !== params.mode) {
    return false;
  }
  return true;
}

/**
 * Menyusun daftar opsi filter "Jenis Soal" beserta jumlah sesinya dari daftar attempt yang tersedia.
 */
export function buildQuestionTypeOptions(
  matchingAttempts: QuizAttempt[]
): QuestionTypeOption[] {
  const options: QuestionTypeOption[] = [
    {
      value: 'all',
      label: `Semua Jenis Soal (${matchingAttempts.length} sesi)`,
      shortLabel: 'Semua Jenis Soal',
      count: matchingAttempts.length,
    },
  ];

  const istilahiCount = matchingAttempts.filter((a) =>
    matchesResetParams(a, { tashrifType: 'istilahi' })
  ).length;
  if (istilahiCount > 0) {
    options.push({
      value: 'tashrif:istilahi',
      label: `Tashrif Istilahi — Semua Bagian 1–6 (${istilahiCount} sesi)`,
      shortLabel: 'Tashrif Istilahi (Bagian 1–6)',
      count: istilahiCount,
    });
  }

  const lughawiCount = matchingAttempts.filter((a) =>
    matchesResetParams(a, { tashrifType: 'lughawi' })
  ).length;
  if (lughawiCount > 0) {
    options.push({
      value: 'tashrif:lughawi',
      label: `Tashrif Lughawi — Semua Bagian 1–6 (${lughawiCount} sesi)`,
      shortLabel: 'Tashrif Lughawi (Bagian 1–6)',
      count: lughawiCount,
    });
  }

  // Per bagian spesifik (Bagian 1-12) yang benar-benar ada di riwayat
  const sectionCounts = new Map<number, number>();
  const nonSectionModeCounts = new Map<QuizAttempt['mode'], number>();
  matchingAttempts.forEach((a) => {
    if (typeof a.sectionNumber === 'number') {
      sectionCounts.set(a.sectionNumber, (sectionCounts.get(a.sectionNumber) || 0) + 1);
    } else {
      nonSectionModeCounts.set(a.mode, (nonSectionModeCounts.get(a.mode) || 0) + 1);
    }
  });

  Array.from(sectionCounts.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([secNum, count]) => {
      const meta = getSectionMeta(secNum);
      const cleanTitle = meta
        ? meta.title.replace(/^Bagian \d+:\s*/, '')
        : `Bagian ${secNum}`;
      const shortLabel = meta
        ? `${meta.shortLabel}: ${cleanTitle}`
        : `Bagian ${secNum}`;
      options.push({
        value: `sec:${secNum}`,
        label: `${shortLabel} (${count} sesi)`,
        shortLabel,
        count,
      });
    });

  Array.from(nonSectionModeCounts.entries()).forEach(([mode, count]) => {
    const labelText = MODE_LABELS[mode] || mode;
    options.push({
      value: `mode:${mode}`,
      label: `${labelText} (${count} sesi)`,
      shortLabel: labelText,
      count,
    });
  });

  return options;
}
