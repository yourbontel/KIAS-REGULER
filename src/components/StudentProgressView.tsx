import React, { useMemo } from 'react';
import { Award, CheckCircle2, Clock, Play, RotateCcw } from 'lucide-react';
import {
  PASSING_SCORE,
  QuizAttempt,
  SetoranRecord,
  Student,
} from '../data/students';
import { getBabsForClass } from '../data/shorofData';

interface StudentProgressViewProps {
  student: Student;
  attempts: QuizAttempt[];
  setoran?: SetoranRecord;
  onStartBabExam: (babId: string) => void;
}

const MODE_LABELS: Record<QuizAttempt['mode'], string> = {
  ujian_bab: 'Ujian Per Bab',
  istilahi: 'Tashrif Istilahi',
  lughawi: 'Tashrif Lughawi',
  tebak_shighat: 'Tebak Shighat',
  susun_tashrif: 'Susun Tabel',
};

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({
  student,
  attempts,
  setoran,
  onStartBabExam,
}) => {
  const myAttempts = useMemo(
    () => attempts.filter((a) => a.studentId === student.id),
    [attempts, student.id]
  );

  const classBabs = useMemo(
    () => getBabsForClass(student.kelas),
    [student.kelas]
  );

  const perBabRows = useMemo(() => {
    return classBabs.map((bab) => {
      const babAttempts = myAttempts.filter((a) => a.babId === bab.id);
      const bestScore =
        babAttempts.length > 0
          ? Math.max(...babAttempts.map((a) => a.score))
          : null;
      const latestScore = babAttempts.length > 0 ? babAttempts[0].score : null;
      const passed = bestScore !== null && bestScore >= PASSING_SCORE;
      return {
        bab,
        attemptCount: babAttempts.length,
        bestScore,
        latestScore,
        lastTime: babAttempts[0]?.timestamp || null,
        passed,
      };
    });
  }, [classBabs, myAttempts]);

  const completedBabsCount = perBabRows.filter((r) => r.attemptCount > 0).length;
  const passedBabsCount = perBabRows.filter((r) => r.passed).length;
  const avgBestScore =
    completedBabsCount > 0
      ? Math.round(
          perBabRows
            .filter((r) => r.bestScore !== null)
            .reduce((sum, r) => sum + (r.bestScore ?? 0), 0) / completedBabsCount
        )
      : 0;
  const oralSetoranBabs = setoran?.completedBabs || [];

  return (
    <div className="space-y-6">
      {/* Top Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Bab Dikerjakan</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {completedBabsCount} / {classBabs.length} Bab
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {student.kelas} · Kelompok {student.gender}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Rata-rata Nilai Terbaik</div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
            {completedBabsCount > 0 ? avgBestScore : '—'}
          </div>
          <div className="text-xs text-slate-500 mt-1 tabular-nums">
            {passedBabsCount} Bab lulus (KKM {PASSING_SCORE})
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Total Pengerjaan Ujian</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {myAttempts.length} Kali
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Setoran lisan diverifikasi: {oralSetoranBabs.length} Bab
          </div>
        </div>
      </div>

      {/* Per-Bab Score Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Rekap Nilai Ujian Per Bab
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nilai terbaik Anda pada setiap bab (KKM kelulusan: {PASSING_SCORE}).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/70">
                <th className="py-3 px-5">Bab</th>
                <th className="py-3 px-5">Wazan &amp; Materi</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right">Nilai Terbaik</th>
                <th className="py-3 px-5 text-right">Nilai Terakhir</th>
                <th className="py-3 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {perBabRows.map((row) => (
                <tr key={row.bab.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-5 font-bold text-slate-900 whitespace-nowrap">
                    {row.bab.kode}
                  </td>
                  <td className="py-3 px-5">
                    <div className="font-arabic text-lg font-bold text-slate-900 leading-tight">
                      {row.bab.wazanAr}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {row.bab.namaBab}
                    </div>
                  </td>
                  <td className="py-3 px-5 text-center">
                    {row.attemptCount === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                        <Clock className="w-3 h-3" />
                        Belum Ujian
                      </span>
                    ) : row.passed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Lulus
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        Perlu Mengulang
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-right tabular-nums">
                    {row.bestScore !== null ? (
                      <span
                        className={`text-sm font-bold ${
                          row.passed ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {row.bestScore}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-5 text-right tabular-nums text-slate-600">
                    {row.latestScore !== null ? row.latestScore : '—'}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => onStartBabExam(row.bab.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                        row.attemptCount > 0
                          ? 'bg-slate-900 hover:bg-slate-800 text-white'
                          : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                    >
                      {row.attemptCount > 0 ? (
                        <>
                          <RotateCcw className="w-3 h-3" />
                          Ulangi
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          Kerjakan
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student's Own Chronological Exam History */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-900">
              Riwayat Pengerjaan Ujian Saya
            </h2>
          </div>
          <span className="text-xs text-slate-500 tabular-nums">
            {myAttempts.length} Catatan
          </span>
        </div>

        {myAttempts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Anda belum mengerjakan ujian bab apa pun. Pilih salah satu bab di atas untuk mulai mengerjakan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 bg-slate-50/70">
                  <th className="py-3 px-5">Waktu</th>
                  <th className="py-3 px-5">Bab</th>
                  <th className="py-3 px-5">Jenis</th>
                  <th className="py-3 px-5 text-right">Benar</th>
                  <th className="py-3 px-5 text-right">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {myAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-5 text-slate-500 tabular-nums whitespace-nowrap">
                      {att.timestamp}
                    </td>
                    <td className="py-3 px-5 font-semibold text-slate-900">
                      {att.babLabel}
                    </td>
                    <td className="py-3 px-5 text-slate-600">
                      {MODE_LABELS[att.mode]}
                    </td>
                    <td className="py-3 px-5 text-right tabular-nums text-slate-700">
                      {att.correctCount} / {att.totalQuestions}
                    </td>
                    <td className="py-3 px-5 text-right tabular-nums">
                      <span
                        className={`font-bold ${
                          att.score >= PASSING_SCORE
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {att.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
