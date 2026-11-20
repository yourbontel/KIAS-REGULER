import {
  ManualScoreRecord,
  PASSING_SCORE,
  QuizAttempt,
  SetoranRecord,
  Student,
  StudentClass,
  StudentGender,
} from '../data/students';
import { getBabsForClass } from '../data/shorofData';
import { summarizeBabAttempts } from './babScores';
import { computeFinalGradeSummary } from './finalGrades';

export type RankingSortMode = 'total_score' | 'final_grade';

export interface RankedStudentEntry {
  student: Student;
  rank: number | null;
  totalScore: number;
  avgScore: number | null;
  utsScore: number | null;
  uasScore: number | null;
  finalScore: number | null;
  finalGradeComplete: boolean;
  finalGradePassed: boolean;
  completedBabsCount: number;
  totalBabsForClass: number;
  passedBabsCount: number;
  setoranCount: number;
  totalAttempts: number;
  /** Khusus filter per-Bab: nilai pada Bab yang dipilih */
  selectedBabScore: number | null;
  /** Khusus filter per-Bab bertipe sectioned: jumlah Bagian selesai (0-12) */
  selectedBabPartialSections: number;
}

export interface RankingFilterOptions {
  kelas?: 'Semua' | StudentClass;
  gender?: 'Semua' | StudentGender;
  babId?: 'all' | string;
  search?: string;
  manualScoresMap?: Record<string, ManualScoreRecord>;
  sortMode?: RankingSortMode;
}

export function computeStudentRankings(
  students: Student[],
  attempts: QuizAttempt[],
  setoranMap: Record<string, SetoranRecord>,
  options: RankingFilterOptions = {}
): RankedStudentEntry[] {
  const {
    kelas = 'Semua',
    gender = 'Semua',
    babId = 'all',
    search = '',
    manualScoresMap = {},
    sortMode = 'total_score',
  } = options;

  const q = search.trim().toLowerCase();

  // Group attempts per student once (O(N))
  const attemptsByStudent: Record<string, QuizAttempt[]> = {};
  attempts.forEach((att) => {
    if (!attemptsByStudent[att.studentId]) {
      attemptsByStudent[att.studentId] = [];
    }
    attemptsByStudent[att.studentId].push(att);
  });

  const filtered = students.filter((s) => {
    if (kelas !== 'Semua' && s.kelas !== kelas) return false;
    if (gender !== 'Semua' && s.gender !== gender) return false;
    if (q && !s.name.toLowerCase().includes(q) && !s.kota.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });

  const entries: RankedStudentEntry[] = filtered.map((student) => {
    const stAttempts = attemptsByStudent[student.id] || [];
    const classBabs = getBabsForClass(student.kelas);

    let totalScore = 0;
    let completedBabsCount = 0;
    let passedBabsCount = 0;
    let selectedBabScore: number | null = null;
    let selectedBabPartialSections = 0;

    classBabs.forEach((bab) => {
      const summary = summarizeBabAttempts(bab, stAttempts);
      if (summary.bestScore !== null) {
        completedBabsCount += 1;
        totalScore += summary.bestScore;
        if (summary.passed) passedBabsCount += 1;
      }
      if (babId !== 'all' && bab.id === babId) {
        selectedBabScore = summary.bestScore;
        if (summary.sectioned && summary.bestScore === null) {
          selectedBabPartialSections = summary.completedSections;
        }
      }
    });

    const avgScore =
      completedBabsCount > 0 ? Math.round(totalScore / completedBabsCount) : null;
    const gradeSummary = computeFinalGradeSummary(
      avgScore,
      manualScoresMap[student.id]
    );

    return {
      student,
      rank: null,
      totalScore,
      avgScore,
      utsScore: gradeSummary.utsScore,
      uasScore: gradeSummary.uasScore,
      finalScore: gradeSummary.finalScore,
      finalGradeComplete: gradeSummary.isComplete,
      finalGradePassed: gradeSummary.passed,
      completedBabsCount,
      totalBabsForClass: classBabs.length,
      passedBabsCount,
      setoranCount: setoranMap[student.id]?.completedBabs?.length || 0,
      totalAttempts: stAttempts.length,
      selectedBabScore,
      selectedBabPartialSections,
    };
  });

  // Sort: students with score first, then unranked at the bottom alphabetically
  entries.sort((a, b) => {
    if (babId !== 'all') {
      const aHas = a.selectedBabScore !== null;
      const bHas = b.selectedBabScore !== null;
      if (aHas !== bHas) return aHas ? -1 : 1;
      if (aHas && bHas && a.selectedBabScore !== b.selectedBabScore) {
        return (b.selectedBabScore ?? 0) - (a.selectedBabScore ?? 0);
      }
      if (a.selectedBabPartialSections !== b.selectedBabPartialSections) {
        return b.selectedBabPartialSections - a.selectedBabPartialSections;
      }
      if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
      return a.student.name.localeCompare(b.student.name, 'id');
    }

    if (sortMode === 'final_grade') {
      const aHas = a.finalScore !== null;
      const bHas = b.finalScore !== null;
      if (aHas !== bHas) return aHas ? -1 : 1;
      if ((a.finalScore ?? 0) !== (b.finalScore ?? 0)) {
        return (b.finalScore ?? 0) - (a.finalScore ?? 0);
      }
      if (a.finalGradeComplete !== b.finalGradeComplete) {
        return a.finalGradeComplete ? -1 : 1;
      }
      if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
      return a.student.name.localeCompare(b.student.name, 'id');
    }

    const aHas = a.completedBabsCount > 0;
    const bHas = b.completedBabsCount > 0;
    if (aHas !== bHas) return aHas ? -1 : 1;
    if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
    if ((a.avgScore ?? 0) !== (b.avgScore ?? 0)) {
      return (b.avgScore ?? 0) - (a.avgScore ?? 0);
    }
    if (a.passedBabsCount !== b.passedBabsCount) {
      return b.passedBabsCount - a.passedBabsCount;
    }
    if (a.setoranCount !== b.setoranCount) {
      return b.setoranCount - a.setoranCount;
    }
    return a.student.name.localeCompare(b.student.name, 'id');
  });

  // Assign competition rank (1, 2, 2, 4...) for students who have a score
  let lastScoreKey: string | null = null;
  let lastRank = 0;
  let scoredCount = 0;

  entries.forEach((entry) => {
    const hasScore =
      babId !== 'all'
        ? entry.selectedBabScore !== null
        : sortMode === 'final_grade'
        ? entry.finalScore !== null
        : entry.completedBabsCount > 0;
    if (!hasScore) {
      entry.rank = null;
      return;
    }
    scoredCount += 1;
    const scoreKey =
      babId !== 'all'
        ? `${entry.selectedBabScore}`
        : sortMode === 'final_grade'
        ? `${entry.finalScore}-${entry.finalGradeComplete ? 1 : 0}`
        : `${entry.totalScore}-${entry.avgScore ?? 0}`;
    if (scoreKey === lastScoreKey) {
      entry.rank = lastRank;
    } else {
      entry.rank = scoredCount;
      lastRank = scoredCount;
      lastScoreKey = scoreKey;
    }
  });

  return entries;
}

export function isEntryPassing(
  entry: RankedStudentEntry,
  babId: 'all' | string,
  sortMode: RankingSortMode = 'total_score'
): boolean {
  if (babId !== 'all') {
    return entry.selectedBabScore !== null && entry.selectedBabScore >= PASSING_SCORE;
  }
  if (sortMode === 'final_grade') {
    return entry.finalGradePassed;
  }
  return entry.avgScore !== null && entry.avgScore >= PASSING_SCORE;
}
