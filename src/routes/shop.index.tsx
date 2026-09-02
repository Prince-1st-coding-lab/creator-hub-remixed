import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ContactMenu } from "@/components/site/ContactMenu";
import { productsQuery, servicesQuery, settingsQuery, whatsappLink } from "@/lib/site-data";

export const Route = createFileRoute("/shop/")({
  loader: async ({ context }) => {
    const [, products] = await Promise.all([
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(servicesQuery),
    ]);
    return { products };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: "Shop | Pots, Vases, Flowers & Stands — G Modern Creativity Ltd" },
      {
        name: "description",
        content:
          "Browse pots, vases, natural and artificial flowers, stands and gift articles. Order and we deliver anywhere in Rwanda.",
      },
      { property: "og:title", content: "Shop | G Modern Creativity Ltd" },
      {
        property: "og:description",
        content: "Pots, vases, flowers, stands and gift articles, delivered across Rwanda.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/shop" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
    scripts: loaderData?.products?.length
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "G Modern Creativity Ltd Shop",
              itemListElement: loaderData.products.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "Product",
                  name: p.name,
                  image: p.image_url,
                  ...(p.description ? { description: p.description } : {}),
                  ...(p.price
                    ? {
                        offers: {
                          "@type": "Offer",
                          price: String(p.price).replace(/[^0-9.]/g, ""),
                          priceCurrency: "RWF",
                          availability: p.available
                            ? "https://schema.org/InStock"
                            : "https://schema.org/OutOfStock",
                        },
                      }
                    : {}),
                },
              })),
            }),
          },
        ]
      : [],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader settings={settings} />

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h1 className="text-4xl sm:text-5xl">Shop</h1>
        <div className="rule-gold mt-5 max-w-xs" />
        <p className="mt-5 max-w-xl text-muted-foreground">
          Pots, vases, flowers, stands and gift articles for your space or your event. You order, we
          deliver anywhere in Rwanda.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <article
              key={p.id}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]"
            >
              <Link to="/shop/$slug" params={{ slug: p.slug }} className="block">
                <img
                  src={p.image_url}
                  alt={p.name}
                  loading="lazy"
                  width={1200}
                  height={912}
                  className="h-56 w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </Link>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl">
                    <Link to="/shop/$slug" params={{ slug: p.slug }} className="hover:underline">
                      {p.name}
                    </Link>
                  </h2>
                  {p.price ? (
                    <span className="shrink-0 font-display text-base text-leaf">{p.price}</span>
                  ) : null}
                </div>
                {p.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                ) : null}
                <p className="mt-3 text-xs text-muted-foreground">
                  {p.available ? "Available" : "Currently out of stock"}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/shop/$slug"
                    params={{ slug: p.slug }}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    View details
                  </Link>
                  <a
                    href={whatsappLink(
                      settings.whatsapp,
                      `Hello G Modern Creativity, I would like to order: ${p.name}`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Make Your Order
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-muted/40 p-8">
          <h2 className="text-2xl">Not sure what you need?</h2>
          <p className="mt-2 text-muted-foreground">{settings.delivery_text}</p>
          <ContactMenu settings={settings}>
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              Contact Us
            </button>
          </ContactMenu>
        </div>
      </section>

      <SiteFooter settings={settings} services={services} />
    </div>
  );
}
