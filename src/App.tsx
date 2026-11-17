import { useState, useEffect } from 'react';
import { LogOut, KeyRound, ShieldCheck, GraduationCap } from 'lucide-react';
import {
  DEMO_STUDENTS,
  INITIAL_STUDENTS,
  Student,
  StudentClass,
  StudentGender,
  QuizAttempt,
  SetoranRecord,
} from './data/students';
import { BabExamView } from './components/BabExamView';
import { StudentRosterView } from './components/StudentRosterView';
import { ClassRecapView } from './components/ClassRecapView';
import { LoginView } from './components/LoginView';
import { StudentProgressView } from './components/StudentProgressView';
import { AccountModal } from './components/AccountModal';
import {
  AUTH_STORAGE_KEYS,
  AuthSession,
  StudentPasswordMap,
  SuperadminConfig,
  getInitialSession,
  getInitialStudentPasswords,
  getInitialSuperadminConfig,
  hashPassword,
} from './utils/auth';

type ActiveSection = 'practice' | 'roster' | 'recap' | 'my_progress';

const STORAGE_KEYS = {
  STUDENTS: 'albarkah_shorof_students_v1',
  ATTEMPTS: 'albarkah_shorof_attempts_v1',
  SETORAN: 'albarkah_shorof_setoran_v1',
};

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('practice');

  // Authentication & Credentials State
  const [superadminConfig, setSuperadminConfig] = useState<SuperadminConfig>(() =>
    getInitialSuperadminConfig()
  );
  const [studentPasswords, setStudentPasswords] = useState<StudentPasswordMap>(() =>
    getInitialStudentPasswords()
  );
  const [session, setSession] = useState<AuthSession | null>(() => getInitialSession());
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [requestedBabId, setRequestedBabId] = useState<string | null>(null);

  // Persistent Student Roster (88 initial students + Demo Siswa; NIS removed)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const needsDemoBothMigration = !localStorage.getItem(
            'albarkah_shorof_demo_both_v1'
          );
          const demoMap = new Map(DEMO_STUDENTS.map((d) => [d.id, d]));
          const sanitized: Student[] = parsed.map((item) => {
            const { nis: _removed, ...rest } = item as Student & { nis?: string };
            if (needsDemoBothMigration && demoMap.has(rest.id)) {
              return demoMap.get(rest.id)!;
            }
            return rest;
          });
          const existingIds = new Set(sanitized.map((s) => s.id));
          const missingDemos = DEMO_STUDENTS.filter((d) => !existingIds.has(d.id));
          if (needsDemoBothMigration) {
            localStorage.setItem('albarkah_shorof_demo_both_v1', 'true');
          }
          return [...missingDemos, ...sanitized];
        }
      }
    } catch {
      // Fallback to INITIAL_STUDENTS
    }
    return INITIAL_STUDENTS;
  });

  // Persistent Quiz Attempts
  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Persistent Oral Setoran Checklist per Student
  const [setoranMap, setSetoranMap] = useState<Record<string, SetoranRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETORAN);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // Active cohort filter & selected student in Practice Sandbox
  const [filterClass, setFilterClass] = useState<StudentClass>('Reguler 1');
  const [filterGender, setFilterGender] = useState<StudentGender>('Ikhwan');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    INITIAL_STUDENTS[0].id
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch {
      // ignore storage errors
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    } catch {
      // ignore storage errors
    }
  }, [attempts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETORAN, JSON.stringify(setoranMap));
    } catch {
      // ignore storage errors
    }
  }, [setoranMap]);

  useEffect(() => {
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEYS.SUPERADMIN,
        JSON.stringify(superadminConfig)
      );
    } catch {
      // ignore storage errors
    }
  }, [superadminConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEYS.STUDENT_PASSWORDS,
        JSON.stringify(studentPasswords)
      );
    } catch {
      // ignore storage errors
    }
  }, [studentPasswords]);

  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem(AUTH_STORAGE_KEYS.SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEYS.SESSION);
      }
    } catch {
      // ignore storage errors
    }
  }, [session]);

  const isSuperadmin = session?.role === 'superadmin';
  const loggedInStudent =
    session?.role === 'student'
      ? students.find((s) => s.id === session.studentId)
      : undefined;

  // Keep cohort & selected student locked to logged-in student
  useEffect(() => {
    if (loggedInStudent) {
      setFilterClass(loggedInStudent.kelas);
      setFilterGender(loggedInStudent.gender);
      setSelectedStudentId(loggedInStudent.id);
    }
  }, [loggedInStudent]);

  const handleLoginSuperadmin = (username: string, password: string): string | null => {
    if (username !== superadminConfig.username) {
      return 'Username superadmin tidak ditemukan.';
    }
    const candidateHash = hashPassword(password, superadminConfig.username);
    if (candidateHash !== superadminConfig.passwordHash) {
      return 'Password superadmin salah.';
    }
    setSession({
      role: 'superadmin',
      username: superadminConfig.username,
      displayName: superadminConfig.displayName,
      loggedInAt: new Date().toISOString(),
    });
    setActiveSection('recap');
    return null;
  };

  const handleRegisterStudentPassword = (
    studentId: string,
    newPassword: string
  ): string | null => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return 'Data siswa tidak ditemukan.';
    if (studentPasswords[studentId]) {
      return 'Siswa ini sudah memiliki password. Silakan login menggunakan password Anda.';
    }
    const passwordHash = hashPassword(newPassword, studentId);
    setStudentPasswords((prev) => ({ ...prev, [studentId]: passwordHash }));
    setFilterClass(student.kelas);
    setFilterGender(student.gender);
    setSelectedStudentId(student.id);
    setSession({
      role: 'student',
      studentId: student.id,
      loggedInAt: new Date().toISOString(),
    });
    setActiveSection('practice');
    return null;
  };

  const handleLoginStudent = (studentId: string, password: string): string | null => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return 'Data siswa tidak ditemukan.';
    const storedHash = studentPasswords[studentId];
    if (!storedHash) {
      return 'Akun belum memiliki password. Silakan buat password baru.';
    }
    if (hashPassword(password, studentId) !== storedHash) {
      return 'Password salah. Silakan coba lagi atau hubungi Superadmin untuk reset.';
    }
    setFilterClass(student.kelas);
    setFilterGender(student.gender);
    setSelectedStudentId(student.id);
    setSession({
      role: 'student',
      studentId: student.id,
      loggedInAt: new Date().toISOString(),
    });
    setActiveSection('practice');
    return null;
  };

  const handleResetStudentPassword = (studentId: string) => {
    setStudentPasswords((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  const handleChangeOwnPassword = (
    oldPassword: string,
    newPassword: string
  ): string | null => {
    if (!session) return 'Sesi tidak ditemukan.';
    if (session.role === 'superadmin') {
      if (
        hashPassword(oldPassword, superadminConfig.username) !==
        superadminConfig.passwordHash
      ) {
        return 'Password saat ini salah.';
      }
      setSuperadminConfig((prev) => ({
        ...prev,
        passwordHash: hashPassword(newPassword, prev.username),
      }));
      return null;
    }

    const stored = studentPasswords[session.studentId];
    if (!stored || hashPassword(oldPassword, session.studentId) !== stored) {
      return 'Password saat ini salah.';
    }
    setStudentPasswords((prev) => ({
      ...prev,
      [session.studentId]: hashPassword(newPassword, session.studentId),
    }));
    return null;
  };

  const handleLogout = () => {
    setSession(null);
    setShowAccountModal(false);
    setActiveSection('practice');
  };

  const handleSaveAttempt = (newAttempt: Omit<QuizAttempt, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formattedTime = now.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    const entry: QuizAttempt = {
      ...newAttempt,
      id: `att-${Date.now()}`,
      timestamp: formattedTime,
    };
    setAttempts((prev) => [entry, ...prev]);
  };

  const handleToggleSetoranBab = (studentId: string, babCode: string) => {
    setSetoranMap((prev) => {
      const existing = prev[studentId]?.completedBabs || [];
      const updated = existing.includes(babCode)
        ? existing.filter((b) => b !== babCode)
        : [...existing, babCode];
      return {
        ...prev,
        [studentId]: {
          studentId,
          completedBabs: updated,
          lastUpdated: new Date().toISOString(),
        },
      };
    });
  };

  const handleStartPracticeForStudent = (student: Student) => {
    setFilterClass(student.kelas);
    setFilterGender(student.gender);
    setSelectedStudentId(student.id);
    setActiveSection('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToCohortPractice = (kelas: StudentClass, gender: StudentGender) => {
    setFilterClass(kelas);
    setFilterGender(gender);
    const firstInCohort = students.find(
      (s) => s.kelas === kelas && s.gender === gender
    );
    if (firstInCohort) {
      setSelectedStudentId(firstInCohort.id);
    }
    setActiveSection('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddStudent = (newSt: Omit<Student, 'id'>) => {
    const created: Student = {
      ...newSt,
      id: `st-${Date.now()}`,
    };
    setStudents((prev) => [...prev, created]);
  };

  const handleUpdateStudentGroup = (
    studentId: string,
    kelas: StudentClass,
    gender: StudentGender
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, kelas, gender } : s))
    );
  };

  const handleRandomStudentQuickAction = () => {
    const cohortPool = students.filter(
      (s) => s.kelas === filterClass && s.gender === filterGender
    );
    const targetPool = cohortPool.length > 0 ? cohortPool : students;
    const picked = targetPool[Math.floor(Math.random() * targetPool.length)];
    if (picked) {
      setFilterClass(picked.kelas);
      setFilterGender(picked.gender);
      setSelectedStudentId(picked.id);
      setActiveSection('practice');
    }
  };

  // Counts for the 4 separated groups
  const r1Ikhwan = students.filter(
    (s) => s.kelas === 'Reguler 1' && s.gender === 'Ikhwan'
  ).length;
  const r1Akhwat = students.filter(
    (s) => s.kelas === 'Reguler 1' && s.gender === 'Akhwat'
  ).length;
  const r2Ikhwan = students.filter(
    (s) => s.kelas === 'Reguler 2' && s.gender === 'Ikhwan'
  ).length;
  const r2Akhwat = students.filter(
    (s) => s.kelas === 'Reguler 2' && s.gender === 'Akhwat'
  ).length;

  // Require login if no active session (or if student record is missing)
  if (!session || (session.role === 'student' && !loggedInStudent)) {
    return (
      <LoginView
        students={students}
        studentPasswords={studentPasswords}
        onLoginSuperadmin={handleLoginSuperadmin}
        onLoginStudent={handleLoginStudent}
        onRegisterStudentPassword={handleRegisterStudentPassword}
      />
    );
  }

  const navItems: { id: ActiveSection; label: string; mobileLabel: string }[] = isSuperadmin
    ? [
        { id: 'recap', label: 'Rekap Nilai Per Bab', mobileLabel: 'Rekap Nilai' },
        { id: 'practice', label: 'Ujian Per Bab', mobileLabel: 'Ujian Bab' },
        { id: 'roster', label: 'Data Siswa & Kelas', mobileLabel: 'Data Siswa' },
      ]
    : [
        { id: 'practice', label: 'Ujian Per Bab', mobileLabel: 'Ujian Bab' },
        { id: 'my_progress', label: 'Nilai Saya', mobileLabel: 'Nilai Saya' },
      ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* TOP BAR CONTRACT: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('practice');
            }}
            className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Madrasah Shorof Al-Barkah
          </a>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeSection === item.id
                    ? 'text-slate-900 border-emerald-700 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: User badge, quick action (Superadmin), password, and logout */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-800 max-w-[180px]">
              {isSuperadmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-slate-900 shrink-0" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              )}
              <span className="truncate">
                {isSuperadmin ? 'Superadmin' : loggedInStudent?.name}
              </span>
            </div>

            {isSuperadmin && (
              <button
                type="button"
                onClick={handleRandomStudentQuickAction}
                className="hidden lg:inline-flex px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Undi Kuis Siswa
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowAccountModal(true)}
              title="Ganti Password"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Password</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar dari akun"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Strip (visible only below md) */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSection(item.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSection === item.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.mobileLabel}
          </button>
        ))}
      </div>

      {/* Main Content Container (1360px max width for 1440px desktop baseline) */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 py-8">
        {/* Page Header & 4-Cohort Quick Switcher Strip */}
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">
                Program Bahasa Arab Al-Barkah · Tashrif Istilahi &amp; Lughawi
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {activeSection === 'practice' &&
                  'Ujian Shorof Per Bab (6 Bagian Evaluasi Terpadu)'}
                {activeSection === 'roster' &&
                  'Daftar Siswa Terpisah: Reguler 1 & 2 (Ikhwan & Akhwat)'}
                {activeSection === 'recap' &&
                  'Rekapitulasi Nilai Ujian Per Bab Siswa'}
                {activeSection === 'my_progress' &&
                  'Rekap Nilai Ujian Per Bab Saya'}
              </h1>
            </div>

            {isSuperadmin ? (
              <div className="text-xs text-slate-500 tabular-nums">
                Total Terdaftar: <strong className="text-slate-900">{students.length} Siswa</strong> · Reguler 1 ({r1Ikhwan + r1Akhwat}) · Reguler 2 ({r2Ikhwan + r2Akhwat})
              </div>
            ) : (
              loggedInStudent && (
                <div className="text-xs text-slate-600">
                  Masuk sebagai <strong className="text-slate-900">{loggedInStudent.name}</strong> ({loggedInStudent.kelas} · {loggedInStudent.gender})
                </div>
              )
            )}
          </div>

          {/* 4-Cohort Selector Bar: Shown for Superadmin only */}
          {isSuperadmin && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  kelas: 'Reguler 1' as StudentClass,
                  gender: 'Ikhwan' as StudentGender,
                  count: r1Ikhwan,
                  subtitle: 'Putra Kelas Reguler 1',
                },
                {
                  kelas: 'Reguler 1' as StudentClass,
                  gender: 'Akhwat' as StudentGender,
                  count: r1Akhwat,
                  subtitle: 'Putri Kelas Reguler 1',
                },
                {
                  kelas: 'Reguler 2' as StudentClass,
                  gender: 'Ikhwan' as StudentGender,
                  count: r2Ikhwan,
                  subtitle: 'Putra Kelas Reguler 2',
                },
                {
                  kelas: 'Reguler 2' as StudentClass,
                  gender: 'Akhwat' as StudentGender,
                  count: r2Akhwat,
                  subtitle: 'Putri Kelas Reguler 2',
                },
              ].map((group) => {
                const isSelected =
                  filterClass === group.kelas && filterGender === group.gender;
                return (
                  <button
                    key={`${group.kelas}-${group.gender}`}
                    type="button"
                    onClick={() => {
                      setFilterClass(group.kelas);
                      setFilterGender(group.gender);
                      const firstSt = students.find(
                        (s) => s.kelas === group.kelas && s.gender === group.gender
                      );
                      if (firstSt) setSelectedStudentId(firstSt.id);
                    }}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-medium ${
                          isSelected ? 'text-emerald-300' : 'text-emerald-800'
                        }`}
                      >
                        {group.kelas}
                      </span>
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {group.count} Siswa
                      </span>
                    </div>
                    <div className="text-base font-bold mt-1">
                      Kelompok {group.gender}
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {group.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Active Section Body */}
        {activeSection === 'practice' && (
          <BabExamView
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            filterClass={filterClass}
            onChangeClass={setFilterClass}
            filterGender={filterGender}
            onChangeGender={setFilterGender}
            attempts={attempts}
            onSaveAttempt={handleSaveAttempt}
            lockedStudent={loggedInStudent}
            requestedBabId={requestedBabId}
            onClearRequestedBab={() => setRequestedBabId(null)}
          />
        )}

        {isSuperadmin && activeSection === 'roster' && (
          <StudentRosterView
            students={students}
            attempts={attempts}
            setoranMap={setoranMap}
            onToggleSetoranBab={handleToggleSetoranBab}
            onStartPracticeForStudent={handleStartPracticeForStudent}
            onAddStudent={handleAddStudent}
            onUpdateStudentGroup={handleUpdateStudentGroup}
            studentPasswords={studentPasswords}
            onResetStudentPassword={handleResetStudentPassword}
          />
        )}

        {isSuperadmin && activeSection === 'recap' && (
          <ClassRecapView
            students={students}
            attempts={attempts}
            setoranMap={setoranMap}
            onJumpToCohortPractice={handleJumpToCohortPractice}
            onClearHistory={() => setAttempts([])}
          />
        )}

        {!isSuperadmin && loggedInStudent && activeSection === 'my_progress' && (
          <StudentProgressView
            student={loggedInStudent}
            attempts={attempts}
            setoran={setoranMap[loggedInStudent.id]}
            onStartBabExam={(babId) => {
              setRequestedBabId(babId);
              setActiveSection('practice');
            }}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-[1360px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Madrasah Shorof Al-Barkah · Sistem Ujian Shorof Per Bab Reguler 1 &amp; Reguler 2
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveSection('practice')}
              className="hover:text-slate-900 transition-colors"
            >
              Ujian Per Bab
            </button>
            {isSuperadmin ? (
              <>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setActiveSection('recap')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Rekap Nilai Per Bab
                </button>
              </>
            ) : (
              <>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setActiveSection('my_progress')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Nilai Saya
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        accountTitle={
          isSuperadmin
            ? superadminConfig.displayName
            : loggedInStudent?.name || 'Akun Siswa'
        }
        accountSubtitle={
          isSuperadmin
            ? `Username: ${superadminConfig.username}`
            : loggedInStudent
            ? `${loggedInStudent.kelas} · Kelompok ${loggedInStudent.gender}`
            : ''
        }
        onChangePassword={handleChangeOwnPassword}
      />
    </div>
  );
}
