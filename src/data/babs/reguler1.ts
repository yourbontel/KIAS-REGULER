import type { MauzunVerb, ShorofBab } from './types';
import { SHOROF_BABS_REGULER_2 } from './reguler2';

function cloneReguler2Bab(
  sourceId: string,
  overrides: Pick<ShorofBab, 'id' | 'kode' | 'namaBab' | 'kategori'>
): ShorofBab {
  const base = SHOROF_BABS_REGULER_2.find((b) => b.id === sourceId);
  if (!base) {
    throw new Error(`Missing base bab: ${sourceId}`);
  }
  return {
    ...base,
    ...overrides,
    bankBabId: base.id,
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
    {
      id: 'saada',
      babId: 'mazid1-bab-2',
      rootLetters: ['س', 'ع', 'د'],
      artiDasar: 'Membantu / Menolong',
      istilahi: {
        madhi: 'سَاعَدَ',
        mudhari: 'يُسَاعِدُ',
        mashdar: 'مُسَاعَدَةً',
        isim_fail: 'مُسَاعِدٌ',
        isim_maful: 'مُسَاعَدٌ',
        fiil_amr: 'سَاعِدْ',
        fiil_nahyi: 'لَا تُسَاعِدْ',
        isim_zaman_makan: 'مُسَاعَدٌ',
        isim_alat: '—',
        madhi_majhul: 'سُوعِدَ',
        mudhari_majhul: 'يُسَاعَدُ',
      },
      lughawiMadhi: [
        'سَاعَدَ', 'سَاعَدَا', 'سَاعَدُوا',
        'سَاعَدَتْ', 'سَاعَدَتَا', 'سَاعَدْنَ',
        'سَاعَدْتَ', 'سَاعَدْتُمَا', 'سَاعَدْتُمْ',
        'سَاعَدْتِ', 'سَاعَدْتُمَا', 'سَاعَدْتُنَّ',
        'سَاعَدْتُ', 'سَاعَدْنَا',
      ],
      lughawiMudhari: [
        'يُسَاعِدُ', 'يُسَاعِدَانِ', 'يُسَاعِدُونَ',
        'تُسَاعِدُ', 'تُسَاعِدَانِ', 'يُسَاعِدْنَ',
        'تُسَاعِدُ', 'تُسَاعِدَانِ', 'تُسَاعِدُونَ',
        'تُسَاعِدِينَ', 'تُسَاعِدَانِ', 'تُسَاعِدْنَ',
        'أُسَاعِدُ', 'نُسَاعِدُ',
      ],
      lughawiAmr: ['سَاعِدْ', 'سَاعِدَا', 'سَاعِدُوا', 'سَاعِدِي', 'سَاعِدَا', 'سَاعِدْنَ'],
    },
  ],
};

const MAZID2_BAB1: ShorofBab = {
  id: 'mazid2-bab-1',
  kode: 'Mazid 2 · Bab 1',
  namaBab: "Tsulatsi Mazid +2 Huruf Bab 1 (Tafa''ala - Yatafa''alu)",
  kategori: 'Tsulatsi Mazid (+2 Huruf)',
  wazanAr: 'تَفَعَّلَ - يَتَفَعَّلُ',
  wazanLatin: "Tafa''ala - Yatafa''alu",
  kaidahAinFiil: "Tambahan Ta' di awal dan Tasydid pada 'Ain Fi'il (sering bermakna muthawa'ah / bertahap)",
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
    {
      id: 'taallama',
      babId: 'mazid2-bab-1',
      rootLetters: ['ع', 'ل', 'م'],
      artiDasar: 'Belajar / Mempelajari',
      istilahi: {
        madhi: 'تَعَلَّمَ',
        mudhari: 'يَتَعَلَّمُ',
        mashdar: 'تَعَلُّمًا',
        isim_fail: 'مُتَعَلِّمٌ',
        isim_maful: 'مُتَعَلَّمٌ',
        fiil_amr: 'تَعَلَّمْ',
        fiil_nahyi: 'لَا تَتَعَلَّمْ',
        isim_zaman_makan: 'مُتَعَلَّمٌ',
        isim_alat: '—',
        madhi_majhul: 'تُعُلِّمَ',
        mudhari_majhul: 'يُتَعَلَّمُ',
      },
      lughawiMadhi: [
        'تَعَلَّمَ', 'تَعَلَّمَا', 'تَعَلَّمُوا',
        'تَعَلَّمَتْ', 'تَعَلَّمَتَا', 'تَعَلَّمْنَ',
        'تَعَلَّمْتَ', 'تَعَلَّمْتُمَا', 'تَعَلَّمْتُمْ',
        'تَعَلَّمْتِ', 'تَعَلَّمْتُمَا', 'تَعَلَّمْتُنَّ',
        'تَعَلَّمْتُ', 'تَعَلَّمْنَا',
      ],
      lughawiMudhari: [
        'يَتَعَلَّمُ', 'يَتَعَلَّمَانِ', 'يَتَعَلَّمُونَ',
        'تَتَعَلَّمُ', 'تَتَعَلَّمَانِ', 'يَتَعَلَّمْنَ',
        'تَتَعَلَّمُ', 'تَتَعَلَّمَانِ', 'تَتَعَلَّمُونَ',
        'تَتَعَلَّمِينَ', 'تَتَعَلَّمَانِ', 'تَتَعَلَّمْنَ',
        'أَتَعَلَّمُ', 'نَتَعَلَّمُ',
      ],
      lughawiAmr: ['تَعَلَّمْ', 'تَعَلَّمَا', 'تَعَلَّمُوا', 'تَعَلَّمِي', 'تَعَلَّمَا', 'تَعَلَّمْنَ'],
    },
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
    {
      id: 'taqabala',
      babId: 'mazid2-bab-2',
      rootLetters: ['ق', 'ب', 'ل'],
      artiDasar: 'Saling Bertemu',
      istilahi: {
        madhi: 'تَقَابَلَ',
        mudhari: 'يَتَقَابَلُ',
        mashdar: 'تَقَابُلًا',
        isim_fail: 'مُتَقَابِلٌ',
        isim_maful: 'مُتَقَابَلٌ',
        fiil_amr: 'تَقَابَلْ',
        fiil_nahyi: 'لَا تَتَقَابَلْ',
        isim_zaman_makan: 'مُتَقَابَلٌ',
        isim_alat: '—',
        madhi_majhul: 'تُقُوبِلَ',
        mudhari_majhul: 'يُتَقَابَلُ',
      },
      lughawiMadhi: [
        'تَقَابَلَ', 'تَقَابَلَا', 'تَقَابَلُوا',
        'تَقَابَلَتْ', 'تَقَابَلَتَا', 'تَقَابَلْنَ',
        'تَقَابَلْتَ', 'تَقَابَلْتُمَا', 'تَقَابَلْتُمْ',
        'تَقَابَلْتِ', 'تَقَابَلْتُمَا', 'تَقَابَلْتُنَّ',
        'تَقَابَلْتُ', 'تَقَابَلْنَا',
      ],
      lughawiMudhari: [
        'يَتَقَابَلُ', 'يَتَقَابَلَانِ', 'يَتَقَابَلُونَ',
        'تَتَقَابَلُ', 'تَتَقَابَلَانِ', 'يَتَقَابَلْنَ',
        'تَتَقَابَلُ', 'تَتَقَابَلَانِ', 'تَتَقَابَلُونَ',
        'تَتَقَابَلِينَ', 'تَتَقَابَلَانِ', 'تَتَقَابَلْنَ',
        'أَتَقَابَلُ', 'نَتَقَابَلُ',
      ],
      lughawiAmr: ['تَقَابَلْ', 'تَقَابَلَا', 'تَقَابَلُوا', 'تَقَابَلِي', 'تَقَابَلَا', 'تَقَابَلْنَ'],
    },
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
    {
      id: 'ijtamaa',
      babId: 'mazid2-bab-3',
      rootLetters: ['ج', 'م', 'ع'],
      artiDasar: 'Berkumpul',
      istilahi: {
        madhi: 'اِجْتَمَعَ',
        mudhari: 'يَجْتَمِعُ',
        mashdar: 'اِجْتِمَاعًا',
        isim_fail: 'مُجْتَمِعٌ',
        isim_maful: 'مُجْتَمَعٌ',
        fiil_amr: 'اِجْتَمِعْ',
        fiil_nahyi: 'لَا تَجْتَمِعْ',
        isim_zaman_makan: 'مُجْتَمَعٌ',
        isim_alat: '—',
        madhi_majhul: 'اُجْتُمِعَ',
        mudhari_majhul: 'يُجْتَمَعُ',
      },
      lughawiMadhi: [
        'اِجْتَمَعَ', 'اِجْتَمَعَا', 'اِجْتَمَعُوا',
        'اِجْتَمَعَتْ', 'اِجْتَمَعَتَا', 'اِجْتَمَعْنَ',
        'اِجْتَمَعْتَ', 'اِجْتَمَعْتُمَا', 'اِجْتَمَعْتُمْ',
        'اِجْتَمَعْتِ', 'اِجْتَمَعْتُمَا', 'اِجْتَمَعْتُنَّ',
        'اِجْتَمَعْتُ', 'اِجْتَمَعْنَا',
      ],
      lughawiMudhari: [
        'يَجْتَمِعُ', 'يَجْتَمِعَانِ', 'يَجْتَمِعُونَ',
        'تَجْتَمِعُ', 'تَجْتَمِعَانِ', 'يَجْتَمِعْنَ',
        'تَجْتَمِعُ', 'تَجْتَمِعَانِ', 'تَجْتَمِعُونَ',
        'تَجْتَمِعِينَ', 'تَجْتَمِعَانِ', 'تَجْتَمِعْنَ',
        'أَجْتَمِعُ', 'نَجْتَمِعُ',
      ],
      lughawiAmr: ['اِجْتَمِعْ', 'اِجْتَمِعَا', 'اِجْتَمِعُوا', 'اِجْتَمِعِي', 'اِجْتَمِعَا', 'اِجْتَمِعْنَ'],
    },
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
    {
      id: 'inkasara',
      babId: 'mazid2-bab-4',
      rootLetters: ['ك', 'س', 'ر'],
      artiDasar: 'Pecah / Terpecah',
      istilahi: {
        madhi: 'اِنْكَسَرَ',
        mudhari: 'يَنْكَسِرُ',
        mashdar: 'اِنْكِسَارًا',
        isim_fail: 'مُنْكَسِرٌ',
        isim_maful: 'مُنْكَسَرٌ',
        fiil_amr: 'اِنْكَسِرْ',
        fiil_nahyi: 'لَا تَنْكَسِرْ',
        isim_zaman_makan: 'مُنْكَسَرٌ',
        isim_alat: '—',
        madhi_majhul: 'اُنْكُسِرَ',
        mudhari_majhul: 'يُنْكَسَرُ',
      },
      lughawiMadhi: [
        'اِنْكَسَرَ', 'اِنْكَسَرَا', 'اِنْكَسَرُوا',
        'اِنْكَسَرَتْ', 'اِنْكَسَرَتَا', 'اِنْكَسَرْنَ',
        'اِنْكَسَرْتَ', 'اِنْكَسَرْتُمَا', 'اِنْكَسَرْتُمْ',
        'اِنْكَسَرْتِ', 'اِنْكَسَرْتُمَا', 'اِنْكَسَرْتُنَّ',
        'اِنْكَسَرْتُ', 'اِنْكَسَرْنَا',
      ],
      lughawiMudhari: [
        'يَنْكَسِرُ', 'يَنْكَسِرَانِ', 'يَنْكَسِرُونَ',
        'تَنْكَسِرُ', 'تَنْكَسِرَانِ', 'يَنْكَسِرْنَ',
        'تَنْكَسِرُ', 'تَنْكَسِرَانِ', 'تَنْكَسِرُونَ',
        'تَنْكَسِرِينَ', 'تَنْكَسِرَانِ', 'تَنْكَسِرْنَ',
        'أَنْكَسِرُ', 'نَنْكَسِرُ',
      ],
      lughawiAmr: ['اِنْكَسِرْ', 'اِنْكَسِرَا', 'اِنْكَسِرُوا', 'اِنْكَسِرِي', 'اِنْكَسِرَا', 'اِنْكَسِرْنَ'],
    },
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
  ...SHOROF_BABS_REGULER_2[0],
  id: 'r1-bab-1',
  kode: 'Bab 1',
  namaBab: 'Tsulatsi Mujarrod Bab 1 (Fathu-Dhammin)',
  kategori: 'Tsulatsi Mujarrod',
  questionsPerSection: 10,
  sectionedExam: true,
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
  ...SHOROF_BABS_REGULER_2[1],
  id: 'r1-bab-2',
  kode: 'Bab 2',
  namaBab: 'Tsulatsi Mujarrod Bab 2 (Fathu-Kasrin)',
  kategori: 'Tsulatsi Mujarrod',
  questionsPerSection: 10,
  sectionedExam: true,
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
  ...SHOROF_BABS_REGULER_2[2],
  id: 'r1-bab-3',
  kode: 'Bab 3',
  namaBab: 'Tsulatsi Mujarrod Bab 3 (Fathu-Fathin)',
  kategori: 'Tsulatsi Mujarrod',
  questionsPerSection: 10,
  sectionedExam: true,
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
  ...SHOROF_BABS_REGULER_2[5],
  id: 'r1-bab-4',
  kode: 'Bab 4',
  namaBab: 'Tsulatsi Mujarrod Bab 4 (Kasru-Kasrin)',
  kategori: 'Tsulatsi Mujarrod',
  questionsPerSection: 10,
  sectionedExam: true,
  mauzunList: [
    buildMujarrodSoundVerb('naima', 'r1-bab-4', ['ن', 'ع', 'م'], 'Lembut', 'نَعِيمًا', BAB4_OPTS),
    buildMujarrodSoundVerb('tafiha', 'r1-bab-4', ['ت', 'ف', 'ه'], 'Rendah', 'تَفَهًا', BAB4_OPTS),
    buildMujarrodSoundVerb('r1-hasiba', 'r1-bab-4', ['ح', 'س', 'ب'], 'Menghitung', 'حُسْبَانًا', BAB4_OPTS),
  ],
};

const R1_BAB5: ShorofBab = {
  ...SHOROF_BABS_REGULER_2[3],
  id: 'r1-bab-5',
  kode: 'Bab 5',
  namaBab: 'Tsulatsi Mujarrod Bab 5 (Kasru-Fathin)',
  kategori: 'Tsulatsi Mujarrod',
  questionsPerSection: 10,
  sectionedExam: true,
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
  ...SHOROF_BABS_REGULER_2[4],
  id: 'r1-bab-6',
  kode: 'Bab 6',
  namaBab: 'Tsulatsi Mujarrod Bab 6 (Dhammu-Dhammin)',
  kategori: 'Tsulatsi Mujarrod',
  questionsPerSection: 10,
  sectionedExam: true,
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
  cloneReguler2Bab('mazid-1', {
    id: 'mazid1-bab-3',
    kode: 'Mazid 1 · Bab 3',
    namaBab: "Tsulatsi Mazid +1 Huruf Bab 3 (Af'ala - Yuf'ilu)",
    kategori: 'Tsulatsi Mazid (+1 Huruf)',
  }),
  // 4 Bab Tsulatsi Mazid (+2 Huruf)
  MAZID2_BAB1,
  MAZID2_BAB2,
  MAZID2_BAB3,
  MAZID2_BAB4,
  // 1 Bab Tsulatsi Mazid (+3 Huruf)
  cloneReguler2Bab('mazid-3', {
    id: 'mazid3-bab-1',
    kode: 'Mazid 3 · Bab 1',
    namaBab: "Tsulatsi Mazid +3 Huruf Bab 1 (Istaf'ala - Yastaf'ilu)",
    kategori: 'Tsulatsi Mazid (+3 Huruf)',
  }),
];
