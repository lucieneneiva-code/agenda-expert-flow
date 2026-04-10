ALTER TABLE public.agenda_entries
  ADD COLUMN status_visita text DEFAULT NULL,
  ADD COLUMN link_termo text DEFAULT NULL,
  ADD COLUMN data_confirmacao timestamptz DEFAULT NULL;