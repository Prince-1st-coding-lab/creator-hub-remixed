CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  hero_title text NOT NULL DEFAULT '',
  hero_description text NOT NULL DEFAULT '',
  hero_image_url text NOT NULL DEFAULT '',
  hero_cta_label text NOT NULL DEFAULT '',
  hero_cta_href text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  delivery_text text NOT NULL DEFAULT '',
  location_text text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_single_row CHECK (id = 1)
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  page_description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  gallery text[] NOT NULL DEFAULT '{}',
  info_points text[] NOT NULL DEFAULT '{}',
  position integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read visible services" ON public.services FOR SELECT USING (visible = true);
CREATE POLICY "Admins read all services" ON public.services FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  available boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read visible products" ON public.products FOR SELECT USING (visible = true);
CREATE POLICY "Admins read all products" ON public.products FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Anyone can read site images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
CREATE POLICY "Admins can upload site images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update site images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete site images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (id, hero_title, hero_description, hero_image_url, hero_cta_label, hero_cta_href, tagline, email, phone, whatsapp, delivery_text, location_text) VALUES (
  1,
  'Welcome to G Modern Creativity Ltd',
  'We transform your space — home, office, hotel, shop, coffee shop, school and more — with landscaping, interior design, event decoration, and pots, vases, flowers and stands.',
  '/images/hero-space.jpg',
  'Our Services',
  '#services',
  'Make Your Space a place of Memories',
  'gmoderncreativityltd@gmail.com',
  '+250 787 287 747',
  '+250 787 287 747',
  'You order, we deliver. We deliver anywhere in Rwanda.',
  'Maison Saint Augustin, Ruyenzi – Runda. You can also visit us to see what we have.'
);

INSERT INTO public.services (slug, name, short_description, page_description, image_url, gallery, info_points, position) VALUES
('landscaping-gardening-maintenance', 'Landscaping, gardening & maintenance', 'We design gardens and keep them looked after.', 'We design and plant gardens for homes, offices, hotels, shops, coffee shops and schools, and we come back to maintain them so they keep looking good.', '/images/landscaping.jpg', ARRAY['/images/landscaping.jpg','/images/care.jpg','/images/delivery.jpg'], ARRAY['Garden design and planting','Regular gardening and maintenance','Plants, pots and stands supplied by us','We work anywhere in Rwanda'], 1),
('interior-design', 'Interior design', 'Wall painting and hanging walls for homes and offices.', 'We decorate the inside of your space with wall painting and hanging walls, together with plants, pots, vases and flowers that fit the room.', '/images/interior.jpg', ARRAY['/images/interior.jpg','/images/hero-space.jpg','/images/products/stands.jpg'], ARRAY['Wall painting','Hanging walls','Plants, pots and vases for the room','Homes, offices, hotels, shops, coffee shops and schools'], 2),
('event-decorations', 'Event decorations', 'We decorate weddings, birthdays, corporate events, baby and bridal showers.', 'We decorate your event space with flowers, pots, vases, stands and decor pieces. Tell us the type of event and the place, and we prepare it.', '/images/events.jpg', ARRAY['/images/events.jpg','/images/products/flowers-natural.jpg','/images/products/vases.jpg'], ARRAY['Weddings','Birthdays','Corporate events','Baby showers and bridal showers'], 3);

INSERT INTO public.products (name, description, price, image_url, available, position) VALUES
('Pots', 'Concrete, plastic, ceramic and fiber pots in different sizes.', '', '/images/products/pots.jpg', true, 1),
('Vases', 'Glass, plastic and ceramic vases.', '', '/images/products/vases.jpg', true, 2),
('Natural flowers', 'Fresh natural flowers for your space or your event.', '', '/images/products/flowers-natural.jpg', true, 3),
('Artificial flowers', 'Artificial flowers that stay looking good all year.', '', '/images/products/flowers-artificial.jpg', true, 4),
('Stands', 'Stands for pots, vases and flowers.', '', '/images/products/stands.jpg', true, 5),
('Gift articles', 'Gift pieces you can order for any occasion.', '', '/images/products/gift-articles.jpg', true, 6);