import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  UserPlus,
  Check,
  ArrowLeftRight,
  KeyRound,
} from 'lucide-react';
import {
  Student,
  StudentClass,
  StudentGender,
  QuizAttempt,
  SetoranRecord,
} from '../data/students';
import { StudentPasswordMap } from '../utils/auth';

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
    </div>
  );
};
