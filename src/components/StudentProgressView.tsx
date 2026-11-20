import React, { useMemo } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  ManualScoreRecord,
  PASSING_SCORE,
  QuizAttempt,
  QuizAttemptReviewItem,
  SetoranRecord,
  Student,
} from '../data/students';
import { getBabsForClass } from '../data/shorofData';
import { summarizeBabAttempts } from '../utils/babScores';
import {
  computeFinalGradeSummary,
  formatGradeNumber,
} from '../utils/finalGrades';
import {
  DEFAULT_EXAM_ACCESS,
  type ExamAccessConfig,
  isBabOpen,
} from '../utils/examAccess';
import { buildReviewUrl } from '../utils/examSession';

interface StudentProgressViewProps {
  student: Student;
  attempts: QuizAttempt[];
  setoran?: SetoranRecord;
  manualScore?: ManualScoreRecord;
  examAccess?: ExamAccessConfig;
  onStartBabExam: (babId: string) => void;
  onLoadAttemptReview?: (attemptId: string) => Promise<QuizAttemptReviewItem[] | null>;
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
  manualScore,
  examAccess = DEFAULT_EXAM_ACCESS,
  onStartBabExam,
}) => {
  const openAttemptReview = (attempt: QuizAttempt) => {
    window.location.assign(buildReviewUrl({ attemptId: attempt.id }));
  };

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
      const summary = summarizeBabAttempts(bab, myAttempts);
      return {
        bab,
        summary,
        attemptCount: summary.attemptCount,
        bestScore: summary.bestScore,
        latestScore: summary.latestScore,
        lastTime: summary.latestTime,
        passed: summary.passed,
      };
    });
  }, [classBabs, myAttempts]);

  const completedBabsCount = perBabRows.filter((r) => r.bestScore !== null).length;
  const passedBabsCount = perBabRows.filter((r) => r.passed).length;
  const avgBestScore =
    completedBabsCount > 0
      ? Math.round(
          perBabRows
            .filter((r) => r.bestScore !== null)
            .reduce((sum, r) => sum + (r.bestScore ?? 0), 0) / completedBabsCount
        )
      : 0;
  const webScoreForFinal = completedBabsCount > 0 ? avgBestScore : null;
  const finalGrade = useMemo(
    () => computeFinalGradeSummary(webScoreForFinal, manualScore),
    [webScoreForFinal, manualScore]
  );
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
          <div className="text-xs font-medium text-slate-500">Rata-rata Ujian Web (50%)</div>
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

      {/* Weighted Final Score Breakdown Card (Semester 1 Reguler 1: 50% Web + 10% UTS + 40% UAS) */}
      {student.kelas === 'Reguler 1' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Komposisi Nilai Akhir Semester 1 (50% Ujian Web · 10% UTS · 40% UAS)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nilai UTS dan UAS Semester 1 diinput oleh pengajar/superadmin sebagai bagian dari evaluasi akhir Reguler 1.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                finalGrade.finalScore === null
                  ? 'bg-slate-100 text-slate-500'
                  : !finalGrade.isComplete
                  ? 'bg-sky-50 text-sky-800 border border-sky-200'
                  : finalGrade.passed
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {finalGrade.finalScore === null
                ? 'Belum Ada Nilai'
                : !finalGrade.isComplete
                ? 'Nilai Sementara (Belum Lengkap)'
                : finalGrade.passed
                ? `Lulus (KKM ${PASSING_SCORE})`
                : `Di Bawah KKM (${PASSING_SCORE})`}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">
                Ujian Web (Bobot 50%)
              </div>
              <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">
                {finalGrade.webScore !== null ? finalGrade.webScore : '—'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                {finalGrade.webWeighted !== null
                  ? `Kontribusi: ${formatGradeNumber(finalGrade.webWeighted)} poin`
                  : 'Belum ada Bab selesai'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">
                Nilai UTS Sem. 1 (Bobot 10%)
              </div>
              <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">
                {finalGrade.utsScore !== null ? finalGrade.utsScore : '—'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                {finalGrade.utsWeighted !== null
                  ? `Kontribusi: ${formatGradeNumber(finalGrade.utsWeighted)} poin`
                  : 'Belum diinput admin'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200">
              <div className="text-[11px] font-medium text-slate-500">
                Nilai UAS Sem. 1 (Bobot 40%)
              </div>
              <div className="text-xl font-bold text-slate-900 tabular-nums mt-1">
                {finalGrade.uasScore !== null ? finalGrade.uasScore : '—'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 tabular-nums">
                {finalGrade.uasWeighted !== null
                  ? `Kontribusi: ${formatGradeNumber(finalGrade.uasWeighted)} poin`
                  : 'Belum diinput admin'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-[11px] font-semibold text-emerald-900">
                Total Nilai Akhir Sem. 1
              </div>
              <div className="text-2xl font-bold text-emerald-800 tabular-nums mt-1">
                {formatGradeNumber(finalGrade.finalScore)}
              </div>
              <div className="text-[11px] text-emerald-900/80 mt-1">
                {finalGrade.isComplete
                  ? 'Akumulasi penuh 100%'
                  : 'Menunggu komponen lengkap'}
              </div>
            </div>
          </div>
        </div>
      )}

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

        {perBabRows.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Belum ada soal ujian yang tersedia untuk kelas {student.kelas}.
          </div>
        ) : (
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
                    ) : row.bestScore === null ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                        <Clock className="w-3 h-3" />
                        {row.summary.completedSections}/{row.summary.totalSections} Bagian
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
                    {!isBabOpen(examAccess, row.bab.id) ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-400 border border-slate-200 whitespace-nowrap">
                        <Lock className="w-3 h-3" />
                        Ditutup
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartBabExam(row.bab.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                          row.attemptCount > 0
                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        }`}
                      >
                        {row.summary.sectioned ? (
                          <>
                            <Play className="w-3 h-3" />
                            Pilih Bagian
                          </>
                        ) : row.attemptCount > 0 ? (
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
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
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
                  <th className="py-3 px-5 text-right">Jawaban</th>
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
                    <td className="py-3 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => openAttemptReview(att)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Lihat Jawaban
                      </button>
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
