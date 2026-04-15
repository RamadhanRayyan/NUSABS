-- ============================================================
-- NUSA BOARDING SCHOOL - CLEAN SCHEMA
-- Jalankan di Supabase SQL Editor (satu per satu bagian)
-- ============================================================

-- BAGIAN A: TABLES
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'User',
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin','teacher','student')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','rejected')),
  class_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS class_id UUID;

CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('design_daily','programming_weekly','business_monthly')),
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','submitted','reviewed')),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT,
  comment TEXT,
  grade NUMERIC(5,2),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  score NUMERIC(5,2),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.check_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checkin','checkout')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BAGIAN B: TRIGGERS
-- ============================================================

-- Trigger: Auto-create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

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
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger: Auto-log checkin/checkout
DROP TRIGGER IF EXISTS on_attendance_created ON public.check_logs;
DROP FUNCTION IF EXISTS public.log_attendance_activity() CASCADE;

CREATE OR REPLACE FUNCTION public.log_attendance_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, activity_type, description)
  VALUES (NEW.user_id, NEW.type,
    CASE WHEN NEW.type = 'checkin' THEN 'Melakukan Check-In'
         ELSE 'Melakukan Check-Out' END);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

CREATE TRIGGER on_attendance_created
  AFTER INSERT ON public.check_logs
  FOR EACH ROW EXECUTE PROCEDURE public.log_attendance_activity();

-- Trigger: Auto-log task submission
DROP TRIGGER IF EXISTS on_submission_created ON public.submissions;
DROP FUNCTION IF EXISTS public.log_submission_activity() CASCADE;

CREATE OR REPLACE FUNCTION public.log_submission_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, activity_type, description)
  VALUES (NEW.user_id, 'submission', 'Mengumpulkan tugas');
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

CREATE TRIGGER on_submission_created
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE PROCEDURE public.log_submission_activity();

-- Trigger: Notify student when task reviewed
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
DROP FUNCTION IF EXISTS public.notify_on_review() CASCADE;

CREATE OR REPLACE FUNCTION public.notify_on_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id FROM public.submissions WHERE id = NEW.submission_id;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message)
    VALUES (v_user_id, 'Submission Reviewed!',
      'Your submission has been reviewed. Score: ' || NEW.score::TEXT);
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.notify_on_review();

-- Trigger: Notify student when exam score added
DROP TRIGGER IF EXISTS on_score_added ON public.exam_scores;
DROP FUNCTION IF EXISTS public.notify_on_score() CASCADE;

CREATE OR REPLACE FUNCTION public.notify_on_score()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message)
  VALUES (NEW.user_id, 'New Exam Score!',
    'Your score for ' || NEW.subject || ': ' || NEW.score::TEXT);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$;

CREATE TRIGGER on_score_added
  AFTER INSERT ON public.exam_scores
  FOR EACH ROW EXECUTE PROCEDURE public.notify_on_score();

-- ============================================================
-- BAGIAN C: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop semua policy lama
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- USERS: Pakai "id" (primary key), bukan "user_id"
CREATE POLICY "u_read_own"  ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "u_admin_all" ON public.users FOR ALL   USING (
  (auth.jwt()->'user_metadata'->>'role') = 'admin' OR 
  (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
);
CREATE POLICY "u_insert"    ON public.users FOR INSERT WITH CHECK (true);

-- CLASSES
CREATE POLICY "c_read" ON public.classes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "c_admin" ON public.classes FOR ALL USING (
  (auth.jwt()->'user_metadata'->>'role') = 'admin' OR 
  (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
);

-- TASKS
CREATE POLICY "t_read_own" ON public.tasks FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (auth.jwt()->'user_metadata'->>'role') IN ('teacher','admin') OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );
CREATE POLICY "t_write" ON public.tasks FOR INSERT
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') IN ('teacher','admin') OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );
CREATE POLICY "t_update" ON public.tasks FOR UPDATE
  USING (
    (auth.jwt()->'user_metadata'->>'role') IN ('teacher','admin') OR 
    auth.uid() = user_id OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );

-- SUBMISSIONS
CREATE POLICY "s_read" ON public.submissions FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (auth.jwt()->'user_metadata'->>'role') IN ('teacher','admin') OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );
CREATE POLICY "s_insert" ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "s_update" ON public.submissions FOR UPDATE
  USING (
    (auth.jwt()->'user_metadata'->>'role') IN ('teacher','admin') OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );

-- REVIEWS
CREATE POLICY "r_read" ON public.reviews FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "r_write" ON public.reviews FOR INSERT
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') IN ('teacher','admin') OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );

-- CHECK_LOGS
CREATE POLICY "cl_own" ON public.check_logs FOR ALL USING (auth.uid() = user_id);

-- EXAM_SCORES
CREATE POLICY "es_read" ON public.exam_scores FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (auth.jwt()->'user_metadata'->>'role') IN ('teacher','admin') OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );
CREATE POLICY "es_write" ON public.exam_scores FOR INSERT
  WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') IN ('teacher','admin') OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );

-- NOTIFICATIONS
CREATE POLICY "n_own" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ACTIVITY_LOGS
CREATE POLICY "al_read" ON public.activity_logs FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (auth.jwt()->'user_metadata'->>'role') = 'admin' OR
    (auth.jwt()->>'email') = 'muhammadramadhanrayyan@gmail.com'
  );
CREATE POLICY "al_insert" ON public.activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- BAGIAN D: AKTIFKAN ADMIN
-- ============================================================

-- Tambah admin dari auth.users jika belum ada
INSERT INTO public.users (id, name, email, role, status)
SELECT id, 'Admin NUSA', email, 'admin', 'active'
FROM auth.users
WHERE email = 'muhammadramadhanrayyan@gmail.com'
ON CONFLICT (id) DO UPDATE
  SET role = 'admin', status = 'active';
