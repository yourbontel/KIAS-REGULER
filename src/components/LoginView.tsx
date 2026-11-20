import React, { useMemo, useState } from 'react';
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
  ChevronDown,
  MapPin,
  Users,
  X,
  UserPlus,
} from 'lucide-react';
import { Student, StudentClass, StudentGender } from '../data/students';
import { StudentPasswordMap } from '../utils/auth';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface LoginViewProps {
  students: Student[];
  studentPasswords: StudentPasswordMap;
  onLoginSuperadmin: (username: string, password: string) => Promise<string | null>;
  onLoginStudent: (studentId: string, password: string) => Promise<string | null>;
  onRegisterStudentPassword: (studentId: string, newPassword: string) => Promise<string | null>;
  onRegisterUnlistedStudent: (student: Omit<Student, 'id'>) => Promise<{ student: Student | null; error: string | null }>;
}

type LoginTab = 'student' | 'superadmin';

export const LoginView: React.FC<LoginViewProps> = ({
  students,
  studentPasswords,
  onLoginSuperadmin,
  onLoginStudent,
  onRegisterStudentPassword,
  onRegisterUnlistedStudent,
}) => {
  const [activeTab, setActiveTab] = useState<LoginTab>('student');

  // Student login state
  const [filterClass, setFilterClass] = useState<'Semua' | StudentClass>('Semua');
  const [filterGender, setFilterGender] = useState<'Semua' | StudentGender>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirmPassword, setStudentConfirmPassword] = useState('');
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [showIdentityConfirmPopup, setShowIdentityConfirmPopup] = useState(false);
  const [showStudentPass, setShowStudentPass] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentBusy, setStudentBusy] = useState(false);
  const [showUnlistedForm, setShowUnlistedForm] = useState(false);
  const [unlistedName, setUnlistedName] = useState('');
  const [unlistedClass, setUnlistedClass] = useState<StudentClass>('Reguler 1');
  const [unlistedGender, setUnlistedGender] = useState<StudentGender>('Ikhwan');
  const [unlistedCity, setUnlistedCity] = useState('');
  const [unlistedError, setUnlistedError] = useState<string | null>(null);

  // Superadmin login state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminBusy, setAdminBusy] = useState(false);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((s) => {
      if (filterClass !== 'Semua' && s.kelas !== filterClass) return false;
      if (filterGender !== 'Semua' && s.gender !== filterGender) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.kota.toLowerCase().includes(q)
      );
    });
  }, [students, filterClass, filterGender, searchQuery]);

  const demoStudents = useMemo(
    () => students.filter((s) => s.id.startsWith('demo-')),
    [students]
  );

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const hasExistingPassword = selectedStudent
    ? Boolean(studentPasswords[selectedStudent.id])
    : false;

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setStudentPassword('');
    setStudentConfirmPassword('');
    setIdentityConfirmed(false);
    setShowIdentityConfirmPopup(false);
    setStudentError(null);
  };

  const handleConfirmIdentityAndRegister = async () => {
    if (!selectedStudent) return;
    setShowIdentityConfirmPopup(false);
    setStudentBusy(true);
    const err = await onRegisterStudentPassword(selectedStudent.id, studentPassword);
    if (err) setStudentError(err);
    setStudentBusy(false);
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);

    if (!selectedStudent) {
      setStudentError('Silakan pilih nama Anda terlebih dahulu dari daftar siswa.');
      return;
    }

    if (!hasExistingPassword) {
      if (studentPassword.length < 4) {
        setStudentError('Password minimal terdiri dari 4 karakter.');
        return;
      }
      if (studentPassword !== studentConfirmPassword) {
        setStudentError('Konfirmasi password tidak cocok.');
        return;
      }
      if (!identityConfirmed) {
        setStudentError(
          `Centang kotak verifikasi identitas untuk memastikan bahwa "${selectedStudent.name}" benar-benar nama Anda.`
        );
        return;
      }
      setShowIdentityConfirmPopup(true);
    } else {
      if (!studentPassword) {
        setStudentError('Masukkan password Anda.');
        return;
      }
      setStudentBusy(true);
      const err = await onLoginStudent(selectedStudent.id, studentPassword);
      if (err) setStudentError(err);
      setStudentBusy(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    if (!adminUsername.trim() || !adminPassword) {
      setAdminError('Username dan password wajib diisi.');
      return;
    }
    setAdminBusy(true);
    const err = await onLoginSuperadmin(adminUsername.trim(), adminPassword);
    if (err) setAdminError(err);
    setAdminBusy(false);
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

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-700" />
                          1. Cari &amp; Pilih Nama Anda
                        </label>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 tabular-nums">
                          {filteredStudents.length} siswa
                        </span>
                      </div>

                      {/* Segmented Pill Filters */}
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
                                onClick={() => setFilterClass(opt.value)}
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
                                onClick={() => setFilterGender(opt.value)}
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

                      {/* Search Box */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Ketik nama lengkap atau asal kota Anda..."
                          className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition-shadow"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label="Hapus pencarian"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Student List */}
                      <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/60 p-1.5 space-y-1">
                        {filteredStudents.length === 0 ? (
                          <div className="py-8 px-4 text-center space-y-2">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                              <Search className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-medium text-slate-600">
                              Nama siswa tidak ditemukan
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Coba ubah filter kelas, kelompok, atau kata kunci pencarian.
                            </div>
                          </div>
                        ) : (
                          filteredStudents.map((st) => {
                            const hasPw = Boolean(studentPasswords[st.id]);
                            const isDemo = st.id.startsWith('demo-');
                            const isReg1 = st.kelas === 'Reguler 1';
                            return (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => handleSelectStudent(st.id)}
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
                                    {hasPw ? 'Aktif' : 'Buat Password'}
                                  </span>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowUnlistedForm((shown) => !shown);
                          setUnlistedError(null);
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 px-4 py-2.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
                      >
                        <UserPlus className="h-4 w-4" />
                        Nama saya belum terdaftar
                      </button>
                      {showUnlistedForm && (
                        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
                          <div className="flex items-start gap-3 border-b border-emerald-100 bg-emerald-50/70 px-4 py-3.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                              <UserPlus className="h-4 w-4" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">Daftar sebagai siswa baru</h3>
                              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">Isi data sesuai identitas Anda. Pastikan nama belum tersedia di daftar siswa.</p>
                            </div>
                          </div>

                          <div className="space-y-3.5 p-4">
                            <div>
                              <label htmlFor="unlisted-student-name" className="mb-1.5 block text-xs font-semibold text-slate-700">Nama lengkap</label>
                              <input id="unlisted-student-name" value={unlistedName} onChange={(event) => setUnlistedName(event.target.value)} maxLength={200} placeholder="Contoh: Ahmad Fauzan" autoComplete="name" className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <label htmlFor="unlisted-student-class" className="mb-1.5 block text-xs font-semibold text-slate-700">Kelas</label>
                                <div className="relative">
                                  <select id="unlisted-student-class" value={unlistedClass} onChange={(event) => setUnlistedClass(event.target.value as StudentClass)} className="w-full appearance-none rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 py-2.5 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100">
                                    <option value="Reguler 1">Reguler 1</option>
                                    <option value="Reguler 2">Reguler 2</option>
                                  </select>
                                  <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" />
                                </div>
                              </div>
                              <div>
                                <label htmlFor="unlisted-student-gender" className="mb-1.5 block text-xs font-semibold text-slate-700">Kelompok</label>
                                <div className="relative">
                                  <select id="unlisted-student-gender" value={unlistedGender} onChange={(event) => setUnlistedGender(event.target.value as StudentGender)} className="w-full appearance-none rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 py-2.5 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100">
                                    <option value="Ikhwan">Ikhwan (Putra)</option>
                                    <option value="Akhwat">Akhwat (Putri)</option>
                                  </select>
                                  <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" />
                                </div>
                              </div>
                            </div>

                            <div>
                              <label htmlFor="unlisted-student-city" className="mb-1.5 block text-xs font-semibold text-slate-700">Kota asal <span className="font-normal text-slate-400">(opsional)</span></label>
                              <input id="unlisted-student-city" value={unlistedCity} onChange={(event) => setUnlistedCity(event.target.value)} maxLength={120} placeholder="Contoh: Bekasi" autoComplete="address-level2" className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" />
                            </div>

                            {unlistedError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{unlistedError}</span></div>}
                          </div>

                          <button
                            type="button"
                            disabled={studentBusy || !unlistedName.trim()}
                            onClick={async () => {
                              setStudentBusy(true);
                              setUnlistedError(null);
                              const result = await onRegisterUnlistedStudent({
                                name: unlistedName.trim(),
                                kelas: unlistedClass,
                                gender: unlistedGender,
                                kota: unlistedCity.trim() || '-',
                              });
                              if (result.error || !result.student) {
                                setUnlistedError(result.error || 'Pendaftaran belum berhasil.');
                              } else {
                                setShowUnlistedForm(false);
                                setUnlistedName('');
                                setSearchQuery('');
                                handleSelectStudent(result.student.id);
                              }
                              setStudentBusy(false);
                            }}
                            className="mx-4 mb-4 flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {studentBusy ? 'Mendaftarkan...' : <><UserPlus className="h-4 w-4" /> Daftarkan & Lanjutkan</>}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Selected Student Card */}
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
                          setStudentConfirmPassword('');
                          setIdentityConfirmed(false);
                          setShowIdentityConfirmPopup(false);
                          setStudentError(null);
                        }}
                        className="shrink-0 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        Ganti Nama
                      </button>
                    </div>

                    {/* First-time Password Creation vs Existing Password Login */}
                    {!hasExistingPassword ? (
                      <div className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                          <KeyRound className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                          <div>
                            <div className="font-semibold">Aktivasi Akun Pertama Kali</div>
                            <p className="mt-0.5 text-amber-800">
                              Anda belum memiliki password. Silakan buat password Anda sendiri (minimal 4 karakter) untuk login sekarang dan seterusnya.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Buat Password Baru
                          </label>
                          <div className="relative">
                            <input
                              type={showStudentPass ? 'text' : 'password'}
                              value={studentPassword}
                              onChange={(e) => setStudentPassword(e.target.value)}
                              placeholder="Minimal 4 karakter..."
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
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Ulangi Password Baru
                          </label>
                          <input
                            type={showStudentPass ? 'text' : 'password'}
                            value={studentConfirmPassword}
                            onChange={(e) => setStudentConfirmPassword(e.target.value)}
                            placeholder="Ketik ulang password yang sama..."
                            className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                          />
                        </div>

                        {/* Verifikasi Kepemilikan Nama */}
                        <label
                          htmlFor="verify-student-identity"
                          className={`flex items-start gap-2.5 p-3.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            identityConfirmed
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <input
                            id="verify-student-identity"
                            type="checkbox"
                            checked={identityConfirmed}
                            onChange={(e) => {
                              setIdentityConfirmed(e.target.checked);
                              setStudentError(null);
                            }}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 shrink-0"
                          />
                          <span>
                            Saya memastikan bahwa nama <strong className="text-slate-900">{selectedStudent.name}</strong> ({selectedStudent.kelas} · Kelompok {selectedStudent.gender}{selectedStudent.kota ? ` · ${selectedStudent.kota}` : ''}) adalah benar-benar nama saya sendiri, bukan milik siswa lain.
                          </span>
                        </label>
                      </div>
                    ) : (
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
                    )}

                    {studentError && (
                      <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{studentError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={studentBusy}
                      className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
                    >
                      {studentBusy ? 'Memproses...' : hasExistingPassword
                        ? 'Masuk sebagai Siswa'
                        : 'Simpan Password & Masuk'}
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
                  disabled={adminBusy}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {adminBusy ? 'Memproses...' : 'Masuk sebagai Superadmin'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        Madrasah Shorof Al-Barkah · Sistem Latihan Tashrif Kelas Reguler 1 &amp; Reguler 2
      </footer>

      {/* Popup Konfirmasi Akhir Verifikasi Nama */}
      {showIdentityConfirmPopup && selectedStudent && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={() => setShowIdentityConfirmPopup(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-identity-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-emerald-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    id="verify-identity-modal-title"
                    className="text-sm font-bold text-slate-900"
                  >
                    Verifikasi Nama Siswa
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Pastikan tidak salah memilih nama teman
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIdentityConfirmPopup(false)}
                aria-label="Tutup konfirmasi"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Apakah benar akun yang sedang Anda buatkan passwordnya ini adalah nama Anda sendiri?
              </p>

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1">
                <div className="text-sm sm:text-base font-bold text-slate-900">
                  {selectedStudent.name}
                </div>
                <div className="text-xs text-slate-600">
                  {selectedStudent.kelas} · Kelompok {selectedStudent.gender}
                  {selectedStudent.kota ? ` · Asal ${selectedStudent.kota}` : ''}
                </div>
              </div>

              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Setelah disimpan, akun atas nama tersebut hanya bisa dibuka menggunakan password yang baru Anda buat.
              </p>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowIdentityConfirmPopup(false);
                    setSelectedStudentId('');
                    setStudentPassword('');
                    setStudentConfirmPassword('');
                    setIdentityConfirmed(false);
                    setStudentError(null);
                  }}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Bukan, Ganti Nama
                </button>
                <button
                  type="button"
                  onClick={handleConfirmIdentityAndRegister}
                  disabled={studentBusy}
                  className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
                >
                  Ya, Benar Nama Saya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
