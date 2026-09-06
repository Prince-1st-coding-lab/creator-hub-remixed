import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SiteSettings = Tables<"site_settings">;
export type Service = Tables<"services">;
export type Product = Tables<"products">;

export type ProductVariant = {
  name: string;
  dimensions: string;
  image_url?: string;
  price?: string;
  available?: boolean;
};

export const parseVariants = (value: unknown): ProductVariant[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => Boolean(v) && typeof v === "object")
    .map((v) => ({
      name: typeof v.name === "string" ? v.name : "",
      dimensions: typeof v.dimensions === "string" ? v.dimensions : "",
      image_url: typeof v.image_url === "string" ? v.image_url : "",
      price: typeof v.price === "string" ? v.price : "",
      available: v.available === false ? false : true,
    }))
    .filter((v) => v.name || v.dimensions);
};


export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async (): Promise<SiteSettings> => {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (error) throw error;
    return data;
  },
});

export const servicesQuery = queryOptions({
  queryKey: ["services", "visible"],
  queryFn: async (): Promise<Service[]> => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("visible", true)
      .order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const productsQuery = queryOptions({
  queryKey: ["products", "visible"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("visible", true)
      .order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const allServicesQuery = queryOptions({
  queryKey: ["services", "all"],
  queryFn: async (): Promise<Service[]> => {
    const { data, error } = await supabase.from("services").select("*").order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const allProductsQuery = queryOptions({
  queryKey: ["products", "all"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from("products").select("*").order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const digits = (value: string) => value.replace(/[^\d+]/g, "").replace(/^\+/, "");

export const whatsappLink = (whatsapp: string, message?: string) =>
  `https://wa.me/${digits(whatsapp)}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

export const LOGO_SRC = "/images/logo.png";

export type Tip = Tables<"tips">;

export const tipsQuery = queryOptions({
  queryKey: ["tips", "visible"],
  queryFn: async (): Promise<Tip[]> => {
    const { data, error } = await supabase
      .from("tips")
      .select("*")
      .eq("visible", true)
      .order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const allTipsQuery = queryOptions({
  queryKey: ["tips", "all"],
  queryFn: async (): Promise<Tip[]> => {
    const { data, error } = await supabase.from("tips").select("*").order("position");
    if (error) throw error;
    return data ?? [];
  },
});

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("visible", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
