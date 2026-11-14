export type StudentClass = 'Reguler 1' | 'Reguler 2';
export type StudentGender = 'Ikhwan' | 'Akhwat';

export interface Student {
  id: string;
  nis: string;
  name: string;
  kelas: StudentClass;
  gender: StudentGender;
  kota: string;
  catatan?: string;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  timestamp: string;
  babId: string;
  babLabel: string;
  mode: 'istilahi' | 'lughawi' | 'tebak_shighat' | 'susun_tashrif';
  score: number;
  correctCount: number;
  totalQuestions: number;
}

export interface SetoranRecord {
  studentId: string;
  completedBabs: string[]; // array of bab IDs passed in oral/written setoran
  lastUpdated?: string;
  notes?: string;
}

export const INITIAL_STUDENTS: Student[] = [
  // === REGULER 1 (65 SISWA) ===
  { id: 'r1-01', nis: '120252672', name: 'Adhitya Sayyid Fuqaha', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bogor' },
  { id: 'r1-02', nis: '202101004', name: 'Andry Desmawanto', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta', catatan: "Cuti Jan'24" },
  { id: 'r1-03', nis: '120252604', name: 'Azzahra Katyenka Aqilah Maylia Difya Magenda', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bekasi', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-04', nis: '2012026', name: 'Abdul Karim Al Jabbar', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Pekanbaru' },
  { id: 'r1-05', nis: '2712026', name: 'Abdur Rahim', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bangun Harja' },
  { id: 'r1-06', nis: '2022026', name: 'Abdurrahman', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Kabupaten Bekasi' },
  { id: 'r1-07', nis: '3012026', name: 'Abyaz Fazli Shahzada', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },
  { id: 'r1-08', nis: '2052026', name: 'Afriyani', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Serang Banten' },
  { id: 'r1-09', nis: '2802026', name: 'Aisyah Hawa', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-10', nis: '2072026', name: 'Anggi Renaldy Pratama', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Rembang' },
  { id: 'r1-11', nis: '2082026', name: 'Ari Risman', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },
  { id: 'r1-12', nis: '120252635', name: 'Balqis Alhumaira', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bogor', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-13', nis: '2092026', name: 'Bayu Priyanto', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Klaten' },
  { id: 'r1-14', nis: '2102026', name: 'Bilqis Feiha Banafsaj', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Kuningan' },
  { id: 'r1-15', nis: '2112026', name: 'Dany Wildan', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bogor' },
  { id: 'r1-16', nis: '2122026', name: 'Dede Maulana', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Sukabumi' },
  { id: 'r1-17', nis: '2522026', name: 'Dedi Purnomo', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Oku Timur' },
  { id: 'r1-18', nis: '2132026', name: 'Desriwarni', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-19', nis: '2142026', name: 'Dian Martini', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-20', nis: '2162026', name: 'Fera Afrianty Farid', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Padang' },
  { id: 'r1-21', nis: '2172026', name: 'Forma Pandu Kharisma', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bantul' },
  { id: 'r1-22', nis: '120252616', name: 'Gigih Andi Wiguna', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Magetan', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-23', nis: '2182026', name: 'Gunawan Suhari', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bogor' },
  { id: 'r1-24', nis: '2192026', name: 'Gusmalik', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },
  { id: 'r1-25', nis: '120252603', name: 'Hary Kapota Novriyadi', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Cimahi', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-26', nis: '2212026', name: 'Haura Adhwiya', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bogor' },
  { id: 'r1-27', nis: '2232026', name: 'Henra Syaputra', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Pariaman' },
  { id: 'r1-28', nis: '2272026', name: 'Islamiyah', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Kendal' },
  { id: 'r1-29', nis: '2262026', name: 'Inayah Lathifa Fitrah', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Medan' },
  { id: 'r1-30', nis: '2282026', name: 'Jihad Jamlatul Akbar', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Sumedang' },
  { id: 'r1-31', nis: '320252612', name: 'Kasmawati', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta', catatan: 'Al-barkah Takmili' },
  { id: 'r1-32', nis: '2292026', name: 'Kamalludin', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta Timur' },
  { id: 'r1-33', nis: '2502026', name: 'Kasirin', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Sragen' },
  { id: 'r1-34', nis: '3072026', name: 'Kayla Amalia Putri', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bandung' },
  { id: 'r1-35', nis: '2702026', name: 'Khoirunnisa', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bekasi' },
  { id: 'r1-36', nis: '220252646', name: 'Mulyana', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Lebak, Banten', catatan: 'Al-barkah Reguler' },
  { id: 'r1-37', nis: '2512026', name: 'Mainggi Kasmianto', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },
  { id: 'r1-38', nis: '2312026', name: 'Mohammad Faris Humama', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Kendal' },
  { id: 'r1-39', nis: '2322026', name: 'Muhammad Umar Firas', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },
  { id: 'r1-40', nis: '2332026', name: 'Nashira Salsabila Pasjchal', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-41', nis: '2662026', name: 'Naswaa Dheniar Ghinannafsy', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Garut' },
  { id: 'r1-42', nis: '2342026', name: 'Nike Viviet Juandhini', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-43', nis: '2352026', name: 'Nuhan Yahya Kamil', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bekasi' },
  { id: 'r1-44', nis: '2812026', name: 'Octavianti Mayasari', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Serang' },
  { id: 'r1-45', nis: '120252621', name: 'Prio Prabowo', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-46', nis: '2672026', name: 'Pancaningtyas Agustina', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Surakarta' },
  { id: 'r1-47', nis: '2372026', name: 'Patimah Azzahra', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Lubuk Linggau' },
  { id: 'r1-48', nis: '2392026', name: 'Ratih Essa Dewi', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-49', nis: '120252612', name: 'Rizki Kurnia Alam', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-50', nis: '220252667', name: 'Roslinda', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Padang' },
  { id: 'r1-51', nis: '2412026', name: 'Siti Khodijah', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-52', nis: '120252617', name: 'Syauqi Yusra', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Cibubur', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-53', nis: '2652026', name: 'Shania Chintya Dewi', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Cibubur' },
  { id: 'r1-54', nis: '2402026', name: 'Siti Adira Maharani', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bandung' },
  { id: 'r1-55', nis: '2492026', name: 'Sri Mulyani', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Purwakarta' },
  { id: 'r1-56', nis: '2422026', name: 'Sulthan Muhammad AlFatih', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Kuningan' },
  { id: 'r1-57', nis: '2252026', name: 'Sutarno', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Cilodong' },
  { id: 'r1-58', nis: '2442026', name: 'Syabil Athar Zaidan Irmasnyah', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bekasi' },
  { id: 'r1-59', nis: '2452026', name: 'Teten Haryanto', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Sragen' },
  { id: 'r1-60', nis: '2462026', name: 'Tina Fauzi Putri Tewali', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Kendari' },
  { id: 'r1-61', nis: '2642026', name: 'Tonny Marlin', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Duri' },
  { id: 'r1-62', nis: '10000152024', name: 'Yeni Muryani', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bandung', catatan: "Cuti Juni'26" },
  { id: 'r1-63', nis: '2732026', name: 'Yeni Dwi Puji', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-64', nis: '120252622', name: 'Zul Arsyad Pasaribu', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Sibolga', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-65', nis: '2472026', name: 'Tomy Suprayitno', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },

  // === REGULER 2 (23 SISWA) ===
  { id: 'r2-01', nis: '220252614', name: 'Adi Yanuar Fadillah', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Kuningan', catatan: 'Al-barkah Reguler' },
  { id: 'r2-02', nis: '220252631', name: 'Aip Saripudin', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Sukabumi', catatan: 'Al-barkah Reguler' },
  { id: 'r2-03', nis: '220252613', name: 'Ali Ahmad Heryana', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Subang', catatan: 'Al-barkah Reguler' },
  { id: 'r2-04', nis: '220252633', name: 'Angga Setiawan', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Salatiga', catatan: 'Al-barkah Reguler' },
  { id: 'r2-05', nis: '3102026', name: 'Anisa', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r2-06', nis: '220252611', name: 'Bagas Yusuf Gunawan', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Serang', catatan: 'Al-barkah Reguler' },
  { id: 'r2-07', nis: '220252627', name: 'Bagus Panuntun', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Jakarta', catatan: 'Al-barkah Reguler' },
  { id: 'r2-08', nis: '220252609', name: 'Farras Quthb', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Pontianak', catatan: 'Al-barkah Reguler' },
  { id: 'r2-09', nis: '20001423', name: 'Fatimah Azzahra', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Cileungsi' },
  { id: 'r2-10', nis: '220252602', name: 'Gunawan Adhi Saputra', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Jakarta', catatan: 'Al-barkah Reguler' },
  { id: 'r2-11', nis: '220252615', name: 'Hendra Wirawan', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Bandung', catatan: 'Al-barkah Reguler' },
  { id: 'r2-12', nis: '2000512024', name: 'Ishmah', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Klaten', catatan: 'Al-barkah Reguler' },
  { id: 'r2-13', nis: '220252607', name: 'Khairina Jihan Firzana', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Cirebon', catatan: 'Al-barkah Reguler' },
  { id: 'r2-14', nis: '220252617', name: 'Najwa Gadiza Salsabila', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Jakarta', catatan: 'Al-barkah Reguler' },
  { id: 'r2-15', nis: '220252632', name: 'Oki Rahadini', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Yogyakarta', catatan: 'Al-barkah Reguler' },
  { id: 'r2-16', nis: '220252651', name: 'Pusvita Ramawati', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Bekasi', catatan: 'Al-barkah Reguler' },
  { id: 'r2-17', nis: '220252642', name: 'Safeena Noah Naisha Vore', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Jakarta', catatan: 'Al-barkah Reguler' },
  { id: 'r2-18', nis: '220252638', name: 'Salwa Audriana Donita', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Cianjur', catatan: 'Al-barkah Reguler' },
  { id: 'r2-19', nis: '220252628', name: 'Sheila Amelia', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Bekasi', catatan: 'Al-barkah Reguler' },
  { id: 'r2-20', nis: '220252605', name: 'Sigit Is Raharjo', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Indramayu', catatan: 'Al-barkah Reguler' },
  { id: 'r2-21', nis: '2202526331', name: 'Shahla Khadijah', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Jakarta', catatan: 'Tercatat L di Excel (Disesuaikan ke Akhwat)' },
  { id: 'r2-22', nis: '220252608', name: 'Yuliani Zaenal', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Cirebon', catatan: 'Al-barkah Reguler' },
  { id: 'r2-23', nis: '10000022024', name: 'Yusneni Sinaga', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Marihat Butar', catatan: "Al-barkah Tajwid Al-Qur'an" },
];
