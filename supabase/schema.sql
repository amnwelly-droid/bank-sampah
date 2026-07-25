-- =============================================
-- BANK SAMPAH - DATABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: profiles
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nama TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'operator', 'user')),
  saldo NUMERIC(15, 2) NOT NULL DEFAULT 0,
  poin INTEGER NOT NULL DEFAULT 0,
  no_hp TEXT,
  alamat TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: jenis_sampah
-- =============================================
CREATE TABLE IF NOT EXISTS public.jenis_sampah (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL CHECK (kategori IN ('organik', 'anorganik', 'b3')),
  harga_per_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
  poin_per_kg INTEGER NOT NULL DEFAULT 0,
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: transaksi
-- =============================================
CREATE TABLE IF NOT EXISTS public.transaksi (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nasabah_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  operator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  jenis_sampah_id UUID NOT NULL REFERENCES public.jenis_sampah(id) ON DELETE RESTRICT,
  berat NUMERIC(10, 3) NOT NULL,
  total_nilai NUMERIC(15, 2) NOT NULL,
  total_poin INTEGER NOT NULL DEFAULT 0,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABLE: penarikan
-- =============================================
CREATE TABLE IF NOT EXISTS public.penarikan (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nasabah_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  jumlah NUMERIC(15, 2) NOT NULL,
  metode TEXT NOT NULL CHECK (metode IN ('transfer', 'poin')),
  no_rekening TEXT,
  nama_bank TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  catatan_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- FUNCTION & TRIGGER: auto create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- FUNCTION: update updated_at for penarikan
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_penarikan_updated ON public.penarikan;
CREATE TRIGGER on_penarikan_updated
  BEFORE UPDATE ON public.penarikan
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jenis_sampah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penarikan ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Operator can view all profiles" ON public.profiles;
CREATE POLICY "Operator can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
CREATE POLICY "Admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow insert own profile" ON public.profiles;
CREATE POLICY "Allow insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- JENIS SAMPAH POLICIES
DROP POLICY IF EXISTS "Anyone authenticated can view jenis_sampah" ON public.jenis_sampah;
CREATE POLICY "Anyone authenticated can view jenis_sampah"
  ON public.jenis_sampah FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin can manage jenis_sampah" ON public.jenis_sampah;
CREATE POLICY "Admin can manage jenis_sampah"
  ON public.jenis_sampah FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- TRANSAKSI POLICIES
DROP POLICY IF EXISTS "Nasabah can view own transaksi" ON public.transaksi;
CREATE POLICY "Nasabah can view own transaksi"
  ON public.transaksi FOR SELECT
  USING (auth.uid() = nasabah_id);

DROP POLICY IF EXISTS "Operator and admin can view all transaksi" ON public.transaksi;
CREATE POLICY "Operator and admin can view all transaksi"
  ON public.transaksi FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

DROP POLICY IF EXISTS "Operator and admin can insert transaksi" ON public.transaksi;
CREATE POLICY "Operator and admin can insert transaksi"
  ON public.transaksi FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'operator')
    )
  );

-- PENARIKAN POLICIES
DROP POLICY IF EXISTS "Users can view own penarikan" ON public.penarikan;
CREATE POLICY "Users can view own penarikan"
  ON public.penarikan FOR SELECT
  USING (auth.uid() = nasabah_id);

DROP POLICY IF EXISTS "Users can insert own penarikan" ON public.penarikan;
CREATE POLICY "Users can insert own penarikan"
  ON public.penarikan FOR INSERT
  WITH CHECK (auth.uid() = nasabah_id);

DROP POLICY IF EXISTS "Admin can view all penarikan" ON public.penarikan;
CREATE POLICY "Admin can view all penarikan"
  ON public.penarikan FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin can update penarikan" ON public.penarikan;
CREATE POLICY "Admin can update penarikan"
  ON public.penarikan FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- SEED DATA: Jenis Sampah
-- =============================================
-- Update poin_per_kg menjadi 0 karena poin dihitung dari nilai (Rp 1.000 = 1 poin)
UPDATE public.jenis_sampah SET poin_per_kg = 0;
