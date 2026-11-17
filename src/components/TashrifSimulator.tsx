import React, { useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { getBabsForClass, SHIGHAT_LIST, DHAMIR_14 } from '../data/shorofData';
import type { StudentClass } from '../data/students';
import { speakArabic } from '../utils/quizGenerator';

export const TashrifSimulator: React.FC = () => {
  const [curriculumClass, setCurriculumClass] = useState<StudentClass>('Reguler 1');
  const activeBabs = useMemo(
    () => getBabsForClass(curriculumClass),
    [curriculumClass]
  );

  const [selectedBabId, setSelectedBabId] = useState<string>(activeBabs[0].id);
  const [selectedVerbId, setSelectedVerbId] = useState<string>(
    activeBabs[0].mauzunList[0].id
  );
  const [activeTab, setActiveTab] = useState<'istilahi' | 'lughawi'>('istilahi');
  const [highlightedDhamirIdx, setHighlightedDhamirIdx] = useState<number>(0);

  const activeBab =
    activeBabs.find((b) => b.id === selectedBabId) || activeBabs[0];
  const activeVerb =
    activeBab.mauzunList.find((v) => v.id === selectedVerbId) ||
    activeBab.mauzunList[0];

  const handleSelectCurriculum = (kelas: StudentClass) => {
    setCurriculumClass(kelas);
    const nextBabs = getBabsForClass(kelas);
    if (nextBabs.length > 0) {
      setSelectedBabId(nextBabs[0].id);
      setSelectedVerbId(nextBabs[0].mauzunList[0].id);
    }
  };

  const handleSelectBab = (babId: string) => {
    setSelectedBabId(babId);
    const bab = activeBabs.find((b) => b.id === babId);
    if (bab && bab.mauzunList.length > 0) {
      setSelectedVerbId(bab.mauzunList[0].id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Selector Bar: Bab Wazan & Kata Kerja (Mauzun) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
          <div className="text-xs font-semibold text-slate-700">
            Kurikulum Tashrif: <span className="text-emerald-700">{curriculumClass}</span> ({activeBabs.length} Bab)
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-[#F8FAFC] p-0.5">
            {(['Reguler 1', 'Reguler 2'] as StudentClass[]).map((kelas) => {
              const active = curriculumClass === kelas;
              return (
                <button
                  key={kelas}
                  type="button"
                  onClick={() => handleSelectCurriculum(kelas)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    active
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {kelas} ({kelas === 'Reguler 1' ? '14 Bab' : '9 Bab'})
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <div className="text-xs text-slate-500 mb-2">
              Pilih Bab Tashrif (Tsulatsi Mujarrod &amp; Tsulatsi Mazid)
            </div>
            <div className="flex flex-wrap gap-2">
              {activeBabs.map((bab) => {
                const isSelected = bab.id === activeBab.id;
                return (
                  <button
                    key={bab.id}
                    type="button"
                    onClick={() => handleSelectBab(bab.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{bab.kode}</span>
                    <span className="mx-1.5 opacity-50">·</span>
                    <span className="font-arabic text-base">{bab.wazanAr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="text-xs text-slate-500 mb-2">
              Pilih Kata Kerja (Mauzun) pada {activeBab.kode}
            </div>
            <div className="flex flex-wrap gap-2">
              {activeBab.mauzunList.map((verb) => {
                const isSelected = verb.id === activeVerb.id;
                return (
                  <button
                    key={verb.id}
                    type="button"
                    onClick={() => {
                      setSelectedVerbId(verb.id);
                      speakArabic(verb.istilahi.madhi);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-500'
                    }`}
                  >
                    <span className="font-arabic text-lg mr-2">
                      {verb.istilahi.madhi}
                    </span>
                    <span>({verb.artiDasar})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Anatomy Breakdown Strip */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              {activeBab.namaBab} · {activeBab.kaidahAinFiil}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-800">
              <span>
                Fa&apos; Fi&apos;il (ف):{' '}
                <strong className="font-arabic text-xl text-emerald-800 mx-1">
                  {activeVerb.rootLetters[0]}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                &apos;Ain Fi&apos;il (ع):{' '}
                <strong className="font-arabic text-xl text-emerald-800 mx-1">
                  {activeVerb.rootLetters[1]}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Lam Fi&apos;il (ل):{' '}
                <strong className="font-arabic text-xl text-emerald-800 mx-1">
                  {activeVerb.rootLetters[2]}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Arti Dasar: <strong>{activeVerb.artiDasar}</strong>
              </span>
            </div>
          </div>

          {/* Sub-mode Switcher: Istilahi vs Lughawi */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('istilahi')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'istilahi'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tashrif Istilahi (11 Shighat)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lughawi')}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'lughawi'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tashrif Lughawi (14 Dhamir)
            </button>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      {activeTab === 'istilahi' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tabel Perbandingan Wazan &amp; Mauzun (Tashrif Istilahi)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik pada baris kata bahasa Arab untuk mendengarkan pelafalan harakat secara jelas.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-600">
                  <th className="py-3.5 px-5 w-14 tabular-nums">No</th>
                  <th className="py-3.5 px-5">Nama Shighat</th>
                  <th className="py-3.5 px-5">Fungsi &amp; Makna</th>
                  <th className="py-3.5 px-5 text-right">Pola Wazan</th>
                  <th className="py-3.5 px-5 text-right">
                    Mauzun ({activeVerb.istilahi.madhi})
                  </th>
                  <th className="py-3.5 px-5 w-16 text-center">Suara</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {SHIGHAT_LIST.map((shighat, idx) => {
                  const wazanWord = activeBab.wazanIstilahi[shighat.key];
                  const mauzunWord = activeVerb.istilahi[shighat.key];
                  return (
                    <tr
                      key={shighat.key}
                      onClick={() => {
                        if (!mauzunWord.startsWith('—')) speakArabic(mauzunWord);
                      }}
                      className="hover:bg-slate-50/90 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-5 text-xs text-slate-400 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">
                          {shighat.labelId}
                        </div>
                        <div className="font-arabic text-base text-slate-500">
                          {shighat.labelAr}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600">
                        {shighat.functionDesc}
                      </td>
                      <td
                        dir="rtl"
                        className="py-3.5 px-5 text-right font-arabic text-2xl text-slate-600"
                      >
                        {wazanWord}
                      </td>
                      <td
                        dir="rtl"
                        className="py-3.5 px-5 text-right font-arabic text-2xl sm:text-3xl font-bold text-emerald-900"
                      >
                        {mauzunWord}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        {!mauzunWord.startsWith('—') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakArabic(mauzunWord);
                            }}
                            className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Putar audio"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tashrif Lughawi 14 Dhamir Interactive View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Tabel Tashrif Lughawi 14 Dhamir ({activeVerb.istilahi.madhi} — {activeVerb.artiDasar})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik baris dhamir mana saja untuk melihat rincian perubahan akhir kata dan mendengarkan bacaannya.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4 w-12 tabular-nums">No</th>
                    <th className="py-3 px-4">Dhamir</th>
                    <th className="py-3 px-4 text-right">Fi&apos;il Madhi</th>
                    <th className="py-3 px-4 text-right">Fi&apos;il Mudhari&apos;</th>
                    <th className="py-3 px-4 text-right">Fi&apos;il Amr</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {DHAMIR_14.map((d, idx) => {
                    const madhiWord = activeVerb.lughawiMadhi[idx];
                    const mudhariWord = activeVerb.lughawiMudhari[idx];
                    // Amr only applies to indices 6..11 (Anta .. Antunna)
                    const amrWord =
                      idx >= 6 && idx <= 11 ? activeVerb.lughawiAmr[idx - 6] : '—';
                    const isActive = highlightedDhamirIdx === idx;

                    return (
                      <tr
                        key={d.id}
                        onClick={() => {
                          setHighlightedDhamirIdx(idx);
                          speakArabic(`${d.dhamirAr} ${madhiWord} ${mudhariWord}`);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isActive ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-4 text-xs text-slate-400 tabular-nums">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="font-arabic text-2xl font-bold text-slate-900">
                              {d.dhamirAr}
                            </span>
                            <div>
                              <div className="text-xs font-semibold text-slate-800">
                                {d.dhamirLatin}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {d.artiId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          dir="rtl"
                          className="py-3 px-4 text-right font-arabic text-2xl font-bold text-slate-900"
                        >
                          {madhiWord}
                        </td>
                        <td
                          dir="rtl"
                          className="py-3 px-4 text-right font-arabic text-2xl font-bold text-emerald-900"
                        >
                          {mudhariWord}
                        </td>
                        <td
                          dir="rtl"
                          className="py-3 px-4 text-right font-arabic text-2xl font-bold text-slate-700"
                        >
                          {amrWord}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Inspection Card for Selected Dhamir */}
          <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 sticky top-20">
            <div className="text-xs text-slate-500 mb-1">
              Rincian Dhamir Terpilih (Baris {highlightedDhamirIdx + 1} dari 14)
            </div>
            <div className="flex items-baseline justify-between gap-4 pb-4 mb-4 border-b border-slate-200">
              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  {DHAMIR_14[highlightedDhamirIdx].dhamirLatin}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {DHAMIR_14[highlightedDhamirIdx].kategori} ·{' '}
                  {DHAMIR_14[highlightedDhamirIdx].artiId}
                </p>
              </div>
              <span className="font-arabic text-4xl font-bold text-emerald-800">
                {DHAMIR_14[highlightedDhamirIdx].dhamirAr}
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Fi&apos;il Madhi (Lampau)</div>
                  <div className="text-xs font-medium text-slate-700 mt-0.5">
                    {DHAMIR_14[highlightedDhamirIdx].artiId} telah{' '}
                    {activeVerb.artiDasar.toLowerCase()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speakArabic(activeVerb.lughawiMadhi[highlightedDhamirIdx])
                  }
                  className="font-arabic text-3xl font-bold text-slate-900 hover:text-emerald-700"
                >
                  {activeVerb.lughawiMadhi[highlightedDhamirIdx]}
                </button>
              </div>

              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">
                    Fi&apos;il Mudhari&apos; (Sekarang/Akan)
                  </div>
                  <div className="text-xs font-medium text-slate-700 mt-0.5">
                    {DHAMIR_14[highlightedDhamirIdx].artiId} sedang{' '}
                    {activeVerb.artiDasar.toLowerCase()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speakArabic(activeVerb.lughawiMudhari[highlightedDhamirIdx])
                  }
                  className="font-arabic text-3xl font-bold text-emerald-800 hover:text-emerald-600"
                >
                  {activeVerb.lughawiMudhari[highlightedDhamirIdx]}
                </button>
              </div>

              {highlightedDhamirIdx >= 6 && highlightedDhamirIdx <= 11 && (
                <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-emerald-800 font-medium">
                      Fi&apos;il Amr (Kata Perintah)
                    </div>
                    <div className="text-xs text-emerald-900 mt-0.5">
                      {activeVerb.artiDasar}lah ({DHAMIR_14[highlightedDhamirIdx].artiId})!
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      speakArabic(
                        activeVerb.lughawiAmr[highlightedDhamirIdx - 6]
                      )
                    }
                    className="font-arabic text-3xl font-bold text-emerald-900"
                  >
                    {activeVerb.lughawiAmr[highlightedDhamirIdx - 6]}
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
