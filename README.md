# NeoFund

NeoFund adalah platform web aplikasi fintech (Financial Technology) modern yang dirancang untuk menyimulasikan sistem perbankan dan pinjaman digital secara end-to-end melalui mekanisme Peer-to-Peer Lending. Dibangun di atas ekosistem teknologi modern, aplikasi ini memisahkan kontrol ke dalam dua portal utama: Portal Nasabah untuk kemandirian finansial, dan Portal Admin untuk manajemen serta operasional terpusat.

Platform ini menghadirkan pengalaman pengguna yang mulus melalui kalkulator pinjaman interaktif, grafik proyeksi pelunasan otomatis, serta sistem verifikasi berlapis yang memastikan keamanan data antara nasabah dan administrator beroperasi secara real-time.

---

## Teknologi yang Digunakan

| Layer | Teknologi |
|---|---|
| Frontend Framework | React + TypeScript |
| Build Tool | Vite |
| Routing | TanStack Router |
| Backend & Database | Firebase (Auth + Firestore) |

---

## Fitur Utama

### Autentikasi dan Keamanan

**Role-Based Access Login**
Sistem login yang secara otomatis mendeteksi peran pengguna berdasarkan email dan mengarahkan mereka ke dasbor yang sesuai, baik Admin maupun Customer. Akses ke rute yang tidak sah diblokir secara otomatis.

**Pendaftaran dengan Pending Verification**
Nasabah baru dapat mendaftar dan mengunggah informasi pribadi, namun tidak dapat langsung masuk ke sistem. Mereka akan diarahkan ke halaman tunggu hingga Admin menyetujui akun secara manual, mencegah bypass dan akses tidak sah.

**Firebase Error Handling**
Notifikasi yang informatif dan spesifik saat pengguna menghadapi kondisi seperti email belum terdaftar, kata sandi salah, atau percobaan login yang melebihi batas.

---

### Portal Nasabah (Customer Dashboard)

**Overview dan Proyeksi Saldo Dinamis**
Dasbor ringkasan yang menampilkan informasi Pinjaman Aktif, Sisa Tagihan, Skor Kredit, dan Cicilan Bulanan secara instan. Dilengkapi grafik Area interaktif yang memproyeksikan penurunan sisa hutang dari bulan ke bulan. Grafik ditampilkan dalam kondisi diburamkan secara estetis apabila nasabah belum memiliki pinjaman aktif.

**Kalkulator Pinjaman Interaktif**
Fitur pengajuan pinjaman dengan slider dinamis yang memungkinkan nasabah mengatur jumlah pinjaman dan memilih tenor untuk melihat estimasi bunga serta cicilan per bulan sebelum mengajukan permohonan.

**Pelacakan Pinjaman (My Loans)**
Halaman riwayat yang menampilkan seluruh pengajuan pinjaman beserta status real-time, mencakup Pending, Approved, dan Rejected. Apabila pinjaman disetujui, nasabah dapat melihat visualisasi timeline angsuran yang sedang berjalan.

**Smart Payment System**
Sistem pembayaran yang secara otomatis mengenali ID pinjaman aktif dan nominal yang harus dibayar. Nasabah cukup mengunggah bukti transfer, setelah itu status transaksi akan berubah menjadi Pending Verification di riwayat pembayaran.

**Profile Settings**
Fitur manajemen akun untuk memperbarui data diri dan melakukan penggantian kata sandi secara aman.

---

### Portal Administrator (Admin Panel)

**Analitik Terpusat (Admin Overview)**
Dasbor khusus Admin yang menampilkan grafik batang (Bar Chart) untuk visualisasi pendapatan, diagram lingkaran (Pie Chart) untuk distribusi pinjaman, serta grafik pertumbuhan nasabah dari waktu ke waktu.

**Customer Management**
Tabel komprehensif untuk memantau seluruh pengguna terdaftar. Admin memiliki wewenang penuh untuk memverifikasi (Approve) pendaftar baru agar dapat mengakses sistem, atau menangguhkan (Suspend) akun yang bermasalah.

**Loan Approval**
Antarmuka untuk memeriksa dan memproses pengajuan pinjaman yang masuk. Dengan satu tindakan, admin dapat menyetujui pinjaman yang secara langsung mengaktifkan pinjaman di dasbor nasabah, atau menolaknya disertai pembaruan status.

**Payment Monitoring**
Sistem pelacakan mutasi terintegrasi. Saat nasabah mengunggah bukti pembayaran, admin dapat memverifikasinya. Setelah diverifikasi, sistem secara otomatis memperbarui riwayat transaksi nasabah, memotong sisa tagihan (remaining balance), dan menambah progres timeline cicilan secara real-time.

---

## Struktur Proyek

```
src
├── components
│   ├── ui
│   ├── AppSidebar.tsx
│   ├── DashboardLayout.tsx
│   └── TopNav.tsx
├── hooks
├── lib
└── routes
    ├── admin
    │   ├── customers.tsx         # Manajemen & verifikasi akun nasabah
    │   ├── index.tsx             # Dasbor analitik admin
    │   ├── loans.tsx             # Persetujuan pengajuan pinjaman
    │   ├── payments.tsx          # Verifikasi pembayaran nasabah
    │   ├── reports.tsx           # Laporan dan statistik platform
    │   └── settings.tsx          # Pengaturan sistem
    ├── dashboard
    │   ├── apply.tsx             # Kalkulator & pengajuan pinjaman
    │   ├── index.tsx             # Dasbor utama nasabah
    │   ├── loans.tsx             # Riwayat & status pinjaman
    │   ├── payments.tsx          # Pembayaran tagihan
    │   └── profile.tsx           # Pengaturan akun nasabah
    ├── __root.tsx                # Root layout aplikasi
    ├── index.tsx                 # Entry point routing
    ├── login.tsx                 # Halaman login
    ├── pending-verification.tsx  # Halaman tunggu verifikasi akun
    ├── register.tsx              # Halaman pendaftaran nasabah baru
    ├── router.tsx                # Konfigurasi TanStack Router
    ├── routeTree.gen.ts          # Auto-generated route tree
    ├── server.ts
    ├── start.ts
    └── styles.css
```

---

## Alur Pengguna

**Nasabah Baru**
1. Mendaftar dan mengunggah data pribadi
2. Menunggu verifikasi dari Admin
3. Setelah disetujui, dapat login dan mengakses dasbor
4. Mengajukan pinjaman melalui kalkulator interaktif
5. Memantau status pinjaman secara real-time
6. Melakukan pembayaran dengan mengunggah bukti transfer

**Administrator**
1. Login dan mengakses Admin Panel
2. Memverifikasi akun nasabah baru
3. Meninjau dan menyetujui atau menolak pengajuan pinjaman
4. Memverifikasi pembayaran yang diunggah nasabah
5. Memantau pertumbuhan platform melalui dasbor analitik

---

## Instalasi dan Pengembangan

### Prasyarat

Pastikan perangkat telah memiliki Node.js versi 18 ke atas dan npm atau yarn.

### Langkah Instalasi

Clone repositori:

```bash
git clone https://github.com/username/neofund.git
cd neofund
```

Install dependensi:

```bash
npm install
```

Salin file konfigurasi environment dan isi dengan kredensial Firebase:

```bash
cp .env.example .env
```

Jalankan server pengembangan:

```bash
npm run dev
```

Buka browser dan akses `http://localhost:5173`.

### Konfigurasi Firebase

Buat project di [Firebase Console](https://console.firebase.google.com), aktifkan Authentication (Email/Password) dan Firestore Database, lalu isi file `.env` dengan konfigurasi berikut:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Lisensi

Proyek ini dikembangkan untuk keperluan simulasi dan pembelajaran. Seluruh hak cipta dipegang oleh pengembang.