import { Link } from "@tanstack/react-router";
import { LOGO_SRC, type SiteSettings } from "@/lib/site-data";

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img
            src={LOGO_SRC}
            alt="G Modern Creativity Ltd logo"
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-full bg-card object-cover ring-1 ring-border"
          />
          <span className="min-w-0 leading-tight">
            <span className="block font-display text-sm font-semibold tracking-tight text-foreground sm:text-base">
              G Modern Creativity Ltd
            </span>
            <span className="block text-[11px] text-muted-foreground sm:text-xs">
              {settings.tagline}
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link className="transition-colors hover:text-foreground" to="/" hash="services">
            Our Services
          </Link>
          <Link className="transition-colors hover:text-foreground" to="/shop">
            Shop
          </Link>
        </nav>
      </div>
    </header>
  );
}
