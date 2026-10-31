INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;
DROP POLICY IF EXISTS "Public read site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins update site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete site assets" ON storage.objects;
CREATE POLICY "Public read site assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Admins upload site assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());
CREATE POLICY "Admins update site assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-assets' AND public.is_admin());
CREATE POLICY "Admins delete site assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-assets' AND public.is_admin());

INSERT INTO public.site_settings (key, value)
VALUES ('welcome_popup', jsonb_build_object(
  'is_enabled', true,
  'title', 'Welcome to ASTRAVEN ✈️',
  'message', E'Thank you for joining ASTRAVEN, where your money flies with the aviation industry.\n\nPick a package, earn daily income, and invite friends to earn commission. Join our official Telegram channel for announcements, updates and payment proofs.',
  'image_url', '/welcome-default.jpg',
  'channel_label', 'Join Official Telegram Channel',
  'channel_url', 'https://t.me/astravenhq'))
ON CONFLICT (key) DO NOTHING;
