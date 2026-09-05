import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

export type QuickViewItem = {
  name?: string | null;
  price?: string | null;
  description?: string | null;
  size?: string | null;
  material?: string | null;
  placement?: string | null;
  available?: boolean | null;
  images: string[];
  slug?: string | null;
};

export function ProductQuickView({
  item,
  whatsapp,
  onClose,
}: {
  item: QuickViewItem | null;
  whatsapp: string;
  onClose: () => void;
}) {
  const [active, setActive] = useState(0);
  const count = item?.images.length ?? 0;

  useEffect(() => setActive(0), [item?.name, item?.images[0]]);

  const next = useCallback(() => setActive((i) => (count ? (i + 1) % count : 0)), [count]);
  const prev = useCallback(
    () => setActive((i) => (count ? (i - 1 + count) % count : 0)),
    [count],
  );

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [item, onClose, next, prev]);

  if (!item) return null;

  const specs = [
    { label: "Size", value: item.size },
    { label: "Type", value: item.material },
    { label: "Best for", value: item.placement },
    {
      label: "Availability",
      value: item.available === false ? "Currently out of stock" : null,
    },
  ].filter((s) => s.value);

  const hasDetails = Boolean(item.name || item.price || item.description || specs.length);

  const orderMessage = `Hello G Modern Creativity, I would like to order: ${item.name ?? "an item"}${
    item.size ? ` (${item.size})` : ""
  }`;

  const displayName = item.name ?? "Product photo";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={displayName}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-soil/90 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-8 w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-background/80 p-2 text-foreground transition-colors hover:bg-background"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
          <div className="bg-muted/40 p-4">
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={item.images[active]}
                alt={`${displayName} photo ${active + 1}`}
                className="h-72 w-full object-cover sm:h-96"
              />
              {count > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 transition-colors hover:bg-background"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 transition-colors hover:bg-background"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
            {count > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {item.images.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show ${displayName} photo ${i + 1}`}
                    aria-current={i === active}
                    className={`shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === active ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${displayName} thumbnail ${i + 1}`}
                      loading="lazy"
                      className="h-14 w-14 object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="p-6">
            {item.name ? <h2 className="text-2xl">{item.name}</h2> : null}
            {item.price ? (
              <p className="mt-2 font-display text-lg text-leaf">{item.price}</p>
            ) : null}
            {item.description ? (
              <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
            ) : null}

            {specs.length ? (
              <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                {specs.map((s) => (
                  <div key={s.label} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="min-w-0">{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <a
              href={whatsappLink(whatsapp, orderMessage)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              Make Your Order
            </a>

            {item.slug ? (
              <div className="mt-4">
                <Link
                  to="/shop/$slug"
                  params={{ slug: item.slug }}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" /> View full page
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
