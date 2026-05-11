<div align="center">

# NeoFund

### Platform Fintech Peer-to-Peer Lending Modern

*Simulasi sistem perbankan digital end-to-end dengan dua portal terpisah untuk Nasabah dan Administrator*

[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

</div>

---

## Tentang NeoFund

NeoFund adalah platform web aplikasi fintech modern yang dirancang untuk menyimulasikan sistem perbankan dan pinjaman digital secara end-to-end melalui mekanisme **Peer-to-Peer Lending**. Platform ini memisahkan kontrol ke dalam dua portal utama:

- **Portal Nasabah** — Kemandirian finansial di ujung jari
- **Portal Admin** — Manajemen dan operasional terpusat

---

## Teknologi

| Layer | Teknologi |
|---|---|
| Frontend Framework | React + TypeScript |
| Build Tool | Vite |
| Routing | TanStack Router |
| Backend & Database | Firebase (Auth + Firestore) |
| Code Style | ESLint + Prettier |

---

## Autentikasi & Keamanan

Sebelum masuk ke portal masing-masing, semua pengguna melewati sistem autentikasi berlapis.

**Role-Based Access Login**
Sistem login secara otomatis mendeteksi peran pengguna berdasarkan email dan mengarahkan ke dasbor yang sesuai. Akses ke rute yang tidak sah diblokir secara otomatis — seorang nasabah tidak bisa mengakses halaman admin, dan sebaliknya.

**Pendaftaran dengan Pending Verification**
Nasabah baru mendaftar dan mengunggah data pribadi, namun **tidak dapat langsung masuk**. Mereka diarahkan ke halaman tunggu hingga Admin menyetujui akun secara manual, mencegah bypass dan akses tidak sah.

**Firebase Error Handling**
Notifikasi yang informatif dan spesifik saat pengguna menghadapi kondisi seperti email belum terdaftar, kata sandi salah, atau percobaan login berlebihan.

---

## Portal Nasabah (Customer)

Akses halaman: `/dashboard`

Nasabah mendapatkan pengalaman perbankan digital yang lengkap — mulai dari pengajuan pinjaman, pelacakan status, hingga pembayaran cicilan.

---

### Dashboard Utama — `/dashboard`

Halaman pertama yang dilihat nasabah setelah login.

| Informasi | Keterangan |
|---|---|
| Pinjaman Aktif | Jumlah pinjaman yang sedang berjalan |
| Sisa Tagihan | Total hutang yang belum terbayar |
| Skor Kredit | Penilaian kelayakan kredit nasabah |
| Cicilan Bulanan | Nominal yang harus dibayar tiap bulan |

**Grafik Proyeksi Dinamis** — Area chart interaktif yang memproyeksikan penurunan sisa hutang dari bulan ke bulan. Jika belum ada pinjaman aktif, grafik ditampilkan dalam kondisi diburamkan secara estetis sebagai *placeholder*.

---

### Kalkulator & Pengajuan Pinjaman — `/dashboard/apply`

Fitur utama nasabah untuk mengajukan pinjaman secara transparan.

- **Slider Jumlah Pinjaman** — Atur nominal pinjaman yang diinginkan secara dinamis
- **Pilih Tenor** — Pilih jangka waktu cicilan
- **Estimasi Real-time** — Sistem langsung menampilkan estimasi bunga dan cicilan per bulan sebelum pengajuan dikirim
- **Kirim Pengajuan** — Permohonan langsung masuk ke antrian Admin

> Nasabah bisa mencoba berbagai kombinasi jumlah dan tenor untuk menemukan cicilan yang paling sesuai kemampuan finansial mereka.

---

### Riwayat Pinjaman — `/dashboard/loans`

Halaman pelacakan seluruh riwayat pengajuan pinjaman.

| Status | Arti |
|---|---|
| Pending | Pengajuan menunggu review Admin |
| Approved | Pinjaman disetujui dan aktif |
| Rejected | Pengajuan ditolak Admin |

**Timeline Angsuran** — Jika pinjaman disetujui, nasabah dapat melihat visualisasi timeline cicilan yang sedang berjalan, termasuk progress cicilan yang sudah dibayar.

---

### Pembayaran Cicilan — `/dashboard/payments`

Sistem pembayaran yang meminimalkan kesalahan nasabah.

- **Deteksi Otomatis** — Sistem secara otomatis mengenali ID pinjaman aktif dan nominal yang harus dibayar
- **Upload Bukti Transfer** — Nasabah mengunggah bukti pembayaran (screenshot atau foto transfer)
- **Status Transaksi** — Setelah diunggah, status berubah menjadi **Pending Verification** hingga Admin memverifikasi

---

### Pengaturan Profil — `/dashboard/profile`

Fitur manajemen akun nasabah.

- Perbarui data diri (nama, informasi kontak, dll.)
- Ganti kata sandi secara aman

---

## Portal Administrator (Admin)

Akses halaman: `/admin`

Admin memiliki kendali penuh atas seluruh operasional platform — dari verifikasi akun, persetujuan pinjaman, hingga monitoring pembayaran.

---

### Dashboard Analitik Admin — `/admin`

Pusat kendali dan pemantauan platform secara keseluruhan.

| Visualisasi | Keterangan |
|---|---|
| Bar Chart | Grafik pendapatan platform dari waktu ke waktu |
| Pie Chart | Distribusi dan komposisi pinjaman aktif |
| Grafik Pertumbuhan | Tren pertambahan nasabah baru |

---

### Manajemen Nasabah — `/admin/customers`

Tabel komprehensif seluruh pengguna terdaftar di platform.

| Aksi | Fungsi |
|---|---|
| Approve | Verifikasi akun pendaftar baru agar bisa login dan mengakses sistem |
| Suspend | Tangguhkan akun nasabah yang bermasalah |

Admin dapat memantau status setiap nasabah, kapan mereka mendaftar, serta riwayat aktivitas akun.

---

### Persetujuan Pinjaman — `/admin/loans`

Antarmuka untuk memproses semua pengajuan pinjaman yang masuk dari nasabah.

- **Lihat Detail Pengajuan** — Jumlah pinjaman, tenor yang dipilih, dan informasi nasabah pengaju
- **Setujui Pinjaman** — Dengan satu klik, pinjaman langsung aktif di dasbor nasabah secara real-time
- **Tolak Pinjaman** — Status pengajuan diperbarui ke Rejected dan nasabah dapat melihat hasilnya langsung

---

### Verifikasi Pembayaran — `/admin/payments`

Sistem pelacakan dan verifikasi mutasi terintegrasi.

Alur kerja:
1. Nasabah mengunggah bukti pembayaran
2. Admin melihat pembayaran masuk beserta bukti transfernya
3. Admin memverifikasi keaslian pembayaran
4. Setelah diverifikasi, sistem secara otomatis memperbarui riwayat transaksi nasabah, memotong sisa tagihan, dan memajukan progres timeline cicilan

---

### Laporan — `/admin/reports`

Halaman statistik dan laporan platform untuk analisis lebih lanjut.

---

### Pengaturan Sistem — `/admin/settings`

Konfigurasi dan pengaturan operasional platform.

---

## Alur Pengguna

**Nasabah Baru**
```
Daftar & Upload Data Pribadi
        ↓
   Halaman Tunggu
        ↓
  Admin Verifikasi Akun
        ↓
    Login ke Dashboard
        ↓
  Ajukan Pinjaman via Kalkulator
        ↓
  Tunggu Persetujuan Admin
        ↓
  Pinjaman Aktif — Bayar Cicilan
        ↓
  Upload Bukti Transfer
        ↓
  Admin Verifikasi Pembayaran
        ↓
  Saldo Terpotong Otomatis
```

**Administrator**
```
Login ke Admin Panel
        ↓
  Verifikasi Akun Nasabah Baru
        ↓
  Tinjau Pengajuan Pinjaman
  (Approve / Reject)
        ↓
  Verifikasi Pembayaran Nasabah
        ↓
  Pantau Analitik Platform
```

---

## Struktur Proyek

```
src/
├── components/
│   ├── ui/                        # Komponen UI reusable
│   ├── AppSidebar.tsx             # Sidebar navigasi
│   ├── DashboardLayout.tsx        # Layout wrapper dasbor
│   └── TopNav.tsx                 # Navigasi atas
├── hooks/                         # Custom React hooks
├── lib/                           # Utility & konfigurasi Firebase
└── routes/
    ├── admin/
    │   ├── index.tsx              # Dasbor analitik admin
    │   ├── customers.tsx          # Manajemen & verifikasi akun nasabah
    │   ├── loans.tsx              # Persetujuan pengajuan pinjaman
    │   ├── payments.tsx           # Verifikasi pembayaran nasabah
    │   ├── reports.tsx            # Laporan dan statistik platform
    │   └── settings.tsx           # Pengaturan sistem
    ├── dashboard/
    │   ├── index.tsx              # Dasbor utama nasabah
    │   ├── apply.tsx              # Kalkulator & pengajuan pinjaman
    │   ├── loans.tsx              # Riwayat & status pinjaman
    │   ├── payments.tsx           # Pembayaran tagihan cicilan
    │   └── profile.tsx            # Pengaturan akun nasabah
    ├── login.tsx                  # Halaman login
    ├── register.tsx               # Pendaftaran nasabah baru
    ├── pending-verification.tsx   # Halaman tunggu verifikasi akun
    └── router.tsx                 # Konfigurasi TanStack Router
```

---

## Instalasi & Menjalankan Proyek

### Prasyarat

- Node.js versi **18+**
- npm, yarn, atau bun

### Langkah Instalasi

**1. Clone repositori**
```bash
git clone https://github.com/Grimarks/SIBANK-NEOFUND.git
cd SIBANK-NEOFUND
```

**2. Install dependensi**
```bash
npm install
# atau
bun install
```

**3. Konfigurasi environment**
```bash
cp .env.example .env
```

Isi file `.env` dengan kredensial Firebase:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**4. Jalankan development server**
```bash
npm run dev
```

Buka browser di `http://localhost:5173`

### Konfigurasi Firebase

1. Buat project baru di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan **Authentication** → Email/Password
3. Aktifkan **Firestore Database**
4. Salin konfigurasi ke file `.env`

---

## Live Demo

[neofund.vercel.app](https://neofund.vercel.app)

---

## Lisensi

Proyek ini dikembangkan untuk keperluan simulasi dan pembelajaran. Seluruh hak cipta dipegang oleh pengembang.
