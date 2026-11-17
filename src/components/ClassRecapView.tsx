import React, { useMemo, useState } from 'react';
import { Download, Play, Search, Trash2 } from 'lucide-react';
import {
  PASSING_SCORE,
  QuizAttempt,
  SetoranRecord,
  Student,
  StudentClass,
  StudentGender,
} from '../data/students';
import { ALL_SHOROF_BABS, getBabsForClass } from '../data/shorofData';
import { summarizeBabAttempts } from '../utils/babScores';

interface ClassRecapViewProps {
  students: Student[];
  attempts: QuizAttempt[];
  setoranMap: Record<string, SetoranRecord>;
  onJumpToCohortPractice: (kelas: StudentClass, gender: StudentGender) => void;
  onClearHistory: () => void;
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
  onJumpToCohortPractice,
  onClearHistory,
}) => {
  const [matrixClass, setMatrixClass] = useState<StudentClass>('Reguler 1');
  const [matrixGender, setMatrixGender] = useState<'Semua' | StudentGender>('Semua');
  const [matrixSearch, setMatrixSearch] = useState('');

  const activeBabs = useMemo(() => getBabsForClass(matrixClass), [matrixClass]);

  // Precompute best score per student per bab (Bab per-Bagian = rata-rata 6 Bagian bila lengkap)
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

  const handleExportMatrixCSV = () => {
    const headers = [
      'Nama Siswa',
      'Kelas',
      'Kelompok',
      ...activeBabs.map((b) => b.kode),
      'Rata-rata',
    ];
    const rows = filteredMatrixStudents.map((st) => {
      const scoresMap = bestScoreMap[st.id] || {};
      const babScores = activeBabs.map((b) => scoresMap[b.id]);
      const validScores = babScores.filter((v): v is number => v !== undefined);
      const avg =
        validScores.length > 0
          ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
          : '';
      return [
        `"${st.name}"`,
        `"${st.kelas}"`,
        `"${st.gender}"`,
        ...babScores.map((v) => (v !== undefined ? v : '-')),
        avg,
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
            Klik tombol pada salah satu kelompok untuk membuka simulasi ujian per bab bagi kelompok tersebut.
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

                <button
                  type="button"
                  onClick={() => onJumpToCohortPractice(c.kelas, c.gender)}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  Ujian Kelompok Ini
                </button>
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
              Matriks Nilai Ujian Siswa Per Bab (Nilai Terbaik)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hijau menandakan lulus KKM ({PASSING_SCORE}+), oranye menandakan perlu mengulang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter Kelas Matriks"
              value={matrixClass}
              onChange={(e) =>
                setMatrixClass(e.target.value as StudentClass)
              }
              className="px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg"
            >
              <option value="Reguler 1">Reguler 1 (14 Bab)</option>
              <option value="Reguler 2">Reguler 2 (9 Bab)</option>
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
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Rata-rata
                </th>
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
                              {partialSectionsMap[st.id][bab.id]}/6
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-4 text-right tabular-nums font-bold text-slate-900">
                      {avg !== null ? avg : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Exam Attempts Log */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Pengerjaan Ujian Terbaru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan otomatis hasil ujian per bab yang dikerjakan oleh siswa.
            </p>
          </div>
          {attempts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    'Hapus seluruh riwayat nilai ujian siswa? Tindakan ini tidak dapat dibatalkan.'
                  )
                ) {
                  onClearHistory();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Bersihkan Riwayat
            </button>
          )}
        </div>

        {attempts.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Belum ada ujian yang diselesaikan. Siswa atau Superadmin dapat memulai ujian di tab Ujian Per Bab.
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {attempts.map((att) => {
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
