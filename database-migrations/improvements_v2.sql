-- ================================================================
-- MIGRATION: journal_entries, daily_risk_scores, streak function
-- Run in Supabase SQL Editor
-- ================================================================

-- Journal Entries Table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sentiment VARCHAR(10) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journals" ON public.journal_entries
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user ON public.journal_entries(user_id, created_at DESC);

GRANT ALL ON public.journal_entries TO anon, authenticated;

-- Daily Risk Scores Table
CREATE TABLE IF NOT EXISTS public.daily_risk_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  risk_level VARCHAR(10) CHECK (risk_level IN ('low', 'moderate', 'high')),
  computed_at DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, computed_at)
);

ALTER TABLE public.daily_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own risk scores" ON public.daily_risk_scores
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT ALL ON public.daily_risk_scores TO anon, authenticated;

-- Streak auto-increment function (call via pg_cron or Supabase Edge Function)
CREATE OR REPLACE FUNCTION increment_active_streaks()
RETURNS void AS $$
BEGIN
  -- Increment streak for users who logged mood yesterday
  UPDATE public.users u
  SET streak = streak + 1
  WHERE EXISTS (
    SELECT 1 FROM public.mood_logs m
    WHERE m.user_id = u.id
    AND m.created_at::date = CURRENT_DATE - INTERVAL '1 day'
  );
  -- Reset streak for users who missed yesterday (and are older than 1 day)
  UPDATE public.users u
  SET streak = 0
  WHERE NOT EXISTS (
    SELECT 1 FROM public.mood_logs m
    WHERE m.user_id = u.id
    AND m.created_at::date = CURRENT_DATE - INTERVAL '1 day'
  )
  AND u.streak > 0
  AND u.created_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily streak update at midnight UTC (requires pg_cron extension)
-- SELECT cron.schedule('increment-streaks', '0 0 * * *', 'SELECT increment_active_streaks()');
