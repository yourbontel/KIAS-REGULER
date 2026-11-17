import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  RotateCcw,
  Search,
  Volume2,
  XCircle,
} from 'lucide-react';
import {
  PASSING_SCORE,
  QuizAttempt,
  Student,
  StudentClass,
  StudentGender,
} from '../data/students';
import { ALL_SHOROF_BABS, ShorofBab, getBabsForClass } from '../data/shorofData';
import {
  EXAM_SECTIONS,
  QuizQuestion,
  generateBabExamQuestions,
  getExamQuestionCount,
  speakArabic,
} from '../utils/quizGenerator';

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
  lockedStudent?: Student;
  requestedBabId?: string | null;
  onClearRequestedBab?: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function hasArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

interface ExamResultSummary {
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
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
  lockedStudent,
  requestedBabId,
  onClearRequestedBab,
}) => {
  const [studentSearch, setStudentSearch] = useState('');

  // Active exam state
  const [activeExamBab, setActiveExamBab] = useState<ShorofBab | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittedResult, setSubmittedResult] = useState<ExamResultSummary | null>(
    null
  );
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);

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

  const startExamForBab = (bab: ShorofBab) => {
    const generated = generateBabExamQuestions(bab.id);
    setActiveExamBab(bab);
    setQuestions(generated);
    setCurrentIdx(0);
    setAnswers({});
    setSubmittedResult(null);
    setSubmitWarning(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Support launching a specific bab exam directly from another tab (e.g. Nilai Saya)
  useEffect(() => {
    if (!requestedBabId) return;
    const targetBab =
      activeBabs.find((b) => b.id === requestedBabId) ||
      ALL_SHOROF_BABS.find((b) => b.id === requestedBabId);
    if (targetBab) {
      startExamForBab(targetBab);
    }
    onClearRequestedBab?.();
  }, [requestedBabId, activeBabs, onClearRequestedBab]);

  const studentAttempts = useMemo(
    () => attempts.filter((a) => a.studentId === activeStudent?.id),
    [attempts, activeStudent]
  );

  // Per-bab summary for the active student
  const babStatsMap = useMemo(() => {
    const map: Record<
      string,
      {
        attemptCount: number;
        bestScore: number | null;
        latestScore: number | null;
        latestTime: string | null;
        passed: boolean;
      }
    > = {};

    activeBabs.forEach((bab) => {
      const babAttempts = studentAttempts.filter((a) => a.babId === bab.id);
      if (babAttempts.length === 0) {
        map[bab.id] = {
          attemptCount: 0,
          bestScore: null,
          latestScore: null,
          latestTime: null,
          passed: false,
        };
      } else {
        const bestScore = Math.max(...babAttempts.map((a) => a.score));
        map[bab.id] = {
          attemptCount: babAttempts.length,
          bestScore,
          latestScore: babAttempts[0].score,
          latestTime: babAttempts[0].timestamp,
          passed: bestScore >= PASSING_SCORE,
        };
      }
    });

    return map;
  }, [activeBabs, studentAttempts]);

  const overallSummary = useMemo(() => {
    const completedBabs = activeBabs.filter(
      (b) => (babStatsMap[b.id]?.attemptCount ?? 0) > 0
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

  const handleSelectAnswer = (questionIndex: number, optionId: string, arabicText: string) => {
    if (submittedResult) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionId }));
    setSubmitWarning(null);
    if (/[\u0600-\u06FF]/.test(arabicText)) {
      speakArabic(arabicText);
    }
  };

  const handleSubmitExam = () => {
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

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionId) {
        correctCount += 1;
      }
    });

    const totalQuestions = Math.max(1, questions.length);
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= PASSING_SCORE;

    setSubmittedResult({
      score,
      correctCount,
      totalQuestions,
      passed,
    });

    onSaveAttempt({
      studentId: activeStudent.id,
      babId: activeExamBab.id,
      babLabel: activeExamBab.kode,
      mode: 'ujian_bab',
      score,
      correctCount,
      totalQuestions,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // VIEW A: ACTIVE EXAM RUNNER OR RESULT SCREEN
  // =========================================================================
  if (activeExamBab) {
    const currentQuestion = questions[currentIdx];

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
                if (
                  !submittedResult &&
                  answeredCount > 0 &&
                  !window.confirm(
                    'Keluar dari ujian ini? Jawaban yang sudah dipilih tidak akan disimpan.'
                  )
                ) {
                  return;
                }
                setActiveExamBab(null);
                setSubmittedResult(null);
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
          <div className="space-y-6">
            {/* Score Hero Card */}
            <div
              className={`rounded-2xl border p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                submittedResult.passed
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200">
                  {submittedResult.passed ? (
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
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Nilai {activeExamBab.kode}:{' '}
                  <span
                    className={`tabular-nums ${
                      submittedResult.passed ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {submittedResult.score}
                  </span>
                  <span className="text-base font-medium text-slate-500"> / 100</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Jawaban benar:{' '}
                  <strong className="text-slate-900 tabular-nums">
                    {submittedResult.correctCount} dari {submittedResult.totalQuestions} soal
                  </strong>
                  . Nilai sudah otomatis tersimpan pada profil{' '}
                  <strong className="text-slate-900">{activeStudent?.name}</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => startExamForBab(activeExamBab)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ujian Ulang Bab Ini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveExamBab(null);
                    setSubmittedResult(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Pilih Bab Lain
                </button>
              </div>
            </div>

            {/* Ringkasan Skor Per Bagian (1-6) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                Rincian Skor Per Bagian (Bagian 1–6)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {EXAM_SECTIONS.map((sec) => {
                  const secQuestions = questions
                    .map((q, idx) => ({ q, idx }))
                    .filter((item) => item.q.sectionNumber === sec.number);
                  const secCorrect = secQuestions.filter(
                    ({ q, idx }) => answers[idx] === q.correctOptionId
                  ).length;
                  const allRight =
                    secQuestions.length > 0 && secCorrect === secQuestions.length;

                  return (
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
                        {secCorrect}/{secQuestions.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pembahasan Per Soal */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h4 className="text-base font-bold text-slate-900">
                  Pembahasan Jawaban ({questions.length} Soal)
                </h4>
              </div>
              <div className="divide-y divide-slate-200">
                {questions.map((q, idx) => {
                  const chosenId = answers[idx];
                  const isCorrect = chosenId === q.correctOptionId;
                  const chosenOpt = q.options.find((o) => o.id === chosenId);
                  const correctOpt = q.options.find(
                    (o) => o.id === q.correctOptionId
                  );

                  return (
                    <div key={q.id} className="p-5 sm:p-6 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 tabular-nums">
                            Soal {idx + 1}
                          </span>
                          {q.sectionTitle && (
                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {q.sectionTitle}
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
                        <span className="text-[11px] text-slate-400">{q.babKode}</span>
                      </div>

                      <div className="text-sm font-medium text-slate-800">
                        <div>{q.promptId}</div>
                        <div className="font-arabic text-xl text-slate-900 mt-1">
                          {q.arabicHighlight}
                        </div>
                      </div>

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
                          <div
                            className={`font-semibold text-slate-900 ${
                              hasArabicText(chosenOpt?.textAr || '')
                                ? 'font-arabic text-lg'
                                : 'text-sm'
                            }`}
                          >
                            {chosenOpt?.textAr || '—'}
                          </div>
                          {chosenOpt?.textSub && (
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              {chosenOpt.textSub}
                            </div>
                          )}
                        </div>
                        {!isCorrect && (
                          <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200">
                            <div className="text-[11px] text-emerald-800 mb-0.5">
                              Jawaban Benar
                            </div>
                            <div
                              className={`font-semibold text-emerald-900 ${
                                hasArabicText(correctOpt?.textAr || '')
                                  ? 'font-arabic text-lg'
                                  : 'text-sm'
                              }`}
                            >
                              {correctOpt?.textAr}
                            </div>
                            {correctOpt?.textSub && (
                              <div className="text-[11px] text-emerald-800 mt-0.5">
                                {correctOpt.textSub}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 bg-[#F8FAFC] p-3 rounded-lg border border-slate-200">
                        <strong className="text-slate-900">Kaidah:</strong>{' '}
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
                    <button
                      type="button"
                      onClick={() => speakArabic(currentQuestion.arabicHighlight)}
                      title="Dengarkan pelafalan Arab"
                      className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-colors shrink-0"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
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
                          handleSelectAnswer(currentIdx, opt.id, opt.textAr)
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
                          {opt.textSub && (
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              {opt.textSub}
                            </div>
                          )}
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
                      onClick={handleSubmitExam}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Selesai &amp; Lihat Nilai
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Question Navigator grouped by 6 Bagian */}
              <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Navigasi 6 Bagian Soal
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
                    onClick={handleSubmitExam}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                  >
                    Kumpulkan Ujian ({answeredCount}/{questions.length})
                  </button>
                </div>
              </aside>
            </div>
          )
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
                Pilih salah satu Bab di bawah ini untuk mengerjakan ujian (6 Bagian Soal, KKM {PASSING_SCORE}).
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
            6 Bagian Soal (Transformasi, Reverse Tasrif, Deret Rumpang, Kontekstual, Koreksi Wazan &amp; Idgham, Ekstraksi Kalimat)
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
                const stat = babStatsMap[bab.id] ?? {
                  attemptCount: 0,
                  bestScore: null,
                  latestScore: null,
                  latestTime: null,
                  passed: false,
                };
                const hasAttempt = stat.attemptCount > 0;
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
