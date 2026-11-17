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
} from 'lucide-react';
import { Student, StudentClass, StudentGender } from '../data/students';
import { StudentPasswordMap } from '../utils/auth';

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

  // Student login state
  const [filterClass, setFilterClass] = useState<'Semua' | StudentClass>('Semua');
  const [filterGender, setFilterGender] = useState<'Semua' | StudentGender>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentConfirmPassword, setStudentConfirmPassword] = useState('');
  const [showStudentPass, setShowStudentPass] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Superadmin login state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

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
    setStudentError(null);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
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
      const err = onRegisterStudentPassword(selectedStudent.id, studentPassword);
      if (err) setStudentError(err);
    } else {
      if (!studentPassword) {
        setStudentError('Masukkan password Anda.');
        return;
      }
      const err = onLoginStudent(selectedStudent.id, studentPassword);
      if (err) setStudentError(err);
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

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-700">
                          1. Cari &amp; Pilih Nama Anda
                        </label>
                        <span className="text-[11px] text-slate-500 tabular-nums">
                          {filteredStudents.length} siswa ditampilkan
                        </span>
                      </div>

                      {/* Filters */}
                      <div className="grid grid-cols-2 gap-2 mb-2.5">
                        <select
                          aria-label="Filter Kelas"
                          value={filterClass}
                          onChange={(e) =>
                            setFilterClass(e.target.value as 'Semua' | StudentClass)
                          }
                          className="px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-600"
                        >
                          <option value="Semua">Semua Kelas</option>
                          <option value="Reguler 1">Reguler 1</option>
                          <option value="Reguler 2">Reguler 2</option>
                        </select>
                        <select
                          aria-label="Filter Kelompok"
                          value={filterGender}
                          onChange={(e) =>
                            setFilterGender(e.target.value as 'Semua' | StudentGender)
                          }
                          className="px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-emerald-600"
                        >
                          <option value="Semua">Ikhwan &amp; Akhwat</option>
                          <option value="Ikhwan">Ikhwan</option>
                          <option value="Akhwat">Akhwat</option>
                        </select>
                      </div>

                      {/* Search Box */}
                      <div className="relative mb-2.5">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Ketik nama lengkap atau asal kota Anda..."
                          className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      {/* Student List */}
                      <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-[#F8FAFC]">
                        {filteredStudents.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500">
                            Nama tidak ditemukan. Coba ubah filter atau kata kunci pencarian.
                          </div>
                        ) : (
                          filteredStudents.map((st) => {
                            const hasPw = Boolean(studentPasswords[st.id]);
                            const isDemo = st.id.startsWith('demo-');
                            return (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => handleSelectStudent(st.id)}
                                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-emerald-50/70 transition-colors"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                                      {st.name}
                                    </span>
                                    {isDemo && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white shrink-0">
                                        DEMO
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {st.kelas} · {st.gender}
                                    {st.kota ? ` · ${st.kota}` : ''}
                                  </div>
                                </div>
                                <span
                                  className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                    hasPw
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {hasPw ? 'Aktif' : 'Buat Password'}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
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
                      className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
                    >
                      {hasExistingPassword
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
    </div>
  );
};
