-- Supabase Schema for AarogyaPath profiles and roles

-- 1. Create enum for roles if not existing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('citizen', 'doctor', 'nurse', 'student');
    END IF;
END$$;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('female', 'male', 'other', 'prefer_not_to_say')),
    city TEXT NOT NULL DEFAULT 'Indore',
    lat DOUBLE PRECISION DEFAULT 22.7196,
    lng DOUBLE PRECISION DEFAULT 75.8577,
    role user_role NOT NULL DEFAULT 'citizen',
    specialty TEXT,
    reg_no TEXT,
    is_available BOOLEAN DEFAULT false,
    language TEXT DEFAULT 'en',
    emergency_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policies:
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Public can view helper profiles for verified assistance (name, role, specialty, availability)
CREATE POLICY "Public can view helper profiles"
ON public.profiles
FOR SELECT
USING (role IN ('doctor', 'nurse', 'student'));

-- 5. Automatic trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
