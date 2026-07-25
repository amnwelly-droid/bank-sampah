export type Role = 'admin' | 'operator' | 'user'
export type KategoriSampah = 'organik' | 'anorganik' | 'b3'
export type StatusPenarikan = 'pending' | 'approved' | 'rejected'
export type MetodePenarikan = 'transfer' | 'poin'

export interface Profile {
  id: string
  email: string
  nama: string
  role: Role
  saldo: number
  poin: number  // NUMERIC(10,1) - bisa desimal 1 angka
  no_hp: string | null
  alamat: string | null
  created_at: string
}

export interface JenisSampah {
  id: string
  nama: string
  kategori: KategoriSampah
  harga_per_kg: number
  poin_per_kg: number
  aktif: boolean
  created_at: string
}

export interface Transaksi {
  id: string
  nasabah_id: string
  operator_id: string
  jenis_sampah_id: string
  berat: number
  total_nilai: number
  total_poin: number  // NUMERIC(10,1) - bisa desimal 1 angka
  catatan: string | null
  created_at: string
  nasabah?: Profile
  operator?: Profile
  jenis_sampah?: JenisSampah
}

export interface Penarikan {
  id: string
  nasabah_id: string
  jumlah: number
  metode: MetodePenarikan
  no_rekening: string | null
  nama_bank: string | null
  status: StatusPenarikan
  catatan_admin: string | null
  created_at: string
  updated_at: string
  nasabah?: Profile
}
