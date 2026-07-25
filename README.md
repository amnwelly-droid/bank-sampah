# Bank Sampah - Sistem Pengelolaan Sampah Digital

Aplikasi web bank sampah lengkap menggunakan Next.js 14, Supabase, Tailwind CSS, dan shadcn/ui.

## Fitur

### Role Admin
- Dashboard dengan statistik dan chart
- Manajemen nasabah
- Manajemen operator (tambah operator baru)
- Manajemen jenis sampah (CRUD + toggle aktif)
- Lihat semua transaksi (dengan filter)
- Proses permintaan penarikan (approve/reject)
- Laporan bulanan dengan chart

### Role Operator
- Form input timbang sampah (dengan kalkulasi otomatis)
- Riwayat transaksi yang diinput

### Role User (Nasabah)
- Dashboard saldo dan poin
- Riwayat setoran sampah
- Ajukan penarikan saldo

## Setup

### 1. Clone & Install
```bash
npm install
```

### 2. Setup Supabase
1. Buat project di [supabase.com](https://supabase.com)
2. Jalankan SQL di `supabase/schema.sql` melalui SQL Editor di Supabase
3. Copy URL dan anon key dari Settings > API

### 3. Environment Variables
Salin `.env.local.example` menjadi `.env.local`:
```bash
cp .env.local.example .env.local
```

Isi dengan kredensial Supabase Anda:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### 4. Buat Admin User
Setelah setup, daftar akun normal di `/register`, lalu jalankan SQL berikut di Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 5. Run Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Tech Stack
- **Next.js 14** - App Router
- **Supabase** - Database + Auth + RLS
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI Components
- **Recharts** - Charts
- **TypeScript** - Type safety
- **date-fns** - Date formatting

## Struktur Database

### Tables
- `profiles` - Data user (nasabah, operator, admin)
- `jenis_sampah` - Jenis dan harga sampah
- `transaksi` - Riwayat setoran sampah
- `penarikan` - Permintaan penarikan saldo

### Security
- Row Level Security (RLS) aktif di semua tabel
- Middleware autentikasi dan otorisasi berbasis role
- Session management dengan @supabase/ssr
