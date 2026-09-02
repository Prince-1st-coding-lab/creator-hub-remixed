import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { createClient } from "@supabase/supabase-js";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/shop", changefreq: "weekly", priority: "0.8" },
        ];

        try {
          const supabase = createClient(
            process.env["VITE_SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"],
            process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
              import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
            { auth: { persistSession: false } },
          );
          const { data } = await supabase.from("services").select("slug").eq("visible", true);
          for (const row of data ?? []) {
            entries.push({ path: `/services/${row.slug}`, changefreq: "monthly", priority: "0.7" });
          }
          const { data: prods } = await supabase
            .from("products")
            .select("slug")
            .eq("visible", true);
          for (const row of prods ?? []) {
            entries.push({ path: `/shop/${row.slug}`, changefreq: "monthly", priority: "0.6" });
          }
        } catch {
          // fall back to static entries
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
