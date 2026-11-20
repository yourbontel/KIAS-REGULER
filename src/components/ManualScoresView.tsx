import React, { useEffect, useMemo, useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  Download,
  RotateCcw,
  Save,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import {
  ManualScoreRecord,
  PASSING_SCORE,
  QuizAttempt,
  Student,
  StudentGender,
} from '../data/students';
import {
  GRADE_WEIGHTS,
  computeFinalGradeSummary,
  computeStudentWebAverage,
  formatGradeNumber,
} from '../utils/finalGrades';
import type { ManualScoreInputEntry } from '../utils/studentData';

interface ManualScoresViewProps {
  students: Student[];
  attempts: QuizAttempt[];
  manualScoresMap: Record<string, ManualScoreRecord>;
  selectedGender?: StudentGender;
  onSaveManualScores: (entries: ManualScoreInputEntry[]) => Promise<string | null>;
}

type StatusFilter = 'all' | 'has_manual' | 'complete' | 'incomplete';

function toInputString(val: number | null | undefined): string {
  if (val === null || val === undefined || !Number.isFinite(val)) return '';
  return String(val);
}

function parseOptionalScoreInput(raw: string): {
  valid: boolean;
  value: number | null;
} {
  const trimmed = raw.trim().replace(',', '.');
  if (!trimmed) return { valid: true, value: null };
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num < 0 || num > 100) {
    return { valid: false, value: null };
  }
  return { valid: true, value: Math.round(num * 100) / 100 };
}

export const ManualScoresView: React.FC<ManualScoresViewProps> = ({
  students,
  attempts,
  manualScoresMap,
  selectedGender,
  onSaveManualScores,
}) => {
  const [genderFilter, setGenderFilter] = useState<'Semua' | StudentGender>(
    selectedGender ?? 'Semua'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Single-student quick form state
  const [formStudentSearch, setFormStudentSearch] = useState<string>('');
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formUts, setFormUts] = useState<string>('');
  const [formUas, setFormUas] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [savingForm, setSavingForm] = useState(false);

  const classStudents = useMemo(
    () =>
      students.filter((s) => {
        if (s.kelas !== 'Reguler 1') return false;
        if (genderFilter !== 'Semua' && s.gender !== genderFilter) return false;
        return true;
      }),
    [students, genderFilter]
  );

  const formFilteredStudents = useMemo(() => {
    const q = formStudentSearch.trim().toLowerCase();
    if (!q) return classStudents;
    return classStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) || s.kota.toLowerCase().includes(q)
    );
  }, [classStudents, formStudentSearch]);

  // Ensure formStudentId stays valid inside active gender/search filter
  useEffect(() => {
    if (formFilteredStudents.length === 0) {
      setFormStudentId('');
      setFormUts('');
      setFormUas('');
      return;
    }
    if (!formFilteredStudents.some((s) => s.id === formStudentId)) {
      const firstId = formFilteredStudents[0].id;
      setFormStudentId(firstId);
      const rec = manualScoresMap[firstId];
      setFormUts(toInputString(rec?.utsScore));
      setFormUas(toInputString(rec?.uasScore));
      setFormError(null);
      setFormSuccess(null);
    }
  }, [formFilteredStudents, formStudentId, manualScoresMap]);

  // Group attempts per student once
  const attemptsByStudent = useMemo(() => {
    const map: Record<string, QuizAttempt[]> = {};
    attempts.forEach((a) => {
      if (!map[a.studentId]) map[a.studentId] = [];
      map[a.studentId].push(a);
    });
    return map;
  }, [attempts]);

  const webAvgByStudent = useMemo(() => {
    const map: Record<string, number | null> = {};
    students.forEach((st) => {
      map[st.id] = computeStudentWebAverage(st, attemptsByStudent[st.id] || []);
    });
    return map;
  }, [students, attemptsByStudent]);

  const handleSelectStudentForForm = (studentId: string) => {
    if (
      formStudentSearch.trim() &&
      !formFilteredStudents.some((s) => s.id === studentId)
    ) {
      setFormStudentSearch('');
    }
    setFormStudentId(studentId);
    const saved = manualScoresMap[studentId];
    setFormUts(toInputString(saved?.utsScore));
    setFormUas(toInputString(saved?.uasScore));
    setFormError(null);
    setFormSuccess(null);
  };

  const selectedFormStudent = useMemo(
    () => students.find((s) => s.id === formStudentId) || null,
    [students, formStudentId]
  );

  const formParsed = useMemo(() => {
    const uts = parseOptionalScoreInput(formUts);
    const uas = parseOptionalScoreInput(formUas);
    const webScore = selectedFormStudent
      ? webAvgByStudent[selectedFormStudent.id] ?? null
      : null;
    const summary = computeFinalGradeSummary(webScore, {
      utsScore: uts.valid ? uts.value : null,
      uasScore: uas.valid ? uas.value : null,
    });
    return { uts, uas, summary };
  }, [formUts, formUas, selectedFormStudent, webAvgByStudent]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormStudent) return;
    setFormError(null);
    setFormSuccess(null);

    if (!formParsed.uts.valid || !formParsed.uas.valid) {
      setFormError('Nilai UTS dan UAS harus berupa angka antara 0 sampai 100.');
      return;
    }

    setSavingForm(true);
    const error = await onSaveManualScores([
      {
        studentId: selectedFormStudent.id,
        utsScore: formParsed.uts.value,
        uasScore: formParsed.uas.value,
      },
    ]);
    setSavingForm(false);

    if (error) {
      setFormError(error);
      return;
    }

    setFormSuccess(`Nilai UTS & UAS untuk ${selectedFormStudent.name} berhasil disimpan.`);
  };

  const handleClearFormInputs = () => {
    setFormUts('');
    setFormUas('');
    setFormError(null);
    setFormSuccess(null);
  };

  const filteredTableStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return classStudents.filter((st) => {
      if (q && !st.name.toLowerCase().includes(q) && !st.kota.toLowerCase().includes(q)) {
        return false;
      }
      const saved = manualScoresMap[st.id];
      const webAvg = webAvgByStudent[st.id] ?? null;
      const summary = computeFinalGradeSummary(webAvg, saved);
      if (statusFilter === 'has_manual') {
        return summary.utsScore !== null || summary.uasScore !== null;
      }
      if (statusFilter === 'complete') {
        return summary.isComplete;
      }
      if (statusFilter === 'incomplete') {
        return !summary.isComplete;
      }
      return true;
    });
  }, [classStudents, searchQuery, statusFilter, manualScoresMap, webAvgByStudent]);

  const classStats = useMemo(() => {
    let withUts = 0;
    let withUas = 0;
    let completeCount = 0;
    classStudents.forEach((st) => {
      const saved = manualScoresMap[st.id];
      if (saved?.utsScore !== null && saved?.utsScore !== undefined) withUts += 1;
      if (saved?.uasScore !== null && saved?.uasScore !== undefined) withUas += 1;
      const summary = computeFinalGradeSummary(webAvgByStudent[st.id] ?? null, saved);
      if (summary.isComplete) completeCount += 1;
    });
    return {
      total: classStudents.length,
      withUts,
      withUas,
      completeCount,
    };
  }, [classStudents, manualScoresMap, webAvgByStudent]);

  const handleExportCSV = () => {
    const headers = [
      'Nama Siswa',
      'Kelas',
      'Kelompok',
      'Semester',
      'Ujian Web (50%)',
      'Nilai UTS Sem. 1 (10%)',
      'Nilai UAS Sem. 1 (40%)',
      'Nilai Akhir Sem. 1',
      'Status Kelengkapan',
      'Status KKM',
    ];
    const rows = filteredTableStudents.map((st) => {
      const webScore = webAvgByStudent[st.id] ?? null;
      const summary = computeFinalGradeSummary(webScore, manualScoresMap[st.id]);
      const statusKkm = !summary.isComplete
        ? 'Belum Lengkap'
        : summary.passed
        ? 'Lulus'
        : 'Di Bawah KKM';
      return [
        `"${st.name}"`,
        `"${st.kelas}"`,
        `"${st.gender}"`,
        '"Semester 1"',
        summary.webScore ?? '-',
        summary.utsScore ?? '-',
        summary.uasScore ?? '-',
        summary.finalScore !== null ? formatGradeNumber(summary.finalScore) : '-',
        summary.isComplete ? 'Lengkap' : 'Sementara',
        `"${statusKkm}"`,
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Nilai_Semester_1_Reguler_1.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Grading Formula Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <Calculator className="w-3.5 h-3.5" />
              Semester 1 · Kelas Reguler 1
            </div>
            <h2 className="text-base font-bold text-slate-900 pt-1">
              Input Manual Nilai UTS &amp; UAS Semester 1 (Reguler 1)
            </h2>
            <p className="text-xs text-slate-500">
              Nilai UTS dan UAS Semester 1 Reguler 1 tidak diambil dari ujian website, melainkan diinput langsung oleh Superadmin. Komposisi nilai akhir: <strong>50% Ujian Web + 10% UTS + 40% UAS</strong> (KKM {PASSING_SCORE}).
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 shrink-0">
            <div className="px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500">Ujian Website</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">50%</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-center">
              <div className="text-[11px] text-sky-800">UTS Sem. 1</div>
              <div className="text-base font-bold text-sky-900 tabular-nums">10%</div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-center">
              <div className="text-[11px] text-emerald-800">UAS Sem. 1</div>
              <div className="text-base font-bold text-emerald-900 tabular-nums">40%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Single-Student Form */}
      <form
        onSubmit={handleSubmitForm}
        className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Form Input Nilai UTS &amp; UAS Semester 1 (Reguler 1)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pilih siswa Reguler 1 atau klik langsung nama siswa pada tabel di bawah untuk mengisi nilai UTS dan UAS Semester 1.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 tabular-nums">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">
              UTS Terisi: <strong>{classStats.withUts}/{classStats.total}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200">
              UAS Terisi: <strong>{classStats.withUas}/{classStats.total}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              Lengkap: <strong>{classStats.completeCount}/{classStats.total}</strong>
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Class + Gender + Student search & selector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kelas &amp; Periode
              </label>
              <div className="w-full px-3 py-2.5 text-xs font-semibold text-emerald-900 bg-emerald-50/70 border border-emerald-200 rounded-lg whitespace-nowrap">
                Reguler 1 · Sem. 1
              </div>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="form-gender-filter"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Kelompok
              </label>
              <select
                id="form-gender-filter"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as 'Semua' | StudentGender)}
                className="w-full px-3 py-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-600"
              >
                <option value="Semua">Ikhwan &amp; Akhwat</option>
                <option value="Ikhwan">Ikhwan</option>
                <option value="Akhwat">Akhwat</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="form-student-search"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Cari Siswa
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="form-student-search"
                  type="text"
                  value={formStudentSearch}
                  onChange={(e) => setFormStudentSearch(e.target.value)}
                  placeholder="Ketik nama atau kota..."
                  className="w-full pl-8 pr-8 py-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-600"
                />
                {formStudentSearch && (
                  <button
                    type="button"
                    onClick={() => setFormStudentSearch('')}
                    aria-label="Hapus pencarian siswa"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor="form-student-select"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Pilih Siswa
                </label>
                {formStudentSearch.trim() && (
                  <span className="text-[11px] font-medium text-emerald-700 tabular-nums">
                    {formFilteredStudents.length} cocok
                  </span>
                )}
              </div>
              <select
                id="form-student-select"
                value={formStudentId}
                onChange={(e) => handleSelectStudentForForm(e.target.value)}
                disabled={formFilteredStudents.length === 0}
                className="w-full px-3 py-2.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-emerald-600 disabled:opacity-50"
              >
                {formFilteredStudents.length === 0 ? (
                  <option value="">
                    {formStudentSearch.trim()
                      ? `Tidak ada siswa cocok dengan "${formStudentSearch.trim()}"`
                      : 'Tidak ada siswa pada filter ini'}
                  </option>
                ) : (
                  formFilteredStudents.map((st) => {
                    const rec = manualScoresMap[st.id];
                    const hasAny =
                      (rec?.utsScore !== null && rec?.utsScore !== undefined) ||
                      (rec?.uasScore !== null && rec?.uasScore !== undefined);
                    return (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.gender} · {st.kota})
                        {hasAny
                          ? ` — UTS: ${rec?.utsScore ?? '-'}, UAS: ${rec?.uasScore ?? '-'}`
                          : ''}
                      </option>
                    );
                  })
                )}
              </select>
            </div>
          </div>

          {!selectedFormStudent && (
            <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-xs text-slate-500">
              Tidak ada siswa yang sesuai dengan kata kunci pencarian. Ubah atau hapus teks pencarian untuk memilih siswa.
            </div>
          )}

          {/* Score Inputs + Live Weighted Preview */}
          {selectedFormStudent && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Ujian Website (50%)
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                    {formParsed.summary.webScore !== null
                      ? formParsed.summary.webScore
                      : '—'}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 tabular-nums">
                  {formParsed.summary.webWeighted !== null
                    ? `Kontribusi: ${formatGradeNumber(formParsed.summary.webWeighted)} poin`
                    : 'Belum ada Bab selesai'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <label
                  htmlFor="input-uts-score"
                  className="block text-[11px] font-semibold text-slate-700 mb-1.5"
                >
                  Nilai UTS (Bobot {GRADE_WEIGHTS.UTS * 100}%)
                </label>
                <input
                  id="input-uts-score"
                  type="number"
                  min={0}
                  max={100}
                  step="0.5"
                  value={formUts}
                  onChange={(e) => {
                    setFormUts(e.target.value);
                    setFormError(null);
                    setFormSuccess(null);
                  }}
                  placeholder="0 - 100"
                  className={`w-full px-3 py-2 text-sm font-semibold tabular-nums rounded-lg border focus:outline-none ${
                    formParsed.uts.valid
                      ? 'border-slate-300 bg-[#F8FAFC] focus:bg-white focus:border-emerald-600'
                      : 'border-rose-400 bg-rose-50 text-rose-900'
                  }`}
                />
                <div className="text-[11px] text-slate-500 mt-1.5 tabular-nums">
                  {!formParsed.uts.valid ? (
                    <span className="text-rose-600 font-medium">Rentang valid: 0–100</span>
                  ) : formParsed.summary.utsWeighted !== null ? (
                    `Kontribusi: ${formatGradeNumber(formParsed.summary.utsWeighted)} poin`
                  ) : (
                    'Kosongkan jika belum ada'
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200">
                <label
                  htmlFor="input-uas-score"
                  className="block text-[11px] font-semibold text-slate-700 mb-1.5"
                >
                  Nilai UAS (Bobot {GRADE_WEIGHTS.UAS * 100}%)
                </label>
                <input
                  id="input-uas-score"
                  type="number"
                  min={0}
                  max={100}
                  step="0.5"
                  value={formUas}
                  onChange={(e) => {
                    setFormUas(e.target.value);
                    setFormError(null);
                    setFormSuccess(null);
                  }}
                  placeholder="0 - 100"
                  className={`w-full px-3 py-2 text-sm font-semibold tabular-nums rounded-lg border focus:outline-none ${
                    formParsed.uas.valid
                      ? 'border-slate-300 bg-[#F8FAFC] focus:bg-white focus:border-emerald-600'
                      : 'border-rose-400 bg-rose-50 text-rose-900'
                  }`}
                />
                <div className="text-[11px] text-slate-500 mt-1.5 tabular-nums">
                  {!formParsed.uas.valid ? (
                    <span className="text-rose-600 font-medium">Rentang valid: 0–100</span>
                  ) : formParsed.summary.uasWeighted !== null ? (
                    `Kontribusi: ${formatGradeNumber(formParsed.summary.uasWeighted)} poin`
                  ) : (
                    'Kosongkan jika belum ada'
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-emerald-900">
                      Nilai Akhir
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        formParsed.summary.finalScore === null
                          ? 'bg-slate-200 text-slate-600'
                          : !formParsed.summary.isComplete
                          ? 'bg-sky-100 text-sky-800'
                          : formParsed.summary.passed
                          ? 'bg-emerald-700 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {formParsed.summary.finalScore === null
                        ? 'Kosong'
                        : !formParsed.summary.isComplete
                        ? 'Sementara'
                        : formParsed.summary.passed
                        ? 'Lulus'
                        : 'Di Bawah KKM'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                    {formatGradeNumber(formParsed.summary.finalScore)}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-900/80 mt-2">
                  50% Web + 10% UTS + 40% UAS
                </div>
              </div>
            </div>
          )}

          {formError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleClearFormInputs}
              disabled={savingForm || (!formUts && !formUas)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Kosongkan Input
            </button>
            <button
              type="submit"
              disabled={savingForm || !selectedFormStudent}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingForm ? 'Menyimpan...' : 'Simpan Nilai UTS & UAS'}
            </button>
          </div>
        </div>
      </form>

      {/* Read-only Student Scores Table (editing only via Form above) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daftar Nilai UTS &amp; UAS (Reguler 1 · Semester 1)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tabel ini bersifat lihat saja. Pengisian atau perubahan nilai UTS &amp; UAS hanya dilakukan melalui Form Input di atas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter Status Nilai UTS UAS"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg"
            >
              <option value="all">Semua Siswa</option>
              <option value="has_manual">Sudah Ada UTS / UAS</option>
              <option value="complete">Lengkap (Web + UTS + UAS)</option>
              <option value="incomplete">Belum Lengkap</option>
            </select>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari siswa..."
                className="pl-8 pr-7 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg w-44"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
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
                <th className="py-3 px-4 text-center whitespace-nowrap">
                  Ujian Web (50%)
                </th>
                <th className="py-3 px-4 text-center whitespace-nowrap">
                  UTS (10%)
                </th>
                <th className="py-3 px-4 text-center whitespace-nowrap">
                  UAS (40%)
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  Nilai Akhir
                </th>
                <th className="py-3 px-4 text-center whitespace-nowrap">
                  Status
                </th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {filteredTableStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Tidak ada siswa yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTableStudents.map((st, idx) => {
                  const webScore = webAvgByStudent[st.id] ?? null;
                  const summary = computeFinalGradeSummary(webScore, manualScoresMap[st.id]);
                  const isFocused = formStudentId === st.id;

                  return (
                    <tr
                      key={st.id}
                      className={
                        isFocused ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'
                      }
                    >
                      <td className="py-2.5 px-4 text-slate-400 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{st.name}</span>
                          {isFocused && (
                            <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {st.kelas} · {st.gender} · {st.kota}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center tabular-nums">
                        {webScore !== null ? (
                          <div>
                            <span className="font-semibold text-slate-900">
                              {webScore}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              +{formatGradeNumber(summary.webWeighted)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center tabular-nums">
                        {summary.utsScore !== null ? (
                          <div>
                            <span className="font-semibold text-slate-900">
                              {summary.utsScore}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              +{formatGradeNumber(summary.utsWeighted)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center tabular-nums">
                        {summary.uasScore !== null ? (
                          <div>
                            <span className="font-semibold text-slate-900">
                              {summary.uasScore}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              +{formatGradeNumber(summary.uasWeighted)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        {summary.finalScore !== null ? (
                          <span
                            className={`text-sm font-bold ${
                              !summary.isComplete
                                ? 'text-slate-700'
                                : summary.passed
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {formatGradeNumber(summary.finalScore)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {summary.finalScore === null ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                            Kosong
                          </span>
                        ) : !summary.isComplete ? (
                          <span
                            title="Menunggu komponen Web/UTS/UAS lengkap"
                            className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200"
                          >
                            Sementara
                          </span>
                        ) : summary.passed ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Lulus
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Di Bawah KKM
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelectStudentForForm(st.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                            isFocused
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isFocused ? 'Dipilih' : 'Pilih di Form'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
