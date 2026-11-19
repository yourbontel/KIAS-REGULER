import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Crown,
  Download,
  MapPin,
  Medal,
  Search,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import {
  PASSING_SCORE,
  QuizAttempt,
  SetoranRecord,
  Student,
  StudentClass,
  StudentGender,
} from '../data/students';
import { ShorofBab, getBabsForClass } from '../data/shorofData';
import { SECTION_NUMBERS } from '../utils/babScores';
import {
  RankedStudentEntry,
  computeStudentRankings,
  isEntryPassing,
} from '../utils/ranking';

interface RankingViewProps {
  students: Student[];
  attempts: QuizAttempt[];
  setoranMap: Record<string, SetoranRecord>;
  loggedInStudent?: Student;
  isSuperadmin?: boolean;
  selectedClass?: StudentClass;
  onChangeClass?: (kelas: StudentClass) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function renderRankBadge(rank: number | null) {
  if (rank === null) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-7 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold tabular-nums">
        —
      </span>
    );
  }
  if (rank === 1) {
    return (
      <span className="inline-flex items-center justify-center gap-1 px-2.5 h-7 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold tabular-nums">
        <Crown className="w-3.5 h-3.5 text-amber-600" />
        #1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center justify-center gap-1 px-2.5 h-7 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold tabular-nums">
        <Medal className="w-3.5 h-3.5 text-slate-500" />
        #2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center justify-center gap-1 px-2.5 h-7 rounded-lg bg-orange-100 text-orange-900 border border-orange-300 text-xs font-bold tabular-nums">
        <Award className="w-3.5 h-3.5 text-orange-600" />
        #3
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center w-8 h-7 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold tabular-nums">
      #{rank}
    </span>
  );
}

export const RankingView: React.FC<RankingViewProps> = ({
  students,
  attempts,
  setoranMap,
  loggedInStudent,
  isSuperadmin = false,
  selectedClass,
  onChangeClass,
}) => {
  const [kelasFilter, setKelasFilter] = useState<StudentClass>(
    loggedInStudent?.kelas ?? selectedClass ?? 'Reguler 1'
  );
  const [genderFilter, setGenderFilter] = useState<'Semua' | StudentGender>('Semua');
  const [selectedBabId, setSelectedBabId] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [babMenuOpen, setBabMenuOpen] = useState(false);
  const babDropdownRef = useRef<HTMLDivElement>(null);
  const effectiveKelas: StudentClass =
    !isSuperadmin && loggedInStudent ? loggedInStudent.kelas : kelasFilter;
  const effectiveGender = !isSuperadmin && loggedInStudent ? loggedInStudent.gender : genderFilter;

  useEffect(() => {
    if (!isSuperadmin || !selectedClass || selectedClass === kelasFilter) return;
    setKelasFilter(selectedClass);
    if (selectedBabId !== 'all') {
      const nextBabs = getBabsForClass(selectedClass);
      if (!nextBabs.some((b) => b.id === selectedBabId)) {
        setSelectedBabId('all');
      }
    }
  }, [isSuperadmin, selectedClass, kelasFilter, selectedBabId]);

  useEffect(() => {
    if (!babMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        babDropdownRef.current &&
        !babDropdownRef.current.contains(e.target as Node)
      ) {
        setBabMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBabMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [babMenuOpen]);

  const availableBabs = useMemo(
    () => getBabsForClass(effectiveKelas),
    [effectiveKelas]
  );

  const groupedAvailableBabs = useMemo(() => {
    const groups: { kategori: ShorofBab['kategori']; items: ShorofBab[] }[] = [];
    availableBabs.forEach((bab) => {
      const existing = groups.find((g) => g.kategori === bab.kategori);
      if (existing) existing.items.push(bab);
      else groups.push({ kategori: bab.kategori, items: [bab] });
    });
    return groups;
  }, [availableBabs]);

  const handleChangeKelas = (nextKelas: StudentClass) => {
    setKelasFilter(nextKelas);
    onChangeClass?.(nextKelas);
    if (selectedBabId !== 'all') {
      const nextBabs = getBabsForClass(nextKelas);
      if (!nextBabs.some((b) => b.id === selectedBabId)) {
        setSelectedBabId('all');
      }
    }
  };

  // Hitung peringkat penuh terlebih dahulu sebelum filter pencarian nama,
  // sehingga saat mencari nama, nomor peringkat asli tetap akurat.
  const fullRankedList = useMemo(
    () =>
      computeStudentRankings(students, attempts, setoranMap, {
        kelas: effectiveKelas,
        gender: effectiveGender,
        babId: selectedBabId,
      }),
    [students, attempts, setoranMap, effectiveKelas, effectiveGender, selectedBabId]
  );

  const scoredEntries = useMemo(
    () => fullRankedList.filter((e) => e.rank !== null),
    [fullRankedList]
  );

  const visibleRows = useMemo(() => {
    if (!isSuperadmin) {
      return scoredEntries.slice(0, 5);
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return fullRankedList;
    return fullRankedList.filter(
      (entry) =>
        entry.student.name.toLowerCase().includes(q) ||
        entry.student.kota.toLowerCase().includes(q)
    );
  }, [isSuperadmin, scoredEntries, fullRankedList, searchQuery]);

  const pinnedMyRow = useMemo(() => {
    if (isSuperadmin || !loggedInStudent) return null;
    if (visibleRows.some((e) => e.student.id === loggedInStudent.id)) {
      return null;
    }
    return fullRankedList.find((e) => e.student.id === loggedInStudent.id) || null;
  }, [isSuperadmin, loggedInStudent, visibleRows, fullRankedList]);

  const topThree = useMemo(() => scoredEntries.slice(0, 3), [scoredEntries]);

  const myRankingEntry = useMemo(() => {
    if (!loggedInStudent) return null;
    // Always compute student's own standing inside their own class cohort
    const classRankings = computeStudentRankings(students, attempts, setoranMap, {
      kelas: loggedInStudent.kelas,
      gender: loggedInStudent.gender,
      babId: selectedBabId,
    });
    const entry =
      classRankings.find((e) => e.student.id === loggedInStudent.id) || null;
    const totalInClass = classRankings.length;
    const rankedInClass = classRankings.filter((e) => e.rank !== null).length;
    return { entry, totalInClass, rankedInClass };
  }, [loggedInStudent, students, attempts, setoranMap, selectedBabId]);

  const activeBabMeta = useMemo(
    () =>
      selectedBabId === 'all'
        ? null
        : availableBabs.find((b) => b.id === selectedBabId) || null,
    [selectedBabId, availableBabs]
  );

  const handleExportCSV = () => {
    const headers = [
      'Peringkat',
      'Nama Siswa',
      'Kelas',
      'Kelompok',
      'Asal Kota',
      selectedBabId === 'all' ? 'Total Skor' : `Nilai ${activeBabMeta?.kode ?? ''}`,
      'Rata-rata',
      'Bab Selesai',
      'Total Bab Kelas',
      'Bab Lulus',
      'Setoran Lisan',
    ];
    const rows = fullRankedList.map((entry) => [
      entry.rank ?? '-',
      `"${entry.student.name}"`,
      `"${entry.student.kelas}"`,
      `"${entry.student.gender}"`,
      `"${entry.student.kota}"`,
      selectedBabId === 'all'
        ? entry.totalScore
        : entry.selectedBabScore ?? '-',
      entry.avgScore ?? '-',
      entry.completedBabsCount,
      entry.totalBabsForClass,
      entry.passedBabsCount,
      entry.setoranCount,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ranking_Shorof_${kelasFilter.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStudentRow = (entry: RankedStudentEntry) => {
    const isMe = loggedInStudent?.id === entry.student.id;
    const passing = isEntryPassing(entry, selectedBabId);
    const hasDisplayedScore =
      selectedBabId === 'all'
        ? entry.completedBabsCount > 0
        : entry.selectedBabScore !== null;

    return (
      <tr
        key={entry.student.id}
        className={isMe ? 'bg-emerald-50/70' : 'hover:bg-slate-50/80'}
      >
        <td className="py-3 px-4">{renderRankBadge(entry.rank)}</td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 border ${
                entry.student.id.startsWith('demo-')
                  ? 'bg-slate-900 text-white border-slate-900'
                  : entry.student.gender === 'Ikhwan'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-teal-50 text-teal-800 border-teal-200'
              }`}
            >
              {getInitials(entry.student.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 truncate">
                  {entry.student.name}
                </span>
                {isMe && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-700 text-white shrink-0">
                    Anda
                  </span>
                )}
                {entry.student.id.startsWith('demo-') && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white shrink-0">
                    DEMO
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    entry.student.kelas === 'Reguler 1'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-sky-50 text-sky-800'
                  }`}
                >
                  {entry.student.kelas}
                </span>
                <span className="text-[11px] text-slate-500">
                  {entry.student.gender}
                </span>
                {entry.student.kota && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400">
                    <MapPin className="w-2.5 h-2.5" />
                    {entry.student.kota}
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4 text-center tabular-nums">
          <div className="font-semibold text-slate-800">
            {entry.completedBabsCount} / {entry.totalBabsForClass} Bab
          </div>
          <div className="text-[10px] text-slate-400">
            {entry.passedBabsCount} lulus · {entry.setoranCount} setoran
          </div>
        </td>
        <td className="py-3 px-4 text-right tabular-nums font-semibold text-slate-700">
          {entry.avgScore !== null ? entry.avgScore : '—'}
        </td>
        <td className="py-3 px-4 text-right tabular-nums">
          {selectedBabId === 'all' ? (
            <span
              className={`text-sm font-bold ${
                entry.completedBabsCount > 0 ? 'text-slate-900' : 'text-slate-300'
              }`}
            >
              {entry.completedBabsCount > 0 ? entry.totalScore : '—'}
            </span>
          ) : entry.selectedBabScore !== null ? (
            <span className="text-sm font-bold text-slate-900">
              {entry.selectedBabScore}
            </span>
          ) : entry.selectedBabPartialSections > 0 ? (
            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              {entry.selectedBabPartialSections}/{SECTION_NUMBERS.length} Bagian
            </span>
          ) : (
            <span className="text-slate-300">—</span>
          )}
        </td>
        <td className="py-3 px-4 text-center">
          {!hasDisplayedScore ? (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
              Belum Ujian
            </span>
          ) : passing ? (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Lulus (KKM {PASSING_SCORE})
            </span>
          ) : (
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              Di Bawah KKM
            </span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Personal Standing Banner for Logged-in Student */}
      {!isSuperadmin && loggedInStudent && myRankingEntry?.entry && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <Trophy className="w-3.5 h-3.5" />
              Peringkat Anda di {loggedInStudent.kelas}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 pt-1">
              {loggedInStudent.name}
            </h2>
            <p className="text-xs text-slate-500">
              {myRankingEntry.entry.rank !== null
                ? `Posisi #${myRankingEntry.entry.rank} dari ${myRankingEntry.rankedInClass} siswa yang sudah memiliki nilai (total ${myRankingEntry.totalInClass} siswa).`
                : 'Anda belum memiliki nilai lengkap pada filter ini. Selesaikan ujian untuk masuk papan peringkat.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500">Peringkat</div>
              <div className="text-lg font-bold text-emerald-700 tabular-nums">
                {myRankingEntry.entry.rank !== null
                  ? `#${myRankingEntry.entry.rank}`
                  : '—'}
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500">
                {selectedBabId === 'all' ? 'Total Skor' : 'Nilai Bab'}
              </div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {selectedBabId === 'all'
                  ? myRankingEntry.entry.totalScore
                  : myRankingEntry.entry.selectedBabScore ?? '—'}
              </div>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
              <div className="text-[11px] text-slate-500">Rata-rata</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">
                {myRankingEntry.entry.avgScore ?? '—'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((entry, idx) => {
            const rankNum = entry.rank ?? idx + 1;
            const isFirst = rankNum === 1;
            const isSecond = rankNum === 2;
            const accentClass = isFirst
              ? 'border-amber-300 bg-amber-50/40'
              : isSecond
              ? 'border-slate-300 bg-slate-50/60'
              : 'border-orange-200 bg-orange-50/40';
            const mainScore =
              selectedBabId === 'all'
                ? entry.totalScore
                : entry.selectedBabScore ?? 0;

            return (
              <div
                key={entry.student.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 bg-white ${accentClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  {renderRankBadge(rankNum)}
                  <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                    {entry.completedBabsCount}/{entry.totalBabsForClass} Bab
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="text-base font-bold text-slate-900 truncate">
                      {entry.student.name}
                    </div>
                    {entry.student.id.startsWith('demo-') && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white shrink-0">
                        DEMO
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {entry.student.kelas} · {entry.student.gender}
                    {entry.student.kota ? ` · ${entry.student.kota}` : ''}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">
                      {selectedBabId === 'all' ? 'Total Skor: ' : 'Nilai Bab: '}
                    </span>
                    <strong className="text-base font-bold text-slate-900 tabular-nums">
                      {mainScore}
                    </strong>
                  </div>
                  <div className="text-slate-600 tabular-nums">
                    Rata-rata: <strong className="text-emerald-800">{entry.avgScore ?? '—'}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Bar & Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-6 py-4 border-b border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-700" />
                {isSuperadmin
                  ? `Papan Peringkat Siswa ${effectiveKelas}`
                  : `Peringkat Kelas ${effectiveKelas} (5 Besar)`}
                {activeBabMeta ? ` · ${activeBabMeta.kode}` : ' · Keseluruhan'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedBabId === 'all'
                  ? 'Urutan berdasarkan Total Skor akumulasi nilai terbaik tiap Bab, diikuti nilai rata-rata dan jumlah Bab lulus.'
                  : `Urutan berdasarkan nilai terbaik pada ${activeBabMeta?.kode} (${activeBabMeta?.wazanAr}).`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg tabular-nums">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                {isSuperadmin
                  ? `${scoredEntries.length} / ${fullRankedList.length} berperingkat`
                  : 'Menampilkan 5 Besar'}
              </span>
              {isSuperadmin && (
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh CSV
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Baris 1: Segmented Pill Filters untuk Kelas & Kelompok + Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              {isSuperadmin && <div
                role="group"
                aria-label="Filter Kelas Ranking"
                className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80"
              >
                {(
                  [
                    { value: 'Reguler 1', label: 'Reguler 1' },
                    { value: 'Reguler 2', label: 'Reguler 2' },
                  ] as const
                ).map((opt) => {
                  const active = kelasFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleChangeKelas(opt.value)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        active
                          ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>}

              {isSuperadmin && <div
                role="group"
                aria-label="Filter Kelompok Ranking"
                className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80"
              >
                {(
                  [
                    { value: 'Semua', label: 'Semua' },
                    { value: 'Ikhwan', label: 'Ikhwan' },
                    { value: 'Akhwat', label: 'Akhwat' },
                  ] as const
                ).map((opt) => {
                  const active = genderFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setGenderFilter(opt.value)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                        active
                          ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>}

              {/* Custom Categorized Bab Picker Dropdown */}
              <div ref={babDropdownRef} className="relative flex-1 min-w-[240px] sm:max-w-[340px]">
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={babMenuOpen}
                  onClick={() => setBabMenuOpen((v) => !v)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl border text-left transition-all ${
                    babMenuOpen
                      ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/15'
                      : 'bg-[#F8FAFC] border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    {activeBabMeta ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          {activeBabMeta.kode}
                        </span>
                        <span className="font-arabic text-base font-bold text-slate-900 shrink-0">
                          {activeBabMeta.wazanAr}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                          {activeBabMeta.wazanLatin}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        Peringkat Keseluruhan (Semua Bab)
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      babMenuOpen ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>

                {babMenuOpen && (
                  <div
                    role="listbox"
                    className="absolute left-0 mt-2 w-full sm:w-[420px] max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-2 space-y-2"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBabId('all');
                        setBabMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        selectedBabId === 'all'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-950'
                          : 'hover:bg-slate-50 border border-transparent text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
                          <Trophy className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">
                            Peringkat Keseluruhan (Semua Bab)
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Akumulasi total skor seluruh Bab pada kelas terpilih
                          </div>
                        </div>
                      </div>
                      {selectedBabId === 'all' && (
                        <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      )}
                    </button>

                    {groupedAvailableBabs.map((group) => (
                      <div key={group.kategori} className="space-y-1">
                        <div className="px-2.5 pt-1.5 pb-0.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>{group.kategori}</span>
                          <span>{group.items.length} Bab</span>
                        </div>
                        {group.items.map((bab) => {
                          const isSelected = selectedBabId === bab.id;
                          return (
                            <button
                              key={bab.id}
                              type="button"
                              onClick={() => {
                                setSelectedBabId(bab.id);
                                setBabMenuOpen(false);
                              }}
                              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                                isSelected
                                  ? 'bg-emerald-50 border border-emerald-200'
                                  : 'hover:bg-slate-50 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                                    isSelected
                                      ? 'bg-emerald-700 text-white border-emerald-700'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {bab.kode}
                                </span>
                                <span className="font-arabic text-lg font-bold text-slate-900 shrink-0 leading-none">
                                  {bab.wazanAr}
                                </span>
                                <span className="text-[11px] text-slate-500 truncate">
                                  {bab.wazanLatin}
                                </span>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pencarian Siswa (Superadmin) */}
              {isSuperadmin && (
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama siswa atau kota..."
                    className="w-full pl-8 pr-8 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Hapus pencarian"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-semibold text-slate-600">
                <th className="py-3 px-4 w-20">Peringkat</th>
                <th className="py-3 px-4 min-w-[210px]">Nama Siswa</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Progres Bab</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Rata-rata</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">
                  {selectedBabId === 'all' ? 'Total Skor' : 'Nilai Bab'}
                </th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status KKM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    {isSuperadmin
                      ? 'Tidak ada siswa yang sesuai dengan filter pencarian.'
                      : 'Belum ada siswa yang masuk 5 besar peringkat pada filter ini.'}
                  </td>
                </tr>
              ) : (
                visibleRows.map(renderStudentRow)
              )}
              {pinnedMyRow && (
                <>
                  <tr className="bg-slate-50/90">
                    <td
                      colSpan={6}
                      className="py-2 px-4 text-[11px] font-semibold text-slate-500 text-center"
                    >
                      {visibleRows.length > 0
                        ? 'Peringkat Anda Saat Ini (di luar 5 besar)'
                        : 'Peringkat Anda Saat Ini'}
                    </td>
                  </tr>
                  {renderStudentRow(pinnedMyRow)}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
