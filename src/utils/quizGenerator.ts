import {
  ALL_SHOROF_BABS,
  DHAMIR_14,
  MauzunVerb,
  SHIGHAT_LIST,
  ShorofBab,
} from '../data/shorofData';
import { CURATED_EXAM_QUESTIONS } from '../data/babExamBank';

export type ExamSectionNumber =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

export type TashrifType = 'istilahi' | 'lughawi';

export interface ExamSectionMeta {
  number: ExamSectionNumber;
  /** Jenis tashrif: istilahi (perubahan shighat) atau lughawi (perubahan dhamir) */
  tashrifType: TashrifType;
  /** Nomor bagian lokal 1-6 di dalam jenisnya */
  localNumber: number;
  /** Nama kelompok untuk ditampilkan di UI */
  groupName: string;
  shortLabel: string;
  title: string;
}

/**
 * 12 Bagian Ujian Per Bab:
 * - Tashrif Istilahi (Bagian 1-6): perubahan shighat (madhi, mudhari, mashdar, dst.)
 * - Tashrif Lughawi (Bagian 1-6): perubahan dhamir (14 dhamir & 6 dhamir amr)
 */
export const EXAM_SECTIONS: ExamSectionMeta[] = [
  // ===================== TASHRIF ISTILAHI (Bagian 1-6) =====================
  {
    number: 1,
    tashrifType: 'istilahi',
    localNumber: 1,
    groupName: 'Tashrif Istilahi',
    shortLabel: 'Istilahi · Bagian 1',
    title: 'Bagian 1: Transformasi Langsung (Tanpa Urutan)',
  },
  {
    number: 2,
    tashrifType: 'istilahi',
    localNumber: 2,
    groupName: 'Tashrif Istilahi',
    shortLabel: 'Istilahi · Bagian 2',
    title: 'Bagian 2: Identifikasi Shighat dan Akar Kata (Reverse Tasrif)',
  },
  {
    number: 3,
    tashrifType: 'istilahi',
    localNumber: 3,
    groupName: 'Tashrif Istilahi',
    shortLabel: 'Istilahi · Bagian 3',
    title: 'Bagian 3: Melengkapi Deret Tashrif yang Rumpang',
  },
  {
    number: 4,
    tashrifType: 'istilahi',
    localNumber: 4,
    groupName: 'Tashrif Istilahi',
    shortLabel: 'Istilahi · Bagian 4',
    title: 'Bagian 4: Penerapan Shighat dalam Kalimat Kontekstual',
  },
  {
    number: 5,
    tashrifType: 'istilahi',
    localNumber: 5,
    groupName: 'Tashrif Istilahi',
    shortLabel: 'Istilahi · Bagian 5',
    title: 'Bagian 5: Koreksi Kesalahan Pola (Analisis Wazan & Idgham)',
  },
  {
    number: 6,
    tashrifType: 'istilahi',
    localNumber: 6,
    groupName: 'Tashrif Istilahi',
    shortLabel: 'Istilahi · Bagian 6',
    title: 'Bagian 6: Ekstraksi dari Kalimat Sehari-hari',
  },
  // ====================== TASHRIF LUGHAWI (Bagian 1-6) =====================
  {
    number: 7,
    tashrifType: 'lughawi',
    localNumber: 1,
    groupName: 'Tashrif Lughawi',
    shortLabel: 'Lughawi · Bagian 1',
    title: "Bagian 1: Transformasi Langsung Tashrif Lughawi (Fi'il Madhi)",
  },
  {
    number: 8,
    tashrifType: 'lughawi',
    localNumber: 2,
    groupName: 'Tashrif Lughawi',
    shortLabel: 'Lughawi · Bagian 2',
    title: 'Bagian 2: Identifikasi Dhamir & Shighat (Reverse Tashrif Lughawi)',
  },
  {
    number: 9,
    tashrifType: 'lughawi',
    localNumber: 3,
    groupName: 'Tashrif Lughawi',
    shortLabel: 'Lughawi · Bagian 3',
    title: "Bagian 3: Melengkapi Deret Tashrif Lughawi Fi'il Madhi",
  },
  {
    number: 10,
    tashrifType: 'lughawi',
    localNumber: 4,
    groupName: 'Tashrif Lughawi',
    shortLabel: 'Lughawi · Bagian 4',
    title: "Bagian 4: Transformasi Langsung Tashrif Lughawi (Fi'il Mudhari')",
  },
  {
    number: 11,
    tashrifType: 'lughawi',
    localNumber: 5,
    groupName: 'Tashrif Lughawi',
    shortLabel: 'Lughawi · Bagian 5',
    title: "Bagian 5: Melengkapi Deret Tashrif Lughawi Fi'il Mudhari'",
  },
  {
    number: 12,
    tashrifType: 'lughawi',
    localNumber: 6,
    groupName: 'Tashrif Lughawi',
    shortLabel: 'Lughawi · Bagian 6',
    title: "Bagian 6: Transformasi Tashrif Lughawi Fi'il Amr (6 Dhamir)",
  },
];

export const ISTILAHI_SECTIONS: ExamSectionMeta[] = EXAM_SECTIONS.filter(
  (s) => s.tashrifType === 'istilahi'
);

export const LUGHAWI_SECTIONS: ExamSectionMeta[] = EXAM_SECTIONS.filter(
  (s) => s.tashrifType === 'lughawi'
);

export function getSectionMeta(
  number: number
): ExamSectionMeta | undefined {
  return EXAM_SECTIONS.find((s) => s.number === number);
}

export interface QuizQuestion {
  id: string;
  babId: string;
  babKode: string;
  sectionNumber?: ExamSectionNumber;
  sectionTitle?: string;
  promptId: string;
  arabicHighlight: string;
  arabicSubtext: string;
  options: {
    id: string;
    textAr: string;
    textSub?: string;
  }[];
  correctOptionId: string;
  explanation: string;
}

/** Dhamir raf' mutaharrik yang dipakai pada Fi'il Amr (Anta s.d. Antunna) */
const AMR_DHAMIR_INDICES = [6, 7, 8, 9, 10, 11];
/** Jendela 4 dhamir berurutan untuk deret lughawi rumpang */
const LUGHAWI_SEQUENCE_WINDOWS = [
  [0, 1, 2, 3],
  [6, 7, 8, 9],
  [10, 11, 12, 13],
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickBalancedFromPools(
  perVerbPools: QuizQuestion[][],
  count: number
): QuizQuestion[] {
  const queues = shuffleArray(perVerbPools).map((pool) => shuffleArray(pool));
  const picked: QuizQuestion[] = [];
  let progressed = true;
  while (picked.length < count && progressed) {
    progressed = false;
    for (const q of queues) {
      if (picked.length >= count) break;
      const item = q.pop();
      if (item) {
        picked.push(item);
        progressed = true;
      }
    }
  }
  return picked;
}

export function speakArabic(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis errors on unsupported browsers
  }
}

function getSectionTitle(num: number): string {
  return getSectionMeta(num)?.title || `Bagian ${num}`;
}

// ===========================================================================
// TASHRIF ISTILAHI (Bagian 1-6)
// ===========================================================================

const NON_MAJHUL_ISTILAHI_KEYS: (keyof MauzunVerb['istilahi'])[] = [
  'madhi',
  'mudhari',
  'mashdar',
  'isim_fail',
  'isim_maful',
  'fiil_amr',
  'fiil_nahyi',
  'isim_zaman_makan',
  'isim_alat',
];

const NON_MAJHUL_TARGET_KEYS: (keyof MauzunVerb['istilahi'])[] = [
  'mudhari',
  'mashdar',
  'isim_fail',
  'isim_maful',
  'fiil_amr',
  'fiil_nahyi',
  'isim_zaman_makan',
];

const NON_MAJHUL_SHIGHAT_LIST = SHIGHAT_LIST.filter(
  (s) => s.key !== 'madhi_majhul' && s.key !== 'mudhari_majhul'
);

function buildSection1Questions(bab: ShorofBab, count: number): QuizQuestion[] {
  const perVerbPools: QuizQuestion[][] = bab.mauzunList.map((verb) => {
    const pool: QuizQuestion[] = [];
    NON_MAJHUL_TARGET_KEYS.forEach((tKey) => {
      const answer = verb.istilahi[tKey];
      if (!answer || answer.startsWith('—')) return;
      const targetMeta = SHIGHAT_LIST.find((s) => s.key === tKey)!;

      const distractorPool = Array.from(
        new Set(
          NON_MAJHUL_ISTILAHI_KEYS.map((k) => verb.istilahi[k]).filter(
            (w) => w && !w.startsWith('—') && w !== answer
          )
        )
      );

      const distractors = shuffleArray(distractorPool).slice(0, 3);
      if (distractors.length < 3) return;

      pool.push({
        id: `s1-${verb.id}-${tKey}`,
        babId: bab.id,
        babKode: `${bab.kode} (${bab.wazanAr})`,
        sectionNumber: 1,
        sectionTitle: getSectionTitle(1),
        promptId: `Transformasikan langsung kata "${verb.istilahi.madhi}" (${verb.artiDasar}) ke bentuk ${targetMeta.labelId} (${targetMeta.functionDesc}):`,
        arabicHighlight: `${verb.istilahi.madhi}  ←  ${targetMeta.labelAr}`,
        arabicSubtext: `Tanpa mengurutkan tabel dari awal, langsung ubah ke ${targetMeta.labelId}`,
        options: shuffleArray([
          { id: 'correct', textAr: answer, textSub: targetMeta.labelAr },
          ...distractors.map((val, idx) => ({
            id: `wrong-${idx}`,
            textAr: val,
          })),
        ]),
        correctOptionId: 'correct',
        explanation: `Transformasi langsung dari ${verb.istilahi.madhi} ke ${targetMeta.labelId} mengikuti wazan ${bab.wazanIstilahi[tKey]} → ${answer}.`,
      });
    });

    return pool;
  });

  return pickBalancedFromPools(perVerbPools, count);
}

function buildSection2Questions(bab: ShorofBab, count: number): QuizQuestion[] {
  const perVerbPools: QuizQuestion[][] = bab.mauzunList.map((verb) => {
    const pool: QuizQuestion[] = [];
    const rootStr = verb.rootLetters.join(' - ');
    const swappedCandidates = Array.from(
      new Set([
        `${verb.rootLetters[0]} - ${verb.rootLetters[2]} - ${verb.rootLetters[1]}`,
        `${verb.rootLetters[1]} - ${verb.rootLetters[0]} - ${verb.rootLetters[2]}`,
        `${verb.rootLetters[2]} - ${verb.rootLetters[1]} - ${verb.rootLetters[0]}`,
        `${verb.rootLetters[1]} - ${verb.rootLetters[2]} - ${verb.rootLetters[0]}`,
      ])
    ).filter((r) => r !== rootStr);
    const swappedRoot1 = swappedCandidates[0] || `${verb.rootLetters[0]} - ${verb.rootLetters[1]} - م`;
    const swappedRoot2 = swappedCandidates[1] || swappedRoot1;

    NON_MAJHUL_TARGET_KEYS.forEach((sKey) => {
      const wordAr = verb.istilahi[sKey];
      if (!wordAr || wordAr.startsWith('—')) return;
      const meta = SHIGHAT_LIST.find((s) => s.key === sKey)!;
      const otherShighats = shuffleArray(
        NON_MAJHUL_SHIGHAT_LIST.filter(
          (s) => s.key !== sKey && verb.istilahi[s.key] !== wordAr
        )
      );
      if (otherShighats.length < 3) return;

      const distractorSpecs = [
        {
          textAr: otherShighats[0].labelId,
          textSub: `Akar: ${rootStr} · ${otherShighats[0].labelAr}`,
        },
        {
          textAr: otherShighats[1].labelId,
          textSub: `Akar: ${swappedRoot1} · ${otherShighats[1].labelAr}`,
        },
        {
          textAr: otherShighats[2].labelId,
          textSub: `Akar: ${swappedRoot2} · ${otherShighats[2].labelAr}`,
        },
      ];

      pool.push({
        id: `s2-${verb.id}-${sKey}`,
        babId: bab.id,
        babKode: `${bab.kode} (${bab.wazanAr})`,
        sectionNumber: 2,
        sectionTitle: getSectionTitle(2),
        promptId: 'Tentukan Shighat (jenis kata) dan 3 huruf Akar Kata (Reverse Tasrif) dari lafaz berikut:',
        arabicHighlight: wordAr,
        arabicSubtext: `Makna dasar: "${verb.artiDasar}" · ${bab.kode}`,
        options: shuffleArray([
          {
            id: 'correct',
            textAr: meta.labelId,
            textSub: `Akar: ${rootStr} · ${meta.labelAr}`,
          },
          ...distractorSpecs.map((d, idx) => ({
            id: `wrong-${idx}`,
            textAr: d.textAr,
            textSub: d.textSub,
          })),
        ]),
        correctOptionId: 'correct',
        explanation: `Lafaz ${wordAr} adalah ${meta.labelId} (${meta.functionDesc}) yang berasal dari 3 huruf akar kata (${rootStr}) mengikuti wazan ${bab.wazanIstilahi[sKey]}.`,
      });
    });

    return pool;
  });

  return pickBalancedFromPools(perVerbPools, count);
}

function buildSection3Questions(bab: ShorofBab, count: number): QuizQuestion[] {
  const istilahiOrder: (keyof MauzunVerb['istilahi'])[] = [
    'madhi',
    'mudhari',
    'mashdar',
    'isim_fail',
    'isim_maful',
    'fiil_amr',
    'fiil_nahyi',
    'isim_zaman_makan',
  ];

  const perVerbPools: QuizQuestion[][] = bab.mauzunList.map((verb) => {
    const pool: QuizQuestion[] = [];
    // Deret Tashrif Istilahi Rumpang (4 slot windows)
    for (let start = 0; start <= istilahiOrder.length - 4; start++) {
      const sliceKeys = istilahiOrder.slice(start, start + 4);
      const hasMissingPlaceholder = sliceKeys.some((k) =>
        verb.istilahi[k].startsWith('—')
      );
      if (hasMissingPlaceholder) continue;

      const gapPos = (start % 2) + 1; // index 1 or 2 inside the 4-item window
      const gapKey = sliceKeys[gapPos];
      const answer = verb.istilahi[gapKey];
      const gapMeta = SHIGHAT_LIST.find((s) => s.key === gapKey)!;

      const sequenceDisplay = sliceKeys
        .map((k, idx) => (idx === gapPos ? '[ ... ]' : verb.istilahi[k]))
        .join('  —  ');

      const distractors = shuffleArray(
        Array.from(
          new Set(
            NON_MAJHUL_ISTILAHI_KEYS.map((k) => verb.istilahi[k]).filter(
              (w) => w && !w.startsWith('—') && w !== answer
            )
          )
        )
      ).slice(0, 3);

      if (distractors.length < 3) continue;

      pool.push({
        id: `s3-ist-${verb.id}-${start}`,
        babId: bab.id,
        babKode: `${bab.kode} (${bab.wazanAr})`,
        sectionNumber: 3,
        sectionTitle: getSectionTitle(3),
        promptId: `Lengkapi deret Tashrif Istilahi yang rumpang berikut (posisi ${gapMeta.labelId}):`,
        arabicHighlight: sequenceDisplay,
        arabicSubtext: `Kata dasar: ${verb.istilahi.madhi} (${verb.artiDasar}) · Urutan ${sliceKeys.map((k) => SHIGHAT_LIST.find((s) => s.key === k)?.labelId).join(' → ')}`,
        options: shuffleArray([
          { id: 'correct', textAr: answer, textSub: gapMeta.labelAr },
          ...distractors.map((val, idx) => ({
            id: `wrong-${idx}`,
            textAr: val,
          })),
        ]),
        correctOptionId: 'correct',
        explanation: `Pada urutan Tashrif Istilahi tersebut, bagian yang rumpang adalah ${gapMeta.labelId} yaitu ${answer}.`,
      });
    }

    return pool;
  });

  return pickBalancedFromPools(perVerbPools, count);
}

function buildCuratedSectionQuestions(
  bab: ShorofBab,
  sectionNumber: 4 | 5 | 6,
  count: number
): QuizQuestion[] {
  const lookupBabId = bab.bankBabId || bab.id;
  const specs = CURATED_EXAM_QUESTIONS.filter(
    (q) => q.babId === lookupBabId && q.sectionNumber === sectionNumber
  );

  const selected = specs.length > count ? shuffleArray(specs).slice(0, count) : specs;

  return selected.map((spec) => ({
    id: spec.id,
    babId: bab.id,
    babKode: `${bab.kode} (${bab.wazanAr})`,
    sectionNumber,
    sectionTitle: getSectionTitle(sectionNumber),
    promptId: spec.promptId,
    arabicHighlight: spec.arabicHighlight,
    arabicSubtext: spec.arabicSubtext,
    options: shuffleArray(spec.options),
    correctOptionId: spec.correctOptionId,
    explanation: spec.explanation,
  }));
}

// ===========================================================================
// TASHRIF LUGHAWI (Bagian 7-12)
// ===========================================================================

function buildLughawiTransformQuestions(
  bab: ShorofBab,
  count: number,
  tense: 'madhi' | 'mudhari'
): QuizQuestion[] {
  const sectionNumber: ExamSectionNumber = tense === 'madhi' ? 7 : 10;
  const formsKey = tense === 'madhi' ? 'lughawiMadhi' : 'lughawiMudhari';
  const tenseLabel = tense === 'madhi' ? "Fi'il Madhi" : "Fi'il Mudhari'";

  const perVerbPools: QuizQuestion[][] = bab.mauzunList.map((verb) => {
    const pool: QuizQuestion[] = [];
    const forms = verb[formsKey];

    DHAMIR_14.forEach((dhamir, dIdx) => {
      const answer = forms[dIdx];
      if (!answer || answer.startsWith('—')) return;

      const distractors = shuffleArray(
        Array.from(new Set(forms.filter((v) => v && !v.startsWith('—') && v !== answer)))
      ).slice(0, 3);
      if (distractors.length < 3) return;

      pool.push({
        id: `s${sectionNumber}-${verb.id}-${dIdx}`,
        babId: bab.id,
        babKode: `${bab.kode} (${bab.wazanAr})`,
        sectionNumber,
        sectionTitle: getSectionTitle(sectionNumber),
        promptId: `Ubah ${tenseLabel} lughawi dari "${verb.istilahi[tense]}" (${verb.artiDasar}) untuk dhamir ${dhamir.dhamirLatin} (${dhamir.artiId}):`,
        arabicHighlight: `${verb.istilahi[tense]}  ←  ${dhamir.dhamirAr}`,
        arabicSubtext: `Target: ${dhamir.kategori} · ${bab.kode}`,
        options: shuffleArray([
          { id: 'correct', textAr: answer, textSub: dhamir.dhamirAr },
          ...distractors.map((val, idx) => ({
            id: `wrong-${idx}`,
            textAr: val,
          })),
        ]),
        correctOptionId: 'correct',
        explanation: `Bentuk ${tenseLabel} lughawi untuk dhamir ${dhamir.dhamirAr} (${dhamir.artiId}) dari ${verb.istilahi[tense]} adalah ${answer}.`,
      });
    });

    return pool;
  });

  return pickBalancedFromPools(perVerbPools, count);
}

function buildLughawiReverseQuestions(
  bab: ShorofBab,
  count: number
): QuizQuestion[] {
  const sectionNumber: ExamSectionNumber = 8;

  const perVerbPools: QuizQuestion[][] = bab.mauzunList.map((verb) => {
    const pool: QuizQuestion[] = [];
    const rootStr = verb.rootLetters.join(' - ');

    (['madhi', 'mudhari'] as const).forEach((tense) => {
      const forms = tense === 'madhi' ? verb.lughawiMadhi : verb.lughawiMudhari;
      const tenseLabel = tense === 'madhi' ? "Fi'il Madhi" : "Fi'il Mudhari'";

      DHAMIR_14.forEach((dhamir, dIdx) => {
        const form = forms[dIdx];
        if (!form || form.startsWith('—')) return;
        // Lewati bentuk yang sama dipakai lebih dari satu dhamir (ambigu)
        if (forms.filter((v) => v === form).length > 1) return;

        // Pilih distraktor dengan dhamirAr unik agar opsi tidak duplikat
        const seen = new Set<string>([dhamir.dhamirAr]);
        const distractors = shuffleArray(DHAMIR_14)
          .filter((d) => {
            if (d.id === dhamir.id || seen.has(d.dhamirAr)) return false;
            seen.add(d.dhamirAr);
            return true;
          })
          .slice(0, 3);
        if (distractors.length < 3) return;

        pool.push({
          id: `s8-${verb.id}-${tense}-${dIdx}`,
          babId: bab.id,
          babKode: `${bab.kode} (${bab.wazanAr})`,
          sectionNumber,
          sectionTitle: getSectionTitle(sectionNumber),
          promptId: `Lafaz berikut adalah bentuk ${tenseLabel} lughawi dari akar "${rootStr}" (${verb.artiDasar}). Tentukan dhamir-nya:`,
          arabicHighlight: form,
          arabicSubtext: `Pola lughawi ${tenseLabel} · ${bab.kode}`,
          options: shuffleArray([
            { id: 'correct', textAr: dhamir.dhamirAr, textSub: dhamir.kategori },
            ...distractors.map((d, idx) => ({
              id: `wrong-${idx}`,
              textAr: d.dhamirAr,
              textSub: d.kategori,
            })),
          ]),
          correctOptionId: 'correct',
          explanation: `Lafaz ${form} adalah ${tenseLabel} lughawi untuk dhamir ${dhamir.dhamirAr} (${dhamir.artiId}).`,
        });
      });
    });

    return pool;
  });

  return pickBalancedFromPools(perVerbPools, count);
}

function buildLughawiSequenceQuestions(
  bab: ShorofBab,
  count: number,
  tense: 'madhi' | 'mudhari'
): QuizQuestion[] {
  const sectionNumber: ExamSectionNumber = tense === 'madhi' ? 9 : 11;
  const formsKey = tense === 'madhi' ? 'lughawiMadhi' : 'lughawiMudhari';
  const tenseLabel = tense === 'madhi' ? "Fi'il Madhi" : "Fi'il Mudhari'";

  const perVerbPools: QuizQuestion[][] = bab.mauzunList.map((verb) => {
    const forms = verb[formsKey];
    const pool: QuizQuestion[] = [];
    const gapPos = 2;

    LUGHAWI_SEQUENCE_WINDOWS.forEach((indices, windowIdx) => {
      const targetDhamirIdx = indices[gapPos];
      const answer = forms[targetDhamirIdx];
      const targetDhamir = DHAMIR_14[targetDhamirIdx];
      if (!answer || answer.startsWith('—')) return;

      const sequenceDisplay = indices
        .map((dIdx, idx) => (idx === gapPos ? '[ ... ]' : forms[dIdx]))
        .join('  —  ');

      const distractors = shuffleArray(
        Array.from(new Set(forms.filter((v) => v && !v.startsWith('—') && v !== answer)))
      ).slice(0, 3);

      if (distractors.length < 3) return;

      pool.push({
        id: `s${sectionNumber}-${verb.id}-${windowIdx}`,
        babId: bab.id,
        babKode: `${bab.kode} (${bab.wazanAr})`,
        sectionNumber,
        sectionTitle: getSectionTitle(sectionNumber),
        promptId: `Lengkapi deret Tashrif Lughawi ${tenseLabel} yang rumpang berikut (dhamir ${targetDhamir.dhamirLatin}):`,
        arabicHighlight: sequenceDisplay,
        arabicSubtext: `Urutan dhamir: ${indices.map((i) => DHAMIR_14[i].dhamirLatin).join(' → ')}`,
        options: shuffleArray([
          { id: 'correct', textAr: answer, textSub: targetDhamir.dhamirAr },
          ...distractors.map((val, idx) => ({
            id: `wrong-${idx}`,
            textAr: val,
          })),
        ]),
        correctOptionId: 'correct',
        explanation: `Urutan dhamir ${targetDhamir.dhamirAr} (${targetDhamir.artiId}) dalam deret ${tenseLabel} lughawi tersebut adalah ${answer}.`,
      });
    });

    return pool;
  });

  return pickBalancedFromPools(perVerbPools, count);
}

function buildLughawiAmrQuestions(
  bab: ShorofBab,
  count: number
): QuizQuestion[] {
  const sectionNumber: ExamSectionNumber = 12;

  const perVerbPools: QuizQuestion[][] = bab.mauzunList.map((verb) => {
    const amrForms = verb.lughawiAmr;
    if (!amrForms || amrForms.length < AMR_DHAMIR_INDICES.length) return [];
    const pool: QuizQuestion[] = [];

    AMR_DHAMIR_INDICES.forEach((dIdx, i) => {
      const answer = amrForms[i];
      if (!answer || answer.startsWith('—')) return;
      const dhamir = DHAMIR_14[dIdx];

      const distractors = shuffleArray(
        Array.from(new Set(amrForms.filter((v) => v && !v.startsWith('—') && v !== answer)))
      ).slice(0, 3);
      if (distractors.length < 3) return;

      pool.push({
        id: `s12-${verb.id}-${i}`,
        babId: bab.id,
        babKode: `${bab.kode} (${bab.wazanAr})`,
        sectionNumber,
        sectionTitle: getSectionTitle(sectionNumber),
        promptId: `Ubah Fi'il Amr dari "${verb.istilahi.fiil_amr}" (${verb.artiDasar}) untuk dhamir ${dhamir.dhamirLatin} (${dhamir.artiId}):`,
        arabicHighlight: `${verb.istilahi.fiil_amr}  ←  ${dhamir.dhamirAr}`,
        arabicSubtext: `Target: ${dhamir.kategori} · ${bab.kode}`,
        options: shuffleArray([
          { id: 'correct', textAr: answer, textSub: dhamir.dhamirAr },
          ...distractors.map((val, idx) => ({
            id: `wrong-${idx}`,
            textAr: val,
          })),
        ]),
        correctOptionId: 'correct',
        explanation: `Fi'il Amr lughawi untuk dhamir ${dhamir.dhamirAr} (${dhamir.artiId}) dari ${verb.istilahi.fiil_amr} adalah ${answer}.`,
      });
    });

    return pool;
  });

  return pickBalancedFromPools(perVerbPools, count);
}

export function getExamQuestionCount(babId: string): number {
  const bab = ALL_SHOROF_BABS.find((b) => b.id === babId);
  return (bab?.questionsPerSection ?? 2) * EXAM_SECTIONS.length;
}

/**
 * Generates a structured per-Bab exam covering all 12 Bagian
 * (6 Bagian Tashrif Istilahi + 6 Bagian Tashrif Lughawi),
 * `questionsPerSection` per Bagian (e.g. 10x12 = 120 for Reguler 1 Bab 1).
 */
export function generateBabExamQuestions(babId: string): QuizQuestion[] {
  const bab = ALL_SHOROF_BABS.find((b) => b.id === babId) || ALL_SHOROF_BABS[0];
  const perSection = bab.questionsPerSection ?? 2;

  const istilahi = [
    ...buildSection1Questions(bab, perSection),
    ...buildSection2Questions(bab, perSection),
    ...buildSection3Questions(bab, perSection),
    ...buildCuratedSectionQuestions(bab, 4, perSection),
    ...buildCuratedSectionQuestions(bab, 5, perSection),
    ...buildCuratedSectionQuestions(bab, 6, perSection),
  ];

  const lughawi = [
    ...buildLughawiTransformQuestions(bab, perSection, 'madhi'),
    ...buildLughawiReverseQuestions(bab, perSection),
    ...buildLughawiSequenceQuestions(bab, perSection, 'madhi'),
    ...buildLughawiTransformQuestions(bab, perSection, 'mudhari'),
    ...buildLughawiSequenceQuestions(bab, perSection, 'mudhari'),
    ...buildLughawiAmrQuestions(bab, perSection),
  ];

  return [...istilahi, ...lughawi];
}

export function generateQuizQuestions(
  selectedBabId: string | 'all',
  mode: 'istilahi' | 'lughawi' | 'tebak_shighat',
  count = 8
): QuizQuestion[] {
  const targetBabs: ShorofBab[] =
    selectedBabId === 'all'
      ? ALL_SHOROF_BABS
      : ALL_SHOROF_BABS.filter((b) => b.id === selectedBabId);

  const pool: QuizQuestion[] = [];
  targetBabs.forEach((bab) => {
    const perSection = bab.questionsPerSection ?? 2;
    if (mode === 'istilahi') {
      pool.push(
        ...buildSection1Questions(bab, perSection),
        ...buildSection2Questions(bab, perSection),
        ...buildSection3Questions(bab, perSection)
      );
    } else if (mode === 'lughawi') {
      pool.push(
        ...buildLughawiTransformQuestions(bab, perSection, 'madhi'),
        ...buildLughawiReverseQuestions(bab, perSection),
        ...buildLughawiSequenceQuestions(bab, perSection, 'madhi'),
        ...buildLughawiTransformQuestions(bab, perSection, 'mudhari'),
        ...buildLughawiSequenceQuestions(bab, perSection, 'mudhari'),
        ...buildLughawiAmrQuestions(bab, perSection)
      );
    } else {
      pool.push(...buildSection2Questions(bab, perSection));
    }
  });

  return shuffleArray(pool).slice(0, count);
}
