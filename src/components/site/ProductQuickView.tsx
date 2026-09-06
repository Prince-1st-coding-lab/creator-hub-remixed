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
  onClose,
}: {
  item: QuickViewItem | null;
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

  const displayName = item.name ?? "Product photo";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={displayName}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-soil/95 p-0 backdrop-blur-sm sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative h-full w-full overflow-hidden bg-card sm:my-8 sm:h-auto sm:max-w-3xl sm:rounded-2xl sm:border sm:border-border sm:shadow-[var(--shadow-soft)]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-2 text-foreground transition-colors hover:bg-background sm:right-3 sm:top-3"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid h-full gap-0 md:grid-cols-[1.1fr_1fr]">
          <div className="flex h-full flex-col bg-muted/40 p-2 sm:p-4">
            <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-xl">
              <img
                src={item.images[active]}
                alt={`${displayName} photo ${active + 1}`}
                className="max-h-[78vh] w-full object-contain sm:max-h-[80vh] md:max-h-[85vh]"
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
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 sm:mt-3">
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

          {hasDetails ? (
            <div className="p-4 sm:p-6">
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
