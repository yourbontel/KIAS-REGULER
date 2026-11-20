import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  Flag,
  XCircle,
} from 'lucide-react';
import { PASSING_SCORE, QuizAttemptReviewItem } from '../data/students';
import { EXAM_SECTIONS } from '../utils/quizGenerator';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function hasArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

export interface ExamResultReviewProps {
  title: string;
  studentName?: string;
  timestamp?: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  reviewItems?: QuizAttemptReviewItem[] | null;
  loadingReview?: boolean;
  reviewError?: string | null;
  onRetryLoadReview?: () => void;
  onRetryExam?: () => void;
  retryLabel?: string;
  onBack: () => void;
  backLabel: string;
  savedNotice?: string;
}

export const ExamResultReview: React.FC<ExamResultReviewProps> = ({
  title,
  studentName,
  timestamp,
  score,
  correctCount,
  totalQuestions,
  passed,
  reviewItems,
  loadingReview = false,
  reviewError = null,
  onRetryLoadReview,
  onRetryExam,
  retryLabel = 'Ujian Ulang',
  onBack,
  backLabel,
  savedNotice,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'correct' | 'wrong'>('all');

  const indexedItems = useMemo(() => {
    if (!reviewItems) return [];
    return reviewItems.map((item, idx) => ({
      item,
      number: idx + 1,
      isCorrect: item.selectedOptionId === item.correctOptionId,
    }));
  }, [reviewItems]);

  const correctTotal = useMemo(
    () => indexedItems.filter((entry) => entry.isCorrect).length,
    [indexedItems]
  );
  const wrongTotal = indexedItems.length - correctTotal;
  const markedTotal = indexedItems.filter((entry) => entry.item.markedAsProblem).length;

  const filteredItems = useMemo(() => {
    if (filterMode === 'correct') return indexedItems.filter((e) => e.isCorrect);
    if (filterMode === 'wrong') return indexedItems.filter((e) => !e.isCorrect);
    return indexedItems;
  }, [indexedItems, filterMode]);

  const sectionBreakdown = useMemo(() => {
    if (!reviewItems || reviewItems.length === 0) return [];
    const sectionsPresent = new Set(
      reviewItems
        .map((item) => item.sectionNumber)
        .filter((n): n is number => typeof n === 'number')
    );
    if (sectionsPresent.size <= 1) return [];
    return EXAM_SECTIONS.map((sec) => {
      const secItems = reviewItems.filter((item) => item.sectionNumber === sec.number);
      if (secItems.length === 0) return null;
      const secCorrect = secItems.filter(
        (item) => item.selectedOptionId === item.correctOptionId
      ).length;
      return {
        sec,
        correct: secCorrect,
        total: secItems.length,
        allRight: secCorrect === secItems.length,
      };
    }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  }, [reviewItems]);

  return (
    <div className="space-y-6">
      {/* Score Hero Card */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          passed
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-amber-50/70 border-amber-200'
        }`}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200">
              {passed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-emerald-800">
                    LULUS UJIAN (KKM {PASSING_SCORE})
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span className="text-amber-800">
                    PERLU MENGULANG (KKM {PASSING_SCORE})
                  </span>
                </>
              )}
            </div>
            {timestamp && (
              <span className="text-xs text-slate-600 bg-white/80 border border-slate-200 px-2.5 py-1 rounded-full tabular-nums">
                Dikerjakan: {timestamp}
              </span>
            )}
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {title}:{' '}
            <span
              className={`tabular-nums ${
                passed ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {score}
            </span>
            <span className="text-base font-medium text-slate-500"> / 100</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-600">
            Jawaban benar:{' '}
            <strong className="text-slate-900 tabular-nums">
              {correctCount} dari {totalQuestions} soal
            </strong>
            .{' '}
            {savedNotice ||
              (studentName ? (
                <>
                  Tercatat pada profil{' '}
                  <strong className="text-slate-900">{studentName}</strong>.
                </>
              ) : null)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onRetryExam && (
            <button
              type="button"
              onClick={onRetryExam}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {retryLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            {backLabel}
          </button>
        </div>
      </div>

      {/* Ringkasan Skor Per Bagian (muncul jika soal mencakup lebih dari 1 bagian) */}
      {sectionBreakdown.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <h4 className="text-sm font-bold text-slate-900 mb-3">
            Rincian Skor Per Bagian (6 Istilahi + 6 Lughawi)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sectionBreakdown.map(({ sec, correct, total, allRight }) => (
              <div
                key={sec.number}
                className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-emerald-800">
                    {sec.shortLabel}
                  </div>
                  <div className="text-xs text-slate-700 truncate">
                    {sec.title.replace(/^Bagian \d+:\s*/, '')}
                  </div>
                </div>
                <span
                  className={`shrink-0 text-xs font-bold tabular-nums px-2.5 py-1 rounded-lg border ${
                    allRight
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-white text-slate-800 border-slate-200'
                  }`}
                >
                  {correct}/{total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pembahasan Per Soal */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Riwayat Jawaban &amp; Pembahasan
              {indexedItems.length > 0 ? ` (${indexedItems.length} Soal)` : ''}
            </h4>
            {indexedItems.length > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan soal, pilihan jawaban Anda, kunci jawaban benar, dan kaidahnya.
              </p>
            )}
            {markedTotal > 0 && (
              <p className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-700">
                <Flag className="w-3.5 h-3.5" />
                Peserta menandai {markedTotal} soal sebagai bermasalah.
              </p>
            )}
          </div>

          {indexedItems.length > 0 && (
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'all', label: `Semua (${indexedItems.length})` },
                  { id: 'correct', label: `Benar (${correctTotal})` },
                  { id: 'wrong', label: `Salah (${wrongTotal})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    filterMode === tab.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loadingReview ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3 text-xs text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
            <span>Memuat rincian soal dan jawaban yang dikerjakan...</span>
          </div>
        ) : reviewError ? (
          <div className="p-8 text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{reviewError}</span>
            </div>
            {onRetryLoadReview && (
              <div>
                <button
                  type="button"
                  onClick={onRetryLoadReview}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Coba Muat Ulang
                </button>
              </div>
            )}
          </div>
        ) : indexedItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 leading-relaxed">
            Rincian soal dan jawaban per nomor untuk pengerjaan ini belum tersimpan karena
            dikerjakan sebelum fitur riwayat jawaban diaktifkan. Ringkasan nilai tetap
            tersimpan pada bagian atas.
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Tidak ada soal pada filter ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredItems.map(({ item, number, isCorrect }) => {
              const chosenOpt = item.options.find(
                (o) => o.id === item.selectedOptionId
              );
              const correctOpt = item.options.find(
                (o) => o.id === item.correctOptionId
              );

              return (
                <div
                  key={`${item.questionId}-${number}`}
                  className="p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 tabular-nums">
                        Soal {number}
                      </span>
                      {item.sectionTitle && (
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {item.sectionTitle}
                        </span>
                      )}
                      {item.markedAsProblem && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <Flag className="w-3 h-3" /> Bermasalah
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isCorrect
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> Benar
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Salah
                          </>
                        )}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.babKode}</span>
                  </div>

                  <div className="text-sm font-medium text-slate-800">
                    <div>{item.promptId}</div>
                    <div className="font-arabic text-xl sm:text-2xl text-slate-900 mt-1.5 leading-relaxed">
                      {item.arabicHighlight}
                    </div>
                    {item.arabicSubtext && (
                      <div className="text-xs text-slate-500 mt-1">
                        {item.arabicSubtext}
                      </div>
                    )}
                  </div>

                  {item.options.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {item.options.map((opt, optIdx) => {
                        const isChosen = opt.id === item.selectedOptionId;
                        const isRightOpt = opt.id === item.correctOptionId;

                        let cardStyle =
                          'bg-[#F8FAFC] border-slate-200 text-slate-700';
                        let letterStyle = 'bg-slate-200/70 text-slate-600';
                        if (isChosen && isRightOpt) {
                          cardStyle =
                            'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300 text-emerald-950';
                          letterStyle = 'bg-emerald-700 text-white';
                        } else if (isChosen && !isRightOpt) {
                          cardStyle =
                            'bg-rose-50 border-rose-300 ring-1 ring-rose-300 text-rose-950';
                          letterStyle = 'bg-rose-600 text-white';
                        } else if (isRightOpt) {
                          cardStyle =
                            'bg-emerald-50/70 border-emerald-300 text-emerald-950';
                          letterStyle = 'bg-emerald-700 text-white';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${cardStyle}`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${letterStyle}`}
                              >
                                {OPTION_LETTERS[optIdx] ?? optIdx + 1}
                              </span>
                              <div className="min-w-0">
                                <div
                                  className={`font-semibold leading-snug ${
                                    hasArabicText(opt.textAr)
                                      ? 'font-arabic text-lg'
                                      : 'text-xs sm:text-sm'
                                  }`}
                                >
                                  {opt.textAr}
                                </div>
                              </div>
                            </div>

                            {(isChosen || isRightOpt) && (
                              <span
                                className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  isRightOpt
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-rose-100 text-rose-800 border-rose-300'
                                }`}
                              >
                                {isChosen && isRightOpt
                                  ? 'Pilihan Anda · Benar'
                                  : isChosen
                                  ? 'Pilihan Anda'
                                  : 'Jawaban Benar'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div
                        className={`p-3 rounded-lg border ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-rose-50 border-rose-200'
                        }`}
                      >
                        <div className="text-[11px] text-slate-500 mb-0.5">
                          Jawaban Anda
                        </div>
                        <div className="font-semibold text-slate-900">
                          {chosenOpt?.textAr || '—'}
                        </div>
                      </div>
                      {!isCorrect && (
                        <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200">
                          <div className="text-[11px] text-emerald-800 mb-0.5">
                            Jawaban Benar
                          </div>
                          <div className="font-semibold text-emerald-900">
                            {correctOpt?.textAr || '—'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-slate-600 bg-[#F8FAFC] p-3 rounded-lg border border-slate-200">
                    <strong className="text-slate-900">Kaidah:</strong>{' '}
                    {item.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
