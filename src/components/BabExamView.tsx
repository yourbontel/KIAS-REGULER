import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Play,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  PASSING_SCORE,
  QuizAttempt,
  QuizAttemptReviewItem,
  Student,
  StudentClass,
  StudentGender,
} from '../data/students';
import { ExamResultReview } from './ExamResultReview';
import { ALL_SHOROF_BABS, ShorofBab, getBabsForClass } from '../data/shorofData';
import {
  EXAM_SECTIONS,
  ISTILAHI_SECTIONS,
  LUGHAWI_SECTIONS,
  QuizQuestion,
  generateBabExamQuestions,
  getExamQuestionCount,
} from '../utils/quizGenerator';
import { BabScoreSummary, summarizeBabAttempts } from '../utils/babScores';

interface BabExamViewProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  filterClass: StudentClass;
  onChangeClass: (c: StudentClass) => void;
  filterGender: StudentGender;
  onChangeGender: (g: StudentGender) => void;
  attempts: QuizAttempt[];
  onSaveAttempt: (attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => void;
  onLoadAttemptReview?: (attemptId: string) => Promise<QuizAttemptReviewItem[] | null>;
  lockedStudent?: Student;
  requestedBabId?: string | null;
  onClearRequestedBab?: () => void;
}

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

interface ReviewingAttemptState {
  bab: ShorofBab;
  attempt: QuizAttempt;
  items: QuizAttemptReviewItem[] | null;
  loading: boolean;
  error: string | null;
}

export const BabExamView: React.FC<BabExamViewProps> = ({
  students,
  selectedStudentId,
  onSelectStudent,
  filterClass,
  onChangeClass,
  filterGender,
  onChangeGender,
  attempts,
  onSaveAttempt,
  onLoadAttemptReview,
  lockedStudent,
  requestedBabId,
  onClearRequestedBab,
}) => {
  const [studentSearch, setStudentSearch] = useState('');

  // Active exam state
  const [activeExamBab, setActiveExamBab] = useState<ShorofBab | null>(null);
  const [activeExamSection, setActiveExamSection] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittedResult, setSubmittedResult] = useState<ExamResultSummary | null>(
    null
  );
  const [reviewingAttempt, setReviewingAttempt] = useState<ReviewingAttemptState | null>(
    null
  );
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [openSectionDropdown, setOpenSectionDropdown] = useState<string | null>(null);
  const [pendingStartSection, setPendingStartSection] = useState<{
    bab: ShorofBab;
    sectionNumber: number;
    sectionTitle: string;
    groupName: string;
    localNumber: number;
    questionCount: number;
  } | null>(null);

  const filteredGroupStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return students.filter((s) => {
      if (s.kelas !== filterClass || s.gender !== filterGender) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.kota.toLowerCase().includes(q);
    });
  }, [students, filterClass, filterGender, studentSearch]);

  const activeStudent = useMemo(
    () =>
      lockedStudent ||
      students.find((s) => s.id === selectedStudentId) ||
      filteredGroupStudents[0] ||
      students[0],
    [lockedStudent, students, selectedStudentId, filteredGroupStudents]
  );

  const activeClass: StudentClass = activeStudent?.kelas || filterClass;
  const activeBabs = useMemo(() => getBabsForClass(activeClass), [activeClass]);

  const groupedBabs = useMemo(() => {
    const groups: { kategori: ShorofBab['kategori']; items: ShorofBab[] }[] = [];
    activeBabs.forEach((bab) => {
      const existing = groups.find((g) => g.kategori === bab.kategori);
      if (existing) {
        existing.items.push(bab);
      } else {
        groups.push({ kategori: bab.kategori, items: [bab] });
      }
    });
    return groups;
  }, [activeBabs]);

  // Sync selected student in Superadmin mode if cohort changes
  useEffect(() => {
    if (lockedStudent || activeExamBab) return;
    if (
      activeStudent &&
      (activeStudent.kelas !== filterClass || activeStudent.gender !== filterGender)
    ) {
      const first = students.find(
        (s) => s.kelas === filterClass && s.gender === filterGender
      );
      if (first) onSelectStudent(first.id);
    }
  }, [
    lockedStudent,
    activeExamBab,
    filterClass,
    filterGender,
    activeStudent,
    students,
    onSelectStudent,
  ]);

  const startExamForBab = (bab: ShorofBab, sectionNumber?: number) => {
    if (
      bab.sectionedExam &&
      sectionNumber &&
      activeStudent &&
      attempts.some(
        (a) =>
          a.studentId === activeStudent.id &&
          a.babId === bab.id &&
          a.sectionNumber === sectionNumber
      )
    ) {
      return;
    }
    const allQuestions = generateBabExamQuestions(bab.id);
    const generated =
      bab.sectionedExam && sectionNumber
        ? allQuestions.filter((q) => q.sectionNumber === sectionNumber)
        : allQuestions;
    setActiveExamBab(bab);
    setActiveExamSection(bab.sectionedExam && sectionNumber ? sectionNumber : null);
    setQuestions(generated);
    setCurrentIdx(0);
    setAnswers({});
    setSubmittedResult(null);
    setReviewingAttempt(null);
    setSubmitWarning(null);
    setShowSubmitConfirm(false);
    setShowExitConfirm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAttemptReview = async (bab: ShorofBab, attempt: QuizAttempt) => {
    const preloaded =
      attempt.reviewItems && attempt.reviewItems.length > 0
        ? attempt.reviewItems
        : null;
    const shouldFetch =
      !preloaded && attempt.hasReview !== false && Boolean(onLoadAttemptReview);

    setActiveExamBab(null);
    setActiveExamSection(null);
    setSubmittedResult(null);
    setShowSubmitConfirm(false);
    setShowExitConfirm(false);
    setReviewingAttempt({
      bab,
      attempt,
      items: preloaded,
      loading: shouldFetch,
      error: null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (shouldFetch && onLoadAttemptReview) {
      try {
        const loaded = await onLoadAttemptReview(attempt.id);
        setReviewingAttempt((prev) =>
          prev && prev.attempt.id === attempt.id
            ? { ...prev, items: loaded, loading: false, error: null }
            : prev
        );
      } catch (err) {
        setReviewingAttempt((prev) =>
          prev && prev.attempt.id === attempt.id
            ? {
                ...prev,
                loading: false,
                error:
                  err instanceof Error
                    ? err.message
                    : 'Gagal memuat rincian jawaban ujian.',
              }
            : prev
        );
      }
    }
  };

  // Support launching a specific bab exam directly from another tab (e.g. Nilai Saya)
  useEffect(() => {
    if (!requestedBabId) return;
    const targetBab =
      activeBabs.find((b) => b.id === requestedBabId) ||
      ALL_SHOROF_BABS.find((b) => b.id === requestedBabId);
    // Bab per-Bagian: buka dropdown daftar bagian agar siswa bisa memilih Bagian atau melihat hasil
    if (targetBab) {
      if (targetBab.sectionedExam) {
        setReviewingAttempt(null);
        setActiveExamBab(null);
        setOpenSectionDropdown(targetBab.id);
      } else {
        startExamForBab(targetBab);
      }
    }
    onClearRequestedBab?.();
  }, [requestedBabId, activeBabs, onClearRequestedBab]);

  const studentAttempts = useMemo(
    () => attempts.filter((a) => a.studentId === activeStudent?.id),
    [attempts, activeStudent]
  );

  // Per-bab summary for the active student
  const babStatsMap = useMemo(() => {
    const map: Record<string, BabScoreSummary> = {};
    activeBabs.forEach((bab) => {
      map[bab.id] = summarizeBabAttempts(bab, studentAttempts);
    });
    return map;
  }, [activeBabs, studentAttempts]);

  const overallSummary = useMemo(() => {
    const completedBabs = activeBabs.filter(
      (b) => babStatsMap[b.id]?.bestScore != null
    );
    const passedBabs = activeBabs.filter((b) => babStatsMap[b.id]?.passed);
    const avgBest =
      completedBabs.length > 0
        ? Math.round(
            completedBabs.reduce(
              (sum, b) => sum + (babStatsMap[b.id]?.bestScore ?? 0),
              0
            ) / completedBabs.length
          )
        : 0;
    return {
      completedCount: completedBabs.length,
      passedCount: passedBabs.length,
      totalBabs: activeBabs.length,
      avgBest,
    };
  }, [activeBabs, babStatsMap]);

  const answeredCount = Object.keys(answers).length;

  const handleSelectAnswer = (questionIndex: number, optionId: string) => {
    if (submittedResult) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionId }));
    setSubmitWarning(null);
  };

  const handleRequestSubmitExam = () => {
    if (!activeExamBab || !activeStudent) return;
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

  const confirmSubmitExam = () => {
    if (!activeExamBab || !activeStudent) return;
    if (answeredCount < questions.length) {
      setShowSubmitConfirm(false);
      handleRequestSubmitExam();
      return;
    }
    setShowSubmitConfirm(false);

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

    setSubmittedResult({
      score,
      correctCount,
      totalQuestions,
      passed,
      reviewItems,
    });

    onSaveAttempt({
      studentId: activeStudent.id,
      babId: activeExamBab.id,
      babLabel: activeExamSection
        ? `${activeExamBab.kode} · ${sectionLabel(activeExamSection)}`
        : activeExamBab.kode,
      sectionNumber: activeExamSection ?? undefined,
      mode: 'ujian_bab',
      score,
      correctCount,
      totalQuestions,
      hasReview: true,
      reviewItems,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // VIEW A0: REVIEW PREVIOUSLY COMPLETED ATTEMPT
  // =========================================================================
  if (reviewingAttempt) {
    const { bab, attempt, items, loading, error } = reviewingAttempt;
    const sectionMeta = attempt.sectionNumber
      ? EXAM_SECTIONS.find((s) => s.number === attempt.sectionNumber)
      : undefined;

    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-800">{bab.kode}</span>
              <span aria-hidden="true">·</span>
              <span>{bab.kategori}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700">
                Peserta: {activeStudent?.name}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 flex flex-wrap items-center gap-2">
              <span>Hasil Ujian {bab.kode}:</span>
              <span className="font-arabic text-2xl text-emerald-800">
                {bab.wazanAr}
              </span>
              <span className="text-sm font-medium text-slate-500">
                ({bab.wazanLatin})
              </span>
            </h2>
            {sectionMeta && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {sectionMeta.groupName} · {sectionMeta.title}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setReviewingAttempt(null)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Daftar Bab
          </button>
        </div>

        <ExamResultReview
          title={`Nilai ${bab.kode}${
            sectionMeta
              ? ` · ${sectionMeta.groupName} Bagian ${sectionMeta.localNumber}`
              : ''
          }`}
          studentName={activeStudent?.name}
          timestamp={attempt.timestamp}
          score={attempt.score}
          correctCount={attempt.correctCount}
          totalQuestions={attempt.totalQuestions}
          passed={attempt.score >= PASSING_SCORE}
          reviewItems={items}
          loadingReview={loading}
          reviewError={error}
          onRetryLoadReview={() => void openAttemptReview(bab, attempt)}
          onRetryExam={
            !bab.sectionedExam ? () => startExamForBab(bab) : undefined
          }
          retryLabel="Ujian Ulang Bab Ini"
          onBack={() => setReviewingAttempt(null)}
          backLabel={attempt.sectionNumber ? 'Pilih Bagian Lain' : 'Kembali ke Daftar Bab'}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW A: ACTIVE EXAM RUNNER OR RESULT SCREEN
  // =========================================================================
  if (activeExamBab) {
    const currentQuestion = questions[currentIdx];
    const activeSectionMeta = activeExamSection
      ? EXAM_SECTIONS.find((s) => s.number === activeExamSection)
      : undefined;

    return (
      <div className="space-y-6">
        {/* Top Exam Header Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-800">
                {activeExamBab.kode}
              </span>
              <span aria-hidden="true">·</span>
              <span>{activeExamBab.kategori}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700">
                Peserta: {activeStudent?.name}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 flex flex-wrap items-center gap-2">
              <span>Ujian {activeExamBab.kode}:</span>
              <span className="font-arabic text-2xl text-emerald-800">
                {activeExamBab.wazanAr}
              </span>
              <span className="text-sm font-medium text-slate-500">
                ({activeExamBab.wazanLatin})
              </span>
            </h2>
            {activeExamSection && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {EXAM_SECTIONS.find((s) => s.number === activeExamSection)?.title}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!submittedResult && (
              <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg tabular-nums">
                Terjawab: {answeredCount} / {questions.length}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                if (!submittedResult) {
                  setShowExitConfirm(true);
                  return;
                }
                setActiveExamBab(null);
                setActiveExamSection(null);
                setSubmittedResult(null);
                setShowSubmitConfirm(false);
                setShowExitConfirm(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Daftar Bab
            </button>
          </div>
        </div>

        {/* RESULT & EXPLANATION MODE */}
        {submittedResult ? (
          <ExamResultReview
            title={`Nilai ${activeExamBab.kode}${
              activeSectionMeta
                ? ` · ${activeSectionMeta.groupName} Bagian ${activeSectionMeta.localNumber}`
                : ''
            }`}
            studentName={activeStudent?.name}
            score={submittedResult.score}
            correctCount={submittedResult.correctCount}
            totalQuestions={submittedResult.totalQuestions}
            passed={submittedResult.passed}
            reviewItems={submittedResult.reviewItems}
            savedNotice={
              activeStudent
                ? `Nilai sudah otomatis tersimpan pada profil ${activeStudent.name}.`
                : undefined
            }
            onRetryExam={
              !activeExamSection ? () => startExamForBab(activeExamBab) : undefined
            }
            retryLabel="Ujian Ulang Bab Ini"
            onBack={() => {
              setActiveExamBab(null);
              setActiveExamSection(null);
              setSubmittedResult(null);
            }}
            backLabel={activeExamSection ? 'Pilih Bagian Lain' : 'Pilih Bab Lain'}
          />
        ) : (
          /* ACTIVE QUESTION STAGE */
          currentQuestion && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Question Stage */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full tabular-nums">
                      Soal {currentIdx + 1} dari {questions.length}
                    </span>
                    <span className="text-xs text-slate-500">
                      {currentQuestion.babKode}
                    </span>
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
                        onClick={() =>
                          handleSelectAnswer(currentIdx, opt.id)
                        }
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
                      onClick={handleRequestSubmitExam}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Selesai &amp; Lihat Nilai
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Question Navigator grouped by 12 Bagian (Istilahi & Lughawi) */}
              <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Navigasi Bagian Soal (Istilahi &amp; Lughawi)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Klik nomor untuk berpindah bagian sebelum mengumpulkan.
                  </p>
                </div>

                <div className="space-y-3">
                  {EXAM_SECTIONS.map((sec) => {
                    const secQuestions = questions
                      .map((q, idx) => ({ q, idx }))
                      .filter((item) => item.q.sectionNumber === sec.number);
                    if (secQuestions.length === 0) return null;

                    return (
                      <div
                        key={sec.number}
                        className="p-2.5 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-2"
                      >
                        <div className="text-[11px] font-semibold text-slate-700 flex items-center justify-between gap-2">
                          <span>{sec.title}</span>
                          <span className="text-[10px] text-slate-400 tabular-nums shrink-0">
                            {secQuestions.length} soal
                          </span>
                        </div>
                        <div
                          className={
                            secQuestions.length > 4
                              ? 'grid grid-cols-5 gap-1.5'
                              : 'grid grid-cols-2 gap-2'
                          }
                        >
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
                    onClick={handleRequestSubmitExam}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                  >
                    Kumpulkan Ujian ({answeredCount}/{questions.length})
                  </button>
                </div>
              </aside>
            </div>
          )
        )}

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
                    {activeExamBab.kode}
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
                    Terjawab: {answeredCount} / {questions.length} soal
                    {activeStudent ? ` · Siswa: ${activeStudent.name}` : ''}
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
                    onClick={confirmSubmitExam}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
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
                    {activeExamBab.kode}
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
                    Terjawab: {answeredCount} / {questions.length} soal
                    {activeStudent ? ` · Siswa: ${activeStudent.name}` : ''}
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
                      setShowExitConfirm(false);
                      setShowSubmitConfirm(false);
                      setActiveExamBab(null);
                      setActiveExamSection(null);
                      setSubmittedResult(null);
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
  }

  // =========================================================================
  // VIEW B: BAB LIST & SCORE OVERVIEW (MAIN LANDING FOR UJIAN PER BAB)
  // =========================================================================
  return (
    <div className="space-y-8">
      {/* Top Student Context & Score Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div
          className={`${
            lockedStudent ? 'lg:col-span-12' : 'lg:col-span-8'
          } bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-5`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-semibold text-emerald-800">
                  {activeStudent?.kelas}
                </span>
                <span aria-hidden="true">·</span>
                <span>Kelompok {activeStudent?.gender}</span>
                {activeStudent?.kota && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{activeStudent.kota}</span>
                  </>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {activeStudent?.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Pilih salah satu Bab di bawah ini untuk mengerjakan ujian (12 Bagian: 6 Tashrif Istilahi + 6 Tashrif Lughawi, KKM {PASSING_SCORE}).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
                <div className="text-[11px] text-slate-500">Bab Dikerjakan</div>
                <div className="text-base font-bold text-slate-900 tabular-nums">
                  {overallSummary.completedCount} / {overallSummary.totalBabs}
                </div>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
                <div className="text-[11px] text-slate-500">Bab Lulus</div>
                <div className="text-base font-bold text-emerald-700 tabular-nums">
                  {overallSummary.passedCount} Bab
                </div>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
                <div className="text-[11px] text-slate-500">Rata-rata Nilai</div>
                <div className="text-base font-bold text-slate-900 tabular-nums">
                  {overallSummary.completedCount > 0
                    ? overallSummary.avgBest
                    : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Superadmin-only Student Switcher */}
        {!lockedStudent && (
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Pilih Peserta Ujian (Superadmin)
              </h3>
              <span className="text-[11px] text-slate-500 tabular-nums">
                {filteredGroupStudents.length} Siswa
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <select
                aria-label="Kelas"
                value={filterClass}
                onChange={(e) => onChangeClass(e.target.value as StudentClass)}
                className="px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg"
              >
                <option value="Reguler 1">Reguler 1</option>
                <option value="Reguler 2">Reguler 2</option>
              </select>
              <select
                aria-label="Kelompok"
                value={filterGender}
                onChange={(e) => onChangeGender(e.target.value as StudentGender)}
                className="px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg"
              >
                <option value="Ikhwan">Ikhwan</option>
                <option value="Akhwat">Akhwat</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Cari nama siswa..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg"
              />
            </div>

            <select
              aria-label="Pilih Siswa"
              value={activeStudent?.id || ''}
              onChange={(e) => onSelectStudent(e.target.value)}
              className="w-full px-2.5 py-2 text-xs font-medium bg-[#F8FAFC] border border-slate-200 rounded-lg text-slate-900"
            >
              {filteredGroupStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid of All Babs grouped by Kategori */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">
              Daftar Ujian Per Bab {activeClass} ({activeBabs.length} Bab)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            12 Bagian Soal: 6 Tashrif Istilahi (Transformasi, Reverse Tasrif, Deret Rumpang, Kontekstual, Koreksi Wazan, Ekstraksi) + 6 Tashrif Lughawi (Madhi, Dhamir, Deret, Mudhari', Deret, Amr)
          </span>
        </div>

        {groupedBabs.map((group) => (
          <div key={group.kategori} className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-bold text-slate-800">{group.kategori}</h4>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {group.items.length} Bab
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {group.items.map((bab) => {
                const stat: BabScoreSummary = babStatsMap[bab.id] ?? {
                  attemptCount: 0,
                  bestScore: null,
                  latestScore: null,
                  latestTime: null,
                  passed: false,
                  sectioned: false,
                  completedSections: 0,
                  totalSections: 0,
                  sectionBest: {},
                  sectionAttemptCount: {},
                };
                const hasAttempt = stat.attemptCount > 0;

                // Bab dengan 12 Bagian yang dikerjakan satu per satu
                if (bab.sectionedExam) {
                  const perSection = bab.questionsPerSection ?? 2;
                  return (
                    <div
                      key={bab.id}
                      className="md:col-span-2 xl:col-span-3 bg-white border border-slate-200 rounded-xl p-5 space-y-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              {bab.kode}
                            </span>
                            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              Dikerjakan per Bagian
                            </span>
                            {stat.bestScore !== null ? (
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                  stat.passed
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {stat.passed ? 'Lulus' : 'Belum Lulus'}
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                {stat.completedSections === 0
                                  ? 'Belum Ujian'
                                  : `${stat.completedSections}/${stat.totalSections} Bagian selesai`}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-arabic text-2xl font-bold text-slate-900">
                              {bab.wazanAr}
                            </div>
                            <div className="text-xs font-semibold text-slate-700 mt-0.5">
                              {bab.namaBab}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              {bab.kaidahAinFiil}
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center shrink-0">
                          <div className="text-[11px] text-slate-500">Nilai Bab (Rata-rata 12 Bagian)</div>
                          <div
                            className={`text-xl font-bold tabular-nums ${
                              stat.bestScore === null
                                ? 'text-slate-400'
                                : stat.passed
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {stat.bestScore ?? '—'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {stat.bestScore === null
                              ? 'Selesaikan ke-12 Bagian'
                              : `KKM ${PASSING_SCORE}`}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button
                          type="button"
                          aria-expanded={openSectionDropdown === bab.id}
                          onClick={() =>
                            setOpenSectionDropdown((prev) =>
                              prev === bab.id ? null : bab.id
                            )
                          }
                          className={`w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                            openSectionDropdown === bab.id
                              ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/15'
                              : 'bg-[#F8FAFC] border-slate-200 hover:border-slate-300 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                              <BookOpenCheck className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900">
                                Daftar 12 Bagian (Istilahi &amp; Lughawi)
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Buka untuk memilih Bagian yang ingin dikerjakan
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full tabular-nums">
                              {stat.completedSections}/{stat.totalSections} Bagian selesai
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                                openSectionDropdown === bab.id
                                  ? 'rotate-180 text-emerald-700'
                                  : ''
                              }`}
                            />
                          </div>
                        </button>

                        {openSectionDropdown === bab.id && (
                          <div className="space-y-4">
                            {[
                              {
                                key: 'istilahi',
                                label: 'Tashrif Istilahi (Bagian 1–6)',
                                sections: ISTILAHI_SECTIONS,
                              },
                              {
                                key: 'lughawi',
                                label: 'Tashrif Lughawi (Bagian 1–6)',
                                sections: LUGHAWI_SECTIONS,
                              },
                            ].map((group) => (
                              <div key={group.key} className="space-y-2">
                                <div className="text-[11px] font-bold text-emerald-800">
                                  {group.label}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                  {group.sections.map((sec) => {
                                    const sectionNo = sec.number;
                                    const best = stat.sectionBest[sectionNo];
                                    const tries = stat.sectionAttemptCount[sectionNo] ?? 0;
                                    const done = best !== undefined;
                                    const sectionPassed = done && best >= PASSING_SCORE;
                                    const sectionAttempt = studentAttempts.find(
                                      (a) =>
                                        a.babId === bab.id &&
                                        a.sectionNumber === sectionNo
                                    );
                                    return (
                                      <div
                                        key={sectionNo}
                                        className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3 bg-slate-50/50"
                                      >
                                        <div className="space-y-1.5">
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="text-[11px] font-bold text-slate-700">
                                              Bagian {sec.localNumber}
                                            </span>
                                            {done ? (
                                              <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                  sectionPassed
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                                }`}
                                              >
                                                Nilai {best}
                                              </span>
                                            ) : (
                                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                                Belum dikerjakan
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-xs font-semibold text-slate-800 leading-snug">
                                            {sec.title.replace(/^Bagian \d+:\s*/, '')}
                                          </div>
                                          <div className="text-[11px] text-slate-500 tabular-nums">
                                            {perSection} soal
                                            {tries > 0 ? ' · Sudah dikerjakan' : ''}
                                          </div>
                                        </div>
                                        {done ? (
                                          <button
                                            type="button"
                                            disabled={!sectionAttempt}
                                            onClick={() =>
                                              sectionAttempt &&
                                              void openAttemptReview(bab, sectionAttempt)
                                            }
                                            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white transition-colors"
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                            Lihat Jawaban
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setPendingStartSection({
                                                bab,
                                                sectionNumber: sectionNo,
                                                sectionTitle: sec.title.replace(/^Bagian \d+:\s*/, ''),
                                                groupName: sec.groupName,
                                                localNumber: sec.localNumber,
                                                questionCount: perSection,
                                              })
                                            }
                                            className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-colors bg-emerald-700 hover:bg-emerald-800 text-white"
                                          >
                                            <Play className="w-3.5 h-3.5" />
                                            Mulai Bagian {sec.localNumber}
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={bab.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between gap-5 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          {bab.kode}
                        </span>
                        {hasAttempt ? (
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              stat.passed
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {stat.passed ? 'Lulus' : 'Belum Lulus'}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            Belum Ujian
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-arabic text-2xl font-bold text-slate-900">
                          {bab.wazanAr}
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">
                          {bab.namaBab}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {bab.kaidahAinFiil}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      {hasAttempt ? (
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-500">Nilai Terbaik: </span>
                            <strong
                              className={`text-sm tabular-nums ${
                                stat.passed ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              {stat.bestScore}
                            </strong>
                            <span className="text-slate-400"> / 100</span>
                          </div>
                          <div className="text-[11px] text-slate-500 tabular-nums">
                            {stat.attemptCount}x ujian
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>{getExamQuestionCount(bab.id)} Soal Pilihan Ganda</span>
                          <span className="inline-flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-slate-400" />
                            KKM {PASSING_SCORE}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => startExamForBab(bab)}
                          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg transition-colors ${
                            hasAttempt
                              ? 'bg-slate-900 hover:bg-slate-800 text-white'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                        >
                          {hasAttempt ? (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              Ujian Ulang {bab.kode}
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              Mulai Ujian {bab.kode}
                            </>
                          )}
                        </button>
                        {hasAttempt && (() => {
                          const latestAttempt = studentAttempts.find(
                            (a) => a.babId === bab.id
                          );
                          if (!latestAttempt) return null;
                          return (
                            <button
                              type="button"
                              onClick={() =>
                                void openAttemptReview(bab, latestAttempt)
                              }
                              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Lihat Jawaban Terakhir
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Popup Verifikasi Mulai Ujian Bagian */}
      {pendingStartSection && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setPendingStartSection(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="start-section-confirm-title"
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
                    id="start-section-confirm-title"
                    className="text-sm font-bold text-slate-900"
                  >
                    Verifikasi Mulai Ujian Bagian
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Pastikan Anda siap sebelum memulai ujian
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingStartSection(null)}
                aria-label="Tutup verifikasi"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1.5">
                <div className="text-[11px] font-semibold text-emerald-800">
                  {pendingStartSection.bab.kode} · {pendingStartSection.groupName} Bagian{' '}
                  {pendingStartSection.localNumber}
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {pendingStartSection.sectionTitle}
                </div>
                <div className="text-xs text-slate-600 tabular-nums">
                  {pendingStartSection.questionCount} soal pilihan ganda
                  {activeStudent ? ` · Siswa: ${activeStudent.name}` : ''}
                </div>
              </div>

              <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5 leading-relaxed">
                <strong>Perhatian:</strong> Setiap bagian hanya boleh dikerjakan{' '}
                <strong>1 (satu) kali</strong> dan tidak dapat diulang. Pastikan Anda sudah
                siap mengerjakan seluruh soal hingga selesai.
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingStartSection(null)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = pendingStartSection;
                    setPendingStartSection(null);
                    startExamForBab(target.bab, target.sectionNumber);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Ya, Mulai Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
