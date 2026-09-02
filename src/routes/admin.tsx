import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";
import {
  allProductsQuery,
  allServicesQuery,
  allTipsQuery,
  settingsQuery,
  LOGO_SRC,
  type Product,
  type Service,
  type SiteSettings,
  type Tip,
} from "@/lib/site-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Website admin | G Modern Creativity Ltd" },
      { name: "description", content: "Manage hero, services, shop products and contact details." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Website admin | G Modern Creativity Ltd" },
      { property: "og:description", content: "Private content management area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const input =
  "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm";
const card = "rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]";
const btn =
  "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60";

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      {textarea ? (
        <textarea rows={3} className={input} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={input} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"hero" | "services" | "shop" | "tips" | "contact">("hero");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (!data.session) navigate({ to: "/auth" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    supabase
      .rpc("has_role", { _user_id: session.user.id, _role: "admin" })
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [session]);

  if (!ready || !session) {
    return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster />
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <img src={LOGO_SRC} alt="Logo" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-display font-semibold">Website admin</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              View website
            </Link>
            <button
              type="button"
              className="rounded-full border border-border px-4 py-2"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/auth" });
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {isAdmin === false ? (
          <ClaimAdmin onDone={() => setIsAdmin(true)} />
        ) : (
          <>
            <nav className="mb-6 flex flex-wrap gap-2">
              {(["hero", "services", "shop", "tips", "contact"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-full px-5 py-2 text-sm capitalize ${
                    tab === t
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background"
                  }`}
                >
                  {t}
                </button>
              ))}
            </nav>
            {tab === "hero" || tab === "contact" ? <SettingsPanel tab={tab} /> : null}
            {tab === "services" ? <ServicesPanel /> : null}
            {tab === "shop" ? <ProductsPanel /> : null}
            {tab === "tips" ? <TipsPanel /> : null}
          </>
        )}
      </main>
    </div>
  );
}

function ClaimAdmin({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className={card}>
      <h1 className="text-xl">You are signed in, but not an admin yet</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        If no admin exists yet for this website, you can claim the owner account now.
      </p>
      <button
        type="button"
        disabled={loading}
        className={`${btn} mt-5`}
        onClick={async () => {
          setLoading(true);
          const { data, error } = await supabase.rpc("claim_admin");
          setLoading(false);
          if (error) { toast.error(error.message); return; }
          if (data) {
            toast.success("You are now the admin");
            onDone();
          } else {
            toast.error("An admin already exists for this website.");
          }
        }}
      >
        Claim admin access
      </button>
    </div>
  );
}

function SettingsPanel({ tab }: { tab: "hero" | "contact" }) {
  const qc = useQueryClient();
  const { data } = useQuery(settingsQuery);
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);
  if (!form) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const set = (k: keyof SiteSettings) => (v: string) => setForm({ ...form, [k]: v });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        hero_title: form.hero_title,
        hero_description: form.hero_description,
        hero_image_url: form.hero_image_url,
        hero_cta_label: form.hero_cta_label,
        hero_cta_href: form.hero_cta_href,
        tagline: form.tagline,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        delivery_text: form.delivery_text,
        location_text: form.location_text,
      })
      .eq("id", 1);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["site_settings"] });
    toast.success("Saved");
  };

  return (
    <div className={`${card} space-y-4`}>
      {tab === "hero" ? (
        <>
          <Field label="Hero title" value={form.hero_title} onChange={set("hero_title")} />
          <Field
            label="Hero description"
            textarea
            value={form.hero_description}
            onChange={set("hero_description")}
          />
          <ImageField
            label="Hero image"
            value={form.hero_image_url}
            onChange={set("hero_image_url")}
          />
          <Field label="Button label" value={form.hero_cta_label} onChange={set("hero_cta_label")} />
          <Field
            label="Button link (e.g. #services or /shop)"
            value={form.hero_cta_href}
            onChange={set("hero_cta_href")}
          />
          <Field label="Tagline" value={form.tagline} onChange={set("tagline")} />
        </>
      ) : (
        <>
          <Field label="Phone number" value={form.phone} onChange={set("phone")} />
          <Field label="WhatsApp number" value={form.whatsapp} onChange={set("whatsapp")} />
          <Field label="Email" value={form.email} onChange={set("email")} />
          <Field
            label="Delivery text"
            textarea
            value={form.delivery_text}
            onChange={set("delivery_text")}
          />
          <Field
            label="Location text"
            textarea
            value={form.location_text}
            onChange={set("location_text")}
          />
        </>
      )}
      <button type="button" className={btn} disabled={saving} onClick={save}>
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

async function uploadImage(file: File): Promise<string | null> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("site-images")
    .upload(path, file, {
      cacheControl: "31536000",
      ...(file.type ? { contentType: file.type } : {}),
    });
  if (error) {
    toast.error(error.message);
    return null;
  }
  return `/api/public/site-image/${path}`;
}

const PROXY_PREFIX = "/api/public/site-image/";

async function deleteUploadedImage(url: string) {
  if (!url.startsWith(PROXY_PREFIX)) return;
  const path = url.slice(PROXY_PREFIX.length);
  const { error } = await supabase.storage.from("site-images").remove([path]);
  if (error) toast.error(error.message);
}

function GalleryField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const addFiles = async (files: File[]) => {
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    setUploading(false);
    if (urls.length) {
      onChange([...value, ...urls]);
      toast.success(`${urls.length} image(s) uploaded — remember to save`);
    }
  };

  return (
    <div className="text-sm">
      <span className="font-medium">{label}</span>
      {value.length ? (
        <div className="mt-2 flex flex-wrap gap-3">
          {value.map((src, i) => (
            <div key={`${src}-${i}`} className="relative">
              <img
                src={src}
                alt=""
                className="h-20 w-20 rounded-lg object-cover ring-1 ring-border"
              />
              <button
                type="button"
                aria-label="Remove image"
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full border border-border bg-background text-xs"
                onClick={() => {
                  onChange(value.filter((_, idx) => idx !== i));
                  void deleteUploadedImage(src);
                  toast.success("Image removed — remember to save");
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium">
          {uploading ? "Uploading…" : "Upload images"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = "";
              if (files.length) void addFiles(files);
            }}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          You can select several photos at once. They appear on the product page gallery.
        </p>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-muted-foreground">
          Paste image addresses instead
        </summary>
        <textarea
          rows={2}
          className={input}
          placeholder="One image address per line"
          value={value.join("\n")}
          onChange={(e) =>
            onChange(e.target.value.split("\n").map((x) => x.trim()).filter(Boolean))
          }
        />
      </details>
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const url = await uploadImage(file);
    setUploading(false);
    if (!url) return;
    onChange(url);
    toast.success("Image uploaded — remember to save");
  };


  return (
    <div className="text-sm">
      <span className="font-medium">{label}</span>
      <div className="mt-1 flex items-start gap-3">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt=""
              className="h-16 w-16 rounded-lg object-cover ring-1 ring-border"
            />
            <button
              type="button"
              aria-label="Remove image"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full border border-border bg-background text-xs"
              onClick={() => {
                const old = value;
                onChange("");
                void deleteUploadedImage(old);
                toast.success("Image removed — remember to save");
              }}
            >
              ×
            </button>
          </div>
        ) : null}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium">
              {uploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void upload(file);
                }}
              />
            </label>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-muted-foreground">
              Paste an image address instead
            </summary>
            <input
              className={input}
              value={value}
              placeholder="https://..."
              onChange={(e) => onChange(e.target.value)}
            />
          </details>
        </div>
      </div>
    </div>
  );
}


function ServicesPanel() {
  const qc = useQueryClient();
  const { data } = useQuery(allServicesQuery);
  const [items, setItems] = useState<Service[]>([]);
  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const update = (id: string, patch: Partial<Service>) =>
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const save = async (s: Service) => {
    const { error } = await supabase
      .from("services")
      .update({
        name: s.name,
        slug: s.slug,
        short_description: s.short_description,
        page_description: s.page_description,
        image_url: s.image_url,
        gallery: s.gallery,
        info_points: s.info_points,
        position: s.position,
        visible: s.visible,
      })
      .eq("id", s.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["services"] });
    qc.invalidateQueries({ queryKey: ["service", s.slug] });
    toast.success("Service saved");
  };

  return (
    <div className="space-y-6">
      {items.map((s) => (
        <div key={s.id} className={`${card} space-y-4`}>
          <Field label="Name" value={s.name} onChange={(v) => update(s.id, { name: v })} />
          <Field label="Page address (slug)" value={s.slug} onChange={(v) => update(s.id, { slug: v })} />
          <Field
            label="Short description (homepage)"
            textarea
            value={s.short_description}
            onChange={(v) => update(s.id, { short_description: v })}
          />
          <Field
            label="Page description"
            textarea
            value={s.page_description}
            onChange={(v) => update(s.id, { page_description: v })}
          />
          <ImageField
            label="Main image"
            value={s.image_url}
            onChange={(v) => update(s.id, { image_url: v })}
          />
          <GalleryField
            label="Gallery images"
            value={s.gallery}
            onChange={(v) => update(s.id, { gallery: v })}
          />

          <Field
            label="Key information points (one per line)"
            textarea
            value={s.info_points.join("\n")}
            onChange={(v) =>
              update(s.id, { info_points: v.split("\n").map((x) => x.trim()).filter(Boolean) })
            }
          />
          <div className="flex flex-wrap items-center gap-6">
            <label className="text-sm">
              <span className="font-medium">Position</span>
              <input
                type="number"
                className={input}
                value={s.position}
                onChange={(e) => update(s.id, { position: Number(e.target.value) })}
              />
            </label>
            <label className="flex items-center gap-2 pt-5 text-sm">
              <input
                type="checkbox"
                checked={s.visible}
                onChange={(e) => update(s.id, { visible: e.target.checked })}
              />
              Visible on website
            </label>
          </div>
          <button type="button" className={btn} onClick={() => save(s)}>
            Save service
          </button>
        </div>
      ))}
    </div>
  );
}

function ProductsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery(allProductsQuery);
  const [items, setItems] = useState<Product[]>([]);
  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const update = (id: string, patch: Partial<Product>) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const refresh = () => qc.invalidateQueries({ queryKey: ["products"] });

  const save = async (p: Product) => {
    const { error } = await supabase
      .from("products")
      .update({
        name: p.name,
        slug: p.slug,
        description: p.description,
        details: p.details,
        gallery: p.gallery,
        price: p.price,
        image_url: p.image_url,
        size: p.size,
        material: p.material,
        placement: p.placement,
        parent_id: p.parent_id,
        available: p.available,
        visible: p.visible,
        position: p.position,
      })
      .eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    refresh();
    toast.success("Product saved");
  };

  const add = async () => {
    const { error } = await supabase
      .from("products")
      .insert({
        name: "New product",
        slug: `new-product-${Math.random().toString(36).slice(2, 8)}`,
        position: items.length + 1,
        visible: false,
      });
    if (error) { toast.error(error.message); return; }
    refresh();
    qc.invalidateQueries({ queryKey: ["products", "all"] });
    toast.success("Product added");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setItems((prev) => prev.filter((p) => p.id !== id));
    refresh();
    toast.success("Product removed");
  };

  return (
    <div className="space-y-6">
      <button type="button" className={btn} onClick={add}>
        Add product
      </button>
      {items.map((p) => (
        <div key={p.id} className={`${card} space-y-4`}>
          <Field label="Name" value={p.name} onChange={(v) => update(p.id, { name: v })} />
          <Field
            label="Page address (slug)"
            value={p.slug}
            onChange={(v) => update(p.id, { slug: v })}
          />
          <Field
            label="Description"
            textarea
            value={p.description}
            onChange={(v) => update(p.id, { description: v })}
          />
          <Field
            label="Price (leave empty to hide)"
            value={p.price}
            onChange={(v) => update(p.id, { price: v })}
          />
          <ImageField
            label="Main product image"
            value={p.image_url}
            onChange={(v) => update(p.id, { image_url: v })}
          />
          <GalleryField
            label="Product gallery images"
            value={p.gallery ?? []}
            onChange={(v) => update(p.id, { gallery: v })}
          />

          <Field
            label="Product page text (extra details)"
            textarea
            value={p.details}
            onChange={(v) => update(p.id, { details: v })}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Size (e.g. 30cm tall)"
              value={p.size ?? ""}
              onChange={(v) => update(p.id, { size: v })}
            />
            <Field
              label="Type / material (e.g. Ceramic)"
              value={p.material ?? ""}
              onChange={(v) => update(p.id, { material: v })}
            />
            <Field
              label="Best for (e.g. Indoor)"
              value={p.placement ?? ""}
              onChange={(v) => update(p.id, { placement: v })}
            />
          </div>

          <label className="block text-sm">
            <span className="font-medium">Belongs to category</span>
            <select
              className={input}
              value={p.parent_id ?? ""}
              onChange={(e) => update(p.id, { parent_id: e.target.value || null })}
            >
              <option value="">Top-level category (shows in shop)</option>
              {items
                .filter((c) => c.id !== p.id && !c.parent_id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-6">
            <label className="text-sm">
              <span className="font-medium">Position</span>
              <input
                type="number"
                className={input}
                value={p.position}
                onChange={(e) => update(p.id, { position: Number(e.target.value) })}
              />
            </label>
            <label className="flex items-center gap-2 pt-5 text-sm">
              <input
                type="checkbox"
                checked={p.available}
                onChange={(e) => update(p.id, { available: e.target.checked })}
              />
              Available
            </label>
            <label className="flex items-center gap-2 pt-5 text-sm">
              <input
                type="checkbox"
                checked={p.visible}
                onChange={(e) => update(p.id, { visible: e.target.checked })}
              />
              Visible in shop
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" className={btn} onClick={() => save(p)}>
              Save product
            </button>
            <button
              type="button"
              className="rounded-full border border-destructive px-5 py-2.5 text-sm text-destructive"
              onClick={() => remove(p.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function TipsPanel() {
  const qc = useQueryClient();
  const { data } = useQuery(allTipsQuery);
  const [items, setItems] = useState<Tip[]>([]);
  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const update = (id: string, patch: Partial<Tip>) =>
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const refresh = () => qc.invalidateQueries({ queryKey: ["tips"] });

  const save = async (t: Tip) => {
    const { error } = await supabase
      .from("tips")
      .update({
        title: t.title,
        body: t.body,
        image_url: t.image_url,
        position: t.position,
        visible: t.visible,
      })
      .eq("id", t.id);
    if (error) { toast.error(error.message); return; }
    refresh();
    toast.success("Tip saved");
  };

  const add = async () => {
    const { error } = await supabase
      .from("tips")
      .insert({ title: "New tip", position: items.length + 1, visible: false });
    if (error) { toast.error(error.message); return; }
    refresh();
    toast.success("Tip added");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("tips").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setItems((prev) => prev.filter((t) => t.id !== id));
    refresh();
    toast.success("Tip removed");
  };

  return (
    <div className="space-y-6">
      <button type="button" className={btn} onClick={add}>
        Add tip
      </button>
      {items.map((t) => (
        <div key={t.id} className={`${card} space-y-4`}>
          <Field label="Title" value={t.title} onChange={(v) => update(t.id, { title: v })} />
          <Field
            label="Tip text"
            textarea
            value={t.body}
            onChange={(v) => update(t.id, { body: v })}
          />
          <ImageField
            label="Tip image"
            value={t.image_url}
            onChange={(v) => update(t.id, { image_url: v })}
          />
          <div className="flex flex-wrap items-center gap-6">
            <label className="text-sm">
              <span className="font-medium">Position</span>
              <input
                type="number"
                className={input}
                value={t.position}
                onChange={(e) => update(t.id, { position: Number(e.target.value) })}
              />
            </label>
            <label className="flex items-center gap-2 pt-5 text-sm">
              <input
                type="checkbox"
                checked={t.visible}
                onChange={(e) => update(t.id, { visible: e.target.checked })}
              />
              Visible on website
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" className={btn} onClick={() => save(t)}>
              Save tip
            </button>
            <button
              type="button"
              className="rounded-full border border-destructive px-5 py-2.5 text-sm text-destructive"
              onClick={() => remove(t.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
