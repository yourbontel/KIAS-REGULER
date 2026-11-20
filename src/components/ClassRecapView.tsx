import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Download, RotateCcw, Search, Trash2, X } from 'lucide-react';
import {
  ManualScoreRecord,
  PASSING_SCORE,
  QuizAttempt,
  SetoranRecord,
  Student,
  StudentClass,
  StudentGender,
} from '../data/students';
import { ALL_SHOROF_BABS, getBabsForClass } from '../data/shorofData';
import {
  buildQuestionTypeOptions,
  matchesResetParams,
  questionTypeToParams,
  type QuestionTypeFilter,
  type ResetAttemptsParams,
} from '../utils/attemptFilter';
import { SECTION_NUMBERS, summarizeBabAttempts } from '../utils/babScores';
import { computeFinalGradeSummary, formatGradeNumber } from '../utils/finalGrades';
import { ResetConfirmModal } from './ResetConfirmModal';
import { SuccessToast } from './SuccessToast';

type PendingResetAction =
  | {
      kind: 'single-attempt';
      attempt: QuizAttempt;
      studentName: string;
    }
  | {
      kind: 'filtered-reset';
      targetLabel: string;
      babLabel: string;
      questionTypeLabel: string;
      sessionCount: number;
      params: ResetAttemptsParams;
    }
  | {
      kind: 'clear-all';
      totalCount: number;
    };

interface ClassRecapViewProps {
  students: Student[];
  attempts: QuizAttempt[];
  setoranMap: Record<string, SetoranRecord>;
  manualScoresMap?: Record<string, ManualScoreRecord>;
  onOpenManualScores?: () => void;
  onDeleteAttempt?: (attemptId: string) => Promise<string | null>;
  onResetStudentAttempts?: (params: ResetAttemptsParams) => Promise<string | null>;
  onClearHistory: () => Promise<string | null>;
}

const COHORTS: { kelas: StudentClass; gender: StudentGender; desc: string }[] = [
  {
    kelas: 'Reguler 1',
    gender: 'Ikhwan',
    desc: 'Kelompok Putra Kelas Reguler 1',
  },
  {
    kelas: 'Reguler 1',
    gender: 'Akhwat',
    desc: 'Kelompok Putri Kelas Reguler 1',
  },
  {
    kelas: 'Reguler 2',
    gender: 'Ikhwan',
    desc: 'Kelompok Putra Kelas Reguler 2',
  },
  {
    kelas: 'Reguler 2',
    gender: 'Akhwat',
    desc: 'Kelompok Putri Kelas Reguler 2',
  },
];

const MODE_LABELS: Record<QuizAttempt['mode'], string> = {
  ujian_bab: 'Ujian Per Bab',
  istilahi: 'Tashrif Istilahi',
  lughawi: 'Tashrif Lughawi',
  tebak_shighat: 'Tebak Shighat',
  susun_tashrif: 'Susun Tabel',
};

export const ClassRecapView: React.FC<ClassRecapViewProps> = ({
  students,
  attempts,
  setoranMap,
  manualScoresMap = {},
  onOpenManualScores,
  onDeleteAttempt,
  onResetStudentAttempts,
  onClearHistory,
}) => {
  const [matrixClass, setMatrixClass] = useState<StudentClass>('Reguler 1');
  const [matrixGender, setMatrixGender] = useState<'Semua' | StudentGender>('Semua');
  const [matrixSearch, setMatrixSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [resetTarget, setResetTarget] = useState<'__all__' | `__class:${StudentClass}__` | string>('__all__');
  const [resetBabId, setResetBabId] = useState<'all' | string>('all');
  const [resetQuestionType, setResetQuestionType] = useState<QuestionTypeFilter>('all');
  const [resetBusy, setResetBusy] = useState(false);
  const [pendingReset, setPendingReset] = useState<PendingResetAction | null>(null);
  const [resetModalError, setResetModalError] = useState<string | null>(null);
  const [resetNotice, setResetNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const activeBabs = useMemo(() => getBabsForClass(matrixClass), [matrixClass]);

  const studentsWithAttempts = useMemo(() => {
    const counts: Record<string, number> = {};
    attempts.forEach((a) => {
      counts[a.studentId] = (counts[a.studentId] || 0) + 1;
    });
    return students
      .filter((s) => (counts[s.id] || 0) > 0)
      .map((s) => ({ student: s, count: counts[s.id] }));
  }, [students, attempts]);

  const classTargetOptions = useMemo(() => {
    const r1Ids = new Set(students.filter((s) => s.kelas === 'Reguler 1').map((s) => s.id));
    const r2Ids = new Set(students.filter((s) => s.kelas === 'Reguler 2').map((s) => s.id));
    const r1Count = attempts.filter((a) => r1Ids.has(a.studentId)).length;
    const r2Count = attempts.filter((a) => r2Ids.has(a.studentId)).length;
    return [
      ...(r1Count > 0 ? [{ value: '__class:Reguler 1__' as const, label: `Semua Siswa Reguler 1 (${r1Count} sesi)`, ids: Array.from(r1Ids) }] : []),
      ...(r2Count > 0 ? [{ value: '__class:Reguler 2__' as const, label: `Semua Siswa Reguler 2 (${r2Count} sesi)`, ids: Array.from(r2Ids) }] : []),
    ];
  }, [students, attempts]);

  useEffect(() => {
    if (resetTarget === '__all__') return;
    if (resetTarget.startsWith('__class:')) {
      if (!classTargetOptions.some((c) => c.value === resetTarget)) {
        setResetTarget('__all__');
      }
      return;
    }
    if (!studentsWithAttempts.some((item) => item.student.id === resetTarget)) {
      setResetTarget('__all__');
    }
  }, [studentsWithAttempts, classTargetOptions, resetTarget]);

  const resetTargetScope = useMemo<{
    label: string;
    studentId?: string;
    studentIds?: string[];
  }>(() => {
    if (resetTarget === '__all__') {
      return { label: 'Semua Siswa' };
    }
    const clsOpt = classTargetOptions.find((c) => c.value === resetTarget);
    if (clsOpt) {
      const kelasName = resetTarget.replace('__class:', '').replace('__', '');
      return { label: `Semua Siswa ${kelasName}`, studentIds: clsOpt.ids };
    }
    const st = students.find((s) => s.id === resetTarget);
    return { label: st?.name || 'Siswa', studentId: resetTarget };
  }, [resetTarget, classTargetOptions, students]);

  const targetScopedAttempts = useMemo(
    () =>
      attempts.filter((a) =>
        matchesResetParams(a, {
          studentId: resetTargetScope.studentId,
          studentIds: resetTargetScope.studentIds,
        })
      ),
    [attempts, resetTargetScope]
  );

  const resetBabOptions = useMemo(() => {
    const counts: Record<string, { kode: string; count: number }> = {};
    targetScopedAttempts.forEach((a) => {
      const babMeta = ALL_SHOROF_BABS.find((b) => b.id === a.babId);
      const kode = babMeta?.kode || a.babId;
      if (!counts[a.babId]) counts[a.babId] = { kode, count: 0 };
      counts[a.babId].count += 1;
    });
    return Object.entries(counts).map(([babId, info]) => ({
      babId,
      kode: info.kode,
      count: info.count,
    }));
  }, [targetScopedAttempts]);

  useEffect(() => {
    if (
      resetBabId !== 'all' &&
      !resetBabOptions.some((b) => b.babId === resetBabId)
    ) {
      setResetBabId('all');
    }
  }, [resetBabOptions, resetBabId]);

  const babScopedAttempts = useMemo(() => {
    if (resetBabId === 'all') return targetScopedAttempts;
    return targetScopedAttempts.filter((a) => a.babId === resetBabId);
  }, [targetScopedAttempts, resetBabId]);

  const resetQuestionTypeOptions = useMemo(
    () => buildQuestionTypeOptions(babScopedAttempts),
    [babScopedAttempts]
  );

  useEffect(() => {
    if (!resetQuestionTypeOptions.some((o) => o.value === resetQuestionType)) {
      setResetQuestionType('all');
    }
  }, [resetQuestionTypeOptions, resetQuestionType]);

  const activeResetParams = useMemo<ResetAttemptsParams>(() => {
    return {
      ...(resetTargetScope.studentId ? { studentId: resetTargetScope.studentId } : {}),
      ...(resetTargetScope.studentIds ? { studentIds: resetTargetScope.studentIds } : {}),
      ...(resetBabId !== 'all' ? { babId: resetBabId } : {}),
      ...questionTypeToParams(resetQuestionType),
    };
  }, [resetTargetScope, resetBabId, resetQuestionType]);

  const filteredResetCount = useMemo(
    () => targetScopedAttempts.filter((a) => matchesResetParams(a, activeResetParams)).length,
    [targetScopedAttempts, activeResetParams]
  );

  const filteredHistoryAttempts = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return attempts;
    return attempts.filter((att) => {
      const st = students.find((s) => s.id === att.studentId);
      return (
        att.babLabel.toLowerCase().includes(q) ||
        (st?.name.toLowerCase().includes(q) ?? false) ||
        (st?.kelas.toLowerCase().includes(q) ?? false)
      );
    });
  }, [attempts, students, historySearch]);

  const handleOpenResetSelectedStudent = () => {
    if (!onResetStudentAttempts || filteredResetCount === 0) return;
    if (
      resetTarget === '__all__' &&
      resetBabId === 'all' &&
      resetQuestionType === 'all'
    ) {
      handleOpenClearAll();
      return;
    }
    const babLabel =
      resetBabId === 'all'
        ? 'Semua Bab'
        : resetBabOptions.find((b) => b.babId === resetBabId)?.kode || resetBabId;
    const questionTypeLabel =
      resetQuestionTypeOptions.find((o) => o.value === resetQuestionType)?.shortLabel ||
      'Semua Jenis Soal';
    setResetModalError(null);
    setPendingReset({
      kind: 'filtered-reset',
      targetLabel: resetTargetScope.label,
      babLabel,
      questionTypeLabel,
      sessionCount: filteredResetCount,
      params: activeResetParams,
    });
  };

  const handleOpenResetSingleAttempt = (att: QuizAttempt) => {
    if (!onDeleteAttempt) return;
    const st = students.find((s) => s.id === att.studentId);
    setResetModalError(null);
    setPendingReset({
      kind: 'single-attempt',
      attempt: att,
      studentName: st?.name || 'Siswa',
    });
  };

  const handleOpenClearAll = () => {
    setResetModalError(null);
    setPendingReset({
      kind: 'clear-all',
      totalCount: attempts.length,
    });
  };

  const handleConfirmPendingReset = async () => {
    if (!pendingReset) return;
    setResetModalError(null);
    setResetNotice(null);
    setResetBusy(true);

    if (pendingReset.kind === 'single-attempt') {
      const error = await onDeleteAttempt?.(pendingReset.attempt.id);
      setResetBusy(false);
      if (error) {
        setResetModalError(error);
        return;
      }
      setResetNotice({
        type: 'success',
        text: `Pengerjaan "${pendingReset.attempt.babLabel}" milik ${pendingReset.studentName} berhasil direset.`,
      });
      setPendingReset(null);
      return;
    }

    if (pendingReset.kind === 'filtered-reset') {
      const error = await onResetStudentAttempts?.(pendingReset.params);
      setResetBusy(false);
      if (error) {
        setResetModalError(error);
        return;
      }
      setResetNotice({
        type: 'success',
        text: `Pengerjaan soal (${pendingReset.babLabel} · ${pendingReset.questionTypeLabel}) untuk ${pendingReset.targetLabel} berhasil direset.`,
      });
      setPendingReset(null);
      return;
    }

    const error = await onClearHistory();
    setResetBusy(false);
    if (error) {
      setResetModalError(error);
      return;
    }
    setPendingReset(null);
    setResetNotice({
      type: 'success',
      text: 'Seluruh riwayat pengerjaan ujian berhasil direset.',
    });
  };

  // Precompute best score per student per bab (Bab per-Bagian = rata-rata 12 Bagian bila lengkap)
  const { bestScoreMap, partialSectionsMap } = useMemo(() => {
    const byStudent: Record<string, QuizAttempt[]> = {};
    attempts.forEach((att) => {
      if (!byStudent[att.studentId]) byStudent[att.studentId] = [];
      byStudent[att.studentId].push(att);
    });

    const map: Record<string, Record<string, number>> = {};
    const partial: Record<string, Record<string, number>> = {};
    Object.entries(byStudent).forEach(([studentId, list]) => {
      map[studentId] = {};
      partial[studentId] = {};
      ALL_SHOROF_BABS.forEach((bab) => {
        const summary = summarizeBabAttempts(bab, list);
        if (summary.bestScore !== null) {
          map[studentId][bab.id] = summary.bestScore;
        } else if (summary.sectioned && summary.completedSections > 0) {
          partial[studentId][bab.id] = summary.completedSections;
        }
      });
    });
    return { bestScoreMap: map, partialSectionsMap: partial };
  }, [attempts]);

  const filteredMatrixStudents = useMemo(() => {
    const q = matrixSearch.trim().toLowerCase();
    return students.filter((s) => {
      if (s.kelas !== matrixClass) return false;
      if (matrixGender !== 'Semua' && s.gender !== matrixGender) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.kota.toLowerCase().includes(q);
    });
  }, [students, matrixClass, matrixGender, matrixSearch]);

  const isSemester1Reguler1 = matrixClass === 'Reguler 1';

  const handleExportMatrixCSV = () => {
    const headers = [
      'Nama Siswa',
      'Kelas',
      'Kelompok',
      ...activeBabs.map((b) => b.kode),
      ...(isSemester1Reguler1
        ? [
            'Rata-rata Web (50%)',
            'UTS Sem. 1 (10%)',
            'UAS Sem. 1 (40%)',
            'Nilai Akhir Sem. 1',
          ]
        : ['Rata-rata']),
    ];
    const rows = filteredMatrixStudents.map((st) => {
      const scoresMap = bestScoreMap[st.id] || {};
      const babScores = activeBabs.map((b) => scoresMap[b.id]);
      const validScores = babScores.filter((v): v is number => v !== undefined);
      const avg =
        validScores.length > 0
          ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
          : null;
      const gradeSummary = computeFinalGradeSummary(avg, manualScoresMap[st.id]);
      return [
        `"${st.name}"`,
        `"${st.kelas}"`,
        `"${st.gender}"`,
        ...babScores.map((v) => (v !== undefined ? v : '-')),
        avg !== null ? avg : '-',
        ...(isSemester1Reguler1
          ? [
              gradeSummary.utsScore !== null ? gradeSummary.utsScore : '-',
              gradeSummary.uasScore !== null ? gradeSummary.uasScore : '-',
              gradeSummary.finalScore !== null ? formatGradeNumber(gradeSummary.finalScore) : '-',
            ]
          : []),
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Nilai_Per_Bab_${matrixClass.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* 4 Separated Cohort Cards */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Ringkasan 4 Kelompok Belajar (Reguler 1 &amp; 2 · Ikhwan / Akhwat)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan jumlah siswa, penyelesaian ujian, rata-rata nilai, dan setoran lisan per kelompok.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {COHORTS.map((c) => {
            const cohortStudents = students.filter(
              (s) => s.kelas === c.kelas && s.gender === c.gender
            );
            const cohortIds = new Set(cohortStudents.map((s) => s.id));
            const cohortAttempts = attempts.filter((a) =>
              cohortIds.has(a.studentId)
            );
            const avgScore =
              cohortAttempts.length > 0
                ? Math.round(
                    cohortAttempts.reduce((sum, a) => sum + a.score, 0) /
                      cohortAttempts.length
                  )
                : 0;

            const totalSetoranBabs = cohortStudents.reduce(
              (acc, st) =>
                acc + (setoranMap[st.id]?.completedBabs?.length || 0),
              0
            );

            return (
              <div
                key={`${c.kelas}-${c.gender}`}
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs text-slate-500">
                    {c.kelas} · {c.gender}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {c.kelas} ({c.gender})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>

                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jumlah Siswa:</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {cohortStudents.length} Murid
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ujian Diselesaikan:</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {cohortAttempts.length} Kali
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rata-rata Nilai:</span>
                      <span className="font-semibold text-emerald-800 tabular-nums">
                        {cohortAttempts.length > 0 ? avgScore : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Setoran Lisan Lulus:</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {totalSetoranBabs} Bab
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Bab Score Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isSemester1Reguler1
                ? 'Matriks Nilai Ujian Per Bab & Nilai Akhir Semester 1 (Reguler 1)'
                : 'Matriks Nilai Ujian Siswa Per Bab (Reguler 2)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSemester1Reguler1
                ? `Nilai Akhir Semester 1 = 50% Rata-rata Ujian Web + 10% UTS + 40% UAS (KKM ${PASSING_SCORE}+).`
                : 'Belum ada soal ujian dan penilaian Semester 1 untuk Reguler 2.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isSemester1Reguler1 && onOpenManualScores && (
              <button
                type="button"
                onClick={onOpenManualScores}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                Input UTS &amp; UAS (Sem. 1)
              </button>
            )}
            <select
              aria-label="Filter Kelas Matriks"
              value={matrixClass}
              onChange={(e) =>
                setMatrixClass(e.target.value as StudentClass)
              }
              className="px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg"
            >
              <option value="Reguler 1">Reguler 1 (14 Bab)</option>
              <option value="Reguler 2">Reguler 2 (Belum ada soal)</option>
            </select>

            <select
              aria-label="Filter Kelompok Matriks"
              value={matrixGender}
              onChange={(e) =>
                setMatrixGender(e.target.value as 'Semua' | StudentGender)
              }
              className="px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg"
            >
              <option value="Semua">Ikhwan &amp; Akhwat</option>
              <option value="Ikhwan">Ikhwan</option>
              <option value="Akhwat">Akhwat</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
                placeholder="Cari siswa..."
                className="pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg w-40 sm:w-48"
              />
            </div>

            <button
              type="button"
              onClick={handleExportMatrixCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4 w-10 tabular-nums">No</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Siswa</th>
                {activeBabs.map((bab) => (
                  <th
                    key={bab.id}
                    className="py-3 px-2.5 text-center whitespace-nowrap"
                  >
                    {bab.kode}
                  </th>
                ))}
                <th className="py-3 px-3 text-right whitespace-nowrap">
                  {isSemester1Reguler1 ? 'Web (50%)' : 'Rata-rata'}
                </th>
                {isSemester1Reguler1 && (
                  <>
                    <th className="py-3 px-3 text-right whitespace-nowrap">
                      UTS Sem. 1 (10%)
                    </th>
                    <th className="py-3 px-3 text-right whitespace-nowrap">
                      UAS Sem. 1 (40%)
                    </th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">
                      Nilai Akhir Sem. 1
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredMatrixStudents.map((st, idx) => {
                const stScores = bestScoreMap[st.id] || {};
                const validScores = activeBabs.map((b) => stScores[b.id]).filter(
                  (v): v is number => v !== undefined
                );
                const avg =
                  validScores.length > 0
                    ? Math.round(
                        validScores.reduce((a, b) => a + b, 0) /
                          validScores.length
                      )
                    : null;
                const gradeSummary = computeFinalGradeSummary(
                  avg,
                  manualScoresMap[st.id]
                );

                return (
                  <tr key={st.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 text-slate-400 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {st.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {st.kelas} · {st.gender}
                      </div>
                    </td>
                    {activeBabs.map((bab) => {
                      const val = stScores[bab.id];
                      return (
                        <td
                          key={bab.id}
                          className="py-2.5 px-2.5 text-center tabular-nums"
                        >
                          {val !== undefined ? (
                            <span
                              className={`inline-block min-w-[2.2rem] px-1.5 py-0.5 rounded font-bold text-[11px] ${
                                val >= PASSING_SCORE
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {val}
                            </span>
                          ) : partialSectionsMap[st.id]?.[bab.id] ? (
                            <span
                              title="Bagian yang sudah dikerjakan"
                              className="inline-block min-w-[2.2rem] px-1.5 py-0.5 rounded font-semibold text-[10px] bg-sky-50 text-sky-800 border border-sky-200"
                            >
                              {partialSectionsMap[st.id][bab.id]}/{SECTION_NUMBERS.length}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-700">
                      {avg !== null ? avg : '—'}
                    </td>
                    {isSemester1Reguler1 && (
                      <>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                          {gradeSummary.utsScore !== null ? gradeSummary.utsScore : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">
                          {gradeSummary.uasScore !== null ? gradeSummary.uasScore : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-right tabular-nums font-bold">
                          {gradeSummary.finalScore !== null ? (
                            <span
                              title={
                                gradeSummary.isComplete
                                  ? 'Nilai Akhir Semester 1 (50% Web + 10% UTS + 40% UAS)'
                                  : 'Nilai Sementara (menunggu komponen Web/UTS/UAS lengkap)'
                              }
                              className={
                                !gradeSummary.isComplete
                                  ? 'text-slate-700'
                                  : gradeSummary.passed
                                  ? 'text-emerald-700'
                                  : 'text-amber-700'
                              }
                            >
                              {formatGradeNumber(gradeSummary.finalScore)}
                              {!gradeSummary.isComplete && (
                                <span className="ml-1 text-[10px] font-medium text-sky-700">
                                  *
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Exam Attempts Log + Reset Controls */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Riwayat &amp; Reset Pengerjaan Soal Siswa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reset pengerjaan per soal/bagian atau per siswa jika siswa perlu mengulang ujian.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {attempts.length > 0 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Cari riwayat siswa / bab..."
                  className="pl-8 pr-7 py-1.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg w-48"
                />
                {historySearch && (
                  <button
                    type="button"
                    onClick={() => setHistorySearch('')}
                    aria-label="Hapus pencarian riwayat"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            {attempts.length > 0 && (
              <button
                type="button"
                onClick={handleOpenClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Reset Semua Riwayat
              </button>
            )}
          </div>
        </div>

        {/* Targeted Reset Pengerjaan Panel */}
        {attempts.length > 0 && onResetStudentAttempts && (
          <div className="px-6 py-3.5 bg-[#F8FAFC] border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              Reset Soal per Target / Jenis Soal:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Pilih Target Siswa untuk Reset Pengerjaan"
                value={resetTarget}
                onChange={(e) => setResetTarget(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg max-w-[220px]"
              >
                <option value="__all__">
                  Semua Siswa ({attempts.length} sesi)
                </option>
                {classTargetOptions.map((clsOpt) => (
                  <option key={clsOpt.value} value={clsOpt.value}>
                    {clsOpt.label}
                  </option>
                ))}
                {studentsWithAttempts.map(({ student, count }) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.kelas} · {count} sesi)
                  </option>
                ))}
              </select>

              <select
                aria-label="Pilih Bab untuk Reset Pengerjaan"
                value={resetBabId}
                onChange={(e) => setResetBabId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
              >
                <option value="all">
                  Semua Bab ({targetScopedAttempts.length} sesi)
                </option>
                {resetBabOptions.map((opt) => (
                  <option key={opt.babId} value={opt.babId}>
                    {opt.kode} ({opt.count} sesi)
                  </option>
                ))}
              </select>

              <select
                aria-label="Pilih Jenis Soal untuk Reset Pengerjaan"
                value={resetQuestionType}
                onChange={(e) => setResetQuestionType(e.target.value as QuestionTypeFilter)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg max-w-[280px]"
              >
                {resetQuestionTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleOpenResetSelectedStudent}
                disabled={filteredResetCount === 0 || resetBusy}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Pengerjaan
              </button>
            </div>
          </div>
        )}

        {resetNotice && (
          <div
            className={`px-6 py-2.5 text-xs border-b ${
              resetNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {resetNotice.text}
          </div>
        )}

        {attempts.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Belum ada ujian yang diselesaikan. Siswa dapat memulai ujian pada halaman Ujian Per Bab.
          </div>
        ) : filteredHistoryAttempts.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Tidak ada riwayat pengerjaan yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-600">
                  <th className="py-3 px-5">Waktu</th>
                  <th className="py-3 px-5">Nama Siswa</th>
                  <th className="py-3 px-5">Kelas &amp; Kelompok</th>
                  <th className="py-3 px-5">Bab &amp; Jenis</th>
                  <th className="py-3 px-5 text-right">Benar / Soal</th>
                  <th className="py-3 px-5 text-right">Nilai</th>
                  {onDeleteAttempt && (
                    <th className="py-3 px-5 text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredHistoryAttempts.map((att) => {
                  const st = students.find((s) => s.id === att.studentId);
                  return (
                    <tr key={att.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-5 text-slate-500 tabular-nums whitespace-nowrap">
                        {att.timestamp}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-900">
                        {st?.name || 'Siswa'}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">
                        {st?.kelas} · {st?.gender}
                      </td>
                      <td className="py-3.5 px-5 text-slate-700">
                        {att.babLabel} · {MODE_LABELS[att.mode]}
                      </td>
                      <td className="py-3.5 px-5 text-right tabular-nums text-slate-700">
                        {att.correctCount} / {att.totalQuestions}
                      </td>
                      <td className="py-3.5 px-5 text-right tabular-nums font-bold">
                        <span
                          className={
                            att.score >= PASSING_SCORE
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }
                        >
                          {att.score}
                        </span>
                      </td>
                      {onDeleteAttempt && (
                        <td className="py-3.5 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenResetSingleAttempt(att)}
                            disabled={resetBusy}
                            title={`Reset pengerjaan "${att.babLabel}" untuk ${st?.name || 'Siswa'}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ResetConfirmModal
        isOpen={Boolean(pendingReset)}
        title={
          pendingReset?.kind === 'clear-all'
            ? 'Reset Semua Riwayat Ujian?'
            : 'Reset Pengerjaan Soal?'
        }
        subtitle="Konfirmasi apakah soal ini ingin direset atau tidak"
        targetLabel={
          pendingReset?.kind === 'single-attempt'
            ? pendingReset.studentName
            : pendingReset?.kind === 'filtered-reset'
            ? pendingReset.targetLabel
            : 'Seluruh Siswa'
        }
        detailText={
          pendingReset?.kind === 'single-attempt'
            ? `${pendingReset.attempt.babLabel} · Nilai sebelumnya: ${pendingReset.attempt.score}`
            : pendingReset?.kind === 'filtered-reset'
            ? `${pendingReset.babLabel} · ${pendingReset.questionTypeLabel} (${pendingReset.sessionCount} sesi pengerjaan)`
            : pendingReset
            ? `${pendingReset.totalCount} riwayat pengerjaan ujian akan dihapus`
            : ''
        }
        warningText={
          pendingReset?.kind === 'clear-all'
            ? 'Apakah Anda yakin ingin mereset seluruh riwayat ujian semua siswa? Tindakan ini menghapus semua nilai ujian web dan tidak dapat dibatalkan.'
            : 'Apakah soal yang sudah dikerjakan ini ingin direset? Data riwayat sebelumnya akan dihapus sehingga siswa dapat mengerjakan soal tersebut kembali.'
        }
        confirmLabel={
          pendingReset?.kind === 'clear-all' ? 'Ya, Reset Semua' : 'Ya, Reset Soal'
        }
        loading={resetBusy}
        error={resetModalError}
        onCancel={() => {
          if (!resetBusy) setPendingReset(null);
        }}
        onConfirm={() => void handleConfirmPendingReset()}
      />

      <SuccessToast
        title="Reset Soal Berhasil"
        message={resetNotice?.type === 'success' ? resetNotice.text : null}
        onClose={() => setResetNotice(null)}
      />
    </div>
  );
};
