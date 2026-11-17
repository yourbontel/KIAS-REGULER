export type StudentClass = 'Reguler 1' | 'Reguler 2';
export type StudentGender = 'Ikhwan' | 'Akhwat';

export interface Student {
  id: string;
  name: string;
  kelas: StudentClass;
  gender: StudentGender;
  kota: string;
  catatan?: string;
}

export const PASSING_SCORE = 75;

export interface QuizAttempt {
  id: string;
  studentId: string;
  timestamp: string;
  babId: string;
  babLabel: string;
  /** Diisi bila ujian dikerjakan per Bagian (mis. Reguler 1 Bab 1) */
  sectionNumber?: number;
  mode: 'ujian_bab' | 'istilahi' | 'lughawi' | 'tebak_shighat' | 'susun_tashrif';
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

export const DEMO_STUDENTS: Student[] = [
  {
    id: 'demo-01',
    name: 'Demo Siswa Reguler 1',
    kelas: 'Reguler 1',
    gender: 'Ikhwan',
    kota: 'Demo',
    catatan: 'Akun Demo Siswa',
  },
  {
    id: 'demo-02',
    name: 'Demo Siswa Reguler 2',
    kelas: 'Reguler 2',
    gender: 'Ikhwan',
    kota: 'Demo',
    catatan: 'Akun Demo Siswa',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  ...DEMO_STUDENTS,
  // === REGULER 1 (65 SISWA) ===
  { id: 'r1-01', name: 'Adhitya Sayyid Fuqaha', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bogor' },
  { id: 'r1-02', name: 'Andry Desmawanto', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta', catatan: "Cuti Jan'24" },
  { id: 'r1-03', name: 'Azzahra Katyenka Aqilah Maylia Difya Magenda', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bekasi', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-04', name: 'Abdul Karim Al Jabbar', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Pekanbaru' },
  { id: 'r1-05', name: 'Abdur Rahim', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bangun Harja' },
  { id: 'r1-06', name: 'Abdurrahman', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Kabupaten Bekasi' },
  { id: 'r1-07', name: 'Abyaz Fazli Shahzada', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },
  { id: 'r1-08', name: 'Afriyani', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Serang Banten' },
  { id: 'r1-09', name: 'Aisyah Hawa', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-10', name: 'Anggi Renaldy Pratama', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Rembang' },
  { id: 'r1-11', name: 'Ari Risman', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },
  { id: 'r1-12', name: 'Balqis Alhumaira', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bogor', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-13', name: 'Bayu Priyanto', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Klaten' },
  { id: 'r1-14', name: 'Bilqis Feiha Banafsaj', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Kuningan' },
  { id: 'r1-15', name: 'Dany Wildan', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bogor' },
  { id: 'r1-16', name: 'Dede Maulana', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Sukabumi' },
  { id: 'r1-17', name: 'Dedi Purnomo', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Oku Timur' },
  { id: 'r1-18', name: 'Desriwarni', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-19', name: 'Dian Martini', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-20', name: 'Fera Afrianty Farid', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Padang' },
  { id: 'r1-21', name: 'Forma Pandu Kharisma', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bantul' },
  { id: 'r1-22', name: 'Gigih Andi Wiguna', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Magetan', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-23', name: 'Gunawan Suhari', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bogor' },
  { id: 'r1-24', name: 'Gusmalik', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },
  { id: 'r1-25', name: 'Hary Kapota Novriyadi', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Cimahi', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-26', name: 'Haura Adhwiya', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bogor' },
  { id: 'r1-27', name: 'Henra Syaputra', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Pariaman' },
  { id: 'r1-28', name: 'Islamiyah', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Kendal' },
  { id: 'r1-29', name: 'Inayah Lathifa Fitrah', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Medan' },
  { id: 'r1-30', name: 'Jihad Jamlatul Akbar', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Sumedang' },
  { id: 'r1-31', name: 'Kasmawati', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta', catatan: 'Al-barkah Takmili' },
  { id: 'r1-32', name: 'Kamalludin', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta Timur' },
  { id: 'r1-33', name: 'Kasirin', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Sragen' },
  { id: 'r1-34', name: 'Kayla Amalia Putri', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bandung' },
  { id: 'r1-35', name: 'Khoirunnisa', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bekasi' },
  { id: 'r1-36', name: 'Mulyana', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Lebak, Banten', catatan: 'Al-barkah Reguler' },
  { id: 'r1-37', name: 'Mainggi Kasmianto', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },
  { id: 'r1-38', name: 'Mohammad Faris Humama', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Kendal' },
  { id: 'r1-39', name: 'Muhammad Umar Firas', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },
  { id: 'r1-40', name: 'Nashira Salsabila Pasjchal', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-41', name: 'Naswaa Dheniar Ghinannafsy', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Garut' },
  { id: 'r1-42', name: 'Nike Viviet Juandhini', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-43', name: 'Nuhan Yahya Kamil', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bekasi' },
  { id: 'r1-44', name: 'Octavianti Mayasari', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Serang' },
  { id: 'r1-45', name: 'Prio Prabowo', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-46', name: 'Pancaningtyas Agustina', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Surakarta' },
  { id: 'r1-47', name: 'Patimah Azzahra', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Lubuk Linggau' },
  { id: 'r1-48', name: 'Ratih Essa Dewi', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-49', name: 'Rizki Kurnia Alam', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-50', name: 'Roslinda', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Padang' },
  { id: 'r1-51', name: 'Siti Khodijah', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-52', name: 'Syauqi Yusra', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Cibubur', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-53', name: 'Shania Chintya Dewi', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Cibubur' },
  { id: 'r1-54', name: 'Siti Adira Maharani', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bandung' },
  { id: 'r1-55', name: 'Sri Mulyani', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Purwakarta' },
  { id: 'r1-56', name: 'Sulthan Muhammad AlFatih', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Kuningan' },
  { id: 'r1-57', name: 'Sutarno', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Cilodong' },
  { id: 'r1-58', name: 'Syabil Athar Zaidan Irmasnyah', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Bekasi' },
  { id: 'r1-59', name: 'Teten Haryanto', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Sragen' },
  { id: 'r1-60', name: 'Tina Fauzi Putri Tewali', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Kendari' },
  { id: 'r1-61', name: 'Tonny Marlin', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Duri' },
  { id: 'r1-62', name: 'Yeni Muryani', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Bandung', catatan: "Cuti Juni'26" },
  { id: 'r1-63', name: 'Yeni Dwi Puji', kelas: 'Reguler 1', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r1-64', name: 'Zul Arsyad Pasaribu', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Sibolga', catatan: "Al-barkah Tajwid Al-Qur'an" },
  { id: 'r1-65', name: 'Tomy Suprayitno', kelas: 'Reguler 1', gender: 'Ikhwan', kota: 'Jakarta' },

  // === REGULER 2 (23 SISWA) ===
  { id: 'r2-01', name: 'Adi Yanuar Fadillah', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Kuningan', catatan: 'Al-barkah Reguler' },
  { id: 'r2-02', name: 'Aip Saripudin', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Sukabumi', catatan: 'Al-barkah Reguler' },
  { id: 'r2-03', name: 'Ali Ahmad Heryana', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Subang', catatan: 'Al-barkah Reguler' },
  { id: 'r2-04', name: 'Angga Setiawan', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Salatiga', catatan: 'Al-barkah Reguler' },
  { id: 'r2-05', name: 'Anisa', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Jakarta' },
  { id: 'r2-06', name: 'Bagas Yusuf Gunawan', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Serang', catatan: 'Al-barkah Reguler' },
  { id: 'r2-07', name: 'Bagus Panuntun', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Jakarta', catatan: 'Al-barkah Reguler' },
  { id: 'r2-08', name: 'Farras Quthb', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Pontianak', catatan: 'Al-barkah Reguler' },
  { id: 'r2-09', name: 'Fatimah Azzahra', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Cileungsi' },
  { id: 'r2-10', name: 'Gunawan Adhi Saputra', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Jakarta', catatan: 'Al-barkah Reguler' },
  { id: 'r2-11', name: 'Hendra Wirawan', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Bandung', catatan: 'Al-barkah Reguler' },
  { id: 'r2-12', name: 'Ishmah', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Klaten', catatan: 'Al-barkah Reguler' },
  { id: 'r2-13', name: 'Khairina Jihan Firzana', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Cirebon', catatan: 'Al-barkah Reguler' },
  { id: 'r2-14', name: 'Najwa Gadiza Salsabila', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Jakarta', catatan: 'Al-barkah Reguler' },
  { id: 'r2-15', name: 'Oki Rahadini', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Yogyakarta', catatan: 'Al-barkah Reguler' },
  { id: 'r2-16', name: 'Pusvita Ramawati', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Bekasi', catatan: 'Al-barkah Reguler' },
  { id: 'r2-17', name: 'Safeena Noah Naisha Vore', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Jakarta', catatan: 'Al-barkah Reguler' },
  { id: 'r2-18', name: 'Salwa Audriana Donita', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Cianjur', catatan: 'Al-barkah Reguler' },
  { id: 'r2-19', name: 'Sheila Amelia', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Bekasi', catatan: 'Al-barkah Reguler' },
  { id: 'r2-20', name: 'Sigit Is Raharjo', kelas: 'Reguler 2', gender: 'Ikhwan', kota: 'Indramayu', catatan: 'Al-barkah Reguler' },
  { id: 'r2-21', name: 'Shahla Khadijah', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Jakarta', catatan: 'Tercatat L di Excel (Disesuaikan ke Akhwat)' },
  { id: 'r2-22', name: 'Yuliani Zaenal', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Cirebon', catatan: 'Al-barkah Reguler' },
  { id: 'r2-23', name: 'Yusneni Sinaga', kelas: 'Reguler 2', gender: 'Akhwat', kota: 'Marihat Butar', catatan: "Al-barkah Tajwid Al-Qur'an" },
];
