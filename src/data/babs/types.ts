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
