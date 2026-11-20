import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  Check,
  Lock,
  LockOpen,
  ShieldCheck,
} from 'lucide-react';
import type { StudentClass } from '../data/students';
import { getBabsForClass, type ShorofBab } from '../data/shorofData';
import {
  ISTILAHI_SECTIONS,
  LUGHAWI_SECTIONS,
} from '../utils/quizGenerator';
import { SECTION_NUMBERS as SECTION_NUMBERS_LIST } from '../utils/babScores';
import {
  ExamAccessConfig,
  isBabOpen,
  isExamSectionOpen,
  isSectionOpen,
  sectionAccessKey,
  tashrifAccessKey,
  isBabWithinSemester1,
  type TashrifType,
} from '../utils/examAccess';

interface ExamAccessControlViewProps {
  examAccess: ExamAccessConfig;
  onUpdateExamAccess: (nextConfig: ExamAccessConfig) => Promise<void>;
  saving?: boolean;
}

export const ExamAccessControlView: React.FC<ExamAccessControlViewProps> = ({
  examAccess,
  onUpdateExamAccess,
  saving = false,
}) => {
  const [selectedClass, setSelectedClass] = useState<StudentClass>('Reguler 1');
  const [expandedBabId, setExpandedBabId] = useState<string | null>(null);
  const [isSemesterBabMenuOpen, setIsSemesterBabMenuOpen] = useState(false);

  const classBabs = useMemo(() => getBabsForClass(selectedClass), [selectedClass]);

  const groupedBabs = useMemo(() => {
    const groups: { kategori: ShorofBab['kategori']; items: ShorofBab[] }[] = [];
    classBabs.forEach((bab) => {
      const existing = groups.find((g) => g.kategori === bab.kategori);
      if (existing) existing.items.push(bab);
      else groups.push({ kategori: bab.kategori, items: [bab] });
    });
    return groups;
  }, [classBabs]);

  const openBabsCount = classBabs.filter((b) => isBabOpen(examAccess, b.id)).length;

  const handleSemester1EndBabChange = (babId: string) => {
    void onUpdateExamAccess({
      ...examAccess,
      semester1EndBabId: babId || undefined,
    });
  };

  const handleToggleTashrifType = (type: TashrifType) => {
    const key = tashrifAccessKey(selectedClass, type);
    void onUpdateExamAccess({
      babs: { ...examAccess.babs },
      sections: { ...examAccess.sections },
      tashrifTypes: { ...examAccess.tashrifTypes, [key]: examAccess.tashrifTypes[key] === false },
      semester1EndBabId: examAccess.semester1EndBabId,
    });
  };

  const handleToggleBab = (bab: ShorofBab) => {
    const currentlyOpen = isBabOpen(examAccess, bab.id);
    const nextBabs = { ...examAccess.babs, [bab.id]: !currentlyOpen };
    void onUpdateExamAccess({
      babs: nextBabs,
      sections: { ...examAccess.sections },
      tashrifTypes: { ...examAccess.tashrifTypes },
      semester1EndBabId: examAccess.semester1EndBabId,
    });
  };

  const handleToggleAllBabsInClass = (open: boolean) => {
    const nextBabs = { ...examAccess.babs };
    const nextSections = { ...examAccess.sections };
    classBabs.forEach((bab) => {
      nextBabs[bab.id] = open;
      if (bab.sectionedExam) {
        SECTION_NUMBERS_LIST.forEach((n) => {
          nextSections[sectionAccessKey(bab.id, n)] = open;
        });
      }
    });
    void onUpdateExamAccess({ babs: nextBabs, sections: nextSections, tashrifTypes: { ...examAccess.tashrifTypes }, semester1EndBabId: examAccess.semester1EndBabId });
  };

  const handleToggleSection = (babId: string, sectionNumber: number) => {
    const currentlyOpen = isSectionOpen(examAccess, babId, sectionNumber);
    const nextBabs = { ...examAccess.babs };
    if (!currentlyOpen && !isBabOpen(examAccess, babId)) {
      nextBabs[babId] = true;
    }
    const nextSections = {
      ...examAccess.sections,
      [sectionAccessKey(babId, sectionNumber)]: !currentlyOpen,
    };
    void onUpdateExamAccess({ babs: nextBabs, sections: nextSections, tashrifTypes: { ...examAccess.tashrifTypes }, semester1EndBabId: examAccess.semester1EndBabId });
  };

  const handleToggleAllSectionsForBab = (babId: string, open: boolean) => {
    const nextBabs = { ...examAccess.babs, [babId]: open };
    const nextSections = { ...examAccess.sections };
    SECTION_NUMBERS_LIST.forEach((n) => {
      nextSections[sectionAccessKey(babId, n)] = open;
    });
    void onUpdateExamAccess({ babs: nextBabs, sections: nextSections, tashrifTypes: { ...examAccess.tashrifTypes }, semester1EndBabId: examAccess.semester1EndBabId });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Akses Tasrif Ujian Per Bab</h2>
            <p className="text-xs text-slate-500 mt-1">Pengaturan berlaku untuk semua bab di kelas terpilih.</p>
          </div>
          <div role="group" aria-label="Pilih kelas akses tasrif" className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200">
            {(['Reguler 1', 'Reguler 2'] as const).map((kelas) => (
              <button key={kelas} type="button" onClick={() => setSelectedClass(kelas)} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${selectedClass === kelas ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'}`}>
                {kelas}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            { type: 'istilahi', label: 'Tashrif Istilahi', sections: 'Bagian 1–6' },
            { type: 'lughawi', label: 'Tashrif Lughawi', sections: 'Bagian 7–12' },
          ] as const).map(({ type, label, sections }) => {
            const open = examAccess.tashrifTypes[tashrifAccessKey(selectedClass, type)] !== false;
            return (
              <div key={type} className="flex items-center justify-between gap-3 border border-slate-200 rounded-lg p-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{sections}</div>
                </div>
                <button type="button" disabled={saving} onClick={() => handleToggleTashrifType(type)} aria-pressed={open} className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border disabled:opacity-50 ${open ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100' : 'text-white bg-emerald-700 border-emerald-700 hover:bg-emerald-800'}`}>
                  {open ? <><Lock className="w-3.5 h-3.5" /> Kunci</> : <><LockOpen className="w-3.5 h-3.5" /> Buka</>}
                </button>
              </div>
            );
          })}
        </div>
        {saving && <div className="text-xs text-emerald-700 font-semibold">Menyimpan perubahan...</div>}
      </div>

      {selectedClass === 'Reguler 1' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <label htmlFor="semester1-end-bab" className="block text-sm font-bold text-slate-900">Batas Bab Ujian Semester 1</label>
          <p className="text-xs text-slate-500 mt-1 mb-3">Peserta hanya dapat mengerjakan ujian sampai bab yang dipilih, termasuk bab tersebut.</p>
          <div className="relative w-full sm:max-w-md">
            <button
              id="semester1-end-bab"
              type="button"
              disabled={saving}
              aria-haspopup="listbox"
              aria-expanded={isSemesterBabMenuOpen}
              onClick={() => setIsSemesterBabMenuOpen((open) => !open)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setIsSemesterBabMenuOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-left shadow-sm transition hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Batas materi</span>
                <span className="mt-0.5 block truncate text-sm font-semibold text-slate-900">
                  {examAccess.semester1EndBabId
                    ? (() => {
                        const selectedBab = classBabs.find((bab) => bab.id === examAccess.semester1EndBabId);
                        return selectedBab ? `${selectedBab.kode} · ${selectedBab.wazanLatin}` : 'Semua bab (tanpa batas)';
                      })()
                    : 'Semua bab (tanpa batas)'}
                </span>
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isSemesterBabMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSemesterBabMenuOpen && (
              <>
                <button type="button" aria-label="Tutup daftar batas bab" className="fixed inset-0 z-10 cursor-default" onClick={() => setIsSemesterBabMenuOpen(false)} />
                <div role="listbox" aria-labelledby="semester1-end-bab" className="absolute z-20 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                  <button
                    type="button"
                    role="option"
                    aria-selected={!examAccess.semester1EndBabId}
                    onClick={() => { handleSemester1EndBabChange(''); setIsSemesterBabMenuOpen(false); }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${!examAccess.semester1EndBabId ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span><span className="block font-semibold">Semua bab</span><span className="mt-0.5 block text-xs text-slate-500">Tanpa batas materi</span></span>
                    {!examAccess.semester1EndBabId && <Check className="h-4 w-4 text-emerald-700" />}
                  </button>
                  <div className="my-1.5 border-t border-slate-100" />
                  {classBabs.map((bab) => {
                    const selected = examAccess.semester1EndBabId === bab.id;
                    return (
                      <button
                        key={bab.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => { handleSemester1EndBabChange(bab.id); setIsSemesterBabMenuOpen(false); }}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition ${selected ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className={`flex h-7 w-12 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${selected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{bab.kode}</span>
                          <span className="truncate text-sm font-medium">{bab.wazanLatin}</span>
                        </span>
                        {selected && <Check className="h-4 w-4 shrink-0 text-emerald-700" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Control Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Kontrol Akses Ujian
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Pengaturan Buka &amp; Tutup Soal ({selectedClass})
          </h2>
          <p className="text-xs text-slate-500">
            Soal yang ditutup tidak dapat dibuka maupun dikerjakan oleh peserta. Bagian yang sudah selesai tetap dapat dilihat pembahasannya.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="Pilih Kelas Kontrol Akses"
            className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80"
          >
            {(['Reguler 1', 'Reguler 2'] as const).map((kelas) => {
              const active = selectedClass === kelas;
              return (
                <button
                  key={kelas}
                  type="button"
                  onClick={() => setSelectedClass(kelas)}
                  className={`py-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {kelas}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={saving || classBabs.length === 0}
            onClick={() => handleToggleAllBabsInClass(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg transition-colors"
          >
            <LockOpen className="w-3.5 h-3.5" />
            Buka Semua {selectedClass}
          </button>

          <button
            type="button"
            disabled={saving || classBabs.length === 0}
            onClick={() => handleToggleAllBabsInClass(false)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            Tutup Semua {selectedClass}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Status aktif <strong className="text-slate-900">{selectedClass}</strong>:{' '}
          <strong className="text-emerald-700 tabular-nums">
            {openBabsCount} / {classBabs.length} Bab terbuka
          </strong>
        </span>
        {saving && <span className="text-emerald-700 font-semibold">Menyimpan perubahan...</span>}
      </div>

      {/* Bab Groups */}
      <div className="space-y-8">
        {groupedBabs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-1.5">
            <div className="text-sm font-bold text-slate-800">
              Belum Ada Soal Ujian untuk {selectedClass}
            </div>
            <p className="text-xs text-slate-500">
              Soal ujian saat ini hanya tersedia untuk kelas Reguler 1.
            </p>
          </div>
        ) : (
        groupedBabs.map((group) => (
          <div key={group.kategori} className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">{group.kategori}</h3>
              <span className="text-[11px] text-slate-500 tabular-nums">
                {group.items.length} Bab
              </span>
            </div>

            <div className="space-y-3">
              {group.items.map((bab) => {
                const withinSemester = isBabWithinSemester1(examAccess, selectedClass, bab.id);
                const babOpen = isBabOpen(examAccess, bab.id) && withinSemester;
                const openSectionCount = bab.sectionedExam
                  ? SECTION_NUMBERS_LIST.filter((n) => isSectionOpen(examAccess, bab.id, n))
                      .length
                  : 0;
                const isExpanded = expandedBabId === bab.id;

                return (
                  <div
                    key={bab.id}
                    className={`bg-white border rounded-xl p-5 transition-colors ${
                      babOpen ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            {bab.kode}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              babOpen
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {babOpen ? (
                              <>
                                <LockOpen className="w-3 h-3" />
                                Dibuka
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                Ditutup
                              </>
                            )}
                          </span>
                          {bab.sectionedExam && (
                            <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                              {openSectionCount} / {SECTION_NUMBERS_LIST.length} Bagian dibuka
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-baseline gap-2.5 pt-1">
                          <span className="font-arabic text-2xl font-bold text-slate-900">
                            {bab.wazanAr}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">
                            {bab.namaBab}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {bab.sectionedExam && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBabId((prev) => (prev === bab.id ? null : bab.id))
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                          >
                            <span>Atur 12 Bagian</span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleToggleBab(bab)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                            babOpen
                              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                              : 'text-white bg-emerald-700 hover:bg-emerald-800'
                          }`}
                        >
                          {babOpen ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              Tutup Akses Bab
                            </>
                          ) : (
                            <>
                              <LockOpen className="w-3.5 h-3.5" />
                              Buka Akses Bab
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Section-level controls */}
                    {bab.sectionedExam && isExpanded && (
                      <div className="mt-5 pt-4 border-t border-slate-200 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            Kontrol Akses Per Bagian (12 Bagian)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => handleToggleAllSectionsForBab(bab.id, true)}
                              className="px-3 py-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                            >
                              Buka Semua Bagian
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => handleToggleAllSectionsForBab(bab.id, false)}
                              className="px-3 py-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                            >
                              Tutup Semua Bagian
                            </button>
                          </div>
                        </div>

                        {(
                          [
                            {
                              key: 'istilahi',
                              label: 'A. Tashrif Istilahi (Bagian 1–6)',
                              sections: ISTILAHI_SECTIONS,
                            },
                            {
                              key: 'lughawi',
                              label: 'B. Tashrif Lughawi (Bagian 1–6)',
                              sections: LUGHAWI_SECTIONS,
                            },
                          ] as const
                        ).map((secGroup) => (
                          <div key={secGroup.key} className="space-y-2">
                            <div className="text-[11px] font-bold text-emerald-800">
                              {secGroup.label}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {secGroup.sections.map((sec) => {
                                const open = isExamSectionOpen(examAccess, selectedClass, bab.id, sec.number);
                                return (
                                  <button
                                    key={sec.number}
                                    type="button"
                                    disabled={saving}
                                    onClick={() => handleToggleSection(bab.id, sec.number)}
                                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                                      open
                                        ? 'bg-[#F8FAFC] border-slate-200 hover:border-emerald-300'
                                        : 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <div className="text-[11px] font-bold text-slate-700">
                                        Bagian {sec.localNumber}
                                      </div>
                                      <div className="text-xs font-medium text-slate-600 truncate">
                                        {sec.title.replace(/^Bagian \d+:\s*/, '')}
                                      </div>
                                    </div>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 border ${
                                        open
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          : 'bg-white text-rose-700 border-rose-200'
                                      }`}
                                    >
                                      {open ? (
                                        <>
                                          <LockOpen className="w-3 h-3" />
                                          Buka
                                        </>
                                      ) : (
                                        <>
                                          <Lock className="w-3 h-3" />
                                          Tutup
                                        </>
                                      )}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
};
