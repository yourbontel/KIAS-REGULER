import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  Shuffle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Search,
  Award,
} from 'lucide-react';
import { Student, StudentClass, StudentGender, QuizAttempt } from '../data/students';
import type { QuestionIssue } from '../data/students';
import { SHOROF_BABS, SHIGHAT_LIST, MauzunVerb } from '../data/shorofData';
import { generateQuizQuestions, speakArabic, QuizQuestion } from '../utils/quizGenerator';

interface PracticeSandboxProps {
  students: Student[];
  selectedStudentId: string;
  onSelectStudent: (id: string) => void;
  filterClass: StudentClass;
  onChangeClass: (c: StudentClass) => void;
  filterGender: StudentGender;
  onChangeGender: (g: StudentGender) => void;
  onSaveAttempt: (attempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => void;
  recentAttempts: QuizAttempt[];
  lockedStudent?: Student;
  isQuestionChecker?: boolean;
  questionIssues?: Record<string, QuestionIssue>;
  onSaveQuestionIssue?: (issue: QuestionIssue) => void;
  onDeleteQuestionIssue?: (questionId: string) => void;
}

const SEQUENCE_KEYS: (keyof MauzunVerb['istilahi'])[] = [
  'madhi',
  'mudhari',
  'mashdar',
  'isim_fail',
  'isim_maful',
  'fiil_amr',
  'fiil_nahyi',
  'isim_zaman_makan',
];

export const PracticeSandbox: React.FC<PracticeSandboxProps> = ({
  students,
  selectedStudentId,
  onSelectStudent,
  filterClass,
  onChangeClass,
  filterGender,
  onChangeGender,
  onSaveAttempt,
  recentAttempts,
  lockedStudent,
  isQuestionChecker = false,
  questionIssues = {},
  onSaveQuestionIssue,
  onDeleteQuestionIssue,
}) => {
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedBabId, setSelectedBabId] = useState<string>('all');
  const [practiceMode, setPracticeMode] = useState<
    'istilahi' | 'lughawi' | 'tebak_shighat' | 'susun_tashrif'
  >('istilahi');
  const [questionCount, setQuestionCount] = useState<number>(8);

  // Filtered students strictly separated by Reguler 1 / 2 and Ikhwan / Akhwat
  const filteredGroupStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = s.kelas === filterClass;
      const matchGender = s.gender === filterGender;
      const matchQuery =
        !studentSearch.trim() ||
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.kota.toLowerCase().includes(studentSearch.toLowerCase());
      return matchClass && matchGender && matchQuery;
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

  // Ensure selected student stays synced if class/gender tab changes (Superadmin mode only)
  useEffect(() => {
    if (lockedStudent) return;
    if (
      activeStudent &&
      (activeStudent.kelas !== filterClass || activeStudent.gender !== filterGender)
    ) {
      const firstInGroup = students.find(
        (s) => s.kelas === filterClass && s.gender === filterGender
      );
      if (firstInGroup) {
        onSelectStudent(firstInGroup.id);
      }
    }
  }, [lockedStudent, filterClass, filterGender, activeStudent, students, onSelectStudent]);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    generateQuizQuestions('all', 'istilahi', 8)
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Sequence builder state ('susun_tashrif' mode)
  const [seqVerbIndex, setSeqVerbIndex] = useState(0);
  const [seqPlaced, setSeqPlaced] = useState<string[]>([]);
  const [seqPool, setSeqPool] = useState<{ key: string; textAr: string }[]>([]);
  const [seqFeedback, setSeqFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const availableVerbs = useMemo(() => {
    const babs =
      selectedBabId === 'all'
        ? SHOROF_BABS
        : SHOROF_BABS.filter((b) => b.id === selectedBabId);
    const list: { babKode: string; wazanAr: string; verb: MauzunVerb }[] = [];
    babs.forEach((b) => {
      b.mauzunList.forEach((v) => {
        list.push({ babKode: b.kode, wazanAr: b.wazanAr, verb: v });
      });
    });
    return list;
  }, [selectedBabId]);

  const currentSeqItem = availableVerbs[seqVerbIndex % Math.max(1, availableVerbs.length)];

  const initSequenceRound = (verbObj: MauzunVerb) => {
    const items = SEQUENCE_KEYS.map((k) => ({
      key: k,
      textAr: verbObj.istilahi[k],
    }));
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setSeqPlaced([]);
    setSeqPool(shuffled);
    setSeqFeedback('idle');
  };

  const startNewSession = (
    newBab = selectedBabId,
    newMode = practiceMode,
    newCount = questionCount
  ) => {
    if (newMode === 'susun_tashrif') {
      const targetBabs =
        newBab === 'all' ? SHOROF_BABS : SHOROF_BABS.filter((b) => b.id === newBab);
      const firstVerb = targetBabs[0]?.mauzunList[0] || SHOROF_BABS[0].mauzunList[0];
      setSeqVerbIndex(0);
      initSequenceRound(firstVerb);
      setQuizFinished(false);
      return;
    }
    const generated = generateQuizQuestions(newBab, newMode, newCount);
    setQuestions(generated);
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setCorrectCount(0);
    setQuizFinished(false);
  };

  const handlePickRandomStudent = () => {
    const pool = students.filter(
      (s) => s.kelas === filterClass && s.gender === filterGender
    );
    if (pool.length === 0) return;
    const randomStudent = pool[Math.floor(Math.random() * pool.length)];
    onSelectStudent(randomStudent.id);
    startNewSession(selectedBabId, practiceMode, questionCount);
  };

  const handleSelectOption = (optionId: string) => {
    if (selectedOptionId !== null) return;
    setSelectedOptionId(optionId);
    if (optionId === questions[currentIdx].correctOptionId) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
    } else {
      setQuizFinished(true);
      const finalScore = Math.round((correctCount / Math.max(1, questions.length)) * 100);
      const babMeta =
        selectedBabId === 'all'
          ? 'Semua Bab Tashrif'
          : SHOROF_BABS.find((b) => b.id === selectedBabId)?.kode || 'Bab Shorof';
      if (activeStudent && !isQuestionChecker) {
        onSaveAttempt({
          studentId: activeStudent.id,
          babId: selectedBabId,
          babLabel: babMeta,
          mode: practiceMode,
          score: finalScore,
          correctCount,
          totalQuestions: questions.length,
        });
      }
    }
  };

  // Sequence Builder Handlers
  const handleAddSeqWord = (key: string, textAr: string) => {
    speakArabic(textAr);
    speakArabic(textAr);
    setSeqPlaced((prev) => [...prev, key]);
    setSeqPool((prev) => prev.filter((item) => item.key !== key));
    setSeqFeedback('idle');
  };

  const handleRemoveSeqWord = (key: string) => {
    if (!currentSeqItem) return;
    const textAr = currentSeqItem.verb.istilahi[key as keyof MauzunVerb['istilahi']];
    setSeqPlaced((prev) => prev.filter((k) => k !== key));
    setSeqPool((prev) => [...prev, { key, textAr }]);
    setSeqFeedback('idle');
  };

  const handleVerifySequence = () => {
    if (!currentSeqItem) return;
    const isAllCorrect =
      seqPlaced.length === SEQUENCE_KEYS.length &&
      seqPlaced.every((k, index) => k === SEQUENCE_KEYS[index]);

    if (isAllCorrect) {
      setSeqFeedback('correct');
      if (activeStudent) {
        onSaveAttempt({
          studentId: activeStudent.id,
          babId: currentSeqItem.verb.babId,
          babLabel: `${currentSeqItem.babKode} (${currentSeqItem.verb.istilahi.madhi})`,
          mode: 'susun_tashrif',
          score: 100,
          correctCount: SEQUENCE_KEYS.length,
          totalQuestions: SEQUENCE_KEYS.length,
        });
      }
    } else {
      setSeqFeedback('wrong');
    }
  };

  const currentQuestion = questions[currentIdx];
  const currentIssue = currentQuestion ? questionIssues[currentQuestion.id] : undefined;
  const handleToggleIssue = () => {
    if (!currentQuestion || !onSaveQuestionIssue || !onDeleteQuestionIssue) return;
    if (currentIssue) {
      onDeleteQuestionIssue(currentQuestion.id);
      return;
    }
    const note = window.prompt('Catatan masalah soal (opsional):', '')?.trim() || undefined;
    onSaveQuestionIssue({
      questionId: currentQuestion.id,
      babId: currentQuestion.babId,
      babKode: currentQuestion.babKode,
      promptId: currentQuestion.promptId,
      ...(note ? { note } : {}),
      markedAt: new Date().toISOString(),
      markedBy: 'Superadmin',
    });
  };
  const studentAttempts = useMemo(
    () => recentAttempts.filter((a) => a.studentId === activeStudent?.id),
    [recentAttempts, activeStudent]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT / MAIN INTERACTIVE STAGE (8 columns on 12-col grid = 66.7%) */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        {/* Student Active Context Header — Zero-Pill Unboxed Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-emerald-800">{activeStudent?.kelas}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-700">
                Kelompok {activeStudent?.gender}
              </span>
              {activeStudent?.kota && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{activeStudent.kota}</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {activeStudent?.name}
            </h2>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500">Riwayat Sesi Siswa</div>
            <div className="text-sm font-semibold text-slate-900 tabular-nums mt-0.5">
              {studentAttempts.length} Latihan Selesai
              {studentAttempts.length > 0 && (
                <>
                  {' '}
                  · Rata-rata{' '}
                  {Math.round(
                    studentAttempts.reduce((acc, a) => acc + a.score, 0) /
                      studentAttempts.length
                  )}
                  %
                </>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Stage Content */}
        {practiceMode === 'susun_tashrif' && currentSeqItem ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-xs text-slate-500">
                  Susun Urutan Tashrif Istilahi · {currentSeqItem.babKode} (
                  {currentSeqItem.wazanAr})
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mt-1">
                  Kata Dasar: <span className="font-arabic text-2xl mx-1">{currentSeqItem.verb.istilahi.madhi}</span> ({currentSeqItem.verb.artiDasar})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = (seqVerbIndex + 1) % availableVerbs.length;
                    setSeqVerbIndex(nextIdx);
                    initSequenceRound(availableVerbs[nextIdx].verb);
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Ganti Kata Kerja
                </button>
                <button
                  type="button"
                  onClick={() => initSequenceRound(currentSeqItem.verb)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Ulangi Susunan
                </button>
              </div>
            </div>

            {/* Target 8-Slot Sequence Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {SEQUENCE_KEYS.map((slotKey, index) => {
                const shighatMeta = SHIGHAT_LIST.find((s) => s.key === slotKey)!;
                const placedKey = seqPlaced[index];
                const placedText = placedKey
                  ? currentSeqItem.verb.istilahi[placedKey as keyof MauzunVerb['istilahi']]
                  : null;

                const isSlotWrong =
                  seqFeedback === 'wrong' && placedKey && placedKey !== slotKey;

                return (
                  <div
                    key={slotKey}
                    className={`p-3.5 rounded-lg border transition-colors ${
                      placedText
                        ? isSlotWrong
                          ? 'bg-red-50/70 border-red-300'
                          : seqFeedback === 'correct'
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-slate-50 border-slate-300'
                        : 'bg-[#F8FAFC] border-dashed border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="tabular-nums font-medium">
                        0{index + 1}. {shighatMeta.labelId}
                      </span>
                    </div>
                    {placedText ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveSeqWord(placedKey)}
                        className="w-full text-center py-2 font-arabic text-2xl font-bold text-slate-900 hover:text-red-700 transition-colors"
                        title="Klik untuk melepas kata ini"
                      >
                        {placedText}
                      </button>
                    ) : (
                      <div className="h-11 flex items-center justify-center text-xs text-slate-400">
                        Klik kata di bawah
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Scrambled Word Pool */}
            <div className="mb-6">
              <div className="text-xs font-medium text-slate-600 mb-3">
                Pilih kata Arab berikut secara berurutan dari 01 (Fi&apos;il Madhi) hingga 08 (Isim Zaman/Makan):
              </div>
              <div className="flex flex-wrap gap-3">
                {seqPool.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleAddSeqWord(item.key, item.textAr)}
                    className="px-5 py-3 bg-white border border-slate-300 hover:border-emerald-600 hover:bg-emerald-50/40 rounded-lg font-arabic text-2xl text-slate-900 transition-colors"
                  >
                    {item.textAr}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification Controls & Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <div>
                {seqFeedback === 'correct' && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Susunan Tashrif Istilahi Tepat (100 Poin tercatat untuk {activeStudent?.name})
                    </span>
                  </div>
                )}
                {seqFeedback === 'wrong' && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Masih ada urutan shighat yang tertukar (ditandai merah). Klik kata untuk memperbaiki.
                    </span>
                  </div>
                )}
                {seqFeedback === 'idle' && (
                  <span className="text-xs text-slate-500 tabular-nums">
                    Terisi {seqPlaced.length} dari {SEQUENCE_KEYS.length} kotak shighat
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={seqPlaced.length < SEQUENCE_KEYS.length}
                onClick={handleVerifySequence}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Periksa Urutan Tashrif
              </button>
            </div>
          </div>
        ) : quizFinished ? (
          /* Quiz Completion Summary */
          <div className="py-8 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6" />
            </div>
            <div className="text-xs text-slate-500 mb-1">
              Hasil Evaluasi Latihan Shorof · {activeStudent?.kelas} ({activeStudent?.gender})
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {activeStudent?.name}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Menjawab benar{' '}
              <span className="font-semibold text-slate-900 tabular-nums">
                {correctCount} dari {questions.length} soal
              </span>{' '}
              dengan nilai akhir{' '}
              <span className="font-bold text-emerald-700 tabular-nums">
                {Math.round((correctCount / Math.max(1, questions.length)) * 100)} / 100
              </span>
              . Nilai telah otomatis disimpan ke rekap kelas.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => startNewSession(selectedBabId, practiceMode, questionCount)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                Latihan Lagi (Soal Baru)
              </button>
              <button
                type="button"
                onClick={handlePickRandomStudent}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Shuffle className="w-4 h-4" />
                Giliran Siswa Berikutnya ({filterClass} - {filterGender})
              </button>
            </div>
          </div>
        ) : currentQuestion ? (
          /* Active Multiple-Choice Question Stage */
          <div>
            {/* Progress & Bab Context */}
             <div className="flex items-center justify-between gap-4 text-xs text-slate-500 mb-4">
               <span>{currentQuestion.babKode}</span>
               <div className="flex items-center gap-3">
                 {isQuestionChecker && (
                   <button type="button" onClick={handleToggleIssue} className={`px-2.5 py-1.5 rounded-md border font-semibold ${currentIssue ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300'}`}>
                     {currentIssue ? 'Soal Ditandai' : 'Tandai Bermasalah'}
                   </button>
                 )}
                 <span className="tabular-nums font-medium text-slate-700">Soal {currentIdx + 1} / {questions.length} · Skor Sementara: {correctCount} Benar</span>
               </div>
             </div>

            {/* Question Prompt Card */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-6 mb-6">
              <p className="text-sm font-medium text-slate-700 mb-4">
                {currentQuestion.promptId}
              </p>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div
                    dir="rtl"
                    className="font-arabic text-3xl sm:text-4xl font-bold text-slate-900 tracking-wide"
                  >
                    {currentQuestion.arabicHighlight}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    {currentQuestion.arabicSubtext}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOptionId === option.id;
                const isCorrect = option.id === currentQuestion.correctOptionId;
                const showResult = selectedOptionId !== null;

                let buttonStyle =
                  'bg-white border-slate-200 hover:border-slate-400 text-slate-900';
                if (showResult) {
                  if (isCorrect) {
                    buttonStyle = 'bg-emerald-50/90 border-emerald-600 text-emerald-950';
                  } else if (isSelected && !isCorrect) {
                    buttonStyle = 'bg-red-50/90 border-red-500 text-red-950';
                  } else {
                    buttonStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-75';
                  }
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                     disabled={showResult}
                    onClick={() => handleSelectOption(option.id)}
                    className={`group flex items-center justify-between gap-4 p-4 rounded-xl border text-left transition-colors ${buttonStyle}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold tabular-nums flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={
                            practiceMode === 'tebak_shighat'
                              ? 'text-base font-bold'
                              : 'font-arabic text-2xl sm:text-3xl font-bold'
                          }
                        >
                          {option.textAr}
             </div>

             {currentIssue && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">Ditandai bermasalah{currentIssue.note ? `: ${currentIssue.note}` : '.'}</div>}
                      </div>
                    </div>

                    {showResult && isCorrect && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        BENAR
                      </span>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 shrink-0">
                        <XCircle className="w-4 h-4" />
                        KURANG TEPAT
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Immediate Pedagogical Explanation & Next Button */}
            {selectedOptionId !== null && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Penjelasan Kaidah: </span>
                  {currentQuestion.explanation}
                </div>
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>
                    {currentIdx + 1 < questions.length
                      ? 'Soal Berikutnya'
                      : 'Selesaikan & Simpan Nilai'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* RIGHT / CONTROL & STUDENT SELECTOR DECK (4 columns on 12-col grid = 33.3%) */}
      <aside className="lg:col-span-4 space-y-6">
        {/* Panel 1: Pemilih Kelas & Siswa (Superadmin) atau Profil Siswa Login */}
        {lockedStudent ? (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-base font-bold text-slate-900">
                1. Profil Siswa Login
              </h3>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Akun Aktif
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-slate-200 space-y-1">
              <div className="text-sm font-bold text-slate-900">
                {lockedStudent.name}
              </div>
              <div className="text-xs text-slate-600">
                {lockedStudent.kelas} · Kelompok {lockedStudent.gender}
              </div>
              {lockedStudent.kota && (
                <div className="text-[11px] text-slate-500">
                  {lockedStudent.kota}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
              Setiap sesi latihan yang Anda selesaikan akan otomatis tercatat pada riwayat nilai akun Anda.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                1. Pilih Kelas &amp; Siswa
              </h3>
              <span className="text-xs text-slate-500 tabular-nums">
                {filteredGroupStudents.length} Siswa
              </span>
            </div>

            {/* Class Filter: Reguler 1 vs Reguler 2 */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Kelas Program
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                {(['Reguler 1', 'Reguler 2'] as StudentClass[]).map((cls) => {
                  const count = students.filter((s) => s.kelas === cls).length;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => onChangeClass(cls)}
                      className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        filterClass === cls
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cls} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gender Filter: Ikhwan vs Akhwat */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Kelompok Belajar (Terpisah)
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                {(['Ikhwan', 'Akhwat'] as StudentGender[]).map((g) => {
                  const count = students.filter(
                    (s) => s.kelas === filterClass && s.gender === g
                  ).length;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => onChangeGender(g)}
                      className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                        filterGender === g
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {g} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search & Random Student Picker */}
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder={`Cari nama di ${filterClass} (${filterGender})...`}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <button
                type="button"
                onClick={handlePickRandomStudent}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                title="Pilih siswa acak dari kelompok ini untuk setoran/kuis"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Acak
              </button>
            </div>

            {/* Scrollable Student List for the Active Class & Gender */}
            <div className="max-h-52 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-[#F8FAFC]">
              {filteredGroupStudents.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  Tidak ada nama siswa yang cocok dengan pencarian.
                </div>
              ) : (
                filteredGroupStudents.map((st, idx) => {
                  const isSelected = st.id === activeStudent?.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        onSelectStudent(st.id);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-emerald-700 text-white font-semibold'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span className="truncate">
                        <span className="tabular-nums opacity-75 mr-1.5">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        {st.name}
                      </span>
                      <span
                        className={`text-[11px] shrink-0 ${
                          isSelected ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {st.kota}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Panel 2: Pengaturan Materi & Mode Latihan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            2. Pengaturan Materi Shorof
          </h3>

          {/* Mode Latihan */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Metode Latihan
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'istilahi', label: 'Tashrif Istilahi' },
                { id: 'lughawi', label: 'Tashrif Lughawi' },
                { id: 'tebak_shighat', label: 'Tebak Shighat' },
                { id: 'susun_tashrif', label: 'Susun Tabel' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    const modeVal = m.id as typeof practiceMode;
                    setPracticeMode(modeVal);
                    startNewSession(selectedBabId, modeVal, questionCount);
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-left transition-colors whitespace-nowrap shrink-0 ${
                    practiceMode === m.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pilihan Bab Tashrif */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Fokus Bab Wazan
            </label>
            <select
              value={selectedBabId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedBabId(val);
                startNewSession(val, practiceMode, questionCount);
              }}
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="all">Semua Bab (Tsulatsi Mujarrod &amp; Mazid)</option>
              {SHOROF_BABS.map((bab) => (
                <option key={bab.id} value={bab.id}>
                  {bab.kode}: {bab.wazanAr} ({bab.wazanLatin})
                </option>
              ))}
            </select>
          </div>

          {/* Slider Jumlah Soal (dengan Label, Nilai Numerik, dan Satuan) */}
          {practiceMode !== 'susun_tashrif' && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label htmlFor="question-count-slider" className="font-medium text-slate-600">
                  Target Jumlah Soal
                </label>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {questionCount} Soal / Sesi
                </span>
              </div>
              <input
                id="question-count-slider"
                type="range"
                min={5}
                max={15}
                step={1}
                value={questionCount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setQuestionCount(val);
                  startNewSession(selectedBabId, practiceMode, val);
                }}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 tabular-nums mt-1">
                <span>5 Soal</span>
                <span>10 Soal</span>
                <span>15 Soal</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
