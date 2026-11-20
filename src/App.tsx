import { useState, useEffect, useRef } from 'react';
import { LogOut, KeyRound, ShieldCheck, GraduationCap, X } from 'lucide-react';
import {
  DEMO_STUDENTS,
  INITIAL_STUDENTS,
  ManualScoreRecord,
  Student,
  StudentClass,
  StudentGender,
  QuizAttempt,
  QuizAttemptReviewItem,
  SetoranRecord,
} from './data/students';
import { BabExamView } from './components/BabExamView';
import { StudentRosterView } from './components/StudentRosterView';
import { ClassRecapView } from './components/ClassRecapView';
import { ManualScoresView } from './components/ManualScoresView';
import { LoginView } from './components/LoginView';
import { StudentProgressView } from './components/StudentProgressView';
import { RankingView } from './components/RankingView';
import { ExamAccessControlView } from './components/ExamAccessControlView';
import { AccountModal } from './components/AccountModal';
import {
  AUTH_STORAGE_KEYS,
  AuthSession,
  StudentPasswordMap,
  SuperadminConfig,
  getInitialAdminToken,
  getInitialSession,
  getInitialSuperadminConfig,
} from './utils/auth';
import {
  DEFAULT_EXAM_ACCESS,
  type ExamAccessConfig,
} from './utils/examAccess';
import { clearLocalExamDrafts } from './utils/examSession';
import { matchesResetParams, type ResetAttemptsParams } from './utils/attemptFilter';
import { loadStudentCredentialStatus, loadSuperadminUsername, requestStudentCredential, verifySuperadmin } from './utils/studentCredentials';
import {
  type ManualScoreInputEntry,
  clearAttemptsInDb,
  deleteAttemptInDb,
  loadAttemptReviewFromDb,
  loadStudentData,
  resetStudentAttemptsInDb,
  saveManualScoresInDb,
  saveQuizAttemptToDb,
  registerUnlistedStudent,
  toggleSetoranInDb,
  updateExamAccessInDb,
  upsertStudentInDb,
} from './utils/studentData';

type ActiveSection =
  | 'practice'
  | 'roster'
  | 'recap'
  | 'uts_uas'
  | 'access'
  | 'my_progress'
  | 'ranking';

const STORAGE_KEYS = {
  STUDENTS: 'albarkah_shorof_students_v1',
  ATTEMPTS: 'albarkah_shorof_attempts_v1',
  SETORAN: 'albarkah_shorof_setoran_v1',
  MANUAL_SCORES: 'albarkah_shorof_manual_scores_v1',
};

function mergeStudentRecords(base: Student[], dbRecords: Student[]): Student[] {
  if (dbRecords.length === 0) return base;
  const recordMap = new Map(dbRecords.map((r) => [r.id, r]));
  const merged = base.map((st) => {
    const override = recordMap.get(st.id);
    if (override) {
      recordMap.delete(st.id);
      return override;
    }
    return st;
  });
  return [...merged, ...recordMap.values()];
}

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getInitialSession());
  const [activeSection, setActiveSection] = useState<ActiveSection>(() =>
    getInitialSession()?.role === 'superadmin' ? 'recap' : 'practice'
  );

  // Authentication & Credentials State
  const [superadminConfig, setSuperadminConfig] = useState<SuperadminConfig>(() =>
    getInitialSuperadminConfig()
  );
  const [superadminReady, setSuperadminReady] = useState(false);
  const [studentPasswords, setStudentPasswords] = useState<StudentPasswordMap>({});
  const [adminToken, setAdminToken] = useState<string | null>(() => getInitialAdminToken());
  const [dbSyncError, setDbSyncError] = useState<string | null>(null);
  const [examAccess, setExamAccess] = useState<ExamAccessConfig>(DEFAULT_EXAM_ACCESS);
  const [examAccessSaving, setExamAccessSaving] = useState(false);
  const seedStudentsSynced = useRef(false);
  const [legacyImported, setLegacyImported] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

  // Persistent Manual UTS & UAS Scores per Student (Input by Superadmin)
  const [manualScoresMap, setManualScoresMap] = useState<
    Record<string, ManualScoreRecord>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MANUAL_SCORES);
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
      localStorage.setItem(STORAGE_KEYS.MANUAL_SCORES, JSON.stringify(manualScoresMap));
    } catch {
      // ignore storage errors
    }
  }, [manualScoresMap]);

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
    let cancelled = false;
    const refresh = async () => {
      const [accountsResult, dataResult] = await Promise.allSettled([
        loadStudentCredentialStatus(),
        loadStudentData(),
      ]);
      if (cancelled) return;
      if (accountsResult.status === 'fulfilled') {
        setStudentPasswords(accountsResult.value);
      } else {
        console.error(accountsResult.reason);
      }
      if (dataResult.status === 'fulfilled') {
        const data = dataResult.value;
        setAttempts((prev) => {
          const cachedReviewById = new Map(
            prev
              .filter((a) => Array.isArray(a.reviewItems) && a.reviewItems.length > 0)
              .map((a) => [a.id, a.reviewItems!])
          );
          return data.attempts.map((att) => {
            const cached = cachedReviewById.get(att.id);
            return cached ? { ...att, hasReview: true, reviewItems: cached } : att;
          });
        });
        setSetoranMap(data.setoranMap);
        if (data.manualScoresMap) {
          setManualScoresMap(data.manualScoresMap);
        }
        setStudents(mergeStudentRecords(INITIAL_STUDENTS, data.studentRecords));
        if (data.examAccess) {
          setExamAccess(data.examAccess);
        }
        setDbSyncError(null);
      } else {
        console.error(dataResult.reason);
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadSuperadminUsername().then((username) => {
      if (!cancelled) {
        setSuperadminConfig((current) => ({ ...current, username }));
        setSuperadminReady(true);
      }
    }).catch((error) => {
      console.error(error);
      if (!cancelled) setSuperadminReady(true);
    });
    return () => { cancelled = true; };
  }, []);

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

  useEffect(() => {
    try {
      if (adminToken) {
        localStorage.setItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN, adminToken);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN);
      }
    } catch {
      // ignore storage errors
    }
  }, [adminToken]);

  const isSuperadmin = session?.role === 'superadmin';
  const loggedInStudent =
    session?.role === 'student'
      ? students.find((s) => s.id === session.studentId)
      : undefined;

  useEffect(() => {
    if (!isSuperadmin || activeSection !== 'access') return;
    if (seedStudentsSynced.current) return;
    seedStudentsSynced.current = true;
    let cancelled = false;
    void fetch('/api/student-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
      },
      body: JSON.stringify({ action: 'sync-seed-students' }),
      signal: AbortSignal.timeout(15000),
    }).then(async (response) => {
      if (response.ok || cancelled) return;
      seedStudentsSynced.current = false;
      const result = await response.json().catch(() => null);
      setDbSyncError(result?.error || 'Gagal menyinkronkan data siswa.');
    }).catch((error) => {
      seedStudentsSynced.current = false;
      if (!cancelled) setDbSyncError(error instanceof Error ? error.message : 'Gagal menyinkronkan data siswa.');
    });
    return () => { cancelled = true; };
  }, [isSuperadmin, activeSection, students, adminToken]);

  // Keep cohort & selected student locked to logged-in student
  useEffect(() => {
    if (loggedInStudent) {
      setFilterClass(loggedInStudent.kelas);
      setFilterGender(loggedInStudent.gender);
      setSelectedStudentId(loggedInStudent.id);
    }
  }, [loggedInStudent]);

  const handleLoginSuperadmin = async (username: string, password: string): Promise<string | null> => {
    if (!superadminReady) return 'Memuat akun superadmin. Silakan coba lagi.';
    if (username !== superadminConfig.username) {
      return 'Username superadmin tidak ditemukan.';
    }
    const result = await verifySuperadmin(username, password);
    if (result.error) return result.error;
    setAdminToken(result.token);
    try {
      const legacy = JSON.parse(localStorage.getItem('albarkah_shorof_student_passwords_v1') || '{}');
      if (Object.keys(legacy).length && !legacyImported) {
        await fetch('/api/student-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${result.token}` },
          body: JSON.stringify({ action: 'import-legacy', passwordHashes: legacy }),
        });
        setLegacyImported(true);
      }
    } catch (error) {
      console.error('Legacy student account migration failed', error);
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

  const handleRegisterStudentPassword = async (
    studentId: string,
    newPassword: string
  ): Promise<string | null> => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return 'Data siswa tidak ditemukan.';
    if (studentPasswords[studentId]) {
      return 'Siswa ini sudah memiliki password. Silakan login menggunakan password Anda.';
    }
    const error = await requestStudentCredential('register', studentId, { newPassword });
    if (error) return error;
    setStudentPasswords((prev) => ({ ...prev, [studentId]: true }));
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

  const handleLoginStudent = async (studentId: string, password: string): Promise<string | null> => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return 'Data siswa tidak ditemukan.';
    const error = await requestStudentCredential('login', studentId, { password });
    if (error) return error;
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

  const handleResetStudentPassword = async (studentId: string) => {
    if (session?.role !== 'superadmin') return 'Sesi superadmin diperlukan.';
    const error = await requestStudentCredential('reset', studentId, {
      adminToken: adminToken || undefined,
    });
    if (error) {
      window.alert(error);
      return error;
    }
    setStudentPasswords((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
    return null;
  };

  const handleChangeOwnPassword = async (
    oldPassword: string,
    newPassword: string
  ): Promise<string | null> => {
    if (!session) return 'Sesi tidak ditemukan.';
    if (session.role === 'superadmin') {
      const error = await requestStudentCredential('change-admin-password', 'superadmin', {
        password: oldPassword,
        newPassword,
        adminUsername: session.username,
        adminToken: adminToken || undefined,
      });
      if (error) return error;
      setSuperadminConfig((prev) => ({
        ...prev,
        passwordHash: 'server-managed',
      }));
      return null;
    }

    const error = await requestStudentCredential('change', session.studentId, {
      password: oldPassword,
      newPassword,
    });
    if (error) return error;
    setStudentPasswords((prev) => ({ ...prev, [session.studentId]: true }));
    return null;
  };

  const handleLogout = () => {
    setSession(null);
    setAdminToken(null);
    setShowAccountModal(false);
    setActiveSection('practice');
  };

  const handleLoadAttemptReview = async (
    attemptId: string
  ): Promise<QuizAttemptReviewItem[] | null> => {
    const existing = attempts.find((a) => a.id === attemptId);
    if (existing?.reviewItems && existing.reviewItems.length > 0) {
      return existing.reviewItems;
    }
    const items = await loadAttemptReviewFromDb(attemptId);
    if (items && items.length > 0) {
      setAttempts((prev) =>
        prev.map((a) =>
          a.id === attemptId ? { ...a, hasReview: true, reviewItems: items } : a
        )
      );
    }
    return items;
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
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: formattedTime,
    };
    setAttempts((prev) => [entry, ...prev]);
    void saveQuizAttemptToDb(entry).then((err) => {
      if (err) {
        console.error('Gagal menyimpan hasil ujian ke database:', err);
        setDbSyncError(err);
      } else {
        setDbSyncError(null);
      }
    });
  };

  const handleToggleSetoranBab = async (studentId: string, babCode: string) => {
    const previous = setoranMap[studentId];
    const existing = previous?.completedBabs || [];
    const updated = existing.includes(babCode)
      ? existing.filter((b) => b !== babCode)
      : [...existing, babCode];

    setSetoranMap((prev) => ({
      ...prev,
      [studentId]: {
        studentId,
        completedBabs: updated,
        lastUpdated: new Date().toISOString(),
      },
    }));

    const { record, error } = await toggleSetoranInDb(studentId, babCode, adminToken);
    if (error) {
      setSetoranMap((prev) => {
        const next = { ...prev };
        if (previous) {
          next[studentId] = previous;
        } else {
          delete next[studentId];
        }
        return next;
      });
      setDbSyncError(error);
      window.alert(error);
      return;
    }
    if (record) {
      setDbSyncError(null);
      setSetoranMap((prev) => ({
        ...prev,
        [studentId]: record,
      }));
    }
  };

  const handleAddStudent = async (newSt: Omit<Student, 'id'>) => {
    const created: Student = {
      ...newSt,
      id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    setStudents((prev) => [...prev, created]);
    const error = await upsertStudentInDb(created, adminToken);
    if (error) {
      setStudents((prev) => prev.filter((s) => s.id !== created.id));
      setDbSyncError(error);
      window.alert(error);
    } else {
      setDbSyncError(null);
    }
  };

  const handleUpdateStudentGroup = async (
    studentId: string,
    kelas: StudentClass,
    gender: StudentGender
  ) => {
    const previous = students.find((s) => s.id === studentId);
    if (!previous) return;
    const updatedStudent: Student = { ...previous, kelas, gender };
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? updatedStudent : s))
    );
    const error = await upsertStudentInDb(updatedStudent, adminToken);
    if (error) {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? previous : s))
      );
      setDbSyncError(error);
      window.alert(error);
    } else {
      setDbSyncError(null);
    }
  };

  const handleClearHistory = async (): Promise<string | null> => {
    const error = await clearAttemptsInDb(adminToken);
    if (error) {
      setDbSyncError(error);
      return error;
    }
    clearLocalExamDrafts({});
    setDbSyncError(null);
    setAttempts([]);
    return null;
  };

  const handleDeleteAttempt = async (attemptId: string): Promise<string | null> => {
    const target = attempts.find((a) => a.id === attemptId);
    const { error } = await deleteAttemptInDb(attemptId, adminToken);
    if (error) {
      setDbSyncError(error);
      return error;
    }
    if (target) {
      clearLocalExamDrafts({
        studentId: target.studentId,
        babId: target.babId,
        sectionNumber: target.sectionNumber ?? null,
      });
    }
    setDbSyncError(null);
    setAttempts((prev) => prev.filter((a) => a.id !== attemptId));
    return null;
  };

  const handleResetStudentAttempts = async (
    params: ResetAttemptsParams
  ): Promise<string | null> => {
    const { error } = await resetStudentAttemptsInDb(params, adminToken);
    if (error) {
      setDbSyncError(error);
      return error;
    }
    clearLocalExamDrafts(params);
    setDbSyncError(null);
    setAttempts((prev) => prev.filter((a) => !matchesResetParams(a, params)));
    return null;
  };

  const handleUpdateExamAccess = async (nextConfig: ExamAccessConfig) => {
    const previous = examAccess;
    setExamAccess(nextConfig);
    setExamAccessSaving(true);
    try {
      const { examAccess: saved, error } = await updateExamAccessInDb(nextConfig, adminToken);
      if (error) {
        setExamAccess(previous);
        setDbSyncError(error);
        window.alert(error);
        return;
      }
      if (saved) setExamAccess(saved);
      setDbSyncError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menyimpan pengaturan akses.';
      setExamAccess(previous);
      setDbSyncError(message);
      window.alert(message);
    } finally {
      setExamAccessSaving(false);
    }
  };

  const handleSaveManualScores = async (
    entries: ManualScoreInputEntry[]
  ): Promise<string | null> => {
    const previous = manualScoresMap;
    const nowIso = new Date().toISOString();
    setManualScoresMap((prev) => {
      const next = { ...prev };
      entries.forEach((item) => {
        if (item.utsScore === null && item.uasScore === null) {
          delete next[item.studentId];
        } else {
          next[item.studentId] = {
            studentId: item.studentId,
            utsScore: item.utsScore,
            uasScore: item.uasScore,
            updatedAt: nowIso,
          };
        }
      });
      return next;
    });

    const { saved, error } = await saveManualScoresInDb(entries, adminToken);
    if (error) {
      setManualScoresMap(previous);
      setDbSyncError(error);
      return error;
    }
    if (saved) {
      setManualScoresMap((prev) => {
        const next = { ...prev };
        Object.entries(saved).forEach(([studentId, rec]) => {
          if (rec === null) {
            delete next[studentId];
          } else {
            next[studentId] = rec;
          }
        });
        return next;
      });
    }
    setDbSyncError(null);
    return null;
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
        onRegisterUnlistedStudent={async (student) => {
          const result = await registerUnlistedStudent(student);
          if (result.student) {
            setStudents((previous) => [...previous, result.student!]);
          }
          return result;
        }}
      />
    );
  }

  const navItems: { id: ActiveSection; label: string; mobileLabel: string }[] = isSuperadmin
      ? [
        { id: 'recap', label: 'Rekap Nilai Per Bab', mobileLabel: 'Rekap Nilai' },
        { id: 'uts_uas', label: 'UTS & UAS Sem. 1', mobileLabel: 'UTS/UAS Sem.1' },
        { id: 'access', label: 'Akses Buka Soal', mobileLabel: 'Akses Soal' },
        { id: 'ranking', label: 'Peringkat Siswa', mobileLabel: 'Peringkat' },
        { id: 'roster', label: 'Data Siswa & Kelas', mobileLabel: 'Data Siswa' },
      ]
    : [
        { id: 'practice', label: 'Ujian Per Bab', mobileLabel: 'Ujian Bab' },
        { id: 'my_progress', label: 'Nilai Saya', mobileLabel: 'Nilai Saya' },
        { id: 'ranking', label: 'Peringkat Kelas', mobileLabel: 'Peringkat' },
      ];

  const currentSection: ActiveSection = activeSection;

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
              setActiveSection(isSuperadmin ? 'recap' : 'practice');
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
                  currentSection === item.id
                    ? 'text-slate-900 border-emerald-700 font-semibold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: User badge, password, and logout */}
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
              onClick={() => setShowLogoutConfirm(true)}
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
              currentSection === item.id
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
        {dbSyncError && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            Sinkronisasi database terganggu: {dbSyncError}
          </div>
        )}
        {/* Page Header & 4-Cohort Quick Switcher Strip */}
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">
                Program Bahasa Arab Al-Barkah · Tashrif Istilahi &amp; Lughawi
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {currentSection === 'practice' &&
                  'Ujian Shorof Per Bab (12 Bagian: 6 Tashrif Istilahi + 6 Tashrif Lughawi)'}
                {currentSection === 'roster' &&
                  'Daftar Siswa Terpisah: Reguler 1 & 2 (Ikhwan & Akhwat)'}
                {currentSection === 'recap' &&
                  'Rekapitulasi Nilai Ujian Per Bab Siswa'}
                {currentSection === 'uts_uas' &&
                  'Input Nilai UTS & UAS Semester 1 · Reguler 1 (50% Web · 10% UTS · 40% UAS)'}
                {currentSection === 'access' &&
                  'Kontrol Akses Buka & Tutup Soal Ujian'}
                {currentSection === 'my_progress' &&
                  'Rekap Nilai Ujian Per Bab Saya'}
                {currentSection === 'ranking' &&
                  'Papan Peringkat & Prestasi Siswa'}
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
        {!isSuperadmin && currentSection === 'practice' && (
          <BabExamView
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            filterClass={filterClass}
            onChangeClass={setFilterClass}
            filterGender={filterGender}
            onChangeGender={setFilterGender}
            attempts={attempts}
            examAccess={examAccess}
            onSaveAttempt={handleSaveAttempt}
            onLoadAttemptReview={handleLoadAttemptReview}
            lockedStudent={loggedInStudent}
            requestedBabId={requestedBabId}
            onClearRequestedBab={() => setRequestedBabId(null)}
          />
        )}

        {isSuperadmin && currentSection === 'access' && (
          <ExamAccessControlView
            examAccess={examAccess}
            onUpdateExamAccess={handleUpdateExamAccess}
            saving={examAccessSaving}
          />
        )}

        {isSuperadmin && currentSection === 'roster' && (
          <StudentRosterView
            students={students}
            attempts={attempts}
            onAddStudent={handleAddStudent}
            onUpdateStudentGroup={handleUpdateStudentGroup}
            studentPasswords={studentPasswords}
            onResetStudentPassword={handleResetStudentPassword}
            onResetStudentAttempts={handleResetStudentAttempts}
          />
        )}

        {isSuperadmin && currentSection === 'recap' && (
          <ClassRecapView
            students={students}
            attempts={attempts}
            setoranMap={setoranMap}
            manualScoresMap={manualScoresMap}
            onOpenManualScores={() => setActiveSection('uts_uas')}
            onDeleteAttempt={handleDeleteAttempt}
            onResetStudentAttempts={handleResetStudentAttempts}
            onClearHistory={handleClearHistory}
          />
        )}

        {isSuperadmin && currentSection === 'uts_uas' && (
          <ManualScoresView
            students={students}
            attempts={attempts}
            manualScoresMap={manualScoresMap}
            selectedGender={filterClass === 'Reguler 1' ? filterGender : undefined}
            onSaveManualScores={handleSaveManualScores}
          />
        )}

        {!isSuperadmin && loggedInStudent && currentSection === 'my_progress' && (
          <StudentProgressView
            student={loggedInStudent}
            attempts={attempts}
            setoran={setoranMap[loggedInStudent.id]}
            manualScore={manualScoresMap[loggedInStudent.id]}
            examAccess={examAccess}
            onLoadAttemptReview={handleLoadAttemptReview}
            onStartBabExam={(babId) => {
              setRequestedBabId(babId);
              setActiveSection('practice');
            }}
          />
        )}

        {currentSection === 'ranking' && (
          <RankingView
            students={students}
            attempts={attempts}
            setoranMap={setoranMap}
            manualScoresMap={manualScoresMap}
            loggedInStudent={loggedInStudent}
            isSuperadmin={isSuperadmin}
            selectedClass={filterClass}
            onChangeClass={setFilterClass}
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
            {isSuperadmin ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSection('recap')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Rekap Nilai Per Bab
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setActiveSection('uts_uas')}
                  className="hover:text-slate-900 transition-colors"
                >
                  UTS &amp; UAS Sem. 1
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setActiveSection('access')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Akses Buka Soal
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setActiveSection('ranking')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Peringkat Siswa
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setActiveSection('roster')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Data Siswa &amp; Kelas
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSection('practice')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Ujian Per Bab
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setActiveSection('my_progress')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Nilai Saya
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => setActiveSection('ranking')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Peringkat Kelas
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

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-rose-50/70 px-5 py-4">
              <h2 id="logout-confirm-title" className="text-sm font-bold text-slate-900">
                Keluar dari akun?
              </h2>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                aria-label="Tutup konfirmasi keluar"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-sm text-slate-600">Apakah Anda yakin ingin keluar dari akun ini?</p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Tidak, Batal
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
