import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  UserPlus,
  Check,
  ArrowLeftRight,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import {
  Student,
  StudentClass,
  StudentGender,
  QuizAttempt,
  SetoranRecord,
} from '../data/students';
import { StudentPasswordMap } from '../utils/auth';
import {
  buildQuestionTypeOptions,
  matchesResetParams,
  questionTypeToParams,
  type QuestionTypeFilter,
  type ResetAttemptsParams,
} from '../utils/attemptFilter';
import { ALL_SHOROF_BABS } from '../data/shorofData';
import { ResetConfirmModal } from './ResetConfirmModal';
import { SuccessToast } from './SuccessToast';

interface StudentRosterViewProps {
  students: Student[];
  attempts: QuizAttempt[];
  setoranMap: Record<string, SetoranRecord>;
  onToggleSetoranBab: (studentId: string, babCode: string) => void;
  onAddStudent: (newStudent: Omit<Student, 'id'>) => void;
  onUpdateStudentGroup: (
    studentId: string,
    kelas: StudentClass,
    gender: StudentGender
  ) => void;
  studentPasswords?: StudentPasswordMap;
  onResetStudentPassword?: (studentId: string) => Promise<unknown>;
  onResetStudentAttempts?: (params: ResetAttemptsParams) => Promise<string | null>;
}

const CORE_BABS = ['Bab 1', 'Bab 2', 'Bab 3', 'Bab 4', 'Bab 5', 'Bab 6'];

export const StudentRosterView: React.FC<StudentRosterViewProps> = ({
  students,
  attempts,
  setoranMap,
  onToggleSetoranBab,
  onAddStudent,
  onUpdateStudentGroup,
  studentPasswords = {},
  onResetStudentPassword,
  onResetStudentAttempts,
}) => {
  const [selectedClass, setSelectedClass] = useState<StudentClass>('Reguler 1');
  const [genderFilter, setGenderFilter] = useState<'Split' | StudentGender>('Split');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New student form state
  const [newName, setNewName] = useState('');
  const [newKelas, setNewKelas] = useState<StudentClass>('Reguler 1');
  const [newGender, setNewGender] = useState<StudentGender>('Ikhwan');
  const [newKota, setNewKota] = useState('');

  // Reset confirmation popup state
  const [pendingResetStudent, setPendingResetStudent] = useState<{
    student: Student;
    attemptCount: number;
  } | null>(null);
  const [modalBabFilter, setModalBabFilter] = useState<'all' | string>('all');
  const [modalQuestionType, setModalQuestionType] = useState<QuestionTypeFilter>('all');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccessText, setResetSuccessText] = useState<string | null>(null);

  const pendingStudentAttempts = useMemo(() => {
    if (!pendingResetStudent) return [];
    return attempts.filter((a) => a.studentId === pendingResetStudent.student.id);
  }, [attempts, pendingResetStudent]);

  const modalBabOptions = useMemo(() => {
    const counts = new Map<string, { kode: string; count: number }>();
    pendingStudentAttempts.forEach((a) => {
      const meta = ALL_SHOROF_BABS.find((b) => b.id === a.babId);
      const prev = counts.get(a.babId);
      counts.set(a.babId, {
        kode: meta?.kode || a.babId,
        count: (prev?.count || 0) + 1,
      });
    });
    return Array.from(counts.entries()).map(([babId, info]) => ({
      babId,
      kode: info.kode,
      count: info.count,
    }));
  }, [pendingStudentAttempts]);

  const modalBabScopedAttempts = useMemo(() => {
    if (modalBabFilter === 'all') return pendingStudentAttempts;
    return pendingStudentAttempts.filter((a) => a.babId === modalBabFilter);
  }, [pendingStudentAttempts, modalBabFilter]);

  const modalQuestionTypeOptions = useMemo(
    () => buildQuestionTypeOptions(modalBabScopedAttempts),
    [modalBabScopedAttempts]
  );

  const activeModalResetParams = useMemo<ResetAttemptsParams | null>(() => {
    if (!pendingResetStudent) return null;
    return {
      studentId: pendingResetStudent.student.id,
      ...(modalBabFilter !== 'all' ? { babId: modalBabFilter } : {}),
      ...questionTypeToParams(modalQuestionType),
    };
  }, [pendingResetStudent, modalBabFilter, modalQuestionType]);

  const modalMatchingCount = useMemo(() => {
    if (!activeModalResetParams) return 0;
    return pendingStudentAttempts.filter((a) =>
      matchesResetParams(a, activeModalResetParams)
    ).length;
  }, [pendingStudentAttempts, activeModalResetParams]);

  const handleConfirmResetStudent = async () => {
    if (!onResetStudentAttempts || !pendingResetStudent || !activeModalResetParams) return;
    setResetLoading(true);
    setResetError(null);
    setResetSuccessText(null);
    const err = await onResetStudentAttempts(activeModalResetParams);
    setResetLoading(false);
    if (err) {
      setResetError(err);
      return;
    }
    const babLabel =
      modalBabFilter === 'all'
        ? 'Semua Bab'
        : modalBabOptions.find((b) => b.babId === modalBabFilter)?.kode || modalBabFilter;
    const typeLabel =
      modalQuestionTypeOptions.find((o) => o.value === modalQuestionType)?.shortLabel ||
      'Semua Jenis Soal';
    setResetSuccessText(
      `Pengerjaan soal (${babLabel} · ${typeLabel}, ${modalMatchingCount} sesi) milik ${pendingResetStudent.student.name} berhasil direset.`
    );
    setPendingResetStudent(null);
  };

  const classStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = s.kelas === selectedClass;
      const matchSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.kota.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [students, selectedClass, searchQuery]);

  const ikhwanStudents = useMemo(
    () => classStudents.filter((s) => s.gender === 'Ikhwan'),
    [classStudents]
  );

  const akhwatStudents = useMemo(
    () => classStudents.filter((s) => s.gender === 'Akhwat'),
    [classStudents]
  );

  const getStudentStats = (studentId: string) => {
    const stAttempts = attempts.filter((a) => a.studentId === studentId);
    const avgScore =
      stAttempts.length > 0
        ? Math.round(
            stAttempts.reduce((sum, a) => sum + a.score, 0) / stAttempts.length
          )
        : null;
    const completedBabs = setoranMap[studentId]?.completedBabs || [];
    return {
      attemptCount: stAttempts.length,
      avgScore,
      completedBabs,
    };
  };

  const handleExportCSV = () => {
    const headers = [
      'Nama Siswa',
      'Kelas',
      'Kelompok (Ikhwan/Akhwat)',
      'Kota',
      'Jumlah Latihan',
      'Rata-rata Skor',
      'Setoran Bab Lulus',
    ];
    const rows = students.map((s) => {
      const stats = getStudentStats(s.id);
      return [
        `"${s.name}"`,
        `"${s.kelas}"`,
        `"${s.gender}"`,
        `"${s.kota}"`,
        stats.attemptCount,
        stats.avgScore !== null ? `${stats.avgScore}` : '-',
        `"${stats.completedBabs.join(', ')}"`,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_Shorof_${selectedClass.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddStudent({
      name: newName.trim(),
      kelas: newKelas,
      gender: newGender,
      kota: newKota.trim() || 'Indonesia',
    });
    setNewName('');
    setNewKota('');
    setShowAddForm(false);
  };

  const renderGroupCard = (title: string, groupGender: StudentGender, list: Student[]) => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-[#F8FAFC]">
        <div>
          <div className="text-xs text-slate-500">
            {selectedClass} · Kelompok {groupGender}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">{title}</h3>
        </div>
        <div className="text-xs font-semibold text-slate-700 tabular-nums">
          Total: {list.length} Siswa
        </div>
      </div>

      {list.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          Tidak ada data siswa {groupGender} yang sesuai pencarian.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 px-4 w-10 tabular-nums">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Setoran Hafalan (Bab 1–6)</th>
                <th className="py-3 px-4 text-right">Nilai Kuis</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {list.map((st, idx) => {
                const stats = getStudentStats(st.id);
                const hasPassword = Boolean(studentPasswords[st.id]);
                return (
                  <tr
                    key={st.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-400 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-slate-900 text-sm">
                          {st.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                            hasPassword
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {hasPassword ? 'Akun Aktif' : 'Belum Password'}
                        </span>
                      </div>
                      {(st.kota || st.catatan) && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          {st.kota && <span>{st.kota}</span>}
                          {st.kota && st.catatan && <span aria-hidden="true">·</span>}
                          {st.catatan && (
                            <span className="text-slate-600">{st.catatan}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1">
                        {CORE_BABS.map((babLabel, bIdx) => {
                          const isDone = stats.completedBabs.includes(babLabel);
                          return (
                            <button
                              key={babLabel}
                              type="button"
                              onClick={() => onToggleSetoranBab(st.id, babLabel)}
                              title={`Klik untuk menandai setoran ${babLabel} (${st.name})`}
                              className={`w-7 h-7 rounded-md text-[11px] font-semibold tabular-nums border flex items-center justify-center transition-colors ${
                                isDone
                                  ? 'bg-emerald-700 text-white border-emerald-700'
                                  : 'bg-[#F8FAFC] text-slate-600 border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              {isDone ? <Check className="w-3.5 h-3.5" /> : bIdx + 1}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {stats.avgScore !== null ? (
                        <div>
                          <span className="font-bold text-slate-900 text-sm">
                            {stats.avgScore}%
                          </span>
                          <div className="text-[11px] text-slate-500">
                            {stats.attemptCount} sesi
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Belum kuis</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {stats.attemptCount > 0 && onResetStudentAttempts && (
                          <button
                            type="button"
                            onClick={() => {
                              setResetError(null);
                              setModalBabFilter('all');
                              setModalQuestionType('all');
                              setPendingResetStudent({
                                student: st,
                                attemptCount: stats.attemptCount,
                              });
                            }}
                            title="Reset pengerjaan soal siswa"
                            className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {hasPassword && onResetStudentPassword && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Reset password untuk ${st.name}? Siswa perlu membuat password baru saat login berikutnya.`
                                )
                              ) {
                                void onResetStudentPassword(st.id);
                              }
                            }}
                            title="Reset password siswa"
                            className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateStudentGroup(
                              st.id,
                              st.kelas,
                              st.gender === 'Ikhwan' ? 'Akhwat' : 'Ikhwan'
                            )
                          }
                          title={`Pindahkan ke ${
                            st.gender === 'Ikhwan' ? 'Akhwat' : 'Ikhwan'
                          }`}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const reg1Count = students.filter((s) => s.kelas === 'Reguler 1').length;
  const reg2Count = students.filter((s) => s.kelas === 'Reguler 2').length;

  return (
    <div className="space-y-6">
      {/* Control Toolbar: Separation of Reguler 1 vs Reguler 2 and Ikhwan vs Akhwat */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Class Switcher & Gender Separation Mode */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Reguler 1 vs Reguler 2 Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedClass('Reguler 1')}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedClass === 'Reguler 1'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kelas Reguler 1 ({reg1Count} Siswa)
              </button>
              <button
                type="button"
                onClick={() => setSelectedClass('Reguler 2')}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedClass === 'Reguler 2'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kelas Reguler 2 ({reg2Count} Siswa)
              </button>
            </div>

            {/* Ikhwan vs Akhwat Separation Mode */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setGenderFilter('Split')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  genderFilter === 'Split'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pisah 2 Kolom (Ikhwan | Akhwat)
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('Ikhwan')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  genderFilter === 'Ikhwan'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Khusus Ikhwan ({ikhwanStudents.length})
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('Akhwat')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  genderFilter === 'Akhwat'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Khusus Akhwat ({akhwatStudents.length})
              </button>
            </div>
          </div>

          {/* Right: Search, Add Student, Export CSV */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau asal kota..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Tambah Siswa
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh CSV
            </button>
          </div>
        </div>

        {/* Collapsible Add Student Form */}
        {showAddForm && (
          <form
            onSubmit={handleCreateStudent}
            className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-3 items-end"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nama Lengkap Siswa
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Masukkan nama siswa..."
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Asal Kota
              </label>
              <input
                type="text"
                value={newKota}
                onChange={(e) => setNewKota(e.target.value)}
                placeholder="Contoh: Jakarta"
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Kelas
              </label>
              <select
                value={newKelas}
                onChange={(e) => setNewKelas(e.target.value as StudentClass)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg"
              >
                <option value="Reguler 1">Reguler 1</option>
                <option value="Reguler 2">Reguler 2</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Kelompok
              </label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value as StudentGender)}
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg"
              >
                <option value="Ikhwan">Ikhwan (Laki-laki)</option>
                <option value="Akhwat">Akhwat (Perempuan)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full py-2 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Simpan Siswa
              </button>
            </div>
          </form>
        )}
      </div>

      {resetSuccessText && (
        <div
          role="status"
          className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resetSuccessText}</span>
          </div>
          <button
            type="button"
            onClick={() => setResetSuccessText(null)}
            className="text-emerald-700 hover:text-emerald-900 font-semibold shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Separated Roster View: Split 2-Column (Ikhwan | Akhwat) or Focused Single Group */}
      {genderFilter === 'Split' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {renderGroupCard(
            `Daftar Ikhwan — ${selectedClass}`,
            'Ikhwan',
            ikhwanStudents
          )}
          {renderGroupCard(
            `Daftar Akhwat — ${selectedClass}`,
            'Akhwat',
            akhwatStudents
          )}
        </div>
      ) : genderFilter === 'Ikhwan' ? (
        renderGroupCard(
          `Daftar Ikhwan — ${selectedClass}`,
          'Ikhwan',
          ikhwanStudents
        )
      ) : (
        renderGroupCard(
          `Daftar Akhwat — ${selectedClass}`,
          'Akhwat',
          akhwatStudents
        )
      )}

      <ResetConfirmModal
        isOpen={Boolean(pendingResetStudent)}
        title="Reset Pengerjaan Soal?"
        subtitle="Pilih cakupan bab/jenis soal lalu konfirmasi sebelum menghapus riwayat siswa"
        targetLabel={pendingResetStudent?.student.name || ''}
        detailText={
          pendingResetStudent
            ? `${pendingResetStudent.student.kelas} · ${pendingResetStudent.student.gender} · ${modalMatchingCount} sesi akan direset`
            : ''
        }
        warningText={
          modalBabFilter === 'all' && modalQuestionType === 'all'
            ? 'Apakah Anda yakin ingin mereset seluruh pengerjaan soal milik siswa ini? Data nilai ujian sebelumnya akan dihapus dan siswa dapat mengerjakan ulang soal.'
            : 'Apakah Anda yakin ingin mereset pengerjaan soal sesuai jenis soal yang dipilih? Data nilai sebelumnya pada cakupan tersebut akan dihapus agar siswa dapat mengerjakan ulang.'
        }
        confirmLabel="Ya, Reset Soal"
        confirmDisabled={modalMatchingCount === 0}
        loading={resetLoading}
        error={resetError}
        onCancel={() => {
          if (!resetLoading) setPendingResetStudent(null);
        }}
        onConfirm={() => void handleConfirmResetStudent()}
      >
        {pendingResetStudent && (
          <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label
                htmlFor="roster-reset-bab-select"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                Pilih Bab
              </label>
              <select
                id="roster-reset-bab-select"
                value={modalBabFilter}
                onChange={(e) => {
                  setModalBabFilter(e.target.value);
                  setModalQuestionType('all');
                }}
                disabled={resetLoading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              >
                <option value="all">
                  Semua Bab ({pendingStudentAttempts.length} sesi)
                </option>
                {modalBabOptions.map((opt) => (
                  <option key={opt.babId} value={opt.babId}>
                    {opt.kode} ({opt.count} sesi)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="roster-reset-type-select"
                className="block text-[11px] font-semibold text-slate-600 mb-1"
              >
                Pilih Jenis Soal
              </label>
              <select
                id="roster-reset-type-select"
                value={modalQuestionType}
                onChange={(e) =>
                  setModalQuestionType(e.target.value as QuestionTypeFilter)
                }
                disabled={resetLoading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              >
                {modalQuestionTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </ResetConfirmModal>

      <SuccessToast
        title="Reset Soal Berhasil"
        message={resetSuccessText}
        onClose={() => setResetSuccessText(null)}
      />
    </div>
  );
};
