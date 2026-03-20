-- ============================================================
-- Supabase Database Schema for LeetCode Student Progress Tracker
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. users table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    roll_number TEXT,
    email TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    leetcode_username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 2. account_requests table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.account_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    roll_number TEXT,
    email TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student')),
    leetcode_username TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. leetcode_stats_cache table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leetcode_stats_cache (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    total_solved INTEGER NOT NULL DEFAULT 0,
    easy_solved INTEGER NOT NULL DEFAULT 0,
    medium_solved INTEGER NOT NULL DEFAULT 0,
    hard_solved INTEGER NOT NULL DEFAULT 0,
    solved_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 4. blind75_progress table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blind75_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    solved_count INTEGER NOT NULL DEFAULT 0,
    total_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, category)
);

-- ============================================================
-- Function to handle approval of an account request
-- ============================================================
CREATE OR REPLACE FUNCTION handle_account_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        INSERT INTO public.users (name, roll_number, email, role, leetcode_username)
        VALUES (NEW.name, NEW.roll_number, NEW.email, NEW.role, NEW.leetcode_username)
        ON CONFLICT (email) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for account approval
DROP TRIGGER IF EXISTS trigger_account_approval ON public.account_requests;
CREATE TRIGGER trigger_account_approval
    AFTER UPDATE ON public.account_requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_account_approval();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_stats_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blind75_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe re-run)
DROP POLICY IF EXISTS "Allow public inserts into account requests" ON public.account_requests;
DROP POLICY IF EXISTS "Allow public read on account requests" ON public.account_requests;
DROP POLICY IF EXISTS "Allow public updates on account requests" ON public.account_requests;
DROP POLICY IF EXISTS "Allow public read on users table" ON public.users;
DROP POLICY IF EXISTS "Allow public updates on users table" ON public.users;
DROP POLICY IF EXISTS "Allow public inserts into users table" ON public.users;

-- account_requests policies (open for self-registration)
CREATE POLICY "Allow public inserts into account requests"
ON public.account_requests FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public read on account requests"
ON public.account_requests FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Allow public updates on account requests"
ON public.account_requests FOR UPDATE TO anon, authenticated
USING (true);

-- users policies
CREATE POLICY "Allow public read on users table"
ON public.users FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Allow public updates on users table"
ON public.users FOR UPDATE TO anon, authenticated
USING (true);

CREATE POLICY "Allow public inserts into users table"
ON public.users FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public deletes on users table"
ON public.users FOR DELETE TO anon, authenticated
USING (true);

-- leetcode_stats_cache policies
CREATE POLICY "Allow all on leetcode_stats_cache"
ON public.leetcode_stats_cache FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- blind75_progress policies
CREATE POLICY "Allow all on blind75_progress"
ON public.blind75_progress FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);
