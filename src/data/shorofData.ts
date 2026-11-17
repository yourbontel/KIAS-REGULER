import type { StudentClass } from './students';

export interface ShighatItem {
  key:
    | 'madhi'
    | 'mudhari'
    | 'mashdar'
    | 'isim_fail'
    | 'isim_maful'
    | 'fiil_amr'
    | 'fiil_nahyi'
    | 'isim_zaman_makan'
    | 'isim_alat'
    | 'madhi_majhul'
    | 'mudhari_majhul';
  labelId: string;
  labelAr: string;
  functionDesc: string;
}

export const SHIGHAT_LIST: ShighatItem[] = [
  { key: 'madhi', labelId: "Fi'il Madhi", labelAr: 'فِعْل مَاضٍ', functionDesc: 'Kata kerja lampau (aktif)' },
  { key: 'mudhari', labelId: "Fi'il Mudhari'", labelAr: 'فِعْل مُضَارِع', functionDesc: 'Kata kerja sedang/akan datang (aktif)' },
  { key: 'mashdar', labelId: 'Mashdar', labelAr: 'مَصْدَر', functionDesc: 'Kata benda dasar / kata kerja yang dibendakan' },
  { key: 'isim_fail', labelId: "Isim Fa'il", labelAr: 'اِسْم فَاعِل', functionDesc: 'Kata benda pelaku (Yang melakukan...)' },
  { key: 'isim_maful', labelId: "Isim Maf'ul", labelAr: 'اِسْم مَفْعُول', functionDesc: 'Kata benda penderita/objek (Yang di-...)' },
  { key: 'fiil_amr', labelId: "Fi'il Amr", labelAr: 'فِعْل أَمْر', functionDesc: 'Kata kerja perintah (...-lah!)' },
  { key: 'fiil_nahyi', labelId: "Fi'il Nahyi", labelAr: 'فِعْل نَهْي', functionDesc: 'Kata kerja larangan (Janganlah...!)' },
  { key: 'isim_zaman_makan', labelId: 'Isim Zaman / Makan', labelAr: 'اِسْم زَمَان وَمَكَان', functionDesc: 'Kata keterangan waktu atau tempat kejadian' },
  { key: 'isim_alat', labelId: 'Isim Alat', labelAr: 'اِسْم آلَة', functionDesc: 'Kata benda alat untuk melakukan pekerjaan' },
  { key: 'madhi_majhul', labelId: 'Madhi Majhul', labelAr: 'مَاضٍ مَجْهُول', functionDesc: 'Kata kerja pasif lampau (Telah di-...)' },
  { key: 'mudhari_majhul', labelId: "Mudhari' Majhul", labelAr: 'مُضَارِع مَجْهُول', functionDesc: 'Kata kerja pasif sedang/akan (Sedang di-...)' },
];

export interface DhamirInfo {
  id: string;
  dhamirAr: string;
  dhamirLatin: string;
  kategori: string;
  artiId: string;
}

export const DHAMIR_14: DhamirInfo[] = [
  { id: 'huwa', dhamirAr: 'هُوَ', dhamirLatin: 'Huwa', kategori: 'Ghaib (Mufrad Mudzakkar)', artiId: 'Dia (1 Laki-laki)' },
  { id: 'huma_m', dhamirAr: 'هُمَا', dhamirLatin: 'Humaa (L)', kategori: 'Ghaib (Mutsanna Mudzakkar)', artiId: 'Mereka berdua (Laki-laki)' },
  { id: 'hum', dhamirAr: 'هُمْ', dhamirLatin: 'Hum', kategori: 'Ghaib (Jamak Mudzakkar)', artiId: 'Mereka (Laki-laki)' },
  { id: 'hiya', dhamirAr: 'هِيَ', dhamirLatin: 'Hiya', kategori: 'Ghaibah (Mufrad Muannats)', artiId: 'Dia (1 Perempuan)' },
  { id: 'huma_f', dhamirAr: 'هُمَا', dhamirLatin: 'Humaa (P)', kategori: 'Ghaibah (Mutsanna Muannats)', artiId: 'Mereka berdua (Perempuan)' },
  { id: 'hunna', dhamirAr: 'هُنَّ', dhamirLatin: 'Hunna', kategori: 'Ghaibah (Jamak Muannats)', artiId: 'Mereka (Perempuan)' },
  { id: 'anta', dhamirAr: 'أَنْتَ', dhamirLatin: 'Anta', kategori: 'Mukhatab (Mufrad Mudzakkar)', artiId: 'Kamu (1 Laki-laki)' },
  { id: 'antuma_m', dhamirAr: 'أَنْتُمَا', dhamirLatin: 'Antumaa (L)', kategori: 'Mukhatab (Mutsanna Mudzakkar)', artiId: 'Kalian berdua (Laki-laki)' },
  { id: 'antum', dhamirAr: 'أَنْتُمْ', dhamirLatin: 'Antum', kategori: 'Mukhatab (Jamak Mudzakkar)', artiId: 'Kalian (Laki-laki)' },
  { id: 'anti', dhamirAr: 'أَنْتِ', dhamirLatin: 'Anti', kategori: 'Mukhatabah (Mufrad Muannats)', artiId: 'Kamu (1 Perempuan)' },
  { id: 'antuma_f', dhamirAr: 'أَنْتُمَا', dhamirLatin: 'Antumaa (P)', kategori: 'Mukhatabah (Mutsanna Muannats)', artiId: 'Kalian berdua (Perempuan)' },
  { id: 'antunna', dhamirAr: 'أَنْتُنَّ', dhamirLatin: 'Antunna', kategori: 'Mukhatabah (Jamak Muannats)', artiId: 'Kalian (Perempuan)' },
  { id: 'ana', dhamirAr: 'أَنَا', dhamirLatin: 'Anaa', kategori: 'Mutakallim Wahdah', artiId: 'Saya (L/P)' },
  { id: 'nahnu', dhamirAr: 'نَحْنُ', dhamirLatin: 'Nahnu', kategori: "Mutakallim Ma'al Ghair", artiId: 'Kami / Kita (L/P)' },
];

export interface MauzunVerb {
  id: string;
  babId: string;
  rootLetters: [string, string, string]; // Fa, Ain, Lam
  artiDasar: string;
  istilahi: {
    madhi: string;
    mudhari: string;
    mashdar: string;
    isim_fail: string;
    isim_maful: string;
    fiil_amr: string;
    fiil_nahyi: string;
    isim_zaman_makan: string;
    isim_alat: string;
    madhi_majhul: string;
    mudhari_majhul: string;
  };
  lughawiMadhi: string[]; // 14 forms matching DHAMIR_14
  lughawiMudhari: string[]; // 14 forms matching DHAMIR_14
  lughawiAmr: string[]; // 6 forms for Anta, Antuma, Antum, Anti, Antuma, Antunna
}

export type ShorofKategori =
  | 'Tsulatsi Mujarrod'
  | 'Tsulatsi Mazid (+1 Huruf)'
  | 'Tsulatsi Mazid (+2 Huruf)'
  | 'Tsulatsi Mazid (+3 Huruf)'
  | 'Tsulatsi Mazid';

export interface ShorofBab {
  id: string;
  kode: string;
  namaBab: string;
  kategori: ShorofKategori;
  wazanAr: string;
  wazanLatin: string;
  kaidahAinFiil: string;
  /** Optional fallback Bab ID in curated exam bank when a Bab shares wazan with another class curriculum */
  bankBabId?: string;
  /** Number of exam questions per section (default 2, i.e. 12 total across 6 Bagian) */
  questionsPerSection?: number;
  /** Jika true, 6 Bagian soal dikerjakan satu per satu (bukan sekaligus) dengan nilai per Bagian */
  sectionedExam?: boolean;
  wazanIstilahi: {
    madhi: string;
    mudhari: string;
    mashdar: string;
    isim_fail: string;
    isim_maful: string;
    fiil_amr: string;
    fiil_nahyi: string;
    isim_zaman_makan: string;
    isim_alat: string;
    madhi_majhul: string;
    mudhari_majhul: string;
  };
  mauzunList: MauzunVerb[];
}

export const SHOROF_BABS_REGULER_2: ShorofBab[] = [
  {
    id: 'bab-1',
    kode: 'Bab 1',
    namaBab: 'Tsulatsi Mujarrod Bab 1 (Fathu-Dhammin)',
    kategori: 'Tsulatsi Mujarrod',
    wazanAr: 'فَعَلَ - يَفْعُلُ',
    wazanLatin: "Fa'ala - Yaf'ulu",
    kaidahAinFiil: "'Ain Fi'il berharakat Fathah pada Madhi dan Dhammah pada Mudhari'",
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
      {
        id: 'nasara',
        babId: 'bab-1',
        rootLetters: ['ن', 'ص', 'ر'],
        artiDasar: 'Menolong',
        istilahi: {
          madhi: 'نَصَرَ',
          mudhari: 'يَنْصُرُ',
          mashdar: 'نَصْرًا',
          isim_fail: 'نَاصِرٌ',
          isim_maful: 'مَنْصُورٌ',
          fiil_amr: 'اُنْصُرْ',
          fiil_nahyi: 'لَا تَنْصُرْ',
          isim_zaman_makan: 'مَنْصَرٌ',
          isim_alat: 'مِنْصَرٌ',
          madhi_majhul: 'نُصِرَ',
          mudhari_majhul: 'يُنْصَرُ',
        },
        lughawiMadhi: [
          'نَصَرَ', 'نَصَرَا', 'نَصَرُوا',
          'نَصَرَتْ', 'نَصَرَتَا', 'نَصَرْنَ',
          'نَصَرْتَ', 'نَصَرْتُمَا', 'نَصَرْتُمْ',
          'نَصَرْتِ', 'نَصَرْتُمَا', 'نَصَرْتُنَّ',
          'نَصَرْتُ', 'نَصَرْنَا',
        ],
        lughawiMudhari: [
          'يَنْصُرُ', 'يَنْصُرَانِ', 'يَنْصُرُونَ',
          'تَنْصُرُ', 'تَنْصُرَانِ', 'يَنْصُرْنَ',
          'تَنْصُرُ', 'تَنْصُرَانِ', 'تَنْصُرُونَ',
          'تَنْصُرِينَ', 'تَنْصُرَانِ', 'تَنْصُرْنَ',
          'أَنْصُرُ', 'نَنْصُرُ',
        ],
        lughawiAmr: ['اُنْصُرْ', 'اُنْصُرَا', 'اُنْصُرُوا', 'اُنْصُرِي', 'اُنْصُرَا', 'اُنْصُرْنَ'],
      },
      {
        id: 'kataba',
        babId: 'bab-1',
        rootLetters: ['ك', 'ت', 'ب'],
        artiDasar: 'Menulis',
        istilahi: {
          madhi: 'كَتَبَ',
          mudhari: 'يَكْتُبُ',
          mashdar: 'كِتَابَةً',
          isim_fail: 'كَاتِبٌ',
          isim_maful: 'مَكْتُوبٌ',
          fiil_amr: 'اُكْتُبْ',
          fiil_nahyi: 'لَا تَكْتُبْ',
          isim_zaman_makan: 'مَكْتَبٌ',
          isim_alat: 'مِكْتَبٌ',
          madhi_majhul: 'كُتِبَ',
          mudhari_majhul: 'يُكْتَبُ',
        },
        lughawiMadhi: [
          'كَتَبَ', 'كَتَبَا', 'كَتَبُوا',
          'كَتَبَتْ', 'كَتَبَتَا', 'كَتَبْنَ',
          'كَتَبْتَ', 'كَتَبْتُمَا', 'كَتَبْتُمْ',
          'كَتَبْتِ', 'كَتَبْتُمَا', 'كَتَبْتُنَّ',
          'كَتَبْتُ', 'كَتَبْنَا',
        ],
        lughawiMudhari: [
          'يَكْتُبُ', 'يَكْتُبَانِ', 'يَكْتُبُونَ',
          'تَكْتُبُ', 'تَكْتُبَانِ', 'يَكْتُبْنَ',
          'تَكْتُبُ', 'تَكْتُبَانِ', 'تَكْتُبُونَ',
          'تَكْتُبِينَ', 'تَكْتُبَانِ', 'تَكْتُبْنَ',
          'أَكْتُبُ', 'نَكْتُبُ',
        ],
        lughawiAmr: ['اُكْتُبْ', 'اُكْتُبَا', 'اُكْتُبُوا', 'اُكْتُبِي', 'اُكْتُبَا', 'اُكْتُبْنَ'],
      },
      {
        id: 'dakhala',
        babId: 'bab-1',
        rootLetters: ['د', 'خ', 'ل'],
        artiDasar: 'Masuk',
        istilahi: {
          madhi: 'دَخَلَ',
          mudhari: 'يَدْخُلُ',
          mashdar: 'دُخُولًا',
          isim_fail: 'دَاخِلٌ',
          isim_maful: 'مَدْخُولٌ',
          fiil_amr: 'اُدْخُلْ',
          fiil_nahyi: 'لَا تَدْخُلْ',
          isim_zaman_makan: 'مَدْخَلٌ',
          isim_alat: 'مِدْخَلٌ',
          madhi_majhul: 'دُخِلَ',
          mudhari_majhul: 'يُدْخَلُ',
        },
        lughawiMadhi: [
          'دَخَلَ', 'دَخَلَا', 'دَخَلُوا',
          'دَخَلَتْ', 'دَخَلَتَا', 'دَخَلْنَ',
          'دَخَلْتَ', 'دَخَلْتُمَا', 'دَخَلْتُمْ',
          'دَخَلْتِ', 'دَخَلْتُمَا', 'دَخَلْتُنَّ',
          'دَخَلْتُ', 'دَخَلْنَا',
        ],
        lughawiMudhari: [
          'يَدْخُلُ', 'يَدْخُلَانِ', 'يَدْخُلُونَ',
          'تَدْخُلُ', 'تَدْخُلَانِ', 'يَدْخُلْنَ',
          'تَدْخُلُ', 'تَدْخُلَانِ', 'تَدْخُلُونَ',
          'تَدْخُلِينَ', 'تَدْخُلَانِ', 'تَدْخُلْنَ',
          'أَدْخُلُ', 'نَدْخُلُ',
        ],
        lughawiAmr: ['اُدْخُلْ', 'اُدْخُلَا', 'اُدْخُلُوا', 'اُدْخُلِي', 'اُدْخُلَا', 'اُدْخُلْنَ'],
      },
    ],
  },
  {
    id: 'bab-2',
    kode: 'Bab 2',
    namaBab: 'Tsulatsi Mujarrod Bab 2 (Fathu-Kasrin)',
    kategori: 'Tsulatsi Mujarrod',
    wazanAr: 'فَعَلَ - يَفْعِلُ',
    wazanLatin: "Fa'ala - Yaf'ilu",
    kaidahAinFiil: "'Ain Fi'il berharakat Fathah pada Madhi dan Kasrah pada Mudhari'",
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
      {
        id: 'dharaba',
        babId: 'bab-2',
        rootLetters: ['ض', 'ر', 'ب'],
        artiDasar: 'Memukul',
        istilahi: {
          madhi: 'ضَرَبَ',
          mudhari: 'يَضْرِبُ',
          mashdar: 'ضَرْبًا',
          isim_fail: 'ضَارِبٌ',
          isim_maful: 'مَضْرُوبٌ',
          fiil_amr: 'اِضْرِبْ',
          fiil_nahyi: 'لَا تَضْرِبْ',
          isim_zaman_makan: 'مَضْرِبٌ',
          isim_alat: 'مِضْرَبٌ',
          madhi_majhul: 'ضُرِبَ',
          mudhari_majhul: 'يُضْرَبُ',
        },
        lughawiMadhi: [
          'ضَرَبَ', 'ضَرَبَا', 'ضَرَبُوا',
          'ضَرَبَتْ', 'ضَرَبَتَا', 'ضَرَبْنَ',
          'ضَرَبْتَ', 'ضَرَبْتُمَا', 'ضَرَبْتُمْ',
          'ضَرَبْتِ', 'ضَرَبْتُمَا', 'ضَرَبْتُنَّ',
          'ضَرَبْتُ', 'ضَرَبْنَا',
        ],
        lughawiMudhari: [
          'يَضْرِبُ', 'يَضْرِبَانِ', 'يَضْرِبُونَ',
          'تَضْرِبُ', 'تَضْرِبَانِ', 'يَضْرِبْنَ',
          'تَضْرِبُ', 'تَضْرِبَانِ', 'تَضْرِبُونَ',
          'تَضْرِبِينَ', 'تَضْرِبَانِ', 'تَضْرِبْنَ',
          'أَضْرِبُ', 'نَضْرِبُ',
        ],
        lughawiAmr: ['اِضْرِبْ', 'اِضْرِبَا', 'اِضْرِبُوا', 'اِضْرِبِي', 'اِضْرِبَا', 'اِضْرِبْنَ'],
      },
      {
        id: 'jalasa',
        babId: 'bab-2',
        rootLetters: ['ج', 'ل', 'س'],
        artiDasar: 'Duduk',
        istilahi: {
          madhi: 'جَلَسَ',
          mudhari: 'يَجْلِسُ',
          mashdar: 'جُلُوسًا',
          isim_fail: 'جَالِسٌ',
          isim_maful: 'مَجْلُوسٌ',
          fiil_amr: 'اِجْلِسْ',
          fiil_nahyi: 'لَا تَجْلِسْ',
          isim_zaman_makan: 'مَجْلِسٌ',
          isim_alat: 'مِجْلَسٌ',
          madhi_majhul: 'جُلِسَ',
          mudhari_majhul: 'يُجْلَسُ',
        },
        lughawiMadhi: [
          'جَلَسَ', 'جَلَسَا', 'جَلَسُوا',
          'جَلَسَتْ', 'جَلَسَتَا', 'جَلَسْنَ',
          'جَلَسْتَ', 'جَلَسْتُمَا', 'جَلَسْتُمْ',
          'جَلَسْتِ', 'جَلَسْتُمَا', 'جَلَسْتُنَّ',
          'جَلَسْتُ', 'جَلَسْنَا',
        ],
        lughawiMudhari: [
          'يَجْلِسُ', 'يَجْلِسَانِ', 'يَجْلِسُونَ',
          'تَجْلِسُ', 'تَجْلِسَانِ', 'يَجْلِسْنَ',
          'تَجْلِسُ', 'تَجْلِسَانِ', 'تَجْلِسُونَ',
          'تَجْلِسِينَ', 'تَجْلِسَانِ', 'تَجْلِسْنَ',
          'أَجْلِسُ', 'نَجْلِسُ',
        ],
        lughawiAmr: ['اِجْلِسْ', 'اِجْلِسَا', 'اِجْلِسُوا', 'اِجْلِسِي', 'اِجْلِسَا', 'اِجْلِسْنَ'],
      },
      {
        id: 'ghasala',
        babId: 'bab-2',
        rootLetters: ['غ', 'س', 'ل'],
        artiDasar: 'Mencuci',
        istilahi: {
          madhi: 'غَسَلَ',
          mudhari: 'يَغْسِلُ',
          mashdar: 'غَسْلًا',
          isim_fail: 'غَاسِلٌ',
          isim_maful: 'مَغْسُولٌ',
          fiil_amr: 'اِغْسِلْ',
          fiil_nahyi: 'لَا تَغْسِلْ',
          isim_zaman_makan: 'مَغْسِلٌ',
          isim_alat: 'مِغْسَلٌ',
          madhi_majhul: 'غُسِلَ',
          mudhari_majhul: 'يُغْسَلُ',
        },
        lughawiMadhi: [
          'غَسَلَ', 'غَسَلَا', 'غَسَلُوا',
          'غَسَلَتْ', 'غَسَلَتَا', 'غَسَلْنَ',
          'غَسَلْتَ', 'غَسَلْتُمَا', 'غَسَلْتُمْ',
          'غَسَلْتِ', 'غَسَلْتُمَا', 'غَسَلْتُنَّ',
          'غَسَلْتُ', 'غَسَلْنَا',
        ],
        lughawiMudhari: [
          'يَغْسِلُ', 'يَغْسِلَانِ', 'يَغْسِلُونَ',
          'تَغْسِلُ', 'تَغْسِلَانِ', 'يَغْسِلْنَ',
          'تَغْسِلُ', 'تَغْسِلَانِ', 'تَغْسِلُونَ',
          'تَغْسِلِينَ', 'تَغْسِلَانِ', 'تَغْسِلْنَ',
          'أَغْسِلُ', 'نَغْسِلُ',
        ],
        lughawiAmr: ['اِغْسِلْ', 'اِغْسِلَا', 'اِغْسِلُوا', 'اِغْسِلِي', 'اِغْسِلَا', 'اِغْسِلْنَ'],
      },
    ],
  },
  {
    id: 'bab-3',
    kode: 'Bab 3',
    namaBab: 'Tsulatsi Mujarrod Bab 3 (Fathatani)',
    kategori: 'Tsulatsi Mujarrod',
    wazanAr: 'فَعَلَ - يَفْعَلُ',
    wazanLatin: "Fa'ala - Yaf'alu",
    kaidahAinFiil: "'Ain Fi'il berharakat Fathah pada Madhi dan Fathah pada Mudhari' (Huruf Halqi)",
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
      {
        id: 'fataha',
        babId: 'bab-3',
        rootLetters: ['ف', 'ت', 'ح'],
        artiDasar: 'Membuka',
        istilahi: {
          madhi: 'فَتَحَ',
          mudhari: 'يَفْتَحُ',
          mashdar: 'فَتْحًا',
          isim_fail: 'فَاتِحٌ',
          isim_maful: 'مَفْتُوحٌ',
          fiil_amr: 'اِفْتَحْ',
          fiil_nahyi: 'لَا تَفْتَحْ',
          isim_zaman_makan: 'مَفْتَحٌ',
          isim_alat: 'مِفْتَاحٌ',
          madhi_majhul: 'فُتِحَ',
          mudhari_majhul: 'يُفْتَحُ',
        },
        lughawiMadhi: [
          'فَتَحَ', 'فَتَحَا', 'فَتَحُوا',
          'فَتَحَتْ', 'فَتَحَتَا', 'فَتَحْنَ',
          'فَتَحْتَ', 'فَتَحْتُمَا', 'فَتَحْتُمْ',
          'فَتَحْتِ', 'فَتَحْتُمَا', 'فَتَحْتُنَّ',
          'فَتَحْتُ', 'فَتَحْنَا',
        ],
        lughawiMudhari: [
          'يَفْتَحُ', 'يَفْتَحَانِ', 'يَفْتَحُونَ',
          'تَفْتَحُ', 'تَفْتَحَانِ', 'يَفْتَحْنَ',
          'تَفْتَحُ', 'تَفْتَحَانِ', 'تَفْتَحُونَ',
          'تَفْتَحِينَ', 'تَفْتَحَانِ', 'تَفْتَحْنَ',
          'أَفْتَحُ', 'نَفْتَحُ',
        ],
        lughawiAmr: ['اِفْتَحْ', 'اِفْتَحَا', 'اِفْتَحُوا', 'اِفْتَحِي', 'اِفْتَحَا', 'اِفْتَحْنَ'],
      },
      {
        id: 'dzahaba',
        babId: 'bab-3',
        rootLetters: ['ذ', 'ه', 'ب'],
        artiDasar: 'Pergi',
        istilahi: {
          madhi: 'ذَهَبَ',
          mudhari: 'يَذْهَبُ',
          mashdar: 'ذَهَابًا',
          isim_fail: 'ذَاهِبٌ',
          isim_maful: 'مَذْهُوبٌ',
          fiil_amr: 'اِذْهَبْ',
          fiil_nahyi: 'لَا تَذْهَبْ',
          isim_zaman_makan: 'مَذْهَبٌ',
          isim_alat: 'مِذْهَبٌ',
          madhi_majhul: 'ذُهِبَ',
          mudhari_majhul: 'يُذْهَبُ',
        },
        lughawiMadhi: [
          'ذَهَبَ', 'ذَهَبَا', 'ذَهَبُوا',
          'ذَهَبَتْ', 'ذَهَبَتَا', 'ذَهَبْنَ',
          'ذَهَبْتَ', 'ذَهَبْتُمَا', 'ذَهَبْتُمْ',
          'ذَهَبْتِ', 'ذَهَبْتُمَا', 'ذَهَبْتُنَّ',
          'ذَهَبْتُ', 'ذَهَبْنَا',
        ],
        lughawiMudhari: [
          'يَذْهَبُ', 'يَذْهَبَانِ', 'يَذْهَبُونَ',
          'تَذْهَبُ', 'تَذْهَبَانِ', 'يَذْهَبْنَ',
          'تَذْهَبُ', 'تَذْهَبَانِ', 'تَذْهَبُونَ',
          'تَذْهَبِينَ', 'تَذْهَبَانِ', 'تَذْهَبْنَ',
          'أَذْهَبُ', 'نَذْهَبُ',
        ],
        lughawiAmr: ['اِذْهَبْ', 'اِذْهَبَا', 'اِذْهَبُوا', 'اِذْهَبِي', 'اِذْهَبَا', 'اِذْهَبْنَ'],
      },
    ],
  },
  {
    id: 'bab-4',
    kode: 'Bab 4',
    namaBab: 'Tsulatsi Mujarrod Bab 4 (Kasru-Fathin)',
    kategori: 'Tsulatsi Mujarrod',
    wazanAr: 'فَعِلَ - يَفْعَلُ',
    wazanLatin: "Fa'ila - Yaf'alu",
    kaidahAinFiil: "'Ain Fi'il berharakat Kasrah pada Madhi dan Fathah pada Mudhari'",
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
      {
        id: 'alima',
        babId: 'bab-4',
        rootLetters: ['ع', 'ل', 'م'],
        artiDasar: 'Mengetahui',
        istilahi: {
          madhi: 'عَلِمَ',
          mudhari: 'يَعْلَمُ',
          mashdar: 'عِلْمًا',
          isim_fail: 'عَالِمٌ',
          isim_maful: 'مَعْلُومٌ',
          fiil_amr: 'اِعْلَمْ',
          fiil_nahyi: 'لَا تَعْلَمْ',
          isim_zaman_makan: 'مَعْلَمٌ',
          isim_alat: 'مِعْلَمٌ',
          madhi_majhul: 'عُلِمَ',
          mudhari_majhul: 'يُعْلَمُ',
        },
        lughawiMadhi: [
          'عَلِمَ', 'عَلِمَا', 'عَلِمُوا',
          'عَلِمَتْ', 'عَلِمَتَا', 'عَلِمْنَ',
          'عَلِمْتَ', 'عَلِمْتُمَا', 'عَلِمْتُمْ',
          'عَلِمْتِ', 'عَلِمْتُمَا', 'عَلِمْتُنَّ',
          'عَلِمْتُ', 'عَلِمْنَا',
        ],
        lughawiMudhari: [
          'يَعْلَمُ', 'يَعْلَمَانِ', 'يَعْلَمُونَ',
          'تَعْلَمُ', 'تَعْلَمَانِ', 'يَعْلَمْنَ',
          'تَعْلَمُ', 'تَعْلَمَانِ', 'تَعْلَمُونَ',
          'تَعْلَمِينَ', 'تَعْلَمَانِ', 'تَعْلَمْنَ',
          'أَعْلَمُ', 'نَعْلَمُ',
        ],
        lughawiAmr: ['اِعْلَمْ', 'اِعْلَمَا', 'اِعْلَمُوا', 'اِعْلَمِي', 'اِعْلَمَا', 'اِعْلَمْنَ'],
      },
      {
        id: 'samia',
        babId: 'bab-4',
        rootLetters: ['س', 'م', 'ع'],
        artiDasar: 'Mendengar',
        istilahi: {
          madhi: 'سَمِعَ',
          mudhari: 'يَسْمَعُ',
          mashdar: 'سَمْعًا',
          isim_fail: 'سَامِعٌ',
          isim_maful: 'مَسْمُوعٌ',
          fiil_amr: 'اِسْمَعْ',
          fiil_nahyi: 'لَا تَسْمَعْ',
          isim_zaman_makan: 'مَسْمَعٌ',
          isim_alat: 'مِسْمَعٌ',
          madhi_majhul: 'سُمِعَ',
          mudhari_majhul: 'يُسْمَعُ',
        },
        lughawiMadhi: [
          'سَمِعَ', 'سَمِعَا', 'سَمِعُوا',
          'سَمِعَتْ', 'سَمِعَتَا', 'سَمِعْنَ',
          'سَمِعْتَ', 'سَمِعْتُمَا', 'سَمِعْتُمْ',
          'سَمِعْتِ', 'سَمِعْتُمَا', 'سَمِعْتُنَّ',
          'سَمِعْتُ', 'سَمِعْنَا',
        ],
        lughawiMudhari: [
          'يَسْمَعُ', 'يَسْمَعَانِ', 'يَسْمَعُونَ',
          'تَسْمَعُ', 'تَسْمَعَانِ', 'يَسْمَعْنَ',
          'تَسْمَعُ', 'تَسْمَعَانِ', 'تَسْمَعُونَ',
          'تَسْمَعِينَ', 'تَسْمَعَانِ', 'تَسْمَعْنَ',
          'أَسْمَعُ', 'نَسْمَعُ',
        ],
        lughawiAmr: ['اِسْمَعْ', 'اِسْمَعَا', 'اِسْمَعُوا', 'اِسْمَعِي', 'اِسْمَعَا', 'اِسْمَعْنَ'],
      },
    ],
  },
  {
    id: 'bab-5',
    kode: 'Bab 5',
    namaBab: 'Tsulatsi Mujarrod Bab 5 (Dhammatani)',
    kategori: 'Tsulatsi Mujarrod',
    wazanAr: 'فَعُلَ - يَفْعُلُ',
    wazanLatin: "Fa'ula - Yaf'ulu",
    kaidahAinFiil: "'Ain Fi'il berharakat Dhammah pada Madhi dan Dhammah pada Mudhari' (Fi'il Lazim/Sifat)",
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
      {
        id: 'hasuna',
        babId: 'bab-5',
        rootLetters: ['ح', 'س', 'ن'],
        artiDasar: 'Menjadi Baik / Indah',
        istilahi: {
          madhi: 'حَسُنَ',
          mudhari: 'يَحْسُنُ',
          mashdar: 'حُسْنًا',
          isim_fail: 'حَسَنٌ',
          isim_maful: 'مَحْسُونٌ به',
          fiil_amr: 'اُحْسُنْ',
          fiil_nahyi: 'لَا تَحْسُنْ',
          isim_zaman_makan: 'مَحْسَنٌ',
          isim_alat: 'مِحْسَنٌ',
          madhi_majhul: 'حُسِنَ',
          mudhari_majhul: 'يُحْسَنُ',
        },
        lughawiMadhi: [
          'حَسُنَ', 'حَسُنَا', 'حَسُنُوا',
          'حَسُنَتْ', 'حَسُنَتَا', 'حَسُنَّ',
          'حَسُنْتَ', 'حَسُنْتُمَا', 'حَسُنْتُمْ',
          'حَسُنْتِ', 'حَسُنْتُمَا', 'حَسُنْتُنَّ',
          'حَسُنْتُ', 'حَسُنَّا',
        ],
        lughawiMudhari: [
          'يَحْسُنُ', 'يَحْسُنَانِ', 'يَحْسُنُونَ',
          'تَحْسُنُ', 'تَحْسُنَانِ', 'يَحْسُنَّ',
          'تَحْسُنُ', 'تَحْسُنَانِ', 'تَحْسُنُونَ',
          'تَحْسُنِينَ', 'تَحْسُنَانِ', 'تَحْسُنَّ',
          'أَحْسُنُ', 'نَحْسُنُ',
        ],
        lughawiAmr: ['اُحْسُنْ', 'اُحْسُنَا', 'اُحْسُنُوا', 'اُحْسُنِي', 'اُحْسُنَا', 'اُحْسُنَّ'],
      },
      {
        id: 'karuma',
        babId: 'bab-5',
        rootLetters: ['ك', 'ر', 'م'],
        artiDasar: 'Menjadi Mulia',
        istilahi: {
          madhi: 'كَرُمَ',
          mudhari: 'يَكْرُمُ',
          mashdar: 'كَرَامَةً',
          isim_fail: 'كَرِيمٌ',
          isim_maful: 'مَكْرُومٌ به',
          fiil_amr: 'اُكْرُمْ',
          fiil_nahyi: 'لَا تَكْرُمْ',
          isim_zaman_makan: 'مَكْرَمٌ',
          isim_alat: 'مِكْرَمٌ',
          madhi_majhul: 'كُرِمَ',
          mudhari_majhul: 'يُكْرَمُ',
        },
        lughawiMadhi: [
          'كَرُمَ', 'كَرُمَا', 'كَرُمُوا',
          'كَرُمَتْ', 'كَرُمَتَا', 'كَرُمْنَ',
          'كَرُمْتَ', 'كَرُمْتُمَا', 'كَرُمْتُمْ',
          'كَرُمْتِ', 'كَرُمْتُمَا', 'كَرُمْتُنَّ',
          'كَرُمْتُ', 'كَرُمْنَا',
        ],
        lughawiMudhari: [
          'يَكْرُمُ', 'يَكْرُمَانِ', 'يَكْرُمُونَ',
          'تَكْرُمُ', 'تَكْرُمَانِ', 'يَكْرُمْنَ',
          'تَكْرُمُ', 'تَكْرُمَانِ', 'تَكْرُمُونَ',
          'تَكْرُمِينَ', 'تَكْرُمَانِ', 'تَكْرُمْنَ',
          'أَكْرُمُ', 'نَكْرُمُ',
        ],
        lughawiAmr: ['اُكْرُمْ', 'اُكْرُمَا', 'اُكْرُمُوا', 'اُكْرُمِي', 'اُكْرُمَا', 'اُكْرُمْنَ'],
      },
    ],
  },
  {
    id: 'bab-6',
    kode: 'Bab 6',
    namaBab: 'Tsulatsi Mujarrod Bab 6 (Kasratani)',
    kategori: 'Tsulatsi Mujarrod',
    wazanAr: 'فَعِلَ - يَفْعِلُ',
    wazanLatin: "Fa'ila - Yaf'ilu",
    kaidahAinFiil: "'Ain Fi'il berharakat Kasrah pada Madhi dan Kasrah pada Mudhari'",
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
      {
        id: 'hasiba',
        babId: 'bab-6',
        rootLetters: ['ح', 'س', 'ب'],
        artiDasar: 'Mengira / Menyangka',
        istilahi: {
          madhi: 'حَسِبَ',
          mudhari: 'يَحْسِبُ',
          mashdar: 'حُسْبَانًا',
          isim_fail: 'حَاسِبٌ',
          isim_maful: 'مَحْسُوبٌ',
          fiil_amr: 'اِحْسِبْ',
          fiil_nahyi: 'لَا تَحْسِبْ',
          isim_zaman_makan: 'مَحْسِبٌ',
          isim_alat: 'مِحْسَبٌ',
          madhi_majhul: 'حُسِبَ',
          mudhari_majhul: 'يُحْسَبُ',
        },
        lughawiMadhi: [
          'حَسِبَ', 'حَسِبَا', 'حَسِبُوا',
          'حَسِبَتْ', 'حَسِبَتَا', 'حَسِبْنَ',
          'حَسِبْتَ', 'حَسِبْتُمَا', 'حَسِبْتُمْ',
          'حَسِبْتِ', 'حَسِبْتُمَا', 'حَسِبْتُنَّ',
          'حَسِبْتُ', 'حَسِبْنَا',
        ],
        lughawiMudhari: [
          'يَحْسِبُ', 'يَحْسِبَانِ', 'يَحْسِبُونَ',
          'تَحْسِبُ', 'تَحْسِبَانِ', 'يَحْسِبْنَ',
          'تَحْسِبُ', 'تَحْسِبَانِ', 'تَحْسِبُونَ',
          'تَحْسِبِينَ', 'تَحْسِبَانِ', 'تَحْسِبْنَ',
          'أَحْسِبُ', 'نَحْسِبُ',
        ],
        lughawiAmr: ['اِحْسِبْ', 'اِحْسِبَا', 'اِحْسِبُوا', 'اِحْسِبِي', 'اِحْسِبَا', 'اِحْسِبْنَ'],
      },
    ],
  },
  {
    id: 'mazid-1',
    kode: 'Mazid 1',
    namaBab: "Tsulatsi Mazid Bi-Harfin: Wazan Af'ala",
    kategori: 'Tsulatsi Mazid',
    wazanAr: 'أَفْعَلَ - يُفْعِلُ',
    wazanLatin: "Af'ala - Yuf'ilu",
    kaidahAinFiil: "Tambahan 1 huruf Hamzah Qatha' di awal Fi'il Madhi (bermakna Ta'diyah / Mem-kan)",
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
      {
        id: 'akrama',
        babId: 'mazid-1',
        rootLetters: ['ك', 'ر', 'م'],
        artiDasar: 'Memuliakan',
        istilahi: {
          madhi: 'أَكْرَمَ',
          mudhari: 'يُكْرِمُ',
          mashdar: 'إِكْرَامًا',
          isim_fail: 'مُكْرِمٌ',
          isim_maful: 'مُكْرَمٌ',
          fiil_amr: 'أَكْرِمْ',
          fiil_nahyi: 'لَا تُكْرِمْ',
          isim_zaman_makan: 'مُكْرَمٌ',
          isim_alat: '—',
          madhi_majhul: 'أُكْرِمَ',
          mudhari_majhul: 'يُكْرَمُ',
        },
        lughawiMadhi: [
          'أَكْرَمَ', 'أَكْرَمَا', 'أَكْرَمُوا',
          'أَكْرَمَتْ', 'أَكْرَمَتَا', 'أَكْرَمْنَ',
          'أَكْرَمْتَ', 'أَكْرَمْتُمَا', 'أَكْرَمْتُمْ',
          'أَكْرَمْتِ', 'أَكْرَمْتُمَا', 'أَكْرَمْتُنَّ',
          'أَكْرَمْتُ', 'أَكْرَمْنَا',
        ],
        lughawiMudhari: [
          'يُكْرِمُ', 'يُكْرِمَانِ', 'يُكْرِمُونَ',
          'تُكْرِمُ', 'تُكْرِمَانِ', 'يُكْرِمْنَ',
          'تُكْرِمُ', 'تُكْرِمَانِ', 'تُكْرِمُونَ',
          'تُكْرِمِينَ', 'تُكْرِمَانِ', 'تُكْرِمْنَ',
          'أُكْرِمُ', 'نُكْرِمُ',
        ],
        lughawiAmr: ['أَكْرِمْ', 'أَكْرِمَا', 'أَكْرِمُوا', 'أَكْرِمِي', 'أَكْرِمَا', 'أَكْرِمْنَ'],
      },
    ],
  },
  {
    id: 'mazid-2',
    kode: 'Mazid 2',
    namaBab: "Tsulatsi Mazid Bi-Harfin: Wazan Fa''ala",
    kategori: 'Tsulatsi Mazid',
    wazanAr: 'فَعَّلَ - يُفَعِّلُ',
    wazanLatin: "Fa''ala - Yufa''ilu",
    kaidahAinFiil: "Tambahan Tasydid (penggandaan) pada 'Ain Fi'il (bermakna Taktsir / Ta'diyah)",
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
      {
        id: 'allama',
        babId: 'mazid-2',
        rootLetters: ['ع', 'ل', 'م'],
        artiDasar: 'Mengajarkan',
        istilahi: {
          madhi: 'عَلَّمَ',
          mudhari: 'يُعَلِّمُ',
          mashdar: 'تَعْلِيمًا',
          isim_fail: 'مُعَلِّمٌ',
          isim_maful: 'مُعَلَّمٌ',
          fiil_amr: 'عَلِّمْ',
          fiil_nahyi: 'لَا تُعَلِّمْ',
          isim_zaman_makan: 'مُعَلَّمٌ',
          isim_alat: '—',
          madhi_majhul: 'عُلِّمَ',
          mudhari_majhul: 'يُعَلَّمُ',
        },
        lughawiMadhi: [
          'عَلَّمَ', 'عَلَّمَا', 'عَلَّمُوا',
          'عَلَّمَتْ', 'عَلَّمَتَا', 'عَلَّمْنَ',
          'عَلَّمْتَ', 'عَلَّمْتُمَا', 'عَلَّمْتُمْ',
          'عَلَّمْتِ', 'عَلَّمْتُمَا', 'عَلَّمْتُنَّ',
          'عَلَّمْتُ', 'عَلَّمْنَا',
        ],
        lughawiMudhari: [
          'يُعَلِّمُ', 'يُعَلِّمَانِ', 'يُعَلِّمُونَ',
          'تُعَلِّمُ', 'تُعَلِّمَانِ', 'يُعَلِّمْنَ',
          'تُعَلِّمُ', 'تُعَلِّمَانِ', 'تُعَلِّمُونَ',
          'تُعَلِّمِينَ', 'تُعَلِّمَانِ', 'تُعَلِّمْنَ',
          'أُعَلِّمُ', 'نُعَلِّمُ',
        ],
        lughawiAmr: ['عَلِّمْ', 'عَلِّمَا', 'عَلِّمُوا', 'عَلِّمِي', 'عَلِّمَا', 'عَلِّمْنَ'],
      },
    ],
  },
  {
    id: 'mazid-3',
    kode: 'Mazid 3',
    namaBab: "Tsulatsi Mazid Bi-Tsalaatsati Ahruf: Wazan Istaf'ala",
    kategori: 'Tsulatsi Mazid',
    wazanAr: 'اِسْتَفْعَلَ - يَسْتَفْعِلُ',
    wazanLatin: "Istaf'ala - Yastaf'ilu",
    kaidahAinFiil: 'Tambahan 3 huruf (Hamzah Washal, Sin, dan Ta) di awal kata (bermakna Thalab / Meminta)',
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
      {
        id: 'istaghfara',
        babId: 'mazid-3',
        rootLetters: ['غ', 'ف', 'ر'],
        artiDasar: 'Memohon Ampun',
        istilahi: {
          madhi: 'اِسْتَغْفَرَ',
          mudhari: 'يَسْتَغْفِرُ',
          mashdar: 'اِسْتِغْفَارًا',
          isim_fail: 'مُسْتَغْفِرٌ',
          isim_maful: 'مُسْتَغْفَرٌ',
          fiil_amr: 'اِسْتَغْفِرْ',
          fiil_nahyi: 'لَا تَسْتَغْفِرْ',
          isim_zaman_makan: 'مُسْتَغْفَرٌ',
          isim_alat: '—',
          madhi_majhul: 'اُسْتُغْفِرَ',
          mudhari_majhul: 'يُسْتَغْفَرُ',
        },
        lughawiMadhi: [
          'اِسْتَغْفَرَ', 'اِسْتَغْفَرَا', 'اِسْتَغْفَرُوا',
          'اِسْتَغْفَرَتْ', 'اِسْتَغْفَرَتَا', 'اِسْتَغْفَرْنَ',
          'اِسْتَغْفَرْتَ', 'اِسْتَغْفَرْتُمَا', 'اِسْتَغْفَرْتُمْ',
          'اِسْتَغْفَرْتِ', 'اِسْتَغْفَرْتُمَا', 'اِسْتَغْفَرْتُنَّ',
          'اِسْتَغْفَرْتُ', 'اِسْتَغْفَرْنَا',
        ],
        lughawiMudhari: [
          'يَسْتَغْفِرُ', 'يَسْتَغْفِرَانِ', 'يَسْتَغْفِرُونَ',
          'تَسْتَغْفِرُ', 'تَسْتَغْفِرَانِ', 'يَسْتَغْفِرْنَ',
          'تَسْتَغْفِرُ', 'تَسْتَغْفِرَانِ', 'تَسْتَغْفِرُونَ',
          'تَسْتَغْفِرِينَ', 'تَسْتَغْفِرَانِ', 'تَسْتَغْفِرْنَ',
          'أَسْتَغْفِرُ', 'نَسْتَغْفِرُ',
        ],
        lughawiAmr: ['اِسْتَغْفِرْ', 'اِسْتَغْفِرَا', 'اِسْتَغْفِرُوا', 'اِسْتَغْفِرِي', 'اِسْتَغْفِرَا', 'اِسْتَغْفِرْنَ'],
      },
    ],
  },
];

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

function buildBab1MauzunVerb(
  id: string,
  babId: string,
  rootLetters: [string, string, string],
  artiDasar: string,
  mashdar: string
): MauzunVerb {
  const [f, a, l] = rootLetters;
  const amrStem = `اُ${f}ْ${a}ُ${l}`;
  const lughawiMadhiStem = `${f}َ${a}َ${l}`;
  const mudhariYa = `يَ${f}ْ${a}ُ${l}`;
  const mudhariTa = `تَ${f}ْ${a}ُ${l}`;

  return {
    id,
    babId,
    rootLetters,
    artiDasar,
    istilahi: {
      madhi: `${f}َ${a}َ${l}َ`,
      mudhari: `${mudhariYa}ُ`,
      mashdar,
      isim_fail: `${f}َا${a}ِ${l}ٌ`,
      isim_maful: `مَ${f}ْ${a}ُو${l}ٌ`,
      fiil_amr: `${amrStem}ْ`,
      fiil_nahyi: `لَا تَ${f}ْ${a}ُ${l}ْ`,
      isim_zaman_makan: `مَ${f}ْ${a}َ${l}ٌ`,
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
      `${lughawiMadhiStem}ْنَ`,
      `${lughawiMadhiStem}ْتَ`,
      `${lughawiMadhiStem}ْتُمَا`,
      `${lughawiMadhiStem}ْتُمْ`,
      `${lughawiMadhiStem}ْتِ`,
      `${lughawiMadhiStem}ْتُمَا`,
      `${lughawiMadhiStem}ْتُنَّ`,
      `${lughawiMadhiStem}ْتُ`,
      `${lughawiMadhiStem}ْنَا`,
    ],
    lughawiMudhari: [
      `${mudhariYa}ُ`,
      `${mudhariYa}َانِ`,
      `${mudhariYa}ُونَ`,
      `${mudhariTa}ُ`,
      `${mudhariTa}َانِ`,
      `${mudhariYa}ْنَ`,
      `${mudhariTa}ُ`,
      `${mudhariTa}َانِ`,
      `${mudhariTa}ُونَ`,
      `${mudhariTa}ِينَ`,
      `${mudhariTa}َانِ`,
      `${mudhariTa}ْنَ`,
      `أَ${f}ْ${a}ُ${l}ُ`,
      `نَ${f}ْ${a}ُ${l}ُ`,
    ],
    lughawiAmr: [
      `${amrStem}ْ`,
      `${amrStem}َا`,
      `${amrStem}ُوا`,
      `${amrStem}ِي`,
      `${amrStem}َا`,
      `${amrStem}ْنَ`,
    ],
  };
}

const R1_BAB1: ShorofBab = {
  ...SHOROF_BABS_REGULER_2[0],
  id: 'r1-bab-1',
  kode: 'Bab 1',
  namaBab: 'Tsulatsi Mujarrod Bab 1 (Fathu-Dhammin)',
  kategori: 'Tsulatsi Mujarrod',
  questionsPerSection: 10,
  sectionedExam: true,
  mauzunList: [
    buildBab1MauzunVerb('kafara', 'r1-bab-1', ['ك', 'ف', 'ر'], 'Mengingkari', 'كُفْرًا'),
    buildBab1MauzunVerb('qatala', 'r1-bab-1', ['ق', 'ت', 'ل'], 'Membunuh', 'قَتْلًا'),
    buildBab1MauzunVerb('satara', 'r1-bab-1', ['س', 'ت', 'ر'], 'Menutupi', 'سَتْرًا'),
    buildBab1MauzunVerb('khalaqa', 'r1-bab-1', ['خ', 'ل', 'ق'], 'Menciptakan', 'خَلْقًا'),
    buildBab1MauzunVerb('r1-nasara', 'r1-bab-1', ['ن', 'ص', 'ر'], 'Menolong', 'نَصْرًا'),
    buildBab1MauzunVerb('kharaja', 'r1-bab-1', ['خ', 'ر', 'ج'], 'Keluar', 'خُرُوجًا'),
    buildBab1MauzunVerb('r1-dakhala', 'r1-bab-1', ['د', 'خ', 'ل'], 'Masuk', 'دُخُولًا'),
    buildBab1MauzunVerb('kanasa', 'r1-bab-1', ['ك', 'ن', 'س'], 'Menyapu', 'كَنْسًا'),
    buildBab1MauzunVerb('razaqa', 'r1-bab-1', ['ر', 'ز', 'ق'], 'Memberi rezeki', 'رِزْقًا'),
    buildBab1MauzunVerb('r1-kataba', 'r1-bab-1', ['ك', 'ت', 'ب'], 'Menulis', 'كِتَابَةً'),
    buildBab1MauzunVerb('raqada', 'r1-bab-1', ['ر', 'ق', 'د'], 'Tidur', 'رُقُودًا'),
    buildBab1MauzunVerb('darasa', 'r1-bab-1', ['د', 'ر', 'س'], 'Belajar', 'دَرْسًا'),
  ],
};

export const SHOROF_BABS_REGULER_1: ShorofBab[] = [
  // 6 Bab Tsulatsi Mujarrod
  R1_BAB1, // Bab 1: فَعَلَ - يَفْعُلُ (12 Mufradat, 60 soal)
  SHOROF_BABS_REGULER_2[1], // Bab 2: فَعَلَ - يَفْعِلُ
  SHOROF_BABS_REGULER_2[2], // Bab 3: فَعَلَ - يَفْعَلُ
  cloneReguler2Bab('bab-6', {
    id: 'r1-bab-4',
    kode: 'Bab 4',
    namaBab: 'Tsulatsi Mujarrod Bab 4 (Kasru-Kasrin)',
    kategori: 'Tsulatsi Mujarrod',
  }),
  cloneReguler2Bab('bab-4', {
    id: 'r1-bab-5',
    kode: 'Bab 5',
    namaBab: 'Tsulatsi Mujarrod Bab 5 (Kasru-Fathin)',
    kategori: 'Tsulatsi Mujarrod',
  }),
  cloneReguler2Bab('bab-5', {
    id: 'r1-bab-6',
    kode: 'Bab 6',
    namaBab: 'Tsulatsi Mujarrod Bab 6 (Dhammu-Dhammin)',
    kategori: 'Tsulatsi Mujarrod',
  }),
  // 3 Bab Tsulatsi Mazid (+1 Huruf)
  cloneReguler2Bab('mazid-2', {
    id: 'mazid1-bab-1',
    kode: 'Mazid 1 · Bab 1',
    namaBab: "Tsulatsi Mazid +1 Huruf Bab 1 (Fa''ala - Yufa''ilu)",
    kategori: 'Tsulatsi Mazid (+1 Huruf)',
  }),
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

export const ALL_SHOROF_BABS: ShorofBab[] = Array.from(
  new Map([...SHOROF_BABS_REGULER_1, ...SHOROF_BABS_REGULER_2].map((b) => [b.id, b])).values()
);

export const SHOROF_BABS: ShorofBab[] = SHOROF_BABS_REGULER_2;

export function getBabsForClass(kelas: StudentClass): ShorofBab[] {
  return kelas === 'Reguler 1' ? SHOROF_BABS_REGULER_1 : SHOROF_BABS_REGULER_2;
}
