import { Link } from "@tanstack/react-router";
import { digits, LOGO_SRC, type Service, type SiteSettings } from "@/lib/site-data";

export function SiteFooter({
  settings,
  services,
}: {
  settings: SiteSettings;
  services: Service[];
}) {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_SRC}
              alt="G Modern Creativity Ltd logo"
              width={40}
              height={40}
              loading="lazy"
              className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
            />
            <span className="font-display text-base font-semibold">G Modern Creativity Ltd</span>
          </div>
          <p className="script-accent mt-3 text-xl">{settings.tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="font-medium text-foreground">Our Services</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    className="hover:text-foreground"
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="hover:text-foreground" to="/shop">
                  Shop
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-foreground">Contact</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <a className="hover:text-foreground" href={`tel:+${digits(settings.phone)}`}>
                  {settings.phone}
                </a>
              </li>
              <li>
                <a
                  className="break-all hover:text-foreground"
                  href={`mailto:${settings.email}`}
                >
                  {settings.email}
                </a>
              </li>
              <li>{settings.location_text}</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border py-5 text-center text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} G Modern Creativity Ltd</span>
        <Link to="/admin" className="underline underline-offset-4 hover:text-foreground">
          Manage website
        </Link>
      </div>

    </footer>
  );
}
