import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Lock,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  INITIAL_STUDENTS,
  PASSING_SCORE,
  QuizAttempt,
  QuizAttemptReviewItem,
  Student,
} from '../data/students';
import { ALL_SHOROF_BABS, ShorofBab } from '../data/shorofData';
import {
  EXAM_SECTIONS,
  QuizQuestion,
  generateBabExamQuestions,
} from '../utils/quizGenerator';
import { getInitialSession } from '../utils/auth';
import {
  DEFAULT_EXAM_ACCESS,
  type ExamAccessConfig,
  isSectionOpen,
} from '../utils/examAccess';
import {
  clearExamDraft,
  loadExamDraft,
  loadLocalAttempts,
  loadLocalStudents,
  mergeStudentRecords,
  saveExamDraft,
  saveLocalAttempts,
} from '../utils/examSession';
import {
  loadAttemptReviewFromDb,
  loadStudentData,
  saveQuizAttemptToDb,
} from '../utils/studentData';
import { ExamResultReview } from './ExamResultReview';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function hasArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function sectionLabel(sectionNumber?: number | null): string {
  if (!sectionNumber) return '';
  const meta = EXAM_SECTIONS.find((s) => s.number === sectionNumber);
  return meta ? `${meta.groupName} Bagian ${meta.localNumber}` : `Bagian ${sectionNumber}`;
}

interface ExamResultSummary {
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  reviewItems: QuizAttemptReviewItem[];
}

export const ExamSessionPage: React.FC = () => {
  const [session] = useState(() => getInitialSession());
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const babId = urlParams.get('bab') || '';
  const bagianParam = urlParams.get('bagian');
  const requestedSection =
    bagianParam && /^\d+$/.test(bagianParam) ? Number(bagianParam) : null;
  const requestedStudentId = urlParams.get('student') || '';

  const [students, setStudents] = useState<Student[]>(() => loadLocalStudents());
  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => loadLocalAttempts());
  const [examAccess, setExamAccess] = useState<ExamAccessConfig>(DEFAULT_EXAM_ACCESS);
  const [loadingRemote, setLoadingRemote] = useState(true);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittedResult, setSubmittedResult] = useState<ExamResultSummary | null>(null);
  const [existingReviewItems, setExistingReviewItems] = useState<QuizAttemptReviewItem[] | null>(
    null
  );
  const [existingReviewLoading, setExistingReviewLoading] = useState(false);
  const [existingReviewError, setExistingReviewError] = useState<string | null>(null);

  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSavingSubmit, setIsSavingSubmit] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const targetBab: ShorofBab | undefined = useMemo(
    () => ALL_SHOROF_BABS.find((b) => b.id === babId),
    [babId]
  );

  const activeSectionNumber =
    targetBab?.sectionedExam && requestedSection ? requestedSection : null;

  const activeStudent: Student | undefined = useMemo(() => {
    if (!session) return undefined;
    if (session.role === 'student') {
      return students.find((s) => s.id === session.studentId);
    }
    if (requestedStudentId) {
      return students.find((s) => s.id === requestedStudentId) || students[0];
    }
    return students[0];
  }, [session, students, requestedStudentId]);

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
        console.error('Gagal memuat data ujian dari server:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingRemote(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const existingSectionAttempt = useMemo(() => {
    if (!activeStudent || !targetBab?.sectionedExam || !activeSectionNumber) {
      return undefined;
    }
    return attempts.find(
      (a) =>
        a.studentId === activeStudent.id &&
        a.babId === targetBab.id &&
        a.sectionNumber === activeSectionNumber
    );
  }, [attempts, activeStudent, targetBab, activeSectionNumber]);

  const isTargetExamOpen = useMemo(() => {
    if (!targetBab) return false;
    return isSectionOpen(examAccess, targetBab.id, activeSectionNumber);
  }, [examAccess, targetBab, activeSectionNumber]);

  // Initialize or restore draft once remote check completes
  useEffect(() => {
    if (loadingRemote || !targetBab || !activeStudent) return;
    if (existingSectionAttempt) {
      clearExamDraft(activeStudent.id, targetBab.id, activeSectionNumber);
      return;
    }
    if (!isTargetExamOpen) return;
    if (submittedResult || questions.length > 0) return;

    const draft = loadExamDraft(activeStudent.id, targetBab.id, activeSectionNumber);
    if (draft) {
      setQuestions(draft.questions);
      setAnswers(draft.answers);
      setCurrentIdx(
        Math.min(Math.max(0, draft.currentIdx || 0), draft.questions.length - 1)
      );
      return;
    }

    const allQuestions = generateBabExamQuestions(targetBab.id);
    const generated =
      targetBab.sectionedExam && activeSectionNumber
        ? allQuestions.filter((q) => q.sectionNumber === activeSectionNumber)
        : allQuestions;
    setQuestions(generated);
    setAnswers({});
    setCurrentIdx(0);
    saveExamDraft({
      studentId: activeStudent.id,
      babId: targetBab.id,
      sectionNumber: activeSectionNumber,
      questions: generated,
      answers: {},
      currentIdx: 0,
      startedAt: new Date().toISOString(),
    });
  }, [
    loadingRemote,
    targetBab,
    activeStudent,
    activeSectionNumber,
    existingSectionAttempt,
    submittedResult,
    questions.length,
  ]);

  // Persist in-progress answers & currentIdx so browser refresh never exits the exam
  useEffect(() => {
    if (
      loadingRemote ||
      !targetBab ||
      !activeStudent ||
      questions.length === 0 ||
      submittedResult ||
      existingSectionAttempt
    ) {
      return;
    }
    saveExamDraft({
      studentId: activeStudent.id,
      babId: targetBab.id,
      sectionNumber: activeSectionNumber,
      questions,
      answers,
      currentIdx,
      startedAt: new Date().toISOString(),
    });
  }, [
    loadingRemote,
    targetBab,
    activeStudent,
    activeSectionNumber,
    questions,
    answers,
    currentIdx,
    submittedResult,
    existingSectionAttempt,
  ]);

  // Load review items if a sectioned attempt was already completed prior to refresh
  useEffect(() => {
    if (!existingSectionAttempt || submittedResult) return;
    if (existingSectionAttempt.reviewItems?.length) {
      setExistingReviewItems(existingSectionAttempt.reviewItems);
      return;
    }
    if (existingSectionAttempt.hasReview === false) {
      setExistingReviewItems(null);
      return;
    }
    let cancelled = false;
    setExistingReviewLoading(true);
    setExistingReviewError(null);
    void loadAttemptReviewFromDb(existingSectionAttempt.id)
      .then((items) => {
        if (!cancelled) {
          setExistingReviewItems(items);
          setExistingReviewLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setExistingReviewLoading(false);
          setExistingReviewError(
            err instanceof Error ? err.message : 'Gagal memuat rincian jawaban ujian.'
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [existingSectionAttempt, submittedResult]);

  const navigateBackToHome = () => {
    window.location.assign('/');
  };

  const answeredCount = Object.keys(answers).length;
  const activeSectionMeta = activeSectionNumber
    ? EXAM_SECTIONS.find((s) => s.number === activeSectionNumber)
    : undefined;

  const handleSelectAnswer = (questionIndex: number, optionId: string) => {
    if (submittedResult || isSavingSubmit) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionId }));
    setSubmitWarning(null);
  };

  const handleRequestSubmitExam = () => {
    if (!targetBab || !activeStudent || isSavingSubmit) return;
    if (answeredCount < questions.length) {
      const unansweredNums = questions
        .map((_, idx) => (answers[idx] ? null : idx + 1))
        .filter((n): n is number => n !== null);
      setSubmitWarning(
        `Masih ada ${unansweredNums.length} soal belum dijawab (Nomor: ${unansweredNums.join(', ')}). Silakan lengkapi semua soal sebelum mengumpulkan.`
      );
      return;
    }
    setSubmitWarning(null);
    setShowSubmitConfirm(true);
  };

  const confirmSubmitExam = async () => {
    if (!targetBab || !activeStudent || isSavingSubmit) return;
    if (answeredCount < questions.length) {
      setShowSubmitConfirm(false);
      handleRequestSubmitExam();
      return;
    }
    setShowSubmitConfirm(false);
    setIsSavingSubmit(true);
    setSaveError(null);

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionId) {
        correctCount += 1;
      }
    });

    const totalQuestions = Math.max(1, questions.length);
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= PASSING_SCORE;
    const reviewItems: QuizAttemptReviewItem[] = questions.map((q, idx) => ({
      questionId: q.id,
      sectionNumber: q.sectionNumber,
      sectionTitle: q.sectionTitle,
      babKode: q.babKode,
      promptId: q.promptId,
      arabicHighlight: q.arabicHighlight,
      arabicSubtext: q.arabicSubtext,
      options: q.options.map((o) => ({
        id: o.id,
        textAr: o.textAr,
        ...(o.textSub ? { textSub: o.textSub } : {}),
      })),
      selectedOptionId: answers[idx] || '',
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
    }));

    const now = new Date();
    const formattedTime = now.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const entry: QuizAttempt = {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      studentId: activeStudent.id,
      timestamp: formattedTime,
      babId: targetBab.id,
      babLabel: activeSectionNumber
        ? `${targetBab.kode} · ${sectionLabel(activeSectionNumber)}`
        : targetBab.kode,
      sectionNumber: activeSectionNumber ?? undefined,
      mode: 'ujian_bab',
      score,
      correctCount,
      totalQuestions,
      hasReview: true,
      reviewItems,
    };

    const nextAttempts = [entry, ...attempts];
    setAttempts(nextAttempts);
    saveLocalAttempts(nextAttempts);

    const dbErr = await saveQuizAttemptToDb(entry);
    if (dbErr) {
      setSaveError(dbErr);
    }

    clearExamDraft(activeStudent.id, targetBab.id, activeSectionNumber);
    setSubmittedResult({
      score,
      correctCount,
      totalQuestions,
      passed,
      reviewItems,
    });
    setIsSavingSubmit(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetryNonSectionedExam = () => {
    if (!targetBab || !activeStudent || activeSectionNumber) return;
    const generated = generateBabExamQuestions(targetBab.id);
    setSubmittedResult(null);
    setSaveError(null);
    setSubmitWarning(null);
    setQuestions(generated);
    setAnswers({});
    setCurrentIdx(0);
    saveExamDraft({
      studentId: activeStudent.id,
      babId: targetBab.id,
      sectionNumber: null,
      questions: generated,
      answers: {},
      currentIdx: 0,
      startedAt: new Date().toISOString(),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderHeader = () => (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <a
          href="/"
          onClick={(e) => {
            if (!submittedResult && !existingSectionAttempt && questions.length > 0) {
              e.preventDefault();
              setShowExitConfirm(true);
            }
          }}
          className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
        >
          Madrasah Shorof Al-Barkah
        </a>

        {activeStudent && session && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200 max-w-[240px]">
            {session.role === 'superadmin' ? (
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">
              {session.role === 'superadmin'
                ? `Superadmin (${activeStudent.name})`
                : activeStudent.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );

  if (!session || !activeStudent) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        {renderHeader()}
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-16 flex items-center justify-center">
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
            <h1 className="text-lg font-bold text-slate-900">Sesi Login Tidak Ditemukan</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Silakan masuk terlebih dahulu melalui halaman utama untuk mengerjakan ujian.
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

  if (!targetBab) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        {renderHeader()}
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-16 flex items-center justify-center">
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4">
            <h1 className="text-lg font-bold text-slate-900">Bab Ujian Tidak Ditemukan</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Data bab ujian yang diminta tidak tersedia. Silakan pilih bab dari halaman daftar ujian.
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

  if (loadingRemote) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        {renderHeader()}
        <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-16 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-xl px-6 py-5 text-xs sm:text-sm text-slate-600">
            Memuat data ujian...
          </div>
        </main>
      </div>
    );
  }

  if (!existingSectionAttempt && !submittedResult && !isTargetExamOpen) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        {renderHeader()}
        <main className="flex-1 max-w-lg w-full mx-auto px-4 py-16 flex items-center justify-center">
          <div className="w-full bg-white border border-rose-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Akses Soal Ditutup</h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Soal untuk <strong>{targetBab.kode}</strong>
              {activeSectionNumber ? ` (${sectionLabel(activeSectionNumber)})` : ''} sedang
              ditutup oleh Superadmin. Silakan hubungi pengajar atau kembali ke daftar bab.
            </p>
            <button
              type="button"
              onClick={navigateBackToHome}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Kembali ke Daftar Bab
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {renderHeader()}

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {saveError && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            Catatan penyimpanan database: {saveError}
          </div>
        )}

        {/* Top Exam Header Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-800">{targetBab.kode}</span>
              <span aria-hidden="true">·</span>
              <span>{targetBab.kategori}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700">
                Peserta: {activeStudent.name}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 flex flex-wrap items-center gap-2">
              <span>Ujian {targetBab.kode}:</span>
              <span className="font-arabic text-2xl text-emerald-800">
                {targetBab.wazanAr}
              </span>
              <span className="text-sm font-medium text-slate-500">
                ({targetBab.wazanLatin})
              </span>
            </h1>
            {activeSectionMeta && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {activeSectionMeta.title}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!submittedResult && !existingSectionAttempt && (
              <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg tabular-nums">
                Terjawab: {answeredCount} / {questions.length}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                if (!submittedResult && !existingSectionAttempt && questions.length > 0) {
                  setShowExitConfirm(true);
                  return;
                }
                navigateBackToHome();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Daftar Bab
            </button>
          </div>
        </div>

        {/* Already Completed Section (e.g., refreshed after submitting) */}
        {existingSectionAttempt && !submittedResult ? (
          <ExamResultReview
            title={`Hasil ${targetBab.kode}${
              activeSectionMeta
                ? ` · ${activeSectionMeta.groupName} Bagian ${activeSectionMeta.localNumber}`
                : ''
            }`}
            studentName={activeStudent.name}
            timestamp={existingSectionAttempt.timestamp}
            score={existingSectionAttempt.score}
            correctCount={existingSectionAttempt.correctCount}
            totalQuestions={existingSectionAttempt.totalQuestions}
            passed={existingSectionAttempt.score >= PASSING_SCORE}
            reviewItems={existingReviewItems}
            loadingReview={existingReviewLoading}
            reviewError={existingReviewError}
            savedNotice={`Bagian ini sudah selesai dikerjakan (maksimal 1 kali).`}
            onBack={navigateBackToHome}
            backLabel="Kembali ke Daftar Bab"
          />
        ) : submittedResult ? (
          <ExamResultReview
            title={`Nilai ${targetBab.kode}${
              activeSectionMeta
                ? ` · ${activeSectionMeta.groupName} Bagian ${activeSectionMeta.localNumber}`
                : ''
            }`}
            studentName={activeStudent.name}
            score={submittedResult.score}
            correctCount={submittedResult.correctCount}
            totalQuestions={submittedResult.totalQuestions}
            passed={submittedResult.passed}
            reviewItems={submittedResult.reviewItems}
            savedNotice={`Nilai sudah otomatis tersimpan pada profil ${activeStudent.name}.`}
            onRetryExam={!activeSectionNumber ? handleRetryNonSectionedExam : undefined}
            retryLabel="Ujian Ulang Bab Ini"
            onBack={navigateBackToHome}
            backLabel={activeSectionNumber ? 'Pilih Bagian Lain' : 'Pilih Bab Lain'}
          />
        ) : (
          currentQuestion && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Question Stage */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full tabular-nums">
                      Soal {currentIdx + 1} dari {questions.length}
                    </span>
                    <span className="text-xs text-slate-500">{currentQuestion.babKode}</span>
                  </div>
                  {currentQuestion.sectionTitle && (
                    <div className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg inline-block">
                      {currentQuestion.sectionTitle}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 mb-4">
                    {currentQuestion.promptId}
                  </p>

                  <div className="p-5 sm:p-6 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-arabic text-3xl sm:text-4xl font-bold text-slate-900 leading-relaxed">
                        {currentQuestion.arabicHighlight}
                      </div>
                      <div className="text-xs text-slate-500 mt-1.5">
                        {currentQuestion.arabicSubtext}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt, optIdx) => {
                    const isSelected = answers[currentIdx] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectAnswer(currentIdx, opt.id)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-700 ring-1 ring-emerald-700'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {OPTION_LETTERS[optIdx]}
                        </span>
                        <div className="min-w-0">
                          <div
                            className={`font-bold text-slate-900 leading-snug ${
                              hasArabicText(opt.textAr)
                                ? 'font-arabic text-xl sm:text-2xl'
                                : 'text-sm sm:text-base'
                            }`}
                          >
                            {opt.textAr}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {submitWarning && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    {submitWarning}
                  </div>
                )}

                {/* Prev / Next / Submit */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Sebelumnya
                  </button>

                  {currentIdx + 1 < questions.length ? (
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))
                      }
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Soal Berikutnya
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isSavingSubmit}
                      onClick={handleRequestSubmitExam}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors"
                    >
                      {isSavingSubmit ? 'Menyimpan...' : 'Kumpulkan Ujian'}
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Section-grouped Question Navigator */}
              <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Navigasi Bagian Soal (Istilahi &amp; Lughawi)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Klik nomor untuk berpindah bagian sebelum mengumpulkan.
                  </p>
                </div>

                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {EXAM_SECTIONS.map((sec) => {
                    const secQuestions = questions
                      .map((q, idx) => ({ q, idx }))
                      .filter((item) => item.q.sectionNumber === sec.number);
                    if (secQuestions.length === 0) return null;

                    return (
                      <div key={sec.number} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-700 truncate">
                            {sec.title}
                          </span>
                          <span className="text-slate-400 tabular-nums shrink-0 ml-2">
                            {secQuestions.length} soal
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {secQuestions.map(({ idx }) => {
                            const isAnswered = Boolean(answers[idx]);
                            const isCurrent = idx === currentIdx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIdx(idx)}
                                className={`py-2 rounded-lg text-xs font-bold tabular-nums border transition-colors ${
                                  isCurrent
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : isAnswered
                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                {secQuestions.length > 4 ? idx + 1 : `Soal ${idx + 1}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={isSavingSubmit}
                    onClick={handleRequestSubmitExam}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {isSavingSubmit
                      ? 'Menyimpan...'
                      : `Kumpulkan Ujian (${answeredCount}/${questions.length})`}
                  </button>
                </div>
              </aside>
            </div>
          )
        )}
      </main>

      {/* Popup Konfirmasi Kumpulkan Ujian */}
      {showSubmitConfirm && !submittedResult && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setShowSubmitConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-exam-confirm-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-amber-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    id="submit-exam-confirm-title"
                    className="text-sm font-bold text-slate-900"
                  >
                    Konfirmasi Kumpulkan Ujian
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Pastikan seluruh jawaban Anda sudah benar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                aria-label="Tutup konfirmasi"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1.5">
                <div className="text-[11px] font-semibold text-emerald-800">
                  {targetBab.kode}
                  {activeSectionMeta
                    ? ` · ${activeSectionMeta.groupName} Bagian ${activeSectionMeta.localNumber}`
                    : ''}
                </div>
                {activeSectionMeta && (
                  <div className="text-sm font-bold text-slate-900">
                    {activeSectionMeta.title.replace(/^Bagian \d+:\s*/, '')}
                  </div>
                )}
                <div className="text-xs text-slate-600 tabular-nums">
                  Terjawab: {answeredCount} / {questions.length} soal · Siswa:{' '}
                  {activeStudent.name}
                </div>
              </div>

              <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 leading-relaxed">
                <strong>Peringatan:</strong> Ujian ini hanya dapat dikumpulkan{' '}
                <strong>1 (satu) kali</strong> dan <strong>tidak dapat diulang</strong>{' '}
                setelah dikumpulkan. Apakah Anda yakin ingin mengumpulkan jawaban sekarang?
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Periksa Kembali
                </button>
                <button
                  type="button"
                  disabled={isSavingSubmit}
                  onClick={() => void confirmSubmitExam()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ya, Kumpulkan Ujian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Peringatan Keluar Sebelum Mengumpulkan Ujian */}
      {showExitConfirm && !submittedResult && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-exam-confirm-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-rose-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    id="exit-exam-confirm-title"
                    className="text-sm font-bold text-slate-900"
                  >
                    Ujian Belum Disimpan
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Anda belum menyelesaikan dan mengirim ujian ini
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                aria-label="Tutup peringatan keluar"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1.5">
                <div className="text-[11px] font-semibold text-emerald-800">
                  {targetBab.kode}
                  {activeSectionMeta
                    ? ` · ${activeSectionMeta.groupName} Bagian ${activeSectionMeta.localNumber}`
                    : ''}
                </div>
                {activeSectionMeta && (
                  <div className="text-sm font-bold text-slate-900">
                    {activeSectionMeta.title.replace(/^Bagian \d+:\s*/, '')}
                  </div>
                )}
                <div className="text-xs text-slate-600 tabular-nums">
                  Terjawab: {answeredCount} / {questions.length} soal · Siswa:{' '}
                  {activeStudent.name}
                </div>
              </div>

              <div className="text-xs text-rose-900 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5 leading-relaxed">
                <strong>Perhatian:</strong> Jawaban ujian ini{' '}
                <strong>belum disimpan</strong> karena Anda belum menekan tombol{' '}
                <strong>Kumpulkan Ujian</strong>. Semua jawaban yang sudah dipilih{' '}
                <strong>akan terhapus</strong> jika Anda keluar sebelum mengirim.
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Lanjutkan Ujian
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearExamDraft(activeStudent.id, targetBab.id, activeSectionNumber);
                    setShowExitConfirm(false);
                    navigateBackToHome();
                  }}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                >
                  Keluar &amp; Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
