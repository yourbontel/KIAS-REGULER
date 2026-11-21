import type { MauzunVerb, ShorofBab } from './types.js';

function buildFaaalaVerb(
  id: string,
  babId: string,
  rootLetters: [string, string, string],
  artiDasar: string,
  mashdar?: string
): MauzunVerb {
  const [f, a, l] = rootLetters;
  const nunNiswahEnd = l === 'ن' ? 'َّ' : 'ْنَ';
  const nahnuMadhiEnd = l === 'ن' ? 'َّا' : 'ْنَا';
  const madhiStem = `${f}َا${a}َ${l}`;
  const mudhariStem = `${f}َا${a}ِ${l}`;
  const amrStem = `${f}َا${a}ِ${l}`;

  return {
    id,
    babId,
    rootLetters,
    artiDasar,
    istilahi: {
      madhi: `${madhiStem}َ`,
      mudhari: `يُ${mudhariStem}ُ`,
      mashdar: mashdar ?? `مُ${f}َا${a}َ${l}َةً`,
      isim_fail: `مُ${f}َا${a}ِ${l}ٌ`,
      isim_maful: `مُ${f}َا${a}َ${l}ٌ`,
      fiil_amr: `${amrStem}ْ`,
      fiil_nahyi: `لَا تُ${mudhariStem}ْ`,
      isim_zaman_makan: `مُ${f}َا${a}َ${l}ٌ`,
      isim_alat: '—',
      madhi_majhul: `${f}ُو${a}ِ${l}َ`,
      mudhari_majhul: `يُ${f}َا${a}َ${l}ُ`,
    },
    lughawiMadhi: [
      `${madhiStem}َ`,
      `${madhiStem}َا`,
      `${madhiStem}ُوا`,
      `${madhiStem}َتْ`,
      `${madhiStem}َتَا`,
      `${madhiStem}${nunNiswahEnd}`,
      `${madhiStem}ْتَ`,
      `${madhiStem}ْتُمَا`,
      `${madhiStem}ْتُمْ`,
      `${madhiStem}ْتِ`,
      `${madhiStem}ْتُمَا`,
      `${madhiStem}ْتُنَّ`,
      `${madhiStem}ْتُ`,
      `${madhiStem}${nahnuMadhiEnd}`,
    ],
    lughawiMudhari: [
      `يُ${mudhariStem}ُ`,
      `يُ${mudhariStem}َانِ`,
      `يُ${mudhariStem}ُونَ`,
      `تُ${mudhariStem}ُ`,
      `تُ${mudhariStem}َانِ`,
      `يُ${mudhariStem}${nunNiswahEnd}`,
      `تُ${mudhariStem}ُ`,
      `تُ${mudhariStem}َانِ`,
      `تُ${mudhariStem}ُونَ`,
      `تُ${mudhariStem}ِينَ`,
      `تُ${mudhariStem}َانِ`,
      `تُ${mudhariStem}${nunNiswahEnd}`,
      `أُ${mudhariStem}ُ`,
      `نُ${mudhariStem}ُ`,
    ],
    lughawiAmr: [
      `${amrStem}ْ`,
      `${amrStem}َا`,
      `${amrStem}ُوا`,
      `${amrStem}ِي`,
      `${amrStem}َا`,
      `${amrStem}${nunNiswahEnd}`,
    ],
  };
}

const MAZID1_BAB2: ShorofBab = {
  id: 'mazid1-bab-2',
  kode: 'Mazid 1 · Bab 2',
  namaBab: "Tsulatsi Mazid +1 Huruf Bab 2 (Faa'ala - Yufaa'ilu)",
  kategori: 'Tsulatsi Mazid (+1 Huruf)',
  wazanAr: 'فَاعَلَ - يُفَاعِلُ',
  wazanLatin: "Faa'ala - Yufaa'ilu",
  kaidahAinFiil: "Tambahan Alif setelah Fa' Fi'il (makna musyarakah/saling atau berulang)",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'فَاعَلَ',
    mudhari: 'يُفَاعِلُ',
    mashdar: 'مُفَاعَلَةً',
    isim_fail: 'مُفَاعِلٌ',
    isim_maful: 'مُفَاعَلٌ',
    fiil_amr: 'فَاعِلْ',
    fiil_nahyi: 'لَا تُفَاعِلْ',
    isim_zaman_makan: 'مُفَاعَلٌ',
    isim_alat: '—',
    madhi_majhul: 'فُوعِلَ',
    mudhari_majhul: 'يُفَاعَلُ',
  },
  mauzunList: [
    buildFaaalaVerb('r1-baaraka', 'mazid1-bab-2', ['ب', 'ر', 'ك'], 'Memberkati'),
    buildFaaalaVerb('r1-qaatala', 'mazid1-bab-2', ['ق', 'ت', 'ل'], 'Memerangi'),
    buildFaaalaVerb('r1-aawada', 'mazid1-bab-2', ['ع', 'و', 'د'], 'Membiasakan'),
    buildFaaalaVerb('r1-saafara', 'mazid1-bab-2', ['س', 'ف', 'ر'], 'Berpergian jauh'),
    buildFaaalaVerb('r1-raasala', 'mazid1-bab-2', ['ر', 'س', 'ل'], 'Bersurat-suratan'),
    buildFaaalaVerb('r1-syaawara', 'mazid1-bab-2', ['ش', 'و', 'ر'], 'Musyawarah'),
    buildFaaalaVerb('r1-jaahada', 'mazid1-bab-2', ['ج', 'ه', 'د'], 'Bersungguh-sungguh'),
    buildFaaalaVerb('r1-baalagha', 'mazid1-bab-2', ['ب', 'ل', 'غ'], 'Berlebih-lebihan'),
    buildFaaalaVerb('r1-aawana', 'mazid1-bab-2', ['ع', 'و', 'ن'], 'Menolong'),
    buildFaaalaVerb('r1-saamaha', 'mazid1-bab-2', ['س', 'م', 'ح'], 'Memaafkan'),
    buildFaaalaVerb('r1-dhaaafa', 'mazid1-bab-2', ['ض', 'ع', 'ف'], 'Menggandakan'),
    buildFaaalaVerb('r1-khaashama', 'mazid1-bab-2', ['خ', 'ص', 'م'], 'Berdebat'),
  ],
};

function buildFathahMudhariLughawi(
  madhiStem: string,
  mudhariStem: string,
  amrStem: string,
  lamLetter: string
): Pick<MauzunVerb, 'lughawiMadhi' | 'lughawiMudhari' | 'lughawiAmr'> {
  const nunNiswahEnd = lamLetter === 'ن' ? 'َّ' : 'ْنَ';
  const nahnuMadhiEnd = lamLetter === 'ن' ? 'َّا' : 'ْنَا';
  return {
    lughawiMadhi: [
      `${madhiStem}َ`,
      `${madhiStem}َا`,
      `${madhiStem}ُوا`,
      `${madhiStem}َتْ`,
      `${madhiStem}َتَا`,
      `${madhiStem}${nunNiswahEnd}`,
      `${madhiStem}ْتَ`,
      `${madhiStem}ْتُمَا`,
      `${madhiStem}ْتُمْ`,
      `${madhiStem}ْتِ`,
      `${madhiStem}ْتُمَا`,
      `${madhiStem}ْتُنَّ`,
      `${madhiStem}ْتُ`,
      `${madhiStem}${nahnuMadhiEnd}`,
    ],
    lughawiMudhari: [
      `يَ${mudhariStem}ُ`,
      `يَ${mudhariStem}َانِ`,
      `يَ${mudhariStem}ُونَ`,
      `تَ${mudhariStem}ُ`,
      `تَ${mudhariStem}َانِ`,
      `يَ${mudhariStem}${nunNiswahEnd}`,
      `تَ${mudhariStem}ُ`,
      `تَ${mudhariStem}َانِ`,
      `تَ${mudhariStem}ُونَ`,
      `تَ${mudhariStem}ِينَ`,
      `تَ${mudhariStem}َانِ`,
      `تَ${mudhariStem}${nunNiswahEnd}`,
      `أَ${mudhariStem}ُ`,
      `نَ${mudhariStem}ُ`,
    ],
    lughawiAmr: [
      `${amrStem}ْ`,
      `${amrStem}َا`,
      `${amrStem}ُوا`,
      `${amrStem}ِي`,
      `${amrStem}َا`,
      `${amrStem}${nunNiswahEnd}`,
    ],
  };
}

function buildTafaalaVerb(
  id: string,
  rootLetters: [string, string, string],
  artiDasar: string,
  mashdar: string
): MauzunVerb {
  const [f, a, l] = rootLetters;
  if (l === 'أ') {
    return {
      id,
      babId: 'mazid2-bab-1',
      rootLetters,
      artiDasar,
      istilahi: {
        madhi: `تَ${f}َ${a}َّأَ`,
        mudhari: `يَتَ${f}َ${a}َّأُ`,
        mashdar,
        isim_fail: `مُتَ${f}َ${a}ِّئٌ`,
        isim_maful: `مُتَ${f}َ${a}َّأٌ`,
        fiil_amr: `تَ${f}َ${a}َّأْ`,
        fiil_nahyi: `لَا تَتَ${f}َ${a}َّأْ`,
        isim_zaman_makan: `مُتَ${f}َ${a}َّأٌ`,
        isim_alat: '—',
        madhi_majhul: `تُ${f}ُ${a}ِّئَ`,
        mudhari_majhul: `يُتَ${f}َ${a}َّأُ`,
      },
      lughawiMadhi: [
        `تَ${f}َ${a}َّأَ`, `تَ${f}َ${a}َّأَا`, `تَ${f}َ${a}َّؤُوا`,
        `تَ${f}َ${a}َّأَتْ`, `تَ${f}َ${a}َّأَتَا`, `تَ${f}َ${a}َّأْنَ`,
        `تَ${f}َ${a}َّأْتَ`, `تَ${f}َ${a}َّأْتُمَا`, `تَ${f}َ${a}َّأْتُمْ`,
        `تَ${f}َ${a}َّأْتِ`, `تَ${f}َ${a}َّأْتُمَا`, `تَ${f}َ${a}َّأْتُنَّ`,
        `تَ${f}َ${a}َّأْتُ`, `تَ${f}َ${a}َّأْنَا`,
      ],
      lughawiMudhari: [
        `يَتَ${f}َ${a}َّأُ`, `يَتَ${f}َ${a}َّأَانِ`, `يَتَ${f}َ${a}َّؤُونَ`,
        `تَتَ${f}َ${a}َّأُ`, `تَتَ${f}َ${a}َّأَانِ`, `يَتَ${f}َ${a}َّأْنَ`,
        `تَتَ${f}َ${a}َّأُ`, `تَتَ${f}َ${a}َّأَانِ`, `تَتَ${f}َ${a}َّؤُونَ`,
        `تَتَ${f}َ${a}َّئِينَ`, `تَتَ${f}َ${a}َّأَانِ`, `تَتَ${f}َ${a}َّأْنَ`,
        `أَتَ${f}َ${a}َّأُ`, `نَتَ${f}َ${a}َّأُ`,
      ],
      lughawiAmr: [
        `تَ${f}َ${a}َّأْ`, `تَ${f}َ${a}َّأَا`, `تَ${f}َ${a}َّؤُوا`,
        `تَ${f}َ${a}َّئِي`, `تَ${f}َ${a}َّأَا`, `تَ${f}َ${a}َّأْنَ`,
      ],
    };
  }

  const stem = `تَ${f}َ${a}َّ${l}`;
  const majhulFa = f === 'أ' ? 'ؤ' : f;
  return {
    id,
    babId: 'mazid2-bab-1',
    rootLetters,
    artiDasar,
    istilahi: {
      madhi: `${stem}َ`,
      mudhari: `يَ${stem}ُ`,
      mashdar,
      isim_fail: `مُتَ${f}َ${a}ِّ${l}ٌ`,
      isim_maful: `مُ${stem}ٌ`,
      fiil_amr: `${stem}ْ`,
      fiil_nahyi: `لَا تَ${stem}ْ`,
      isim_zaman_makan: `مُ${stem}ٌ`,
      isim_alat: '—',
      madhi_majhul: `تُ${majhulFa}ُ${a}ِّ${l}َ`,
      mudhari_majhul: `يُ${stem}ُ`,
    },
    ...buildFathahMudhariLughawi(stem, stem, stem, l),
  };
}

function buildTafaaalaVerb(
  id: string,
  rootLetters: [string, string, string],
  artiDasar: string,
  mashdar: string
): MauzunVerb {
  const [f, a, l] = rootLetters;
  const isMahmuzAin = a === 'أ';
  const ainLetter = isMahmuzAin ? 'ء' : a;
  const stem = `تَ${f}َا${ainLetter}َ${l}`;
  const failAin = isMahmuzAin ? 'ئ' : a;
  const majhulAin = isMahmuzAin ? 'ئ' : a;

  return {
    id,
    babId: 'mazid2-bab-2',
    rootLetters,
    artiDasar,
    istilahi: {
      madhi: `${stem}َ`,
      mudhari: `يَ${stem}ُ`,
      mashdar,
      isim_fail: `مُتَ${f}َا${failAin}ِ${l}ٌ`,
      isim_maful: `مُ${stem}ٌ`,
      fiil_amr: `${stem}ْ`,
      fiil_nahyi: `لَا تَ${stem}ْ`,
      isim_zaman_makan: `مُ${stem}ٌ`,
      isim_alat: '—',
      madhi_majhul: `تُ${f}ُو${majhulAin}ِ${l}َ`,
      mudhari_majhul: `يُ${stem}ُ`,
    },
    ...buildFathahMudhariLughawi(stem, stem, stem, l),
  };
}

function buildIftaalaVerb(
  id: string,
  rootLetters: [string, string, string],
  artiDasar: string,
  mashdar: string
): MauzunVerb {
  const [f, a, l] = rootLetters;
  const isAssimilatedTa = f === 'و' || f === 'ت';
  const madhiStem = isAssimilatedTa ? `اِتَّ${a}َ${l}` : `اِ${f}ْتَ${a}َ${l}`;
  const mudhariStem = isAssimilatedTa ? `تَّ${a}ِ${l}` : `${f}ْتَ${a}ِ${l}`;
  const amrStem = isAssimilatedTa ? `اِتَّ${a}ِ${l}` : `اِ${f}ْتَ${a}ِ${l}`;
  const isimPrefix = isAssimilatedTa ? `مُتَّ${a}` : `مُ${f}ْتَ${a}`;
  const majhulMadhi = isAssimilatedTa ? `اُتُّ${a}ِ${l}َ` : `اُ${f}ْتُ${a}ِ${l}َ`;
  const majhulMudhari = isAssimilatedTa ? `يُتَّ${a}َ${l}ُ` : `يُ${f}ْتَ${a}َ${l}ُ`;

  return {
    id,
    babId: 'mazid2-bab-3',
    rootLetters,
    artiDasar,
    istilahi: {
      madhi: `${madhiStem}َ`,
      mudhari: `يَ${mudhariStem}ُ`,
      mashdar,
      isim_fail: `${isimPrefix}ِ${l}ٌ`,
      isim_maful: `${isimPrefix}َ${l}ٌ`,
      fiil_amr: `${amrStem}ْ`,
      fiil_nahyi: `لَا تَ${mudhariStem}ْ`,
      isim_zaman_makan: `${isimPrefix}َ${l}ٌ`,
      isim_alat: '—',
      madhi_majhul: majhulMadhi,
      mudhari_majhul: majhulMudhari,
    },
    ...buildFathahMudhariLughawi(madhiStem, mudhariStem, amrStem, l),
  };
}

function buildInfaalaVerb(
  id: string,
  rootLetters: [string, string, string],
  artiDasar: string,
  mashdar: string
): MauzunVerb {
  const [f, a, l] = rootLetters;
  const madhiStem = `اِنْ${f}َ${a}َ${l}`;
  const mudhariStem = `نْ${f}َ${a}ِ${l}`;
  const amrStem = `اِنْ${f}َ${a}ِ${l}`;

  return {
    id,
    babId: 'mazid2-bab-4',
    rootLetters,
    artiDasar,
    istilahi: {
      madhi: `${madhiStem}َ`,
      mudhari: `يَ${mudhariStem}ُ`,
      mashdar,
      isim_fail: `مُنْ${f}َ${a}ِ${l}ٌ`,
      isim_maful: `مُنْ${f}َ${a}َ${l}ٌ`,
      fiil_amr: `${amrStem}ْ`,
      fiil_nahyi: `لَا تَ${mudhariStem}ْ`,
      isim_zaman_makan: `مُنْ${f}َ${a}َ${l}ٌ`,
      isim_alat: '—',
      madhi_majhul: `اُنْ${f}ُ${a}ِ${l}َ`,
      mudhari_majhul: `يُنْ${f}َ${a}َ${l}ُ`,
    },
    ...buildFathahMudhariLughawi(madhiStem, mudhariStem, amrStem, l),
  };
}

const MAZID2_BAB1: ShorofBab = {
  id: 'mazid2-bab-1',
  kode: 'Mazid 2 · Bab 1',
  namaBab: "Tsulatsi Mazid +2 Huruf Bab 1 (Tafa''ala - Yatafa''alu)",
  kategori: 'Tsulatsi Mazid (+2 Huruf)',
  wazanAr: 'تَفَعَّلَ - يَتَفَعَّلُ',
  wazanLatin: "Tafa''ala - Yatafa''alu",
  kaidahAinFiil: "Tambahan Ta' di awal dan Tasydid pada 'Ain Fi'il (sering bermakna muthawa'ah / bertahap)",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'تَفَعَّلَ',
    mudhari: 'يَتَفَعَّلُ',
    mashdar: 'تَفَعُّلًا',
    isim_fail: 'مُتَفَعِّلٌ',
    isim_maful: 'مُتَفَعَّلٌ',
    fiil_amr: 'تَفَعَّلْ',
    fiil_nahyi: 'لَا تَتَفَعَّلْ',
    isim_zaman_makan: 'مُتَفَعَّلٌ',
    isim_alat: '—',
    madhi_majhul: 'تُفُعِّلَ',
    mudhari_majhul: 'يُتَفَعَّلُ',
  },
  mauzunList: [
    buildTafaalaVerb('r1-tafarraqa', ['ف', 'ر', 'ق'], 'Berpecah belah', 'تَفَرُّقًا'),
    buildTafaalaVerb('r1-taakhkhara', ['أ', 'خ', 'ر'], 'Terlambat', 'تَأَخُّرًا'),
    buildTafaalaVerb('r1-tawadhdhaa', ['و', 'ض', 'أ'], 'Berwudhu', 'تَوَضُّؤًا'),
    buildTafaalaVerb('r1-tadzakkara', ['ذ', 'ك', 'ر'], 'Mengingat', 'تَذَكُّرًا'),
    buildTafaalaVerb('r1-tabayyana', ['ب', 'ي', 'ن'], 'Mencari kejelasan', 'تَبَيُّنًا'),
    buildTafaalaVerb('r1-tabarraka', ['ب', 'ر', 'ك'], 'Mencari berkah', 'تَبَرُّكًا'),
    buildTafaalaVerb('r1-tajannaba', ['ج', 'ن', 'ب'], 'Mengelakkan', 'تَجَنُّبًا'),
    buildTafaalaVerb('r1-taallama', ['ع', 'ل', 'م'], 'Mencari ilmu', 'تَعَلُّمًا'),
    buildTafaalaVerb('r1-taaddada', ['ع', 'د', 'د'], 'Berbilang', 'تَعَدُّدًا'),
  ],
};

const MAZID2_BAB2: ShorofBab = {
  id: 'mazid2-bab-2',
  kode: 'Mazid 2 · Bab 2',
  namaBab: "Tsulatsi Mazid +2 Huruf Bab 2 (Tafaa'ala - Yatafaa'alu)",
  kategori: 'Tsulatsi Mazid (+2 Huruf)',
  wazanAr: 'تَفَاعَلَ - يَتَفَاعَلُ',
  wazanLatin: "Tafaa'ala - Yatafaa'alu",
  kaidahAinFiil: "Tambahan Ta' di awal dan Alif setelah Fa' Fi'il (bermakna saling/resiprokal)",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'تَفَاعَلَ',
    mudhari: 'يَتَفَاعَلُ',
    mashdar: 'تَفَاعُلًا',
    isim_fail: 'مُتَفَاعِلٌ',
    isim_maful: 'مُتَفَاعَلٌ',
    fiil_amr: 'تَفَاعَلْ',
    fiil_nahyi: 'لَا تَتَفَاعَلْ',
    isim_zaman_makan: 'مُتَفَاعَلٌ',
    isim_alat: '—',
    madhi_majhul: 'تُفُوعِلَ',
    mudhari_majhul: 'يُتَفَاعَلُ',
  },
  mauzunList: [
    buildTafaaalaVerb('r1-taaawana', ['ع', 'و', 'ن'], 'Tolong-menolong', 'تَعَاوُنًا'),
    buildTafaaalaVerb('r1-tawaatara', ['و', 'ت', 'ر'], 'Berturut-turut', 'تَوَاتُرًا'),
    buildTafaaalaVerb('r1-talaaaba', ['ل', 'ع', 'ب'], 'Bermain-main', 'تَلَاعُبًا'),
    buildTafaaalaVerb('r1-tanaafasa', ['ن', 'ف', 'س'], 'Berlomba', 'تَنَافُسًا'),
    buildTafaaalaVerb('r1-tadaarasa', ['د', 'ر', 'س'], 'Saling mempelajari', 'تَدَارُسًا'),
    buildTafaaalaVerb('r1-tanaazaa', ['ن', 'ز', 'ع'], 'Berselisih', 'تَنَازُعًا'),
    buildTafaaalaVerb('r1-tasaaala', ['س', 'أ', 'ل'], 'Saling bertanya', 'تَسَاؤُلًا'),
    buildTafaaalaVerb('r1-taaarafa', ['ع', 'ر', 'ف'], 'Saling mengenal', 'تَعَارُفًا'),
    buildTafaaalaVerb('r1-tawaadhaa', ['و', 'ض', 'ع'], 'Merendahkan diri', 'تَوَاضُعًا'),
  ],
};

const MAZID2_BAB3: ShorofBab = {
  id: 'mazid2-bab-3',
  kode: 'Mazid 2 · Bab 3',
  namaBab: "Tsulatsi Mazid +2 Huruf Bab 3 (Ifta'ala - Yafta'ilu)",
  kategori: 'Tsulatsi Mazid (+2 Huruf)',
  wazanAr: 'اِفْتَعَلَ - يَفْتَعِلُ',
  wazanLatin: "Ifta'ala - Yafta'ilu",
  kaidahAinFiil: "Tambahan Hamzah Washal di awal dan Ta' setelah Fa' Fi'il",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'اِفْتَعَلَ',
    mudhari: 'يَفْتَعِلُ',
    mashdar: 'اِفْتِعَالًا',
    isim_fail: 'مُفْتَعِلٌ',
    isim_maful: 'مُفْتَعَلٌ',
    fiil_amr: 'اِفْتَعِلْ',
    fiil_nahyi: 'لَا تَفْتَعِلْ',
    isim_zaman_makan: 'مُفْتَعَلٌ',
    isim_alat: '—',
    madhi_majhul: 'اُفْتُعِلَ',
    mudhari_majhul: 'يُفْتَعَلُ',
  },
  mauzunList: [
    buildIftaalaVerb('r1-ikhtabara', ['خ', 'ب', 'ر'], 'Menguji', 'اِخْتِبَارًا'),
    buildIftaalaVerb('r1-ikhtalafa', ['خ', 'ل', 'ف'], 'Berselisih', 'اِخْتِلَافًا'),
    buildIftaalaVerb('r1-iqtaraba', ['ق', 'ر', 'ب'], 'Mendekat', 'اِقْتِرَابًا'),
    buildIftaalaVerb('r1-intasyara', ['ن', 'ش', 'ر'], 'Tersebar', 'اِنْتِشَارًا'),
    buildIftaalaVerb('r1-iatashama', ['ع', 'ص', 'م'], 'Berpegang teguh', 'اِعْتِصَامًا'),
    buildIftaalaVerb('r1-ijtamaa', ['ج', 'م', 'ع'], 'Berkumpul', 'اِجْتِمَاعًا'),
    buildIftaalaVerb('r1-ihtalama', ['ح', 'ل', 'م'], 'Mimpi basah', 'اِحْتِلَامًا'),
    buildIftaalaVerb('r1-ittafaqa', ['و', 'ف', 'ق'], 'Bersepakat', 'اِتِّفَاقًا'),
    buildIftaalaVerb('r1-intatsara', ['ن', 'ث', 'ر'], 'Berserakan', 'اِنْتِثَارًا'),
    buildIftaalaVerb('r1-imtahana', ['م', 'ح', 'ن'], 'Menguji', 'اِمْتِحَانًا'),
    buildIftaalaVerb('r1-ittabaa', ['ت', 'ب', 'ع'], 'Mengikuti', 'اِتِّبَاعًا'),
  ],
};

const MAZID2_BAB4: ShorofBab = {
  id: 'mazid2-bab-4',
  kode: 'Mazid 2 · Bab 4',
  namaBab: "Tsulatsi Mazid +2 Huruf Bab 4 (Infa'ala - Yanfa'ilu)",
  kategori: 'Tsulatsi Mazid (+2 Huruf)',
  wazanAr: 'اِنْفَعَلَ - يَنْفَعِلُ',
  wazanLatin: "Infa'ala - Yanfa'ilu",
  kaidahAinFiil: "Tambahan Hamzah Washal dan Nun di awal (bermakna muthawa'ah / menjadi)",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'اِنْفَعَلَ',
    mudhari: 'يَنْفَعِلُ',
    mashdar: 'اِنْفِعَالًا',
    isim_fail: 'مُنْفَعِلٌ',
    isim_maful: 'مُنْفَعَلٌ',
    fiil_amr: 'اِنْفَعِلْ',
    fiil_nahyi: 'لَا تَنْفَعِلْ',
    isim_zaman_makan: 'مُنْفَعَلٌ',
    isim_alat: '—',
    madhi_majhul: 'اُنْفُعِلَ',
    mudhari_majhul: 'يُنْفَعَلُ',
  },
  mauzunList: [
    buildInfaalaVerb('r1-inqasama', ['ق', 'س', 'م'], 'Terbagi', 'اِنْقِسَامًا'),
    buildInfaalaVerb('r1-infashala', ['ف', 'ص', 'ل'], 'Terpisah', 'اِنْفِصَالًا'),
    buildInfaalaVerb('r1-infathara', ['ف', 'ط', 'ر'], 'Terbelah', 'اِنْفِطَارًا'),
    buildInfaalaVerb('r1-inkasyafa', ['ك', 'ش', 'ف'], 'Tersingkap', 'اِنْكِشَافًا'),
    buildInfaalaVerb('r1-inkadara', ['ك', 'د', 'ر'], 'Berjatuhan', 'اِنْكِدَارًا'),
    buildInfaalaVerb('r1-infarada', ['ف', 'ر', 'د'], 'Bersendirian', 'اِنْفِرَادًا'),
    buildInfaalaVerb('r1-insharafa', ['ص', 'ر', 'ف'], 'Berpaling', 'اِنْصِرَافًا'),
    buildInfaalaVerb('r1-inqalaba', ['ق', 'ل', 'ب'], 'Berbalik, kembali', 'اِنْقِلَابًا'),
    buildInfaalaVerb('r1-inqathaa', ['ق', 'ط', 'ع'], 'Terputus', 'اِنْقِطَاعًا'),
    buildInfaalaVerb('r1-inthalaqa', ['ط', 'ل', 'ق'], 'Pergi', 'اِنْطِلَاقًا'),
  ],
};

function buildMujarrodSoundVerb(
  id: string,
  babId: string,
  rootLetters: [string, string, string],
  artiDasar: string,
  mashdar: string,
  options: {
    madhiVowel?: 'َ' | 'ِ' | 'ُ';
    mudhariVowel: 'ُ' | 'ِ' | 'َ';
    amrHamzah: 'اُ' | 'اِ';
    makanVowel: 'َ' | 'ِ';
  }
): MauzunVerb {
  const [f, a, l] = rootLetters;
  const { madhiVowel = 'َ', mudhariVowel, amrHamzah, makanVowel } = options;
  const amrStem = `${amrHamzah}${f}ْ${a}${mudhariVowel}${l}`;
  const lughawiMadhiStem = `${f}َ${a}${madhiVowel}${l}`;
  const mudhariYa = `يَ${f}ْ${a}${mudhariVowel}${l}`;
  const mudhariTa = `تَ${f}ْ${a}${mudhariVowel}${l}`;
  const nunNiswahEnd = l === 'ن' ? 'َّ' : 'ْنَ';
  const nahnuMadhiEnd = l === 'ن' ? 'َّا' : 'ْنَا';

  return {
    id,
    babId,
    rootLetters,
    artiDasar,
    istilahi: {
      madhi: `${lughawiMadhiStem}َ`,
      mudhari: `${mudhariYa}ُ`,
      mashdar,
      isim_fail: `${f}َا${a}ِ${l}ٌ`,
      isim_maful: `مَ${f}ْ${a}ُو${l}ٌ`,
      fiil_amr: `${amrStem}ْ`,
      fiil_nahyi: `لَا تَ${f}ْ${a}${mudhariVowel}${l}ْ`,
      isim_zaman_makan: `مَ${f}ْ${a}${makanVowel}${l}ٌ`,
      isim_alat: `مِ${f}ْ${a}َ${l}ٌ`,
      madhi_majhul: `${f}ُ${a}ِ${l}َ`,
      mudhari_majhul: `يُ${f}ْ${a}َ${l}ُ`,
    },
    lughawiMadhi: [
      `${lughawiMadhiStem}َ`,
      `${lughawiMadhiStem}َا`,
      `${lughawiMadhiStem}ُوا`,
      `${lughawiMadhiStem}َتْ`,
      `${lughawiMadhiStem}َتَا`,
      `${lughawiMadhiStem}${nunNiswahEnd}`,
      `${lughawiMadhiStem}ْتَ`,
      `${lughawiMadhiStem}ْتُمَا`,
      `${lughawiMadhiStem}ْتُمْ`,
      `${lughawiMadhiStem}ْتِ`,
      `${lughawiMadhiStem}ْتُمَا`,
      `${lughawiMadhiStem}ْتُنَّ`,
      `${lughawiMadhiStem}ْتُ`,
      `${lughawiMadhiStem}${nahnuMadhiEnd}`,
    ],
    lughawiMudhari: [
      `${mudhariYa}ُ`,
      `${mudhariYa}َانِ`,
      `${mudhariYa}ُونَ`,
      `${mudhariTa}ُ`,
      `${mudhariTa}َانِ`,
      `${mudhariYa}${nunNiswahEnd}`,
      `${mudhariTa}ُ`,
      `${mudhariTa}َانِ`,
      `${mudhariTa}ُونَ`,
      `${mudhariTa}ِينَ`,
      `${mudhariTa}َانِ`,
      `${mudhariTa}${nunNiswahEnd}`,
      `أَ${f}ْ${a}${mudhariVowel}${l}ُ`,
      `نَ${f}ْ${a}${mudhariVowel}${l}ُ`,
    ],
    lughawiAmr: [
      `${amrStem}ْ`,
      `${amrStem}َا`,
      `${amrStem}ُوا`,
      `${amrStem}ِي`,
      `${amrStem}َا`,
      `${amrStem}${nunNiswahEnd}`,
    ],
  };
}

const BAB1_OPTS = { mudhariVowel: 'ُ' as const, amrHamzah: 'اُ' as const, makanVowel: 'َ' as const };
const BAB2_OPTS = { mudhariVowel: 'ِ' as const, amrHamzah: 'اِ' as const, makanVowel: 'ِ' as const };
const BAB3_OPTS = { mudhariVowel: 'َ' as const, amrHamzah: 'اِ' as const, makanVowel: 'َ' as const };
const BAB4_OPTS = {
  madhiVowel: 'ِ' as const,
  mudhariVowel: 'ِ' as const,
  amrHamzah: 'اِ' as const,
  makanVowel: 'ِ' as const,
};
const BAB5_OPTS = {
  madhiVowel: 'ِ' as const,
  mudhariVowel: 'َ' as const,
  amrHamzah: 'اِ' as const,
  makanVowel: 'َ' as const,
};
const BAB6_OPTS = {
  madhiVowel: 'ُ' as const,
  mudhariVowel: 'ُ' as const,
  amrHamzah: 'اُ' as const,
  makanVowel: 'َ' as const,
};

const R1_BAB1: ShorofBab = {
  id: 'r1-bab-1',
  kode: 'Bab 1',
  namaBab: 'Tsulatsi Mujarrod Bab 1 (Fathu-Dhammin)',
  kategori: 'Tsulatsi Mujarrod',
  wazanAr: 'فَعَلَ - يَفْعُلُ',
  wazanLatin: "Fa'ala - Yaf'ulu",
  kaidahAinFiil: "'Ain Fi'il berharakat Fathah pada Madhi dan Dhammah pada Mudhari'",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'فَعَلَ',
    mudhari: 'يَفْعُلُ',
    mashdar: 'فَعْلًا',
    isim_fail: 'فَاعِلٌ',
    isim_maful: 'مَفْعُولٌ',
    fiil_amr: 'اُفْعُلْ',
    fiil_nahyi: 'لَا تَفْعُلْ',
    isim_zaman_makan: 'مَفْعَلٌ',
    isim_alat: 'مِفْعَلٌ',
    madhi_majhul: 'فُعِلَ',
    mudhari_majhul: 'يُفْعَلُ',
  },
  mauzunList: [
    buildMujarrodSoundVerb('kafara', 'r1-bab-1', ['ك', 'ف', 'ر'], 'Mengingkari', 'كُفْرًا', BAB1_OPTS),
    buildMujarrodSoundVerb('qatala', 'r1-bab-1', ['ق', 'ت', 'ل'], 'Membunuh', 'قَتْلًا', BAB1_OPTS),
    buildMujarrodSoundVerb('satara', 'r1-bab-1', ['س', 'ت', 'ر'], 'Menutupi', 'سَتْرًا', BAB1_OPTS),
    buildMujarrodSoundVerb('khalaqa', 'r1-bab-1', ['خ', 'ل', 'ق'], 'Menciptakan', 'خَلْقًا', BAB1_OPTS),
    buildMujarrodSoundVerb('r1-nasara', 'r1-bab-1', ['ن', 'ص', 'ر'], 'Menolong', 'نَصْرًا', BAB1_OPTS),
    buildMujarrodSoundVerb('kharaja', 'r1-bab-1', ['خ', 'ر', 'ج'], 'Keluar', 'خُرُوجًا', BAB1_OPTS),
    buildMujarrodSoundVerb('r1-dakhala', 'r1-bab-1', ['د', 'خ', 'ل'], 'Masuk', 'دُخُولًا', BAB1_OPTS),
    buildMujarrodSoundVerb('kanasa', 'r1-bab-1', ['ك', 'ن', 'س'], 'Menyapu', 'كَنْسًا', BAB1_OPTS),
    buildMujarrodSoundVerb('razaqa', 'r1-bab-1', ['ر', 'ز', 'ق'], 'Memberi rezeki', 'رِزْقًا', BAB1_OPTS),
    buildMujarrodSoundVerb('r1-kataba', 'r1-bab-1', ['ك', 'ت', 'ب'], 'Menulis', 'كِتَابَةً', BAB1_OPTS),
    buildMujarrodSoundVerb('raqada', 'r1-bab-1', ['ر', 'ق', 'د'], 'Tidur', 'رُقُودًا', BAB1_OPTS),
    buildMujarrodSoundVerb('darasa', 'r1-bab-1', ['د', 'ر', 'س'], 'Belajar', 'دَرْسًا', BAB1_OPTS),
  ],
};

const R1_BAB2: ShorofBab = {
  id: 'r1-bab-2',
  kode: 'Bab 2',
  namaBab: 'Tsulatsi Mujarrod Bab 2 (Fathu-Kasrin)',
  kategori: 'Tsulatsi Mujarrod',
  wazanAr: 'فَعَلَ - يَفْعِلُ',
  wazanLatin: "Fa'ala - Yaf'ilu",
  kaidahAinFiil: "'Ain Fi'il berharakat Fathah pada Madhi dan Kasrah pada Mudhari'",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'فَعَلَ',
    mudhari: 'يَفْعِلُ',
    mashdar: 'فَعْلًا',
    isim_fail: 'فَاعِلٌ',
    isim_maful: 'مَفْعُولٌ',
    fiil_amr: 'اِفْعِلْ',
    fiil_nahyi: 'لَا تَفْعِلْ',
    isim_zaman_makan: 'مَفْعِلٌ',
    isim_alat: 'مِفْعَلٌ',
    madhi_majhul: 'فُعِلَ',
    mudhari_majhul: 'يُفْعَلُ',
  },
  mauzunList: [
    buildMujarrodSoundVerb('ghalaba', 'r1-bab-2', ['غ', 'ل', 'ب'], 'Mengalahkan', 'غَلَبًا', BAB2_OPTS),
    buildMujarrodSoundVerb('ghafara', 'r1-bab-2', ['غ', 'ف', 'ر'], 'Mengampuni', 'غَفْرًا', BAB2_OPTS),
    buildMujarrodSoundVerb('rajaa', 'r1-bab-2', ['ر', 'ج', 'ع'], 'Kembali', 'رُجُوعًا', BAB2_OPTS),
    buildMujarrodSoundVerb('shabara', 'r1-bab-2', ['ص', 'ب', 'ر'], 'Sabar', 'صَبْرًا', BAB2_OPTS),
    buildMujarrodSoundVerb('r1-dharaba', 'r1-bab-2', ['ض', 'ر', 'ب'], 'Memukul', 'ضَرْبًا', BAB2_OPTS),
    buildMujarrodSoundVerb('qathafa', 'r1-bab-2', ['ق', 'ط', 'ف'], 'Memetik', 'قَطْفًا', BAB2_OPTS),
    buildMujarrodSoundVerb('r1-jalasa', 'r1-bab-2', ['ج', 'ل', 'س'], 'Duduk', 'جُلُوسًا', BAB2_OPTS),
    buildMujarrodSoundVerb('hamala', 'r1-bab-2', ['ح', 'م', 'ل'], 'Membawa', 'حَمْلًا', BAB2_OPTS),
    buildMujarrodSoundVerb('fashala', 'r1-bab-2', ['ف', 'ص', 'ل'], 'Memisahkan', 'فَصْلًا', BAB2_OPTS),
    buildMujarrodSoundVerb('kasaba', 'r1-bab-2', ['ك', 'س', 'ب'], 'Melakukan', 'كَسْبًا', BAB2_OPTS),
    buildMujarrodSoundVerb('r1-ghasala', 'r1-bab-2', ['غ', 'س', 'ل'], 'Mencuci', 'غَسْلًا', BAB2_OPTS),
    buildMujarrodSoundVerb('hadzafa', 'r1-bab-2', ['ح', 'ذ', 'ف'], 'Menghapus', 'حَذْفًا', BAB2_OPTS),
  ],
};

const R1_BAB3: ShorofBab = {
  id: 'r1-bab-3',
  kode: 'Bab 3',
  namaBab: 'Tsulatsi Mujarrod Bab 3 (Fathu-Fathin)',
  kategori: 'Tsulatsi Mujarrod',
  wazanAr: 'فَعَلَ - يَفْعَلُ',
  wazanLatin: "Fa'ala - Yaf'alu",
  kaidahAinFiil: "'Ain Fi'il berharakat Fathah pada Madhi dan Fathah pada Mudhari' (Huruf Halqi)",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'فَعَلَ',
    mudhari: 'يَفْعَلُ',
    mashdar: 'فَعْلًا',
    isim_fail: 'فَاعِلٌ',
    isim_maful: 'مَفْعُولٌ',
    fiil_amr: 'اِفْعَلْ',
    fiil_nahyi: 'لَا تَفْعَلْ',
    isim_zaman_makan: 'مَفْعَلٌ',
    isim_alat: 'مِفْعَلَةٌ',
    madhi_majhul: 'فُعِلَ',
    mudhari_majhul: 'يُفْعَلُ',
  },
  mauzunList: [
    buildMujarrodSoundVerb('r1-fataha', 'r1-bab-3', ['ف', 'ت', 'ح'], 'Membuka', 'فَتْحًا', BAB3_OPTS),
    buildMujarrodSoundVerb('baatsa', 'r1-bab-3', ['ب', 'ع', 'ث'], 'Mengirim', 'بَعْثًا', BAB3_OPTS),
    buildMujarrodSoundVerb('jaala', 'r1-bab-3', ['ج', 'ع', 'ل'], 'Menjadikan', 'جَعْلًا', BAB3_OPTS),
    buildMujarrodSoundVerb('dafana', 'r1-bab-3', ['د', 'ف', 'ن'], 'Mengubur', 'دَفْنًا', BAB3_OPTS),
    buildMujarrodSoundVerb('r1-dzahaba', 'r1-bab-3', ['ذ', 'ه', 'ب'], 'Pergi', 'ذَهَابًا', BAB3_OPTS),
    buildMujarrodSoundVerb('rafaa', 'r1-bab-3', ['ر', 'ف', 'ع'], 'Mengangkat', 'رَفْعًا', BAB3_OPTS),
    buildMujarrodSoundVerb('dzabaha', 'r1-bab-3', ['ذ', 'ب', 'ح'], 'Menyembelih', 'ذَبْحًا', BAB3_OPTS),
    buildMujarrodSoundVerb('masaha', 'r1-bab-3', ['م', 'س', 'ح'], 'Menghapus', 'مَسْحًا', BAB3_OPTS),
    buildMujarrodSoundVerb('jamaa', 'r1-bab-3', ['ج', 'م', 'ع'], 'Mengumpulkan', 'جَمْعًا', BAB3_OPTS),
    buildMujarrodSoundVerb('nahara', 'r1-bab-3', ['ن', 'ح', 'ر'], 'Menyembelih', 'نَحْرًا', BAB3_OPTS),
    buildMujarrodSoundVerb('manaa', 'r1-bab-3', ['م', 'ن', 'ع'], 'Mencegah', 'مَنْعًا', BAB3_OPTS),
    {
      id: 'qaraa',
      babId: 'r1-bab-3',
      rootLetters: ['ق', 'ر', 'أ'],
      artiDasar: 'Membaca',
      istilahi: {
        madhi: 'قَرَأَ',
        mudhari: 'يَقْرَأُ',
        mashdar: 'قِرَاءَةً',
        isim_fail: 'قَارِئٌ',
        isim_maful: 'مَقْرُوءٌ',
        fiil_amr: 'اِقْرَأْ',
        fiil_nahyi: 'لَا تَقْرَأْ',
        isim_zaman_makan: 'مَقْرَأٌ',
        isim_alat: 'مِقْرَأٌ',
        madhi_majhul: 'قُرِئَ',
        mudhari_majhul: 'يُقْرَأُ',
      },
      lughawiMadhi: [
        'قَرَأَ', 'قَرَأَا', 'قَرَءُوا',
        'قَرَأَتْ', 'قَرَأَتَا', 'قَرَأْنَ',
        'قَرَأْتَ', 'قَرَأْتُمَا', 'قَرَأْتُمْ',
        'قَرَأْتِ', 'قَرَأْتُمَا', 'قَرَأْتُنَّ',
        'قَرَأْتُ', 'قَرَأْنَا',
      ],
      lughawiMudhari: [
        'يَقْرَأُ', 'يَقْرَآنِ', 'يَقْرَءُونَ',
        'تَقْرَأُ', 'تَقْرَآنِ', 'يَقْرَأْنَ',
        'تَقْرَأُ', 'تَقْرَآنِ', 'تَقْرَءُونَ',
        'تَقْرَئِينَ', 'تَقْرَآنِ', 'تَقْرَأْنَ',
        'أَقْرَأُ', 'نَقْرَأُ',
      ],
      lughawiAmr: ['اِقْرَأْ', 'اِقْرَآ', 'اِقْرَءُوا', 'اِقْرَئِي', 'اِقْرَآ', 'اِقْرَأْنَ'],
    },
  ],
};

const R1_BAB4: ShorofBab = {
  id: 'r1-bab-4',
  kode: 'Bab 4',
  namaBab: 'Tsulatsi Mujarrod Bab 4 (Kasru-Kasrin)',
  kategori: 'Tsulatsi Mujarrod',
  wazanAr: 'فَعِلَ - يَفْعِلُ',
  wazanLatin: "Fa'ila - Yaf'ilu",
  kaidahAinFiil: "'Ain Fi'il berharakat Kasrah pada Madhi dan Kasrah pada Mudhari'",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'فَعِلَ',
    mudhari: 'يَفْعِلُ',
    mashdar: 'فُعْلَانًا',
    isim_fail: 'فَاعِلٌ',
    isim_maful: 'مَفْعُولٌ',
    fiil_amr: 'اِفْعِلْ',
    fiil_nahyi: 'لَا تَفْعِلْ',
    isim_zaman_makan: 'مَفْعِلٌ',
    isim_alat: 'مِفْعَلٌ',
    madhi_majhul: 'فُعِلَ',
    mudhari_majhul: 'يُفْعَلُ',
  },
  mauzunList: [
    buildMujarrodSoundVerb('naima', 'r1-bab-4', ['ن', 'ع', 'م'], 'Lembut', 'نَعِيمًا', BAB4_OPTS),
    buildMujarrodSoundVerb('tafiha', 'r1-bab-4', ['ت', 'ف', 'ه'], 'Rendah', 'تَفَهًا', BAB4_OPTS),
    buildMujarrodSoundVerb('r1-hasiba', 'r1-bab-4', ['ح', 'س', 'ب'], 'Menghitung', 'حُسْبَانًا', BAB4_OPTS),
  ],
};

const R1_BAB5: ShorofBab = {
  id: 'r1-bab-5',
  kode: 'Bab 5',
  namaBab: 'Tsulatsi Mujarrod Bab 5 (Kasru-Fathin)',
  kategori: 'Tsulatsi Mujarrod',
  wazanAr: 'فَعِلَ - يَفْعَلُ',
  wazanLatin: "Fa'ila - Yaf'alu",
  kaidahAinFiil: "'Ain Fi'il berharakat Kasrah pada Madhi dan Fathah pada Mudhari'",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'فَعِلَ',
    mudhari: 'يَفْعَلُ',
    mashdar: 'فِعْلًا',
    isim_fail: 'فَاعِلٌ',
    isim_maful: 'مَفْعُولٌ',
    fiil_amr: 'اِفْعَلْ',
    fiil_nahyi: 'لَا تَفْعَلْ',
    isim_zaman_makan: 'مَفْعَلٌ',
    isim_alat: 'مِفْعَلٌ',
    madhi_majhul: 'فُعِلَ',
    mudhari_majhul: 'يُفْعَلُ',
  },
  mauzunList: [
    buildMujarrodSoundVerb('ghadhiba', 'r1-bab-5', ['غ', 'ض', 'ب'], 'Marah', 'غَضَبًا', BAB5_OPTS),
    buildMujarrodSoundVerb('lahiqa', 'r1-bab-5', ['ل', 'ح', 'ق'], 'Bertemu', 'لَحَاقًا', BAB5_OPTS),
    buildMujarrodSoundVerb('hamida', 'r1-bab-5', ['ح', 'م', 'د'], 'Memuji', 'حَمْدًا', BAB5_OPTS),
    buildMujarrodSoundVerb('bakhila', 'r1-bab-5', ['ب', 'خ', 'ل'], 'Bakhil', 'بُخْلًا', BAB5_OPTS),
    buildMujarrodSoundVerb('r1-samia', 'r1-bab-5', ['س', 'م', 'ع'], 'Mendengar', 'سَمْعًا', BAB5_OPTS),
    buildMujarrodSoundVerb('shaida', 'r1-bab-5', ['ص', 'ع', 'د'], 'Naik', 'صُعُودًا', BAB5_OPTS),
    buildMujarrodSoundVerb('fahima', 'r1-bab-5', ['ف', 'ه', 'م'], 'Memahami', 'فَهْمًا', BAB5_OPTS),
    buildMujarrodSoundVerb('laiba', 'r1-bab-5', ['ل', 'ع', 'ب'], 'Bermain', 'لَعِبًا', BAB5_OPTS),
    buildMujarrodSoundVerb('r1-alima', 'r1-bab-5', ['ع', 'ل', 'م'], 'Mengetahui', 'عِلْمًا', BAB5_OPTS),
    buildMujarrodSoundVerb('khasira', 'r1-bab-5', ['خ', 'س', 'ر'], 'Merugi', 'خُسْرَانًا', BAB5_OPTS),
    buildMujarrodSoundVerb('fariha', 'r1-bab-5', ['ف', 'ر', 'ح'], 'Senang', 'فَرَحًا', BAB5_OPTS),
    buildMujarrodSoundVerb('salima', 'r1-bab-5', ['س', 'ل', 'م'], 'Selamat', 'سَلَامَةً', BAB5_OPTS),
  ],
};

const R1_BAB6: ShorofBab = {
  id: 'r1-bab-6',
  kode: 'Bab 6',
  namaBab: 'Tsulatsi Mujarrod Bab 6 (Dhammu-Dhammin)',
  kategori: 'Tsulatsi Mujarrod',
  wazanAr: 'فَعُلَ - يَفْعُلُ',
  wazanLatin: "Fa'ula - Yaf'ulu",
  kaidahAinFiil: "'Ain Fi'il berharakat Dhammah pada Madhi dan Dhammah pada Mudhari' (Fi'il Lazim/Sifat)",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'فَعُلَ',
    mudhari: 'يَفْعُلُ',
    mashdar: 'فُعُولَةً / فَعَالَةً',
    isim_fail: 'فَعِيلٌ / حَسَنٌ',
    isim_maful: '— (Lazim)',
    fiil_amr: 'اُفْعُلْ',
    fiil_nahyi: 'لَا تَفْعُلْ',
    isim_zaman_makan: 'مَفْعَلٌ',
    isim_alat: '— (Lazim)',
    madhi_majhul: '—',
    mudhari_majhul: '—',
  },
  mauzunList: [
    buildMujarrodSoundVerb('najusa', 'r1-bab-6', ['ن', 'ج', 'س'], 'Najis', 'نَجَاسَةً', BAB6_OPTS),
    buildMujarrodSoundVerb('katsura', 'r1-bab-6', ['ك', 'ث', 'ر'], 'Banyak', 'كَثْرَةً', BAB6_OPTS),
    buildMujarrodSoundVerb('r1-hasuna', 'r1-bab-6', ['ح', 'س', 'ن'], 'Baik', 'حُسْنًا', BAB6_OPTS),
    buildMujarrodSoundVerb('tsaqula', 'r1-bab-6', ['ث', 'ق', 'ل'], 'Berat', 'ثِقَلًا', BAB6_OPTS),
    buildMujarrodSoundVerb('syarufa', 'r1-bab-6', ['ش', 'ر', 'ف'], 'Mulia', 'شَرَفًا', BAB6_OPTS),
    buildMujarrodSoundVerb('sahula', 'r1-bab-6', ['س', 'ه', 'ل'], 'Mudah', 'سُهُولَةً', BAB6_OPTS),
  ],
};

function buildFaalaVerb(
  id: string,
  babId: string,
  rootLetters: [string, string, string],
  artiDasar: string,
  mashdar: string
): MauzunVerb {
  const [f, a, l] = rootLetters;
  const nunNiswahEnd = l === 'ن' ? 'َّ' : 'ْنَ';
  const nahnuMadhiEnd = l === 'ن' ? 'َّا' : 'ْنَا';
  const madhiStem = `${f}َ${a}َّ${l}`;
  const mudhariStem = `${a}ِّ${l}`;
  const amrStem = `${f}َ${a}ِّ${l}`;

  return {
    id,
    babId,
    rootLetters,
    artiDasar,
    istilahi: {
      madhi: `${madhiStem}َ`,
      mudhari: `يُ${f}َ${mudhariStem}ُ`,
      mashdar,
      isim_fail: `مُ${f}َ${a}ِّ${l}ٌ`,
      isim_maful: `مُ${f}َ${a}َّ${l}ٌ`,
      fiil_amr: `${amrStem}ْ`,
      fiil_nahyi: `لَا تُ${f}َ${a}ِّ${l}ْ`,
      isim_zaman_makan: `مُ${f}َ${a}َّ${l}ٌ`,
      isim_alat: '—',
      madhi_majhul: `${f}ُ${a}ِّ${l}َ`,
      mudhari_majhul: `يُ${f}َ${a}َّ${l}ُ`,
    },
    lughawiMadhi: [
      `${madhiStem}َ`,
      `${madhiStem}َا`,
      `${madhiStem}ُوا`,
      `${madhiStem}َتْ`,
      `${madhiStem}َتَا`,
      `${madhiStem}${nunNiswahEnd}`,
      `${madhiStem}ْتَ`,
      `${madhiStem}ْتُمَا`,
      `${madhiStem}ْتُمْ`,
      `${madhiStem}ْتِ`,
      `${madhiStem}ْتُمَا`,
      `${madhiStem}ْتُنَّ`,
      `${madhiStem}ْتُ`,
      `${madhiStem}${nahnuMadhiEnd}`,
    ],
    lughawiMudhari: [
      `يُ${f}َ${mudhariStem}ُ`,
      `يُ${f}َ${mudhariStem}َانِ`,
      `يُ${f}َ${mudhariStem}ُونَ`,
      `تُ${f}َ${mudhariStem}ُ`,
      `تُ${f}َ${mudhariStem}َانِ`,
      `يُ${f}َ${mudhariStem}${nunNiswahEnd}`,
      `تُ${f}َ${mudhariStem}ُ`,
      `تُ${f}َ${mudhariStem}َانِ`,
      `تُ${f}َ${mudhariStem}ُونَ`,
      `تُ${f}َ${mudhariStem}ِينَ`,
      `تُ${f}َ${mudhariStem}َانِ`,
      `تُ${f}َ${mudhariStem}${nunNiswahEnd}`,
      `أُ${f}َ${mudhariStem}ُ`,
      `نُ${f}َ${mudhariStem}ُ`,
    ],
    lughawiAmr: [
      `${amrStem}ْ`,
      `${amrStem}َا`,
      `${amrStem}ُوا`,
      `${amrStem}ِي`,
      `${amrStem}َا`,
      `${amrStem}${nunNiswahEnd}`,
    ],
  };
}

const MAZID1_BAB1: ShorofBab = {
  id: 'mazid1-bab-1',
  kode: 'Mazid 1 · Bab 1',
  namaBab: "Tsulatsi Mazid +1 Huruf Bab 1 (Fa''ala - Yufa''ilu)",
  kategori: 'Tsulatsi Mazid (+1 Huruf)',
  wazanAr: 'فَعَّلَ - يُفَعِّلُ',
  wazanLatin: "Fa''ala - Yufa''ilu",
  kaidahAinFiil: "Tambahan Tasydid (penggandaan) pada 'Ain Fi'il (bermakna Taktsir / Ta'diyah)",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'فَعَّلَ',
    mudhari: 'يُفَعِّلُ',
    mashdar: 'تَفْعِيلًا',
    isim_fail: 'مُفَعِّلٌ',
    isim_maful: 'مُفَعَّلٌ',
    fiil_amr: 'فَعِّلْ',
    fiil_nahyi: 'لَا تُفَعِّلْ',
    isim_zaman_makan: 'مُفَعَّلٌ',
    isim_alat: '—',
    madhi_majhul: 'فُعِّلَ',
    mudhari_majhul: 'يُفَعَّلُ',
  },
  mauzunList: [
    buildFaalaVerb('r1-hammada', 'mazid1-bab-1', ['ح', 'م', 'د'], 'Bertahmid', 'تَحْمِيدًا'),
    buildFaalaVerb('r1-bayyana', 'mazid1-bab-1', ['ب', 'ي', 'ن'], 'Menjelaskan', 'تَبْيِينًا'),
    buildFaalaVerb('r1-thahhara', 'mazid1-bab-1', ['ط', 'ه', 'ر'], 'Mensucikan', 'تَطْهِيرًا'),
    buildFaalaVerb('r1-karrama', 'mazid1-bab-1', ['ك', 'ر', 'م'], 'Memuliakan', 'تَكْرِيمًا'),
    buildFaalaVerb('r1-kadzdzaba', 'mazid1-bab-1', ['ك', 'ذ', 'ب'], 'Mendustakan', 'تَكْذِيبًا'),
    buildFaalaVerb('r1-haddatsa', 'mazid1-bab-1', ['ح', 'د', 'ث'], 'Menceritakan', 'تَحْدِيثًا'),
    buildFaalaVerb('r1-fassara', 'mazid1-bab-1', ['ف', 'س', 'ر'], 'Menafsirkan', 'تَفْسِيرًا'),
    buildFaalaVerb('r1-sabbaha', 'mazid1-bab-1', ['س', 'ب', 'ح'], 'Bertasbih', 'تَسْبِيحًا'),
    buildFaalaVerb('r1-allama', 'mazid1-bab-1', ['ع', 'ل', 'م'], 'Mengajarkan', 'تَعْلِيمًا'),
    buildFaalaVerb('r1-shaddaqa', 'mazid1-bab-1', ['ص', 'د', 'ق'], 'Membenarkan', 'تَصْدِيقًا'),
    buildFaalaVerb('r1-hawwala', 'mazid1-bab-1', ['ح', 'و', 'ل'], 'Mengubah', 'تَحْوِيلًا'),
    buildFaalaVerb('r1-kabbara', 'mazid1-bab-1', ['ك', 'ب', 'ر'], 'Bertakbir', 'تَكْبِيرًا'),
  ],
};

function buildAfalaVerb(
  id: string,
  rootLetters: [string, string, string],
  artiDasar: string,
  mashdar: string
): MauzunVerb {
  const [f, a, l] = rootLetters;
  if (f === 'أ' && l === 'ن') {
    return {
      id,
      babId: 'mazid1-bab-3',
      rootLetters,
      artiDasar,
      istilahi: {
        madhi: 'آمَنَ',
        mudhari: 'يُؤْمِنُ',
        mashdar,
        isim_fail: 'مُؤْمِنٌ',
        isim_maful: 'مُؤْمَنٌ',
        fiil_amr: 'آمِنْ',
        fiil_nahyi: 'لَا تُؤْمِنْ',
        isim_zaman_makan: 'مُؤْمَنٌ',
        isim_alat: '—',
        madhi_majhul: 'أُومِنَ',
        mudhari_majhul: 'يُؤْمَنُ',
      },
      lughawiMadhi: [
        'آمَنَ', 'آمَنَا', 'آمَنُوا',
        'آمَنَتْ', 'آمَنَتَا', 'آمَنَّ',
        'آمَنْتَ', 'آمَنْتُمَا', 'آمَنْتُمْ',
        'آمَنْتِ', 'آمَنْتُمَا', 'آمَنْتُنَّ',
        'آمَنْتُ', 'آمَنَّا',
      ],
      lughawiMudhari: [
        'يُؤْمِنُ', 'يُؤْمِنَانِ', 'يُؤْمِنُونَ',
        'تُؤْمِنُ', 'تُؤْمِنَانِ', 'يُؤْمِنَّ',
        'تُؤْمِنُ', 'تُؤْمِنَانِ', 'تُؤْمِنُونَ',
        'تُؤْمِنِينَ', 'تُؤْمِنَانِ', 'تُؤْمِنَّ',
        'أُومِنُ', 'نُؤْمِنُ',
      ],
      lughawiAmr: [
        'آمِنْ', 'آمِنَا', 'آمِنُوا',
        'آمِنِي', 'آمِنَا', 'آمِنَّ',
      ],
    };
  }

  const madhiStem = `أَ${f}ْ${a}َ${l}`;
  const mudhariStem = `${f}ْ${a}ِ${l}`;
  const amrStem = `أَ${f}ْ${a}ِ${l}`;

  return {
    id,
    babId: 'mazid1-bab-3',
    rootLetters,
    artiDasar,
    istilahi: {
      madhi: `${madhiStem}َ`,
      mudhari: `يُ${mudhariStem}ُ`,
      mashdar,
      isim_fail: `مُ${f}ْ${a}ِ${l}ٌ`,
      isim_maful: `مُ${f}ْ${a}َ${l}ٌ`,
      fiil_amr: `${amrStem}ْ`,
      fiil_nahyi: `لَا تُ${mudhariStem}ْ`,
      isim_zaman_makan: `مُ${f}ْ${a}َ${l}ٌ`,
      isim_alat: '—',
      madhi_majhul: `أُ${f}ْ${a}ِ${l}َ`,
      mudhari_majhul: `يُ${f}ْ${a}َ${l}ُ`,
    },
    lughawiMadhi: [
      `${madhiStem}َ`, `${madhiStem}َا`, `${madhiStem}ُوا`,
      `${madhiStem}َتْ`, `${madhiStem}َتَا`, `${madhiStem}ْنَ`,
      `${madhiStem}ْتَ`, `${madhiStem}ْتُمَا`, `${madhiStem}ْتُمْ`,
      `${madhiStem}ْتِ`, `${madhiStem}ْتُمَا`, `${madhiStem}ْتُنَّ`,
      `${madhiStem}ْتُ`, `${madhiStem}ْنَا`,
    ],
    lughawiMudhari: [
      `يُ${mudhariStem}ُ`, `يُ${mudhariStem}َانِ`, `يُ${mudhariStem}ُونَ`,
      `تُ${mudhariStem}ُ`, `تُ${mudhariStem}َانِ`, `يُ${mudhariStem}ْنَ`,
      `تُ${mudhariStem}ُ`, `تُ${mudhariStem}َانِ`, `تُ${mudhariStem}ُونَ`,
      `تُ${mudhariStem}ِينَ`, `تُ${mudhariStem}َانِ`, `تُ${mudhariStem}ْنَ`,
      `أُ${mudhariStem}ُ`, `نُ${mudhariStem}ُ`,
    ],
    lughawiAmr: [
      `${amrStem}ْ`, `${amrStem}َا`, `${amrStem}ُوا`,
      `${amrStem}ِي`, `${amrStem}َا`, `${amrStem}ْنَ`,
    ],
  };
}

const MAZID1_BAB3: ShorofBab = {
  id: 'mazid1-bab-3',
  kode: 'Mazid 1 · Bab 3',
  namaBab: "Tsulatsi Mazid +1 Huruf Bab 3 (Af'ala - Yuf'ilu)",
  kategori: 'Tsulatsi Mazid (+1 Huruf)',
  wazanAr: 'أَفْعَلَ - يُفْعِلُ',
  wazanLatin: "Af'ala - Yuf'ilu",
  kaidahAinFiil: "Tambahan 1 huruf Hamzah Qatha' di awal Fi'il Madhi (bermakna Ta'diyah / Mem-kan)",
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'أَفْعَلَ',
    mudhari: 'يُفْعِلُ',
    mashdar: 'إِفْعَالًا',
    isim_fail: 'مُفْعِلٌ',
    isim_maful: 'مُفْعَلٌ',
    fiil_amr: 'أَفْعِلْ',
    fiil_nahyi: 'لَا تُفْعِلْ',
    isim_zaman_makan: 'مُفْعَلٌ',
    isim_alat: '—',
    madhi_majhul: 'أُفْعِلَ',
    mudhari_majhul: 'يُفْعَلُ',
  },
  mauzunList: [
    buildAfalaVerb('r1-aslama', ['س', 'ل', 'م'], 'Masuk Islam', 'إِسْلَامًا'),
    buildAfalaVerb('r1-arsala', ['ر', 'س', 'ل'], 'Mengirim', 'إِرْسَالًا'),
    buildAfalaVerb('r1-akhlasha', ['خ', 'ل', 'ص'], 'Memurnikan', 'إِخْلَاصًا'),
    buildAfalaVerb('r1-amana', ['أ', 'م', 'ن'], 'Beriman', 'إِيمَانًا'),
    buildAfalaVerb('r1-anqadha', ['ن', 'ق', 'ض'], 'Memberatkan', 'إِنْقَاضًا'),
    buildAfalaVerb('r1-abada', ['ب', 'ع', 'د'], 'Menjauhkan', 'إِبْعَادًا'),
    buildAfalaVerb('r1-athama', ['ط', 'ع', 'م'], 'Memberi makan', 'إِطْعَامًا'),
    buildAfalaVerb('r1-azhara', ['ظ', 'ه', 'ر'], 'Menampakkan', 'إِظْهَارًا'),
    buildAfalaVerb('r1-ashraka', ['ش', 'ر', 'ك'], 'Mempersekutukan', 'إِشْرَاكًا'),
    buildAfalaVerb('r1-akhraja', ['خ', 'ر', 'ج'], 'Mengeluarkan', 'إِخْرَاجًا'),
    buildAfalaVerb('r1-akrama', ['ك', 'ر', 'م'], 'Memuliakan', 'إِكْرَامًا'),
    buildAfalaVerb('r1-ashlaha', ['ص', 'ل', 'ح'], 'Memperbaiki', 'إِصْلَاحًا'),
  ],
};

function buildIstafalaVerb(
  id: string,
  rootLetters: [string, string, string],
  artiDasar: string,
  mashdar: string
): MauzunVerb {
  const [f, a, l] = rootLetters;
  if (l === 'أ') {
    const stemBase = `سْتَ${f}ْ${a}`;
    return {
      id,
      babId: 'mazid3-bab-1',
      rootLetters,
      artiDasar,
      istilahi: {
        madhi: `اِ${stemBase}َأَ`,
        mudhari: `يَ${stemBase}ِئُ`,
        mashdar,
        isim_fail: `مُ${stemBase}ِئٌ`,
        isim_maful: `مُ${stemBase}َأٌ`,
        fiil_amr: `اِ${stemBase}ِئْ`,
        fiil_nahyi: `لَا تَ${stemBase}ِئْ`,
        isim_zaman_makan: `مُ${stemBase}َأٌ`,
        isim_alat: '—',
        madhi_majhul: `اُسْتُ${f}ْ${a}ِئَ`,
        mudhari_majhul: `يُ${stemBase}َأُ`,
      },
      lughawiMadhi: [
        `اِ${stemBase}َأَ`, `اِ${stemBase}َأَا`, `اِ${stemBase}َؤُوا`,
        `اِ${stemBase}َأَتْ`, `اِ${stemBase}َأَتَا`, `اِ${stemBase}َأْنَ`,
        `اِ${stemBase}َأْتَ`, `اِ${stemBase}َأْتُمَا`, `اِ${stemBase}َأْتُمْ`,
        `اِ${stemBase}َأْتِ`, `اِ${stemBase}َأْتُمَا`, `اِ${stemBase}َأْتُنَّ`,
        `اِ${stemBase}َأْتُ`, `اِ${stemBase}َأْنَا`,
      ],
      lughawiMudhari: [
        `يَ${stemBase}ِئُ`, `يَ${stemBase}ِئَانِ`, `يَ${stemBase}ِئُونَ`,
        `تَ${stemBase}ِئُ`, `تَ${stemBase}ِئَانِ`, `يَ${stemBase}ِئْنَ`,
        `تَ${stemBase}ِئُ`, `تَ${stemBase}ِئَانِ`, `تَ${stemBase}ِئُونَ`,
        `تَ${stemBase}ِئِينَ`, `تَ${stemBase}ِئَانِ`, `تَ${stemBase}ِئْنَ`,
        `أَ${stemBase}ِئُ`, `نَ${stemBase}ِئُ`,
      ],
      lughawiAmr: [
        `اِ${stemBase}ِئْ`, `اِ${stemBase}ِئَا`, `اِ${stemBase}ِئُوا`,
        `اِ${stemBase}ِئِي`, `اِ${stemBase}ِئَا`, `اِ${stemBase}ِئْنَ`,
      ],
    };
  }

  const madhiStem = `اِسْتَ${f}ْ${a}َ${l}`;
  const mudhariStem = `سْتَ${f}ْ${a}ِ${l}`;
  const amrStem = `اِسْتَ${f}ْ${a}ِ${l}`;
  const majhulFa = f === 'أ' ? 'ؤ' : f;

  return {
    id,
    babId: 'mazid3-bab-1',
    rootLetters,
    artiDasar,
    istilahi: {
      madhi: `${madhiStem}َ`,
      mudhari: `يَ${mudhariStem}ُ`,
      mashdar,
      isim_fail: `مُ${mudhariStem}ٌ`,
      isim_maful: `مُسْتَ${f}ْ${a}َ${l}ٌ`,
      fiil_amr: `${amrStem}ْ`,
      fiil_nahyi: `لَا تَ${mudhariStem}ْ`,
      isim_zaman_makan: `مُسْتَ${f}ْ${a}َ${l}ٌ`,
      isim_alat: '—',
      madhi_majhul: `اُسْتُ${majhulFa}ْ${a}ِ${l}َ`,
      mudhari_majhul: `يُسْتَ${f}ْ${a}َ${l}ُ`,
    },
    ...buildFathahMudhariLughawi(madhiStem, mudhariStem, amrStem, l),
  };
}

const MAZID3_BAB1: ShorofBab = {
  id: 'mazid3-bab-1',
  kode: 'Mazid 3 · Bab 1',
  namaBab: "Tsulatsi Mazid +3 Huruf Bab 1 (Istaf'ala - Yastaf'ilu)",
  kategori: 'Tsulatsi Mazid (+3 Huruf)',
  wazanAr: 'اِسْتَفْعَلَ - يَسْتَفْعِلُ',
  wazanLatin: "Istaf'ala - Yastaf'ilu",
  kaidahAinFiil: 'Tambahan 3 huruf (Hamzah Washal, Sin, dan Ta) di awal kata (bermakna Thalab / Meminta)',
  questionsPerSection: 10,
  sectionedExam: true,
  wazanIstilahi: {
    madhi: 'اِسْتَفْعَلَ',
    mudhari: 'يَسْتَفْعِلُ',
    mashdar: 'اِسْتِفْعَالًا',
    isim_fail: 'مُسْتَفْعِلٌ',
    isim_maful: 'مُسْتَفْعَلٌ',
    fiil_amr: 'اِسْتَفْعِلْ',
    fiil_nahyi: 'لَا تَسْتَفْعِلْ',
    isim_zaman_makan: 'مُسْتَفْعَلٌ',
    isim_alat: '—',
    madhi_majhul: 'اُسْتُفْعِلَ',
    mudhari_majhul: 'يُسْتَفْعَلُ',
  },
  mauzunList: [
    buildIstafalaVerb('r1-istaftaha', ['ف', 'ت', 'ح'], 'Minta dibukakan', 'اِسْتِفْتَاحًا'),
    buildIstafalaVerb('r1-istahzaa', ['ه', 'ز', 'أ'], 'Berolok-olok', 'اِسْتِهْزَاءً'),
    buildIstafalaVerb('r1-istaakhara', ['أ', 'خ', 'ر'], 'Minta diakhirkan', 'اِسْتِئْخَارًا'),
    buildIstafalaVerb('r1-istaslama', ['س', 'ل', 'م'], 'Berserah diri', 'اِسْتِسْلَامًا'),
    buildIstafalaVerb('r1-istaamala', ['ع', 'م', 'ل'], 'Memakai', 'اِسْتِعْمَالًا'),
    buildIstafalaVerb('r1-istakbara', ['ك', 'ب', 'ر'], 'Sombong', 'اِسْتِكْبَارًا'),
    buildIstafalaVerb('r1-istaqdama', ['ق', 'د', 'م'], 'Minta didatangkan', 'اِسْتِقْدَامًا'),
    buildIstafalaVerb('r1-istaghfara', ['غ', 'ف', 'ر'], 'Minta ampun', 'اِسْتِغْفَارًا'),
    buildIstafalaVerb('r1-istafhama', ['ف', 'ه', 'م'], 'Menanyakan', 'اِسْتِفْهَامًا'),
  ],
};

export const SHOROF_BABS_REGULER_1: ShorofBab[] = [
  // 6 Bab Tsulatsi Mujarrod
  R1_BAB1, // Bab 1: فَعَلَ - يَفْعُلُ (12 Mufradat, 60 soal)
  R1_BAB2, // Bab 2: فَعَلَ - يَفْعِلُ (12 Mufradat, 60 soal)
  R1_BAB3, // Bab 3: فَعَلَ - يَفْعَلُ (12 Mufradat, 60 soal)
  R1_BAB4, // Bab 4: فَعِلَ - يَفْعِلُ (3 Mufradat, 60 soal)
  R1_BAB5, // Bab 5: فَعِلَ - يَفْعَلُ (12 Mufradat, 60 soal)
  R1_BAB6, // Bab 6: فَعُلَ - يَفْعُلُ (6 Mufradat, 60 soal)
  // 3 Bab Tsulatsi Mazid (+1 Huruf)
  MAZID1_BAB1, // Mazid 1 Bab 1: فَعَّلَ - يُفَعِّلُ (12 Mufradat, 10 soal/Bagian)
  MAZID1_BAB2,
  MAZID1_BAB3, // Mazid 1 Bab 3: أَفْعَلَ - يُفْعِلُ (12 Mufradat, 10 soal/Bagian)
  // 4 Bab Tsulatsi Mazid (+2 Huruf)
  MAZID2_BAB1,
  MAZID2_BAB2,
  MAZID2_BAB3,
  MAZID2_BAB4,
  // 1 Bab Tsulatsi Mazid (+3 Huruf)
  MAZID3_BAB1, // Mazid 3 Bab 1: اِسْتَفْعَلَ - يَسْتَفْعِلُ (9 Mufradat, 10 soal/Bagian)
];
