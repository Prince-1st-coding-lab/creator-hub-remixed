import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { Check, MessageCircle, ArrowLeft } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ContactMenu } from "@/components/site/ContactMenu";
import { ImageLightbox, useLightbox } from "@/components/site/ImageLightbox";
import { servicesQuery, settingsQuery, type Service } from "@/lib/site-data";

const serviceQuery = (slug: string) =>
  queryOptions({
    queryKey: ["service", slug],
    queryFn: async (): Promise<Service | null> => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("slug", slug)
        .eq("visible", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ context, params }) => {
    const [service] = await Promise.all([
      context.queryClient.ensureQueryData(serviceQuery(params.slug)),
      context.queryClient.ensureQueryData(settingsQuery),
      context.queryClient.ensureQueryData(servicesQuery),
    ]);
    if (!service) throw notFound();
    return {
      name: service.name,
      description: service.page_description,
      image: service.image_url,
      slug: service.slug,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Unavailable" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.name} | G Modern Creativity Ltd`;
    const url = `/services/${loaderData.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: loaderData.name,
            description: loaderData.description,
            ...(loaderData.image ? { image: loaderData.image } : {}),
            serviceType: loaderData.name,
            areaServed: { "@type": "Country", name: "Rwanda" },
            provider: {
              "@type": "LocalBusiness",
              name: "G Modern Creativity Ltd",
},
          }),
        },
      ],
    };
  },
  component: ServicePage,
});

function ServicePage() {
  const { slug } = Route.useParams();
  const { data: service } = useSuspenseQuery(serviceQuery(slug));
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);

  const gallery = service
    ? service.gallery?.length
      ? service.gallery
      : [service.image_url]
    : [];
  const lightbox = useLightbox(gallery.length);

  if (!service) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader settings={settings} />

      <section className="relative overflow-hidden">
        <img
          src={service.image_url}
          alt={service.name}
          width={1600}
          height={1104}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-soil/90 via-soil/70 to-soil/30" />
        <div className="relative mx-auto max-w-6xl px-5 py-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-secondary/80 hover:text-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
          <h1 className="mt-4 max-w-2xl text-4xl leading-tight text-secondary sm:text-5xl">
            {service.name}
          </h1>
          <p className="mt-4 max-w-xl text-secondary/85">{service.short_description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-lg text-muted-foreground">{service.page_description}</p>
            {service.info_points?.length ? (
              <ul className="mt-8 space-y-3">
                {service.info_points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-leaf" />
                    <span className="text-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <ContactMenu
              settings={settings}
              message={`Hello G Modern Creativity, I am interested in ${service.name}.`}
            >
              <button
                type="button"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" />
                Contact Us
              </button>
            </ContactMenu>
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 p-6">
            <h2 className="text-xl">Good to know</h2>
            <p className="mt-3 text-sm text-muted-foreground">{settings.delivery_text}</p>
            <p className="mt-3 text-sm text-muted-foreground">{settings.location_text}</p>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => lightbox.open(i)}
              aria-label={`Open image ${i + 1} of ${service.name}`}
              className="overflow-hidden rounded-xl shadow-[var(--shadow-soft)]"
            >
              <img
                src={src}
                alt={`${service.name} work example`}
                loading="lazy"
                width={1200}
                height={912}
                className="h-56 w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </button>
          ))}
        </div>

        <ImageLightbox
          images={gallery}
          index={lightbox.index}
          alt={`${service.name} work example`}
          onClose={lightbox.close}
          onNext={lightbox.next}
          onPrev={lightbox.prev}
        />

        <div className="mt-14">
          <h2 className="text-2xl">Our other services</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {services
              .filter((s) => s.slug !== service.slug)
              .map((s) => (
                <Link
                  key={s.id}
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:bg-muted"
                >
                  {s.name}
                </Link>
              ))}
            <Link
              to="/shop"
              className="rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:bg-muted"
            >
              Shop
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter settings={settings} services={services} />
    </div>
  );
}
