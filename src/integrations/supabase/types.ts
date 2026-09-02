export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      products: {
        Row: {
          available: boolean
          created_at: string
          description: string
          details: string
          gallery: string[]
          id: string
          image_url: string
          material: string
          name: string
          parent_id: string | null
          placement: string
          position: number
          price: string
          size: string
          slug: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          available?: boolean
          created_at?: string
          description?: string
          details?: string
          gallery?: string[]
          id?: string
          image_url?: string
          material?: string
          name: string
          parent_id?: string | null
          placement?: string
          position?: number
          price?: string
          size?: string
          slug?: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          available?: boolean
          created_at?: string
          description?: string
          details?: string
          gallery?: string[]
          id?: string
          image_url?: string
          material?: string
          name?: string
          parent_id?: string | null
          placement?: string
          position?: number
          price?: string
          size?: string
          slug?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "products_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          gallery: string[]
          id: string
          image_url: string
          info_points: string[]
          name: string
          page_description: string
          position: number
          short_description: string
          slug: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          gallery?: string[]
          id?: string
          image_url?: string
          info_points?: string[]
          name: string
          page_description?: string
          position?: number
          short_description?: string
          slug: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          gallery?: string[]
          id?: string
          image_url?: string
          info_points?: string[]
          name?: string
          page_description?: string
          position?: number
          short_description?: string
          slug?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          delivery_text: string
          email: string
          hero_cta_href: string
          hero_cta_label: string
          hero_description: string
          hero_image_url: string
          hero_title: string
          id: number
          location_text: string
          phone: string
          tagline: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          delivery_text?: string
          email?: string
          hero_cta_href?: string
          hero_cta_label?: string
          hero_description?: string
          hero_image_url?: string
          hero_title?: string
          id?: number
          location_text?: string
          phone?: string
          tagline?: string
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          delivery_text?: string
          email?: string
          hero_cta_href?: string
          hero_cta_label?: string
          hero_description?: string
          hero_image_url?: string
          hero_title?: string
          id?: number
          location_text?: string
          phone?: string
          tagline?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      tips: {
        Row: {
          body: string
          created_at: string
          id: string
          image_url: string
          position: number
          title: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string
          position?: number
          title: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string
          position?: number
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
