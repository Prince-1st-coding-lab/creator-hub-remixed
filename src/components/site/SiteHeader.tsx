import { Link } from "@tanstack/react-router";
import { LOGO_SRC, type SiteSettings } from "@/lib/site-data";

export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2">
        <Link to="/" className="flex min-w-0 items-center">
          <img
            src={LOGO_SRC}
            alt="G Modern Creativity Ltd logo"
            width={1079}
            height={873}
            className="h-16 w-auto shrink-0 object-contain sm:h-20"
          />
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
