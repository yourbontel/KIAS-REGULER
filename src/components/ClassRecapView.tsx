import React from 'react';
import { Trash2, Play } from 'lucide-react';
import {
  Student,
  StudentClass,
  StudentGender,
  QuizAttempt,
  SetoranRecord,
} from '../data/students';

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

export const ClassRecapView: React.FC<ClassRecapViewProps> = ({
  students,
  attempts,
  setoranMap,
  onJumpToCohortPractice,
  onClearHistory,
}) => {
  return (
    <div className="space-y-8">
      {/* 4 Separated Cohort Cards: Reguler 1 (Ikhwan / Akhwat) & Reguler 2 (Ikhwan / Akhwat) */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Ringkasan 4 Kelompok Belajar (Terpisah Kelas &amp; Ikhwan/Akhwat)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Klik tombol mulai latihan pada salah satu kelompok untuk langsung menguji siswa di kelompok tersebut.
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
                      <span className="text-slate-500">Sesi Latihan Kuis:</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {cohortAttempts.length} Sesi
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rata-rata Skor:</span>
                      <span className="font-semibold text-emerald-800 tabular-nums">
                        {cohortAttempts.length > 0 ? `${avgScore}%` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Bab Setoran:</span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {totalSetoranBabs} Bab Lulus
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
                  Latihan Kelompok Ini
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Quiz Attempts Log */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Aktivitas Latihan &amp; Setoran Terbaru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan otomatis hasil latihan kuis Tashrif Istilahi, Lughawi, dan Susun Tabel oleh siswa.
            </p>
          </div>
          {attempts.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Bersihkan Riwayat
            </button>
          )}
        </div>

        {attempts.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            Belum ada riwayat sesi kuis yang diselesaikan. Silakan pilih siswa di menu Latihan Shorof untuk memulai evaluasi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-600">
                  <th className="py-3 px-5">Waktu</th>
                  <th className="py-3 px-5">Nama Siswa</th>
                  <th className="py-3 px-5">Kelas &amp; Kelompok</th>
                  <th className="py-3 px-5">Materi &amp; Metode</th>
                  <th className="py-3 px-5 text-right">Benar / Soal</th>
                  <th className="py-3 px-5 text-right">Nilai Akhir</th>
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
                        {att.babLabel} ·{' '}
                        {att.mode === 'istilahi'
                          ? 'Tashrif Istilahi'
                          : att.mode === 'lughawi'
                          ? 'Tashrif Lughawi'
                          : att.mode === 'tebak_shighat'
                          ? 'Tebak Shighat'
                          : 'Susun Tabel'}
                      </td>
                      <td className="py-3.5 px-5 text-right tabular-nums text-slate-700">
                        {att.correctCount} / {att.totalQuestions}
                      </td>
                      <td className="py-3.5 px-5 text-right tabular-nums font-bold text-emerald-800">
                        {att.score}%
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
