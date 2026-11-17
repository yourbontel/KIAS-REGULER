import {
  ALL_SHOROF_BABS,
  DHAMIR_14,
  MauzunVerb,
  SHIGHAT_LIST,
  ShorofBab,
} from '../data/shorofData';
import { CURATED_EXAM_QUESTIONS } from '../data/babExamBank';

export type ExamSectionNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface ExamSectionMeta {
  number: ExamSectionNumber;
  shortLabel: string;
  title: string;
}

export const EXAM_SECTIONS: ExamSectionMeta[] = [
  {
    number: 1,
    shortLabel: 'Bagian 1',
    title: 'Bagian 1: Transformasi Langsung (Tanpa Urutan)',
  },
  {
    number: 2,
    shortLabel: 'Bagian 2',
    title: 'Bagian 2: Identifikasi Shighat dan Akar Kata (Reverse Tasrif)',
  },
  {
    number: 3,
    shortLabel: 'Bagian 3',
    title: 'Bagian 3: Melengkapi Deret Tasrif yang Rumpang',
  },
  {
    number: 4,
    shortLabel: 'Bagian 4',
    title: 'Bagian 4: Penerapan Shighat dalam Kalimat Kontekstual',
  },
  {
    number: 5,
    shortLabel: 'Bagian 5',
    title: 'Bagian 5: Koreksi Kesalahan Pola (Analisis Wazan & Idgham)',
  },
  {
    number: 6,
    shortLabel: 'Bagian 6',
    title: 'Bagian 6: Ekstraksi dari Kalimat Sehari-hari',
  },
];

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

function getSectionTitle(num: ExamSectionNumber): string {
  return EXAM_SECTIONS.find((s) => s.number === num)?.title || `Bagian ${num}`;
}

function buildSection1Questions(bab: ShorofBab, count: number): QuizQuestion[] {
  const targetKeys: (keyof MauzunVerb['istilahi'])[] = [
    'mudhari',
    'mashdar',
    'isim_fail',
    'isim_maful',
    'fiil_amr',
    'fiil_nahyi',
    'isim_zaman_makan',
    'madhi_majhul',
    'mudhari_majhul',
  ];

  const perVerbPools: QuizQuestion[][] = bab.mauzunList.map((verb) => {
    const pool: QuizQuestion[] = [];
    targetKeys.forEach((tKey) => {
      const answer = verb.istilahi[tKey];
      if (!answer || answer.startsWith('—')) return;
      const targetMeta = SHIGHAT_LIST.find((s) => s.key === tKey)!;

      const distractorPool = Array.from(
        new Set(
          [
            ...Object.values(verb.istilahi),
            ...verb.lughawiMadhi.slice(1, 5),
            ...verb.lughawiMudhari.slice(1, 5),
          ].filter((w) => w && !w.startsWith('—') && w !== answer)
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

    // Also include direct dhamir transformation
    [2, 5, 8, 13].forEach((dIdx) => {
      const dhamir = DHAMIR_14[dIdx];
      const answer = verb.lughawiMudhari[dIdx];
      const distractors = shuffleArray(
        Array.from(new Set(verb.lughawiMudhari.filter((v) => v !== answer)))
      ).slice(0, 3);
      if (distractors.length < 3) return;

      pool.push({
        id: `s1-lug-${verb.id}-${dIdx}`,
        babId: bab.id,
        babKode: `${bab.kode} (${bab.wazanAr})`,
        sectionNumber: 1,
        sectionTitle: getSectionTitle(1),
        promptId: `Ubah langsung Fi'il Mudhari' "${verb.istilahi.mudhari}" untuk dhamir ${dhamir.dhamirLatin} (${dhamir.artiId}):`,
        arabicHighlight: `${verb.istilahi.mudhari}  ←  ${dhamir.dhamirAr}`,
        arabicSubtext: `Target: ${dhamir.kategori}`,
        options: shuffleArray([
          { id: 'correct', textAr: answer },
          ...distractors.map((val, idx) => ({
            id: `wrong-${idx}`,
            textAr: val,
          })),
        ]),
        correctOptionId: 'correct',
        explanation: `Bentuk Fi'il Mudhari' langsung untuk dhamir ${dhamir.dhamirAr} (${dhamir.artiId}) dari ${verb.istilahi.mudhari} adalah ${answer}.`,
      });
    });

    return pool;
  });

  return pickBalancedFromPools(perVerbPools, count);
}

function buildSection2Questions(bab: ShorofBab, count: number): QuizQuestion[] {
  const keys: (keyof MauzunVerb['istilahi'])[] = [
    'mudhari',
    'mashdar',
    'isim_fail',
    'isim_maful',
    'fiil_amr',
    'fiil_nahyi',
    'isim_zaman_makan',
    'madhi_majhul',
    'mudhari_majhul',
  ];

  const perVerbPools: QuizQuestion[][] = bab.mauzunList.map((verb) => {
    const pool: QuizQuestion[] = [];
    const rootStr = verb.rootLetters.join(' - ');
    const swappedRoot1 = `${verb.rootLetters[0]} - ${verb.rootLetters[2]} - ${verb.rootLetters[1]}`;
    const swappedRoot2 = `${verb.rootLetters[1]} - ${verb.rootLetters[0]} - ${verb.rootLetters[2]}`;

    keys.forEach((sKey) => {
      const wordAr = verb.istilahi[sKey];
      if (!wordAr || wordAr.startsWith('—')) return;
      const meta = SHIGHAT_LIST.find((s) => s.key === sKey)!;
      const otherShighats = shuffleArray(
        SHIGHAT_LIST.filter((s) => s.key !== sKey)
      );

      const distractorSpecs = [
        {
          textAr: otherShighats[0].labelId,
          textSub: `Akar: ${rootStr} · ${otherShighats[0].labelAr}`,
        },
        {
          textAr: meta.labelId,
          textSub: `Akar: ${swappedRoot1} · ${meta.labelAr}`,
        },
        {
          textAr: otherShighats[1].labelId,
          textSub: `Akar: ${swappedRoot2} · ${otherShighats[1].labelAr}`,
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
    // 1. Deret Tashrif Istilahi Rumpang (4 slot windows)
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
            [
              ...Object.values(verb.istilahi),
              ...verb.lughawiMadhi.slice(1, 4),
            ].filter((w) => w && !w.startsWith('—') && w !== answer)
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

    // 2. Deret Tashrif Lughawi Rumpang (4 dhamir berurutan)
    [
      [0, 1, 2, 3],
      [6, 7, 8, 9],
      [10, 11, 12, 13],
    ].forEach((indices, windowIdx) => {
      const gapPos = 2;
      const targetDhamirIdx = indices[gapPos];
      const answer = verb.lughawiMadhi[targetDhamirIdx];
      const targetDhamir = DHAMIR_14[targetDhamirIdx];

      const sequenceDisplay = indices
        .map((dIdx, idx) =>
          idx === gapPos ? '[ ... ]' : verb.lughawiMadhi[dIdx]
        )
        .join('  —  ');

      const distractors = shuffleArray(
        Array.from(new Set(verb.lughawiMadhi.filter((v) => v !== answer)))
      ).slice(0, 3);

      if (distractors.length < 3) return;

      pool.push({
        id: `s3-lug-${verb.id}-${windowIdx}`,
        babId: bab.id,
        babKode: `${bab.kode} (${bab.wazanAr})`,
        sectionNumber: 3,
        sectionTitle: getSectionTitle(3),
        promptId: `Lengkapi deret Tashrif Lughawi Fi'il Madhi yang rumpang berikut (dhamir ${targetDhamir.dhamirLatin}):`,
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
        explanation: `Urutan dhamir ${targetDhamir.dhamirAr} (${targetDhamir.artiId}) dalam deret tersebut adalah ${answer}.`,
      });
    });

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

export function getExamQuestionCount(babId: string): number {
  const bab = ALL_SHOROF_BABS.find((b) => b.id === babId);
  return (bab?.questionsPerSection ?? 2) * EXAM_SECTIONS.length;
}

/**
 * Generates a structured per-Bab exam covering all 6 Bagian
 * (questionsPerSection per Bagian, e.g. 10x6 = 60 for Reguler 1 Bab 1, 2x6 = 12 for others).
 */
export function generateBabExamQuestions(babId: string): QuizQuestion[] {
  const bab = ALL_SHOROF_BABS.find((b) => b.id === babId) || ALL_SHOROF_BABS[0];
  const perSection = bab.questionsPerSection ?? 2;

  const s1 = buildSection1Questions(bab, perSection);
  const s2 = buildSection2Questions(bab, perSection);
  const s3 = buildSection3Questions(bab, perSection);
  const s4 = buildCuratedSectionQuestions(bab, 4, perSection);
  const s5 = buildCuratedSectionQuestions(bab, 5, perSection);
  const s6 = buildCuratedSectionQuestions(bab, 6, perSection);

  return [...s1, ...s2, ...s3, ...s4, ...s5, ...s6];
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
    if (mode === 'istilahi') pool.push(...buildSection1Questions(bab, perSection));
    else if (mode === 'lughawi') pool.push(...buildSection3Questions(bab, perSection));
    else pool.push(...buildSection2Questions(bab, perSection));
  });

  return shuffleArray(pool).slice(0, count);
}
