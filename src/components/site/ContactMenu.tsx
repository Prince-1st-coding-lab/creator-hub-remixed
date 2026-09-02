import { useState, type ReactNode } from "react";
import { Mail, Phone, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { digits, whatsappLink, type SiteSettings } from "@/lib/site-data";

export function ContactMenu({
  settings,
  children,
  message,
}: {
  settings: SiteSettings;
  children: ReactNode;
  message?: string;
}) {
  const [open, setOpen] = useState(false);

  const options = [
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: settings.whatsapp,
      href: whatsappLink(settings.whatsapp, message),
      external: true,
    },
    {
      icon: Phone,
      label: "Call us",
      value: settings.phone,
      href: `tel:+${digits(settings.phone)}`,
      external: false,
    },
    {
      icon: Mail,
      label: "Email",
      value: settings.email,
      href: `mailto:${settings.email}${message ? `?subject=${encodeURIComponent(message)}` : ""}`,
      external: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Contact us</DialogTitle>
          <DialogDescription>Choose how you want to reach us.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {options.map((o) => (
            <a
              key={o.label}
              href={o.href}
              {...(o.external ? { target: "_blank", rel: "noreferrer" } : {})}
              onClick={() => setOpen(false)}
              className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted"
            >
              <o.icon className="h-5 w-5 shrink-0 text-leaf" />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{o.label}</span>
                <span className="block truncate text-sm text-muted-foreground">{o.value}</span>
              </span>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
