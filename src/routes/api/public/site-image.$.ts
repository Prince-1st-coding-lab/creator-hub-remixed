import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/site-image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
        const key =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

        if (!url || !key) {
          return new Response("Image service not configured", { status: 500 });
        }

        const upstream = await fetch(
          `${url}/storage/v1/object/site-images/${path
            .split("/")
            .map(encodeURIComponent)
            .join("/")}`,
          { headers: { apikey: key } },
        );

        if (!upstream.ok || !upstream.body) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(await upstream.arrayBuffer(), {
          headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
