ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS details text NOT NULL DEFAULT '';

UPDATE public.products
SET slug = regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g')
WHERE slug = '';

UPDATE public.products p
SET slug = p.slug || '-' || left(p.id::text, 4)
WHERE EXISTS (
  SELECT 1 FROM public.products q WHERE q.slug = p.slug AND q.id <> p.id
);

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products (slug);