import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ProductQuickView, type QuickViewItem } from "@/components/site/ProductQuickView";
import {
  productQuery,
  productsQuery,
  servicesQuery,
  settingsQuery,
  whatsappLink,
} from "@/lib/site-data";


export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ context, params }) => {
    const [product] = await Promise.all([
      context.queryClient.ensureQueryData(productQuery(params.slug)),
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(productsQuery),
    ]);
    if (!product) throw notFound();
    return {
      name: product.name,
      description: product.description,
      image: product.image_url,
      slug: product.slug,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} | Shop — G Modern Creativity Ltd`;
    const description =
      loaderData.description || `${loaderData.name} from G Modern Creativity Ltd, delivered across Rwanda.`;
    const url = `/shop/${loaderData.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQuery(slug));
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);

  const [filter, setFilter] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<QuickViewItem | null>(null);

  const items = useMemo<QuickViewItem[]>(() => {
    if (!product) return [];
    const children = products.filter((p) => p.parent_id === product.id);
    if (children.length) {
      return children.map((c) => ({
        name: c.name,
        price: c.price,
        description: c.description,
        size: c.size,
        material: c.material,
        placement: c.placement,
        available: c.available,
        slug: c.slug,
        images: [c.image_url, ...(c.gallery ?? [])].filter(Boolean),
      }));
    }
    const gallery = [product.image_url, ...(product.gallery ?? [])].filter(Boolean);
    return gallery.map((src, i) => ({
      name: gallery.length > 1 ? `${product.name} ${i + 1}` : product.name,
      price: product.price,
      description: product.description,
      size: product.size,
      material: product.material,
      placement: product.placement,
      available: product.available,
      slug: null,
      images: [src],
    }));
  }, [product, products]);

  const chips = useMemo(() => {
    const values = new Set<string>();
    items.forEach((i) => {
      if (i.placement) values.add(i.placement);
      if (i.material) values.add(i.material);
    });
    return Array.from(values);
  }, [items]);

  const shown = filter
    ? items.filter((i) => i.placement === filter || i.material === filter)
    : items;

  if (!product) return null;
  const others = products
    .filter((p) => p.slug !== product.slug && !p.parent_id)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader settings={settings} />

      <section className="mx-auto max-w-6xl px-5 py-12">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="mt-6 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl">{product.name}</h1>
          <div className="rule-gold mt-4 max-w-[8rem]" />
          {product.price ? (
            <p className="mt-4 font-display text-xl text-leaf">{product.price}</p>
          ) : null}
          {product.description ? (
            <p className="mt-4 text-muted-foreground">{product.description}</p>
          ) : null}
          {product.details ? (
            <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
              {product.details}
            </p>
          ) : null}
        </div>

        {chips.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter(null)}
              aria-pressed={filter === null}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                filter === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted"
              }`}
            >
              All
            </button>
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                aria-pressed={filter === c}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  filter === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        ) : null}

        <p className="mt-5 text-sm text-muted-foreground">
          Showing {shown.length} of {items.length}
        </p>

        {shown.length ? (
          <div className="mt-6 columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
            {shown.map((item, i) => (
              <button
                key={`${item.name}-${i}`}
                type="button"
                onClick={() => setOpenItem(item)}
                aria-label={`Open details for ${item.name}`}
                className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border text-left shadow-[var(--shadow-soft)]"
              >
                <img
                  src={item.images[0]}
                  alt={`${item.name} — ${product.name} from G Modern Creativity Ltd`}
                  loading="lazy"
                  className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-72"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-soil/90 via-soil/40 to-transparent p-4 pt-10 transition-transform duration-300 group-hover:-translate-y-1">
                  <p className="truncate text-sm font-medium text-secondary">{item.name}</p>
                  {item.price ? (
                    <p className="mt-0.5 font-display text-sm text-secondary/85">{item.price}</p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
            Nothing matches that filter yet. Try another option.
          </p>
        )}

        <div className="mt-12 rounded-2xl border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>{settings.delivery_text}</p>
          <p className="mt-2">{settings.location_text}</p>
          <a
            href={whatsappLink(
              settings.whatsapp,
              `Hello G Modern Creativity, I would like to order: ${product.name}`,
            )}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Make Your Order
          </a>
        </div>

        <ProductQuickView
          item={openItem}
          whatsapp={settings.whatsapp}
          onClose={() => setOpenItem(null)}
        />

        {others.length ? (
          <div className="mt-16">
            <h2 className="text-2xl">More from the shop</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {others.map((p) => (
                <Link
                  key={p.id}
                  to="/shop/$slug"
                  params={{ slug: p.slug }}
                  className="group overflow-hidden rounded-xl border border-border bg-card"
                >
                  <img
                    src={p.image_url}
                    alt={p.name}
                    loading="lazy"
                    className="h-24 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-28"
                  />
                  <p className="px-2 py-2 text-xs">{p.name}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <SiteFooter settings={settings} services={services} />
    </div>
  );
}

