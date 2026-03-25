-- Create agenda_entries table
CREATE TABLE public.agenda_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pec_id TEXT NOT NULL,
  area_id TEXT NOT NULL,
  fortnight_id TEXT NOT NULL,
  day_id TEXT NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('manha', 'tarde')),
  activity_type TEXT NOT NULL,
  school_id TEXT,
  school_other_text TEXT,
  observation TEXT,
  agenda_topic TEXT,
  link TEXT,
  type_other_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (open access since no auth required)
ALTER TABLE public.agenda_entries ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous and authenticated users
CREATE POLICY "Allow all select" ON public.agenda_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.agenda_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.agenda_entries FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow all delete" ON public.agenda_entries FOR DELETE TO anon, authenticated USING (true);

-- Unique constraint to prevent duplicate entries per cell/period
CREATE UNIQUE INDEX idx_agenda_unique_cell ON public.agenda_entries (pec_id, fortnight_id, day_id, period);

-- Index for common queries
CREATE INDEX idx_agenda_pec_fortnight ON public.agenda_entries (pec_id, fortnight_id);
CREATE INDEX idx_agenda_fortnight ON public.agenda_entries (fortnight_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_agenda_entries_updated_at
  BEFORE UPDATE ON public.agenda_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.agenda_entries;