-- NUSA Boarding School SaaS Database Schema
-- Run this in Supabase SQL Editor

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table (Public mirror of auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Profiles Table
CREATE TABLE profiles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
  avatar_url TEXT,
  bio TEXT,
  class_id UUID -- Optional: current primary class
);

-- 4. Classes Table
CREATE TABLE classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Enrollments Table
CREATE TABLE enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, class_id)
);

-- 6. Assignments Table
CREATE TABLE assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Submissions Table
CREATE TABLE submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT,
  grade NUMERIC(5,2),
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(assignment_id, student_id)
);

-- 8. Projects Table
CREATE TABLE projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  github_url TEXT,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Portfolios Table
CREATE TABLE portfolios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, project_id)
);

-- 10. Attendance Table
CREATE TABLE attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'late', 'excused')) NOT NULL,
  UNIQUE(student_id, date)
);

-- 11. Activity Logs Table
CREATE TABLE activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Users Policies
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (get_user_role() = 'admin');

-- Profiles Policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Classes Policies
CREATE POLICY "Classes are viewable by everyone" ON classes FOR SELECT USING (true);
CREATE POLICY "Admins can manage classes" ON classes FOR ALL USING (get_user_role() = 'admin');

-- Enrollments Policies
CREATE POLICY "Enrollments viewable by teachers and admins" ON enrollments FOR SELECT USING (get_user_role() IN ('admin', 'teacher') OR auth.uid() = student_id);
CREATE POLICY "Admins can manage enrollments" ON enrollments FOR ALL USING (get_user_role() = 'admin');

-- Assignments Policies
CREATE POLICY "Assignments viewable by class members" ON assignments FOR SELECT USING (true); -- Simplified
CREATE POLICY "Teachers can manage their assignments" ON assignments FOR ALL USING (get_user_role() = 'teacher' AND teacher_id = auth.uid());
CREATE POLICY "Admins can manage all assignments" ON assignments FOR ALL USING (get_user_role() = 'admin');

-- Submissions Policies
CREATE POLICY "Students can manage own submissions" ON submissions FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Teachers can view and grade submissions for their assignments" ON submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM assignments WHERE id = assignment_id AND teacher_id = auth.uid())
);

-- Projects Policies
CREATE POLICY "Students can manage own projects" ON projects FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Published projects viewable by everyone" ON projects FOR SELECT USING (status = 'published' OR auth.uid() = student_id);

-- Portfolios Policies
CREATE POLICY "Portfolios viewable by everyone" ON portfolios FOR SELECT USING (true);
CREATE POLICY "Students can manage own portfolios" ON portfolios FOR ALL USING (auth.uid() = student_id);

-- Attendance Policies
CREATE POLICY "Students can view own attendance" ON attendance FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Teachers can manage attendance" ON attendance FOR ALL USING (get_user_role() = 'teacher');
CREATE POLICY "Admins can manage attendance" ON attendance FOR ALL USING (get_user_role() = 'admin');

-- Activity Logs Policies
CREATE POLICY "Users can view own logs" ON activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all logs" ON activity_logs FOR SELECT USING (get_user_role() = 'admin');

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Automatically create user in public.users on auth.signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'User'), new.email, COALESCE(new.raw_user_meta_data->>'role', 'student'));
  
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
