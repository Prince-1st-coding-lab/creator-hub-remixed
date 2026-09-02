CREATE TABLE public.tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tips TO authenticated;
GRANT ALL ON public.tips TO service_role;

ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visible tips" ON public.tips FOR SELECT USING (visible = true);
CREATE POLICY "Admins read all tips" ON public.tips FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage tips" ON public.tips FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER tips_set_updated_at BEFORE UPDATE ON public.tips FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.tips (title, body, image_url, position) VALUES
('Choose pots that match your space', 'Pick pot sizes and colours that follow the room''s tones. Fewer, larger pieces look calmer than many small ones.', '/images/logo.jpg', 1),
('Keep indoor plants healthy', 'Most indoor plants need indirect light and water only when the top soil is dry. Wipe the leaves so they can breathe.', '/images/logo.jpg', 2),
('Plan your event decor early', 'Share your colours, venue size and date with us in advance so the setup fits the space and the day runs smoothly.', '/images/logo.jpg', 3);