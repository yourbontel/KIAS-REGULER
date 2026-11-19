import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, GraduationCap, ShieldCheck } from 'lucide-react';
import {
  INITIAL_STUDENTS,
  PASSING_SCORE,
  QuizAttempt,
  QuizAttemptReviewItem,
  Student,
} from '../data/students';
import { ALL_SHOROF_BABS } from '../data/shorofData';
import { EXAM_SECTIONS } from '../utils/quizGenerator';
import { getInitialSession } from '../utils/auth';
import {
  DEFAULT_EXAM_ACCESS,
  type ExamAccessConfig,
  isBabOpen,
} from '../utils/examAccess';
import {
  buildExamUrl,
  loadLocalAttempts,
  loadLocalStudents,
  mergeStudentRecords,
  saveLocalAttempts,
} from '../utils/examSession';
import { loadAttemptReviewFromDb, loadStudentData } from '../utils/studentData';
import { ExamResultReview } from './ExamResultReview';

export const AttemptReviewPage: React.FC = () => {
  const [session] = useState(() => getInitialSession());
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const attemptId = urlParams.get('id') || '';

  const [students, setStudents] = useState<Student[]>(() => loadLocalStudents());
  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => loadLocalAttempts());
  const [examAccess, setExamAccess] = useState<ExamAccessConfig>(DEFAULT_EXAM_ACCESS);
  const [loadingData, setLoadingData] = useState(true);

  const [reviewItems, setReviewItems] = useState<QuizAttemptReviewItem[] | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadStudentData()
      .then((data) => {
        if (cancelled) return;
        setAttempts(data.attempts);
        setStudents(mergeStudentRecords(INITIAL_STUDENTS, data.studentRecords));
        if (data.examAccess) {
          setExamAccess(data.examAccess);
        }
        saveLocalAttempts(data.attempts);
      })
      .catch((err) => {
        console.error('Gagal memuat riwayat ujian:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingData(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const targetAttempt = useMemo(() => {
    if (!session || !attemptId) return undefined;
    const found = attempts.find((a) => a.id === attemptId);
    if (!found) return undefined;
    if (session.role === 'student' && found.studentId !== session.studentId) {
      return undefined;
    }
    return found;
  }, [session, attempts, attemptId]);

  const targetStudent = useMemo(() => {
    if (!targetAttempt) return undefined;
    return students.find((s) => s.id === targetAttempt.studentId);
  }, [students, targetAttempt]);

  const targetBab = useMemo(() => {
    if (!targetAttempt) return undefined;
    return ALL_SHOROF_BABS.find((b) => b.id === targetAttempt.babId);
  }, [targetAttempt]);

  const fetchReview = useCallback(async (attempt: QuizAttempt) => {
    if (attempt.reviewItems && attempt.reviewItems.length > 0) {
      setReviewItems(attempt.reviewItems);
      setLoadingReview(false);
      setReviewError(null);
      return;
    }
    if (attempt.hasReview === false) {
      setReviewItems(null);
      setLoadingReview(false);
      setReviewError(null);
      return;
    }

    setLoadingReview(true);
    setReviewError(null);
    try {
      const loaded = await loadAttemptReviewFromDb(attempt.id);
      setReviewItems(loaded);
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : 'Gagal memuat rincian jawaban ujian.'
      );
    } finally {
      setLoadingReview(false);
    }
  }, []);

  useEffect(() => {
    if (!targetAttempt) return;
    void fetchReview(targetAttempt);
  }, [targetAttempt, fetchReview]);

  const navigateBackToHome = () => {
    window.location.assign('/');
  };

  const renderHeader = () => (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <a
          href="/"
          className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
        >
          Madrasah Shorof Al-Barkah
        </a>

        {session && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200 max-w-[260px]">
            {session.role === 'superadmin' ? (
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">
              {session.role === 'superadmin'
                ? targetStudent
                  ? `Superadmin (${targetStudent.name})`
                  : 'Superadmin'
                : targetStudent?.name || 'Siswa'}
            </span>
          </div>
        )}
      </div>
    </header>
  );

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        {renderHeader()}
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-16 flex items-center justify-center">
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
            <h1 className="text-lg font-bold text-slate-900">Sesi Login Tidak Ditemukan</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Silakan masuk terlebih dahulu melalui halaman utama untuk melihat jawaban ujian.
            </p>
            <button
              type="button"
              onClick={navigateBackToHome}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
            >
              Kembali ke Halaman Utama
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (loadingData && !targetAttempt) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        {renderHeader()}
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-16 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 text-xs sm:text-sm text-slate-600">
            Memuat rincian jawaban ujian...
          </div>
        </main>
      </div>
    );
  }

  if (!targetAttempt) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        {renderHeader()}
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-16 flex items-center justify-center">
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
            <h1 className="text-lg font-bold text-slate-900">Data Jawaban Tidak Ditemukan</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Riwayat ujian tidak tersedia atau tidak dapat diakses dari akun ini.
            </p>
            <button
              type="button"
              onClick={navigateBackToHome}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
            >
              Kembali ke Daftar Bab
            </button>
          </div>
        </main>
      </div>
    );
  }

  const sectionMeta = targetAttempt.sectionNumber
    ? EXAM_SECTIONS.find((s) => s.number === targetAttempt.sectionNumber)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {renderHeader()}

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-800">
                {targetBab?.kode || targetAttempt.babLabel}
              </span>
              {targetBab && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{targetBab.kategori}</span>
                </>
              )}
              {targetStudent && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-700">
                    Peserta: {targetStudent.name}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 flex flex-wrap items-center gap-2">
              <span>Hasil Ujian {targetBab?.kode || targetAttempt.babLabel}</span>
              {targetBab && (
                <>
                  <span className="font-arabic text-2xl text-emerald-800">
                    {targetBab.wazanAr}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    ({targetBab.wazanLatin})
                  </span>
                </>
              )}
            </h1>
            {sectionMeta && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {sectionMeta.groupName} · {sectionMeta.title}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={navigateBackToHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Kembali ke Daftar Bab
          </button>
        </div>

        <ExamResultReview
          title={`Nilai ${targetBab?.kode || targetAttempt.babLabel}${
            sectionMeta
              ? ` · ${sectionMeta.groupName} Bagian ${sectionMeta.localNumber}`
              : ''
          }`}
          studentName={targetStudent?.name}
          timestamp={targetAttempt.timestamp}
          score={targetAttempt.score}
          correctCount={targetAttempt.correctCount}
          totalQuestions={targetAttempt.totalQuestions}
          passed={targetAttempt.score >= PASSING_SCORE}
          reviewItems={reviewItems}
          loadingReview={loadingReview}
          reviewError={reviewError}
          onRetryLoadReview={() => void fetchReview(targetAttempt)}
          onRetryExam={
            targetBab && !targetBab.sectionedExam && isBabOpen(examAccess, targetBab.id)
              ? () =>
                  window.location.assign(
                    buildExamUrl({
                      babId: targetBab.id,
                      studentId:
                        session.role === 'superadmin' ? targetAttempt.studentId : null,
                    })
                  )
              : undefined
          }
          retryLabel="Ujian Ulang Bab Ini"
          onBack={navigateBackToHome}
          backLabel={
            targetAttempt.sectionNumber ? 'Kembali ke Daftar Bagian' : 'Kembali ke Daftar Bab'
          }
        />
      </main>
    </div>
  );
};
