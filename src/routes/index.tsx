import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Truck, MapPin, MessageCircle, ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ContactMenu } from "@/components/site/ContactMenu";
import {
  productsQuery,
  servicesQuery,
  settingsQuery,
  tipsQuery,
  whatsappLink,
} from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "G Modern Creativity Ltd | Space Decoration in Rwanda" },
      {
        name: "description",
        content:
          "We transform your space — home, office, hotel, shop, coffee shop, school and more — with landscaping, interior design, event decoration and decor pieces. Delivered across Rwanda.",
      },
      { property: "og:title", content: "G Modern Creativity Ltd | Space Decoration in Rwanda" },
      {
        property: "og:description",
        content:
          "Make Your Space a place of Memories. Landscaping, interior design, event decoration and decor pieces, delivered across Rwanda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(productsQuery),
      context.queryClient.ensureQueryData(tipsQuery),
    ]);
  },
  component: Index,
});

function Index() {
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: products } = useSuspenseQuery(productsQuery);
  const { data: tips } = useSuspenseQuery(tipsQuery);
  const preview = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader settings={settings} />

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <img
          src={settings.hero_image_url}
          alt="Space decorated with plants in ceramic pots, plant stands and flower vases"
          width={1600}
          height={1104}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-soil/90 via-soil/70 to-soil/25" />
        <div className="relative mx-auto max-w-6xl px-5 py-24 sm:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl leading-[1.05] text-secondary sm:text-6xl">
              {settings.hero_title}
            </h1>
            <p className="mt-5 max-w-xl text-base text-secondary/85 sm:text-lg">
              {settings.hero_description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ContactMenu settings={settings}>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-secondary/40 px-6 py-3 text-sm font-medium text-secondary transition-colors hover:bg-secondary/10"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact Us
                </button>
              </ContactMenu>
              <Link
                to="/"
                hash="services"
                className="inline-flex items-center rounded-full border border-secondary/40 px-6 py-3 text-sm font-medium text-secondary transition-colors hover:bg-secondary/10"
              >
                Our Services
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-soil transition-transform hover:-translate-y-0.5"
              >
                <ArrowRight className="h-4 w-4" />
                Shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl sm:text-4xl">Our Services</h2>
        <div className="rule-gold mt-5 max-w-xs" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link
              key={s.id}
              to="/services/$slug"
              params={{ slug: s.slug }}
              className="group flex flex-col justify-center rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1"
            >
              <h3 className="text-xl">{s.name}</h3>
              <p className="mt-2 text-muted-foreground">{s.short_description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-leaf group-hover:gap-2 transition-all">
                Read more <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Shop preview */}
      <section id="shop" className="soil-panel">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-3xl text-secondary sm:text-4xl">Shop</h2>
          <p className="mt-4 max-w-md text-secondary/80">
            Pots, vases, flowers, stands and gift articles for your space or your event.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {preview.map((p) => (
              <Link
                key={p.id}
                to="/shop/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-xl bg-secondary/5 ring-1 ring-secondary/15"
              >
                <img
                  src={p.image_url}
                  alt={p.name}
                  loading="lazy"
                  width={1200}
                  height={912}
                  className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-48"
                />
                <p className="px-3 py-3 font-display text-sm text-secondary sm:text-base">
                  {p.name}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-soil"
            >
              Visit the shop <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={whatsappLink(
                settings.whatsapp,
                "Hello G Modern Creativity, I would like to make an order.",
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-secondary/40 px-6 py-3 text-sm font-medium text-secondary transition-colors hover:bg-secondary/10"
            >
              <MessageCircle className="h-4 w-4" />
              Make Your Order
            </a>
          </div>
        </div>
      </section>

      {/* Tips */}
      {tips.length > 0 ? (
        <section id="tips" className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-3xl sm:text-4xl">Tips</h2>
          <div className="rule-gold mt-5 max-w-xs" />
          <p className="mt-4 max-w-xl text-muted-foreground">
            Simple advice from our team on caring for your space.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tips.map((t) => (
              <article
                key={t.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]"
              >
                {t.image_url ? (
                  <img
                    src={t.image_url}
                    alt={t.title}
                    loading="lazy"
                    width={1200}
                    height={912}
                    className="h-44 w-full object-cover"
                  />
                ) : null}
                <div className="p-6">
                  <h3 className="text-lg">{t.title}</h3>
                  <p className="mt-2 text-muted-foreground">{t.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Delivery & location */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-8">
            <Truck className="h-6 w-6 text-leaf" />
            <h2 className="mt-3 text-2xl">Delivery</h2>
            <p className="mt-2 text-muted-foreground">{settings.delivery_text}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8">
            <MapPin className="h-6 w-6 text-leaf" />
            <h2 className="mt-3 text-2xl">Location</h2>
            <p className="mt-2 text-muted-foreground">{settings.location_text}</p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="soil-panel">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <h2 className="text-3xl text-secondary sm:text-4xl">Contact us</h2>
          <p className="mt-3 text-secondary/80">
            Call, WhatsApp or email us to order, or to ask about a job.
          </p>
          <ContactMenu settings={settings}>
            <button
              type="button"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-sm font-medium text-soil"
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
