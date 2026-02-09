-- SUPABASE DATABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('RECOVERING_USER', 'RECOVERED_MENTOR', 'ADMIN')),
    streak INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress table for tracking daily progress
CREATE TABLE IF NOT EXISTS public.progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    activities_completed INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT role = 'ADMIN' FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql;

-- Create policies for users table

-- ADMIN: Can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (is_admin(auth.uid()));

-- ADMIN: Can update all users
CREATE POLICY "Admins can update any user" ON public.users
    FOR UPDATE USING (is_admin(auth.uid()));

-- ADMIN: Can delete users
CREATE POLICY "Admins can delete users" ON public.users
    FOR DELETE USING (is_admin(auth.uid()));

-- USERS: Can view own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id OR is_admin(auth.uid()));

-- USERS: Can update own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id OR is_admin(auth.uid()));

-- USERS: Can insert own profile
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for badges table
CREATE POLICY "Users can view own badges" ON public.badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON public.badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for progress table
CREATE POLICY "Users can view own progress" ON public.progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON public.badges(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_date ON public.progress(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.badges TO anon, authenticated;
GRANT ALL ON public.progress TO anon, authenticated;

-- ================================================================
-- PRIORITY 1: Real Data Tracking Tables
-- ================================================================

-- Craving Logs Table
CREATE TABLE IF NOT EXISTS public.craving_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    severity INTEGER CHECK (severity BETWEEN 1 AND 10),
    trigger TEXT,
    coping_strategy_used TEXT,
    outcome VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50),
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mood Logs Table
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for logging tables
ALTER TABLE public.craving_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for craving_logs
CREATE POLICY "Users can view own craving logs" ON public.craving_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own craving logs" ON public.craving_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for activity_logs
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mood_logs
CREATE POLICY "Users can view own mood logs" ON public.mood_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood logs" ON public.mood_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for logging tables
CREATE INDEX IF NOT EXISTS idx_craving_logs_user_date ON public.craving_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_user_date ON public.mood_logs(user_id, created_at DESC);

-- ================================================================
-- PRIORITY 2: Crisis Management
-- ================================================================

CREATE TABLE IF NOT EXISTS public.crisis_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    keywords_detected TEXT[],
    admin_notified BOOLEAN DEFAULT FALSE,
    admin_notified_at TIMESTAMPTZ,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crisis_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crisis logs" ON public.crisis_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all crisis logs" ON public.crisis_logs
    FOR SELECT USING (is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_crisis_logs_user ON public.crisis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_logs_severity ON public.crisis_logs(severity);
CREATE INDEX IF NOT EXISTS idx_crisis_logs_resolved ON public.crisis_logs(resolved);

-- ================================================================
-- PRIORITY 3: Mentor System
-- ================================================================

CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    bio TEXT,
    sobriety_years DECIMAL(4,2),
    specialties TEXT[],
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    rating DECIMAL(3,2) DEFAULT 0,
    max_users INTEGER DEFAULT 5,
    current_users INTEGER DEFAULT 0,
    availability JSONB,
    mentor_since TIMESTAMPTZ,
    verified_by VARCHAR(255),
    verified_at TIMESTAMPTZ,
    background_check_status VARCHAR(20) CHECK (background_check_status IN ('passed', 'pending', 'failed')),
    training_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    session_type VARCHAR(20) CHECK (session_type IN ('chat', 'video', 'phone')),
    notes TEXT,
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_feedback TEXT,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentor_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sobriety_years DECIMAL(4,2),
    why_mentor TEXT,
    experience_text TEXT,
    specialties TEXT[],
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(255),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
    notes TEXT
);

-- Enable RLS for mentor tables
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentors
CREATE POLICY "Everyone can view verified mentors" ON public.mentors
    FOR SELECT USING (verification_status = 'verified');

CREATE POLICY "Mentors can view own profile" ON public.mentors
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage all mentors" ON public.mentors
    FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for mentor_sessions
CREATE POLICY "Users can view own sessions" ON public.mentor_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Mentors can view own sessions" ON public.mentor_sessions
    FOR SELECT USING (auth.uid() = mentor_id);

CREATE POLICY "Users can insert sessions" ON public.mentor_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mentor_applications
CREATE POLICY "Users can view own applications" ON public.mentor_applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON public.mentor_applications
    FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can insert own applications" ON public.mentor_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for mentor tables
CREATE INDEX IF NOT EXISTS idx_mentors_verified ON public.mentors(verification_status);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_user ON public.mentor_sessions(user_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_sessions_mentor ON public.mentor_sessions(mentor_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_applications_status ON public.mentor_applications(status);

-- Grant permissions for new tables
GRANT ALL ON public.craving_logs TO anon, authenticated;
GRANT ALL ON public.activity_logs TO anon, authenticated;
GRANT ALL ON public.mood_logs TO anon, authenticated;
GRANT ALL ON public.crisis_logs TO anon, authenticated;
GRANT ALL ON public.mentors TO anon, authenticated;
GRANT ALL ON public.mentor_sessions TO anon, authenticated;
GRANT ALL ON public.mentor_applications TO anon, authenticated;

-- Create privacy_settings table
CREATE TABLE IF NOT EXISTS public.privacy_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('private', 'friends', 'public')),
    show_streak BOOLEAN DEFAULT FALSE,
    show_badges BOOLEAN DEFAULT FALSE,
    allow_mentor_requests BOOLEAN DEFAULT TRUE,
    data_collection BOOLEAN DEFAULT FALSE,
    analytics BOOLEAN DEFAULT FALSE,
    allow_contact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    email_daily_summary BOOLEAN DEFAULT TRUE,
    email_craving_tips BOOLEAN DEFAULT TRUE,
    email_achievements BOOLEAN DEFAULT TRUE,
    email_mentor_messages BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    push_reminders BOOLEAN DEFAULT TRUE,
    push_motivation BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    sms_crisis_alerts BOOLEAN DEFAULT TRUE,
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'never')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for new tables
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for privacy_settings
CREATE POLICY "Users can view own privacy settings" ON public.privacy_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy settings" ON public.privacy_settings
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy settings" ON public.privacy_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for notification_preferences
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user ON public.privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences(user_id);

-- Grant permissions for privacy and notification tables
GRANT ALL ON public.privacy_settings TO anon, authenticated;
GRANT ALL ON public.notification_preferences TO anon, authenticated;
