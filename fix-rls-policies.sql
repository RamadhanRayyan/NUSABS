-- =============================================================
-- FIX: RLS POLICIES - Perbaikan Row Level Security
-- Jalankan SELURUH script ini di Supabase SQL Editor
-- =============================================================

-- MASALAH UTAMA:
-- 1. Policy lama menggunakan auth.jwt()->'user_metadata'->>'role' untuk cek role,
--    tapi role di user_metadata TIDAK sinkron dengan role di tabel users.
-- 2. Tabel users.class_id tidak punya FOREIGN KEY constraint,
--    sehingga PostgREST tidak bisa membuat JOIN otomatis.
-- 3. Beberapa query dengan ambiguous FK gagal tanpa hint yang benar.

-- SOLUSI:
-- Buat FK constraint, helper functions, dan policy baru.

-- =============================================================
-- STEP 0: Fix Missing Foreign Key on users.class_id
-- =============================================================

-- Tambahkan foreign key constraint jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_class_id_fkey' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users 
      ADD CONSTRAINT users_class_id_fkey 
      FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================================
-- STEP 1: Helper Function untuk cek role dari tabel users
-- =============================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin' AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'teacher') AND status = 'active'
  )
$$;

-- =============================================================
-- STEP 2: Drop SEMUA policy lama
-- =============================================================

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- =============================================================
-- STEP 3: Buat policy baru yang benar
-- =============================================================

-- ── USERS ──────────────────────────────────────────────────────
-- Semua user authenticated bisa baca semua user (diperlukan untuk join queries)
CREATE POLICY "users_select" ON public.users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admin bisa update/delete semua user
CREATE POLICY "users_admin_update" ON public.users FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "users_admin_delete" ON public.users FOR DELETE
  USING (public.is_admin());

-- User bisa update profilenya sendiri
CREATE POLICY "users_self_update" ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Insert terbuka (untuk trigger auth dan registrasi)
CREATE POLICY "users_insert" ON public.users FOR INSERT
  WITH CHECK (true);


-- ── CLASSES ────────────────────────────────────────────────────
-- Semua authenticated bisa baca kelas
CREATE POLICY "classes_select" ON public.classes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admin bisa CRUD kelas
CREATE POLICY "classes_admin_insert" ON public.classes FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "classes_admin_update" ON public.classes FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "classes_admin_delete" ON public.classes FOR DELETE
  USING (public.is_admin());


-- ── TASKS ──────────────────────────────────────────────────────
-- User bisa baca tasknya sendiri, teacher/admin bisa baca semua
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.is_teacher_or_admin()
  );

-- Teacher/admin bisa buat task
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT
  WITH CHECK (public.is_teacher_or_admin());

-- Teacher/admin bisa update semua task, student bisa update tasknya sendiri
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR public.is_teacher_or_admin()
  );

-- Teacher/admin bisa hapus task
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE
  USING (public.is_teacher_or_admin());


-- ── SUBMISSIONS ────────────────────────────────────────────────
-- User bisa baca submissionnya sendiri, teacher/admin bisa baca semua
CREATE POLICY "submissions_select" ON public.submissions FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.is_teacher_or_admin()
  );

-- User bisa insert submissionnya sendiri
CREATE POLICY "submissions_insert" ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Teacher/admin bisa update submission (untuk grading), student bisa update miliknya
CREATE POLICY "submissions_update" ON public.submissions FOR UPDATE
  USING (
    auth.uid() = user_id
    OR public.is_teacher_or_admin()
  );


-- ── REVIEWS ────────────────────────────────────────────────────
-- Semua authenticated bisa baca review
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT
  USING (auth.role() = 'authenticated');

-- Teacher/admin bisa buat review
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT
  WITH CHECK (public.is_teacher_or_admin());


-- ── CHECK_LOGS ─────────────────────────────────────────────────
-- User bisa baca lognya sendiri, admin bisa baca semua
CREATE POLICY "check_logs_select" ON public.check_logs FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.is_admin()
  );

-- User bisa insert lognya sendiri
CREATE POLICY "check_logs_insert" ON public.check_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ── ATTENDANCE_RECORDS ─────────────────────────────────────────
-- User bisa baca recordnya sendiri, teacher/admin bisa baca semua
CREATE POLICY "attendance_select" ON public.attendance_records FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.is_teacher_or_admin()
  );

-- Teacher/admin bisa insert attendance records
CREATE POLICY "attendance_insert" ON public.attendance_records FOR INSERT
  WITH CHECK (public.is_teacher_or_admin());

-- Teacher/admin bisa update attendance records
CREATE POLICY "attendance_update" ON public.attendance_records FOR UPDATE
  USING (public.is_teacher_or_admin());


-- ── EXAM_SCORES ────────────────────────────────────────────────
-- User bisa baca scorenya sendiri, teacher/admin bisa baca semua
CREATE POLICY "exam_scores_select" ON public.exam_scores FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.is_teacher_or_admin()
  );

-- Teacher/admin bisa insert scores
CREATE POLICY "exam_scores_insert" ON public.exam_scores FOR INSERT
  WITH CHECK (public.is_teacher_or_admin());


-- ── NOTIFICATIONS ──────────────────────────────────────────────
-- User bisa baca notifikasinya sendiri
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Insert terbuka (karena trigger insert notification secara otomatis)
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT
  WITH CHECK (true);

-- User bisa update notifikasinya sendiri (mark as read)
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);


-- ── ACTIVITY_LOGS ──────────────────────────────────────────────
-- User bisa baca lognya sendiri, admin bisa baca semua
CREATE POLICY "activity_logs_select" ON public.activity_logs FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.is_admin()
  );

-- Insert terbuka (karena trigger insert activity secara otomatis)
CREATE POLICY "activity_logs_insert" ON public.activity_logs FOR INSERT
  WITH CHECK (true);


-- =============================================================
-- STEP 4: Pastikan RLS aktif di semua tabel
-- =============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;


-- =============================================================
-- STEP 5: Pastikan admin account aktif
-- =============================================================

UPDATE public.users 
SET role = 'admin', status = 'active' 
WHERE email = 'muhammadramadhanrayyan@gmail.com';

-- Jika admin belum ada di tabel users
INSERT INTO public.users (id, name, email, role, status)
SELECT id, 'Admin NUSA', email, 'admin', 'active'
FROM auth.users
WHERE email = 'muhammadramadhanrayyan@gmail.com'
ON CONFLICT (id) DO UPDATE
  SET role = 'admin', status = 'active';

-- =============================================================
-- STEP 6: Perbaiki trigger agar tidak error saat insert user baru
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    'pending'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, public.users.name);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END; $$;


-- =============================================================
-- SELESAI! Jalankan seluruh script ini di Supabase SQL Editor.
-- =============================================================
