import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldCheck,
  GraduationCap,
  Search,
  Eye,
  EyeOff,
  Lock,
  UserCheck,
  KeyRound,
  AlertCircle,
  BookOpen,
  ChevronRight,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import { Student, StudentClass, StudentGender } from '../data/students';
import { StudentPasswordMap } from '../utils/auth';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface StudentPickerListProps {
  title: string;
  students: Student[];
  studentPasswords: StudentPasswordMap;
  filterClass: 'Semua' | StudentClass;
  onChangeClass: (val: 'Semua' | StudentClass) => void;
  filterGender: 'Semua' | StudentGender;
  onChangeGender: (val: 'Semua' | StudentGender) => void;
  searchQuery: string;
  onChangeSearch: (val: string) => void;
  onSelectStudent: (studentId: string) => void;
  emptyTitle?: string;
  emptySubtitle: string;
  maxHeightClass?: string;
}

const StudentPickerList: React.FC<StudentPickerListProps> = ({
  title,
  students,
  studentPasswords,
  filterClass,
  onChangeClass,
  filterGender,
  onChangeGender,
  searchQuery,
  onChangeSearch,
  onSelectStudent,
  emptyTitle = 'Nama siswa tidak ditemukan',
  emptySubtitle,
  maxHeightClass = 'max-h-72',
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-emerald-700" />
        {title}
      </label>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 tabular-nums">
        {students.length} siswa
      </span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div
        role="group"
        aria-label="Filter Kelas"
        className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80"
      >
        {(
          [
            { value: 'Semua', label: 'Semua' },
            { value: 'Reguler 1', label: 'Reguler 1' },
            { value: 'Reguler 2', label: 'Reguler 2' },
          ] as const
        ).map((opt) => {
          const active = filterClass === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChangeClass(opt.value)}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                active
                  ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div
        role="group"
        aria-label="Filter Kelompok"
        className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80"
      >
        {(
          [
            { value: 'Semua', label: 'Semua' },
            { value: 'Ikhwan', label: 'Ikhwan' },
            { value: 'Akhwat', label: 'Akhwat' },
          ] as const
        ).map((opt) => {
          const active = filterGender === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChangeGender(opt.value)}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                active
                  ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>

    <div className="relative">
      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onChangeSearch(e.target.value)}
        placeholder="Ketik nama lengkap atau asal kota Anda..."
        className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-shadow"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onChangeSearch('')}
          aria-label="Hapus pencarian"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>

    <div
      className={`${maxHeightClass} overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/60 p-1.5 space-y-1`}
    >
      {students.length === 0 ? (
        <div className="py-8 px-4 text-center space-y-2">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium text-slate-600">
            {emptyTitle}
          </div>
          <div className="text-[11px] text-slate-400">{emptySubtitle}</div>
        </div>
      ) : (
        students.map((st) => {
          const hasPw = Boolean(studentPasswords[st.id]);
          const isDemo = st.id.startsWith('demo-');
          const isReg1 = st.kelas === 'Reguler 1';
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectStudent(st.id)}
              className="group w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-white border border-transparent hover:border-emerald-200 hover:bg-emerald-50/50 text-left transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                    isDemo
                      ? 'bg-slate-900 text-white border-slate-900'
                      : st.gender === 'Ikhwan'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}
                >
                  {getInitials(st.name)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-950 truncate">
                      {st.name}
                    </span>
                    {isDemo && (
                      <span className="text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded bg-slate-900 text-white shrink-0">
                        DEMO
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                        isReg1
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-sky-50 text-sky-800'
                      }`}
                    >
                      {st.kelas}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {st.gender}
                    </span>
                    {st.kota && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400">
                        <MapPin className="w-2.5 h-2.5" />
                        {st.kota}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    hasPw
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {hasPw ? 'Login' : 'Buat Password'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })
      )}
    </div>
  </div>
);

interface LoginViewProps {
  students: Student[];
  studentPasswords: StudentPasswordMap;
  onLoginSuperadmin: (username: string, password: string) => string | null;
  onLoginStudent: (studentId: string, password: string) => string | null;
  onRegisterStudentPassword: (studentId: string, newPassword: string) => string | null;
}

type LoginTab = 'student' | 'superadmin';

export const LoginView: React.FC<LoginViewProps> = ({
  students,
  studentPasswords,
  onLoginSuperadmin,
  onLoginStudent,
  onRegisterStudentPassword,
}) => {
  const [activeTab, setActiveTab] = useState<LoginTab>('student');

  // Student login state (Login saja)
  const [filterClass, setFilterClass] = useState<'Semua' | StudentClass>('Semua');
  const [filterGender, setFilterGender] = useState<'Semua' | StudentGender>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPass, setShowStudentPass] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Create-password popup modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStudentId, setCreateStudentId] = useState('');
  const [createClass, setCreateClass] = useState<'Semua' | StudentClass>('Semua');
  const [createGender, setCreateGender] = useState<'Semua' | StudentGender>('Semua');
  const [createSearch, setCreateSearch] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState('');
  const [showCreatePass, setShowCreatePass] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Superadmin login state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((s) => {
      if (!studentPasswords[s.id]) return false;
      if (filterClass !== 'Semua' && s.kelas !== filterClass) return false;
      if (filterGender !== 'Semua' && s.gender !== filterGender) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.kota.toLowerCase().includes(q)
      );
    });
  }, [students, studentPasswords, filterClass, filterGender, searchQuery]);

  const activatedTotalCount = useMemo(
    () => students.filter((s) => Boolean(studentPasswords[s.id])).length,
    [students, studentPasswords]
  );

  const unactivatedStudents = useMemo(() => {
    const q = createSearch.trim().toLowerCase();
    return students.filter((s) => {
      if (studentPasswords[s.id]) return false;
      if (createClass !== 'Semua' && s.kelas !== createClass) return false;
      if (createGender !== 'Semua' && s.gender !== createGender) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.kota.toLowerCase().includes(q)
      );
    });
  }, [students, studentPasswords, createClass, createGender, createSearch]);

  const unactivatedTotalCount = useMemo(
    () => students.filter((s) => !studentPasswords[s.id]).length,
    [students, studentPasswords]
  );

  const demoStudents = useMemo(
    () => students.filter((s) => s.id.startsWith('demo-')),
    [students]
  );

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const createModalStudent = useMemo(
    () => students.find((s) => s.id === createStudentId) || null,
    [students, createStudentId]
  );

  const openCreatePasswordModal = (preselectedId = '') => {
    setCreateStudentId(preselectedId);
    setCreatePassword('');
    setCreateConfirmPassword('');
    setShowCreatePass(false);
    setCreateError(null);
    setShowCreateModal(true);
  };

  const closeCreatePasswordModal = () => {
    setShowCreateModal(false);
    setCreateError(null);
    setCreatePassword('');
    setCreateConfirmPassword('');
  };

  useEffect(() => {
    if (!showCreateModal) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCreatePasswordModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showCreateModal]);

  const handleSelectStudent = (studentId: string) => {
    if (!studentPasswords[studentId]) {
      openCreatePasswordModal(studentId);
      return;
    }
    setSelectedStudentId(studentId);
    setStudentPassword('');
    setStudentError(null);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);

    if (!selectedStudent) {
      setStudentError('Silakan pilih nama Anda terlebih dahulu dari daftar siswa.');
      return;
    }

    if (!studentPasswords[selectedStudent.id]) {
      openCreatePasswordModal(selectedStudent.id);
      return;
    }

    if (!studentPassword) {
      setStudentError('Masukkan password Anda.');
      return;
    }
    const err = onLoginStudent(selectedStudent.id, studentPassword);
    if (err) setStudentError(err);
  };

  const handleCreatePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!createModalStudent) {
      setCreateError('Silakan pilih nama siswa terlebih dahulu.');
      return;
    }
    if (createPassword.length < 4) {
      setCreateError('Password minimal terdiri dari 4 karakter.');
      return;
    }
    if (createPassword !== createConfirmPassword) {
      setCreateError('Konfirmasi password tidak cocok.');
      return;
    }
    const err = onRegisterStudentPassword(createModalStudent.id, createPassword);
    if (err) {
      setCreateError(err);
    } else {
      closeCreatePasswordModal();
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (!adminUsername.trim() || !adminPassword) {
      setAdminError('Username dan password wajib diisi.');
      return;
    }
    const err = onLoginSuperadmin(adminUsername.trim(), adminPassword);
    if (err) setAdminError(err);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      {/* Top Minimal Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-[1120px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900">
                Madrasah Shorof Al-Barkah
              </div>
              <div className="text-[11px] text-slate-500">
                Platform Latihan Tashrif &amp; Evaluasi Siswa
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block tabular-nums">
            {students.length} Siswa Terdaftar · Reguler 1 &amp; 2
          </div>
        </div>
      </header>

      {/* Main Centered Login Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[540px]">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-3">
              <Lock className="w-3.5 h-3.5" />
              Portal Masuk Terpadu
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Masuk ke Kelas Shorof
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              Pilih peran Anda untuk melanjutkan ke latihan tashrif atau pengelolaan kelas.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            {/* Role Tabs */}
            <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('student');
                  setAdminError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'student'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Login Siswa
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('superadmin');
                  setStudentError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                  activeTab === 'superadmin'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Superadmin
              </button>
            </div>

            {/* STUDENT LOGIN TAB */}
            {activeTab === 'student' && (
              <form onSubmit={handleStudentSubmit} className="p-6 sm:p-7 space-y-5">
                {!selectedStudent ? (
                  <>
                    {demoStudents.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                        <div className="text-xs font-bold text-emerald-900">
                          Coba Akun Demo Siswa
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {demoStudents.map((demo) => (
                            <button
                              key={demo.id}
                              type="button"
                              onClick={() => handleSelectStudent(demo.id)}
                              className="flex items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                            >
                              <span className="truncate">{demo.kelas}</span>
                              <span className="text-[10px] font-medium text-emerald-100 shrink-0">
                                Pilih →
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <StudentPickerList
                      title="1. Pilih Akun untuk Login"
                      students={filteredStudents}
                      studentPasswords={studentPasswords}
                      filterClass={filterClass}
                      onChangeClass={setFilterClass}
                      filterGender={filterGender}
                      onChangeGender={setFilterGender}
                      searchQuery={searchQuery}
                      onChangeSearch={setSearchQuery}
                      onSelectStudent={handleSelectStudent}
                      emptyTitle={
                        activatedTotalCount === 0
                          ? 'Belum ada akun siswa yang aktif untuk login'
                          : 'Nama siswa tidak ditemukan'
                      }
                      emptySubtitle={
                        activatedTotalCount === 0
                          ? 'Klik tombol "Buat Password" di bawah untuk membuat password terlebih dahulu.'
                          : 'Coba ubah filter kelas, kelompok, atau kata kunci pencarian.'
                      }
                    />

                    {unactivatedTotalCount > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => openCreatePasswordModal()}
                          className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-left transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <KeyRound className="w-4 h-4 text-amber-700 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-amber-950 truncate">
                                Belum punya password? Buat Password di sini
                              </div>
                              <div className="text-[11px] text-amber-800">
                                {unactivatedTotalCount} siswa belum aktivasi password
                              </div>
                            </div>
                          </div>
                          <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-700 text-white">
                            Buat Password
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Selected Student Card (Login saja) */}
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 mb-0.5">
                          <UserCheck className="w-3.5 h-3.5" />
                          Siswa Terpilih
                        </div>
                        <div className="text-sm sm:text-base font-bold text-slate-900 truncate">
                          {selectedStudent.name}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          {selectedStudent.kelas} · Kelompok {selectedStudent.gender}
                          {selectedStudent.kota ? ` · ${selectedStudent.kota}` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentId('');
                          setStudentPassword('');
                          setStudentError(null);
                        }}
                        className="shrink-0 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        Ganti Nama
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Masukkan Password Anda
                        </label>
                        <div className="relative">
                          <input
                            type={showStudentPass ? 'text' : 'password'}
                            value={studentPassword}
                            onChange={(e) => setStudentPassword(e.target.value)}
                            placeholder="Password akun Anda..."
                            autoFocus
                            className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => setShowStudentPass((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            aria-label="Tampilkan atau sembunyikan password"
                          >
                            {showStudentPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5">
                          Lupa password? Hubungi Superadmin untuk mereset password Anda.
                        </p>
                      </div>
                    </div>

                    {studentError && (
                      <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{studentError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
                    >
                      Masuk sebagai Siswa
                    </button>
                  </>
                )}
              </form>
            )}

            {/* SUPERADMIN LOGIN TAB */}
            {activeTab === 'superadmin' && (
              <form onSubmit={handleAdminSubmit} className="p-6 sm:p-7 space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Masuk sebagai <strong className="text-slate-900">Superadmin</strong> untuk mengelola data 88 siswa, menyetujui setoran bab, melihat rekap nilai kelas, dan mereset password siswa.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Username Superadmin
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Masukkan username..."
                    autoComplete="username"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Masukkan password superadmin..."
                      autoComplete="current-password"
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label="Tampilkan atau sembunyikan password"
                    >
                      {showAdminPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {adminError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Masuk sebagai Superadmin
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        Madrasah Shorof Al-Barkah · Sistem Latihan Tashrif Kelas Reguler 1 &amp; Reguler 2
      </footer>

      {/* POPUP MODAL: BUAT PASSWORD SISWA */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={closeCreatePasswordModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-password-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/70">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2
                    id="create-password-modal-title"
                    className="text-sm font-bold text-slate-900 truncate"
                  >
                    Buat Password Akun Siswa
                  </h2>
                  <p className="text-[11px] text-slate-500 truncate">
                    Aktivasi akun pertama kali untuk login ke kelas shorof
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCreatePasswordModal}
                aria-label="Tutup popup"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto">
              {!createModalStudent ? (
                <StudentPickerList
                  title="Pilih Nama Siswa yang Belum Punya Password"
                  students={unactivatedStudents}
                  studentPasswords={studentPasswords}
                  filterClass={createClass}
                  onChangeClass={setCreateClass}
                  filterGender={createGender}
                  onChangeGender={setCreateGender}
                  searchQuery={createSearch}
                  onChangeSearch={setCreateSearch}
                  onSelectStudent={(id) => {
                    setCreateStudentId(id);
                    setCreateError(null);
                  }}
                  emptySubtitle="Semua siswa pada filter ini sudah memiliki password, atau ubah kata kunci pencarian."
                  maxHeightClass="max-h-64"
                />
              ) : (
                <form onSubmit={handleCreatePasswordSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(createModalStudent.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {createModalStudent.name}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {createModalStudent.kelas} · Kelompok {createModalStudent.gender}
                          {createModalStudent.kota ? ` · ${createModalStudent.kota}` : ''}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateStudentId('');
                        setCreatePassword('');
                        setCreateConfirmPassword('');
                        setCreateError(null);
                      }}
                      className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Ganti Nama
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Buat Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showCreatePass ? 'text' : 'password'}
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        placeholder="Minimal 4 karakter..."
                        autoFocus
                        className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                        aria-label="Tampilkan atau sembunyikan password"
                      >
                        {showCreatePass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Ulangi Password Baru
                    </label>
                    <input
                      type={showCreatePass ? 'text' : 'password'}
                      value={createConfirmPassword}
                      onChange={(e) => setCreateConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password yang sama..."
                      className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                    />
                  </div>

                  {createError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={closeCreatePasswordModal}
                      className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
                    >
                      Simpan Password &amp; Masuk
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
