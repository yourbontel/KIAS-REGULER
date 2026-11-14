import { useState, useEffect } from 'react';
import {
  INITIAL_STUDENTS,
  Student,
  StudentClass,
  StudentGender,
  QuizAttempt,
  SetoranRecord,
} from './data/students';
import { PracticeSandbox } from './components/PracticeSandbox';
import { TashrifSimulator } from './components/TashrifSimulator';
import { StudentRosterView } from './components/StudentRosterView';
import { ClassRecapView } from './components/ClassRecapView';

type ActiveSection = 'practice' | 'simulator' | 'roster' | 'recap';

const STORAGE_KEYS = {
  STUDENTS: 'albarkah_shorof_students_v1',
  ATTEMPTS: 'albarkah_shorof_attempts_v1',
  SETORAN: 'albarkah_shorof_setoran_v1',
};

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('practice');

  // Persistent Student Roster (88 initial students: 65 Reguler 1 + 23 Reguler 2)
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* TOP BAR CONTRACT: Strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('practice');
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Madrasah Shorof Al-Barkah
          </a>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveSection('practice')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeSection === 'practice'
                  ? 'text-slate-900 border-emerald-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Latihan Shorof
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('simulator')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeSection === 'simulator'
                  ? 'text-slate-900 border-emerald-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Tabel Tashrif
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('roster')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeSection === 'roster'
                  ? 'text-slate-900 border-emerald-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Data Siswa &amp; Kelas
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('recap')}
              className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                activeSection === 'recap'
                  ? 'text-slate-900 border-emerald-700 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Rekap Setoran
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleRandomStudentQuickAction}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Undi Kuis Siswa
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Strip (visible only below md) */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'practice', label: 'Latihan Shorof' },
          { id: 'simulator', label: 'Tabel Tashrif' },
          { id: 'roster', label: 'Data Siswa' },
          { id: 'recap', label: 'Rekap Nilai' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSection(item.id as ActiveSection)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeSection === item.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item.label}
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
                  'Laboratorium Latihan & Evaluasi Shorof Siswa'}
                {activeSection === 'simulator' &&
                  'Tabel Referensi & Simulator Wazan Tashrif'}
                {activeSection === 'roster' &&
                  'Daftar Siswa Terpisah: Reguler 1 & 2 (Ikhwan & Akhwat)'}
                {activeSection === 'recap' &&
                  'Rekapitulasi Nilai Kuis & Setoran Hafalan Shorof'}
              </h1>
            </div>

            <div className="text-xs text-slate-500 tabular-nums">
              Total Terdaftar: <strong className="text-slate-900">{students.length} Siswa</strong> · Reguler 1 ({r1Ikhwan + r1Akhwat}) · Reguler 2 ({r2Ikhwan + r2Akhwat})
            </div>
          </div>

          {/* 4-Cohort Selector Bar: Explicitly separating Reguler 1 / Reguler 2 and Ikhwan / Akhwat */}
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
        </section>

        {/* Active Section Body */}
        {activeSection === 'practice' && (
          <PracticeSandbox
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            filterClass={filterClass}
            onChangeClass={setFilterClass}
            filterGender={filterGender}
            onChangeGender={setFilterGender}
            onSaveAttempt={handleSaveAttempt}
            recentAttempts={attempts}
          />
        )}

        {activeSection === 'simulator' && <TashrifSimulator />}

        {activeSection === 'roster' && (
          <StudentRosterView
            students={students}
            attempts={attempts}
            setoranMap={setoranMap}
            onToggleSetoranBab={handleToggleSetoranBab}
            onStartPracticeForStudent={handleStartPracticeForStudent}
            onAddStudent={handleAddStudent}
            onUpdateStudentGroup={handleUpdateStudentGroup}
          />
        )}

        {activeSection === 'recap' && (
          <ClassRecapView
            students={students}
            attempts={attempts}
            setoranMap={setoranMap}
            onJumpToCohortPractice={handleJumpToCohortPractice}
            onClearHistory={() => setAttempts([])}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-[1360px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Madrasah Shorof Al-Barkah · Sistem Latihan Tashrif Kelas Reguler 1 &amp; Reguler 2
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveSection('practice')}
              className="hover:text-slate-900 transition-colors"
            >
              Latihan Kuis
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveSection('simulator')}
              className="hover:text-slate-900 transition-colors"
            >
              Tabel Tashrif
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setActiveSection('roster')}
              className="hover:text-slate-900 transition-colors"
            >
              Data 88 Siswa
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
