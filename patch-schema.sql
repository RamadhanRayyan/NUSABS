-- =======================================================
-- PATCH: UPDATE DATABASE UNTUK ABSENSI & MATERIALS
-- Jalankan HANYA kode ini di Supabase SQL Editor
-- =======================================================

-- 1. Perbarui tabel TASK agar mendukung tipe 'material' dan 'assignment'
-- Karena tabel "tasks" sudah ada, "CREATE TABLE" biasa akan di-skip.
-- Kita harus menggunakan ALTER TABLE untuk mengubah constraint-nya.
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_type_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_type_check 
  CHECK (type IN ('material','assignment','design_daily','programming_weekly','business_monthly'));

-- 2. Buat ulang attendance_records untuk memastikan kolom user_id terbentuk dengan benar.
-- (Bila sebelumnya error, mungkin tabel telanjur terbuat tapi kolomnya kurang)
DROP TABLE IF EXISTS public.attendance_records CASCADE;

CREATE TABLE public.attendance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present','excused','absent')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 3. Terapkan RLS (Row Level Security) untuk table absensi yang baru dibuat
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ar_read" ON public.attendance_records FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (auth.jwt()->'user_metadata'->>'role') IN ('teacher','admin') OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );

CREATE POLICY "ar_write" ON public.attendance_records FOR INSERT
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') IN ('teacher','admin') OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );

CREATE POLICY "ar_update" ON public.attendance_records FOR UPDATE
  USING (
    (auth.jwt()->'user_metadata'->>'role') IN ('teacher','admin') OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );
