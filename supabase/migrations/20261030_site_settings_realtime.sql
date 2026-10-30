-- Broadcast site_settings changes so user pages update instantly (Supabase Realtime).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='site_settings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;
  END IF;
END $$;
ALTER TABLE public.site_settings REPLICA IDENTITY FULL;
