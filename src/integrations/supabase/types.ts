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
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          id: string
          ip: string | null
          meta: Json
          resource_id: string | null
          resource_type: string
          result: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          meta?: Json
          resource_id?: string | null
          resource_type: string
          result?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          meta?: Json
          resource_id?: string | null
          resource_type?: string
          result?: string
        }
        Relationships: []
      }
      campaign_events: {
        Row: {
          amount: number | null
          campaign: string | null
          created_at: string
          currency: string | null
          event_type: string
          id: string
          order_reference: string | null
          props: Json
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          amount?: number | null
          campaign?: string | null
          created_at?: string
          currency?: string | null
          event_type: string
          id?: string
          order_reference?: string | null
          props?: Json
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          amount?: number | null
          campaign?: string | null
          created_at?: string
          currency?: string | null
          event_type?: string
          id?: string
          order_reference?: string | null
          props?: Json
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      chatb2k_events: {
        Row: {
          campaign: string | null
          created_at: string
          event_type: string
          funnel_origin: string | null
          id: string
          order_reference: string | null
          props: Json
          rsid: string | null
          session_id: string
        }
        Insert: {
          campaign?: string | null
          created_at?: string
          event_type: string
          funnel_origin?: string | null
          id?: string
          order_reference?: string | null
          props?: Json
          rsid?: string | null
          session_id: string
        }
        Update: {
          campaign?: string | null
          created_at?: string
          event_type?: string
          funnel_origin?: string | null
          id?: string
          order_reference?: string | null
          props?: Json
          rsid?: string | null
          session_id?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          meta_description: string | null
          og_image: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          meta_description?: string | null
          og_image?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          meta_description?: string | null
          og_image?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          created_at: string
          default_currency: string
          id: string
          is_active: boolean
          iso2: string
          name: string
          region_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_currency?: string
          id?: string
          is_active?: boolean
          iso2: string
          name: string
          region_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_currency?: string
          id?: string
          is_active?: boolean
          iso2?: string
          name?: string
          region_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "countries_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      currency_routes: {
        Row: {
          country_iso2: string
          created_at: string
          currency: string
          fulfillment_hub: string | null
          gateway_code: string
          id: string
          is_active: boolean
          region_code: string | null
          updated_at: string
        }
        Insert: {
          country_iso2: string
          created_at?: string
          currency: string
          fulfillment_hub?: string | null
          gateway_code: string
          id?: string
          is_active?: boolean
          region_code?: string | null
          updated_at?: string
        }
        Update: {
          country_iso2?: string
          created_at?: string
          currency?: string
          fulfillment_hub?: string | null
          gateway_code?: string
          id?: string
          is_active?: boolean
          region_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          amount: number | null
          campaign: string | null
          created_at: string
          currency: string | null
          event_type: string
          funnel_origin: string | null
          id: string
          order_reference: string | null
          props: Json
          rsid: string | null
          session_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          amount?: number | null
          campaign?: string | null
          created_at?: string
          currency?: string | null
          event_type: string
          funnel_origin?: string | null
          id?: string
          order_reference?: string | null
          props?: Json
          rsid?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          amount?: number | null
          campaign?: string | null
          created_at?: string
          currency?: string | null
          event_type?: string
          funnel_origin?: string | null
          id?: string
          order_reference?: string | null
          props?: Json
          rsid?: string | null
          session_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      inventory_ledger: {
        Row: {
          change_qty: number
          created_at: string
          id: string
          meta: Json
          order_id: string | null
          reason: string
          variant_sku: string
        }
        Insert: {
          change_qty: number
          created_at?: string
          id?: string
          meta?: Json
          order_id?: string | null
          reason: string
          variant_sku: string
        }
        Update: {
          change_qty?: number
          created_at?: string
          id?: string
          meta?: Json
          order_id?: string | null
          reason?: string
          variant_sku?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_ledger_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          invoice_number: string
          issued_at: string
          meta: Json
          order_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_number: string
          issued_at?: string
          meta?: Json
          order_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_number?: string
          issued_at?: string
          meta?: Json
          order_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          access_token: string
          amount: number
          attribution: Json
          coach_contact: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          download_links: Json
          fulfillment_status: string
          id: string
          items: Json
          next_steps: string | null
          paid_at: string | null
          processing_lock_at: string | null
          reference: string
          referral_processed_at: string | null
          status: string
          updated_at: string
          welcome_sent_at: string | null
        }
        Insert: {
          access_token?: string
          amount?: number
          attribution?: Json
          coach_contact?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          download_links?: Json
          fulfillment_status?: string
          id?: string
          items?: Json
          next_steps?: string | null
          paid_at?: string | null
          processing_lock_at?: string | null
          reference: string
          referral_processed_at?: string | null
          status?: string
          updated_at?: string
          welcome_sent_at?: string | null
        }
        Update: {
          access_token?: string
          amount?: number
          attribution?: Json
          coach_contact?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          download_links?: Json
          fulfillment_status?: string
          id?: string
          items?: Json
          next_steps?: string | null
          paid_at?: string | null
          processing_lock_at?: string | null
          reference?: string
          referral_processed_at?: string | null
          status?: string
          updated_at?: string
          welcome_sent_at?: string | null
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          event_type: string
          external_event_id: string | null
          gateway_code: string
          id: string
          order_id: string | null
          payload: Json
          reference: string | null
          signature_valid: boolean | null
          status: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_type: string
          external_event_id?: string | null
          gateway_code: string
          id?: string
          order_id?: string | null
          payload?: Json
          reference?: string | null
          signature_valid?: boolean | null
          status?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          event_type?: string
          external_event_id?: string | null
          gateway_code?: string
          id?: string
          order_id?: string | null
          payload?: Json
          reference?: string | null
          signature_valid?: boolean | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          code: string
          config: Json
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          priority: number
          supports_currencies: string[]
          updated_at: string
        }
        Insert: {
          code: string
          config?: Json
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          priority?: number
          supports_currencies?: string[]
          updated_at?: string
        }
        Update: {
          code?: string
          config?: Json
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          priority?: number
          supports_currencies?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      payment_idempotency: {
        Row: {
          created_at: string
          gateway_code: string
          id: string
          idempotency_key: string
          reference: string | null
          result: Json
        }
        Insert: {
          created_at?: string
          gateway_code: string
          id?: string
          idempotency_key: string
          reference?: string | null
          result?: Json
        }
        Update: {
          created_at?: string
          gateway_code?: string
          id?: string
          idempotency_key?: string
          reference?: string | null
          result?: Json
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string
          paystack_event_id: string | null
          paystack_reference: string
          raw: Json
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id: string
          paystack_event_id?: string | null
          paystack_reference: string
          raw?: Json
          status: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string
          paystack_event_id?: string | null
          paystack_reference?: string
          raw?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      product_assets: {
        Row: {
          alt_text: string | null
          asset_type: string
          created_at: string
          id: string
          is_public: boolean
          product_sku: string
          sort_order: number
          updated_at: string
          url: string
          variant_sku: string | null
        }
        Insert: {
          alt_text?: string | null
          asset_type?: string
          created_at?: string
          id?: string
          is_public?: boolean
          product_sku: string
          sort_order?: number
          updated_at?: string
          url: string
          variant_sku?: string | null
        }
        Update: {
          alt_text?: string | null
          asset_type?: string
          created_at?: string
          id?: string
          is_public?: boolean
          product_sku?: string
          sort_order?: number
          updated_at?: string
          url?: string
          variant_sku?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string
          currency: string
          id: string
          inventory_qty: number
          is_active: boolean
          options: Json
          price: number
          product_sku: string
          title: string
          updated_at: string
          variant_sku: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          inventory_qty?: number
          is_active?: boolean
          options?: Json
          price?: number
          product_sku: string
          title: string
          updated_at?: string
          variant_sku: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          inventory_qty?: number
          is_active?: boolean
          options?: Json
          price?: number
          product_sku?: string
          title?: string
          updated_at?: string
          variant_sku?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recommendation_results: {
        Row: {
          answers: Json
          confidence_score: number
          created_at: string
          engine_version: string
          goal: string | null
          id: string
          recommended_products: Json
          session_id: string
          upsell_score: number
          user_id: string | null
        }
        Insert: {
          answers?: Json
          confidence_score?: number
          created_at?: string
          engine_version?: string
          goal?: string | null
          id?: string
          recommended_products?: Json
          session_id: string
          upsell_score?: number
          user_id?: string | null
        }
        Update: {
          answers?: Json
          confidence_score?: number
          created_at?: string
          engine_version?: string
          goal?: string | null
          id?: string
          recommended_products?: Json
          session_id?: string
          upsell_score?: number
          user_id?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_amount: number
          created_at: string
          id: string
          order_id: string
          recruiter_code: string | null
          recruiter_id: string | null
          status: string
        }
        Insert: {
          commission_amount?: number
          created_at?: string
          id?: string
          order_id: string
          recruiter_code?: string | null
          recruiter_id?: string | null
          status?: string
        }
        Update: {
          commission_amount?: number
          created_at?: string
          id?: string
          order_id?: string
          recruiter_code?: string | null
          recruiter_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          code: string
          created_at: string
          fulfillment_hub: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          fulfillment_hub?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          fulfillment_hub?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      reseller_leads: {
        Row: {
          campaign: string | null
          commission_status: string
          contact_history: Json
          conversion_status: string
          created_at: string
          funnel_stage: string
          id: string
          lead_email: string | null
          lead_name: string | null
          lead_phone: string | null
          recruiter_id: string | null
          revenue_generated: number
          updated_at: string
        }
        Insert: {
          campaign?: string | null
          commission_status?: string
          contact_history?: Json
          conversion_status?: string
          created_at?: string
          funnel_stage?: string
          id?: string
          lead_email?: string | null
          lead_name?: string | null
          lead_phone?: string | null
          recruiter_id?: string | null
          revenue_generated?: number
          updated_at?: string
        }
        Update: {
          campaign?: string | null
          commission_status?: string
          contact_history?: Json
          conversion_status?: string
          created_at?: string
          funnel_stage?: string
          id?: string
          lead_email?: string | null
          lead_name?: string | null
          lead_phone?: string | null
          recruiter_id?: string | null
          revenue_generated?: number
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_code: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_code: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_code?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["code"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      webhook_events: {
        Row: {
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string
          provider: string
          reference: string | null
        }
        Insert: {
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string
          provider?: string
          reference?: string | null
        }
        Update: {
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string
          provider?: string
          reference?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_first_admin: { Args: never; Returns: Json }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_paystack_success: { Args: { payload: Json }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
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
      app_role: ["admin", "staff", "user"],
    },
  },
} as const
