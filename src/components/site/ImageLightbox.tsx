import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function useLightbox(count: number) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const open = useCallback((i: number) => setIndex(i), []);
  const next = useCallback(() => setIndex((i) => (i === null ? i : (i + 1) % count)), [count]);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + count) % count)),
    [count],
  );
  return { index, open, close, next, prev };
}

export function ImageLightbox({
  images,
  index,
  alt,
  onClose,
  onNext,
  onPrev,
}: {
  images: string[];
  index: number | null;
  alt: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, onClose, onNext, onPrev]);

  if (index === null) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-soil/95 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-secondary/15 p-2 text-secondary transition-colors hover:bg-secondary/25"
      >
        <X className="h-5 w-5" />
      </button>
      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-3 rounded-full bg-secondary/15 p-2 text-secondary transition-colors hover:bg-secondary/25 sm:left-6"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-3 rounded-full bg-secondary/15 p-2 text-secondary transition-colors hover:bg-secondary/25 sm:right-6"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      ) : null}
      <img
        src={images[index]}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain shadow-[var(--shadow-soft)]"
      />
    </div>
  );
}
