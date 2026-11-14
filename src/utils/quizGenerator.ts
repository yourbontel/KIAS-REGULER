import { DHAMIR_14, MauzunVerb, SHIGHAT_LIST, SHOROF_BABS, ShorofBab } from '../data/shorofData';

export interface QuizQuestion {
  id: string;
  babId: string;
  babKode: string;
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

export function generateQuizQuestions(
  selectedBabId: string | 'all',
  mode: 'istilahi' | 'lughawi' | 'tebak_shighat',
  count = 8
): QuizQuestion[] {
  const targetBabs: ShorofBab[] =
    selectedBabId === 'all'
      ? SHOROF_BABS
      : SHOROF_BABS.filter((b) => b.id === selectedBabId);

  const allVerbs: { bab: ShorofBab; verb: MauzunVerb }[] = [];
  targetBabs.forEach((bab) => {
    bab.mauzunList.forEach((verb) => {
      allVerbs.push({ bab, verb });
    });
  });

  const pool: QuizQuestion[] = [];

  if (mode === 'istilahi') {
    const testableKeys: (keyof MauzunVerb['istilahi'])[] = [
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

    allVerbs.forEach(({ bab, verb }) => {
      testableKeys.forEach((shighatKey) => {
        const answer = verb.istilahi[shighatKey];
        if (!answer || answer.startsWith('—')) return;

        const shighatMeta = SHIGHAT_LIST.find((s) => s.key === shighatKey)!;
        const otherForms = testableKeys
          .filter((k) => k !== shighatKey && !verb.istilahi[k].startsWith('—'))
          .map((k) => ({
            key: k,
            val: verb.istilahi[k],
            label: SHIGHAT_LIST.find((s) => s.key === k)?.labelId || '',
          }));

        const distractors = shuffleArray(otherForms)
          .filter((d) => d.val !== answer)
          .slice(0, 3);

        const options = shuffleArray([
          { id: 'correct', textAr: answer, textSub: shighatMeta.labelAr },
          ...distractors.map((d, idx) => ({
            id: `wrong-${idx}`,
            textAr: d.val,
            textSub: SHIGHAT_LIST.find((s) => s.key === d.key)?.labelAr,
          })),
        ]);

        pool.push({
          id: `ist-${verb.id}-${shighatKey}`,
          babId: bab.id,
          babKode: `${bab.kode} (${bab.wazanAr})`,
          promptId: `Manakah bentuk ${shighatMeta.labelId} (${shighatMeta.functionDesc}) dari kata kerja berikut?`,
          arabicHighlight: `${verb.istilahi.madhi} — ${verb.istilahi.mudhari}`,
          arabicSubtext: `Akar kata: ${verb.rootLetters.join(' - ')} · Arti dasar: "${verb.artiDasar}"`,
          options,
          correctOptionId: 'correct',
          explanation: `Pada ${bab.kode} (${bab.wazanAr}), bentuk ${shighatMeta.labelId} mengikuti wazan ${bab.wazanIstilahi[shighatKey]} sehingga menjadi ${answer}.`,
        });
      });
    });
  } else if (mode === 'lughawi') {
    allVerbs.forEach(({ bab, verb }) => {
      // Madhi questions across key dhamirs
      const dhamirIndices = [0, 1, 2, 3, 5, 6, 8, 9, 11, 12, 13];
      dhamirIndices.forEach((dIdx) => {
        const dhamir = DHAMIR_14[dIdx];
        const correctMadhi = verb.lughawiMadhi[dIdx];
        const otherMadhi = shuffleArray(
          verb.lughawiMadhi
            .map((val, idx) => ({ val, idx }))
            .filter((item) => item.val !== correctMadhi)
        ).slice(0, 3);

        pool.push({
          id: `lug-madhi-${verb.id}-${dIdx}`,
          babId: bab.id,
          babKode: `${bab.kode} · Tashrif Lughawi Madhi`,
          promptId: `Ubahlah Fi'il Madhi berikut ke dalam dhamir ${dhamir.dhamirLatin} (${dhamir.artiId}):`,
          arabicHighlight: `${dhamir.dhamirAr} + ${verb.istilahi.madhi}`,
          arabicSubtext: `Kategori: ${dhamir.kategori} · Arti: "${verb.artiDasar}"`,
          options: shuffleArray([
            { id: 'correct', textAr: correctMadhi },
            ...otherMadhi.map((o, idx) => ({
              id: `wrong-${idx}`,
              textAr: o.val,
            })),
          ]),
          correctOptionId: 'correct',
          explanation: `Untuk dhamir ${dhamir.dhamirAr} (${dhamir.artiId}), bentuk Fi'il Madhi dari ${verb.istilahi.madhi} adalah ${correctMadhi}.`,
        });

        // Mudhari questions
        const correctMudhari = verb.lughawiMudhari[dIdx];
        const uniqueWrongMudhari = Array.from(
          new Set(verb.lughawiMudhari.filter((v) => v !== correctMudhari))
        );
        const pickedWrongMudhari = shuffleArray(uniqueWrongMudhari).slice(0, 3);

        pool.push({
          id: `lug-mudhari-${verb.id}-${dIdx}`,
          babId: bab.id,
          babKode: `${bab.kode} · Tashrif Lughawi Mudhari'`,
          promptId: `Ubahlah Fi'il Mudhari' berikut ke dalam dhamir ${dhamir.dhamirLatin} (${dhamir.artiId}):`,
          arabicHighlight: `${dhamir.dhamirAr} + ${verb.istilahi.mudhari}`,
          arabicSubtext: `Kategori: ${dhamir.kategori} · Arti: "${verb.artiDasar}"`,
          options: shuffleArray([
            { id: 'correct', textAr: correctMudhari },
            ...pickedWrongMudhari.map((val, idx) => ({
              id: `wrong-${idx}`,
              textAr: val,
            })),
          ]),
          correctOptionId: 'correct',
          explanation: `Untuk dhamir ${dhamir.dhamirAr} (${dhamir.artiId}), bentuk Fi'il Mudhari' dari ${verb.istilahi.mudhari} adalah ${correctMudhari}.`,
        });
      });
    });
  } else {
    // tebak_shighat
    const shighatKeys: (keyof MauzunVerb['istilahi'])[] = [
      'madhi',
      'mudhari',
      'mashdar',
      'isim_fail',
      'isim_maful',
      'fiil_amr',
      'fiil_nahyi',
      'isim_zaman_makan',
      'madhi_majhul',
    ];

    allVerbs.forEach(({ bab, verb }) => {
      shighatKeys.forEach((sKey) => {
        const wordAr = verb.istilahi[sKey];
        if (!wordAr || wordAr.startsWith('—')) return;
        const meta = SHIGHAT_LIST.find((s) => s.key === sKey)!;

        const wrongShighats = shuffleArray(
          SHIGHAT_LIST.filter((s) => s.key !== sKey)
        ).slice(0, 3);

        pool.push({
          id: `tebak-${verb.id}-${sKey}`,
          babId: bab.id,
          babKode: `${bab.kode} (${bab.wazanAr})`,
          promptId: `Apakah nama shighat dan kedudukan kata di bawah ini?`,
          arabicHighlight: wordAr,
          arabicSubtext: `Berasal dari akar kata ${verb.istilahi.madhi} (${verb.artiDasar})`,
          options: shuffleArray([
            {
              id: 'correct',
              textAr: meta.labelId,
              textSub: `${meta.labelAr} — ${meta.functionDesc}`,
            },
            ...wrongShighats.map((w, idx) => ({
              id: `wrong-${idx}`,
              textAr: w.labelId,
              textSub: `${w.labelAr} — ${w.functionDesc}`,
            })),
          ]),
          correctOptionId: 'correct',
          explanation: `Kata ${wordAr} berwazan ${bab.wazanIstilahi[sKey]} yang merupakan ${meta.labelId} (${meta.functionDesc}) dari kata ${verb.istilahi.madhi} (${verb.artiDasar}).`,
        });
      });
    });
  }

  return shuffleArray(pool).slice(0, count);
}
