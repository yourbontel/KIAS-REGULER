import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
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
  isSectionOpen,
  sectionAccessKey,
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

  const handleToggleBab = (bab: ShorofBab) => {
    const currentlyOpen = isBabOpen(examAccess, bab.id);
    const nextBabs = { ...examAccess.babs, [bab.id]: !currentlyOpen };
    void onUpdateExamAccess({
      babs: nextBabs,
      sections: { ...examAccess.sections },
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
    void onUpdateExamAccess({ babs: nextBabs, sections: nextSections });
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
    void onUpdateExamAccess({ babs: nextBabs, sections: nextSections });
  };

  const handleToggleAllSectionsForBab = (babId: string, open: boolean) => {
    const nextBabs = { ...examAccess.babs, [babId]: open };
    const nextSections = { ...examAccess.sections };
    SECTION_NUMBERS_LIST.forEach((n) => {
      nextSections[sectionAccessKey(babId, n)] = open;
    });
    void onUpdateExamAccess({ babs: nextBabs, sections: nextSections });
  };

  return (
    <div className="space-y-6">
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
                const babOpen = isBabOpen(examAccess, bab.id);
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
                                const open = isSectionOpen(examAccess, bab.id, sec.number);
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
