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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          available_tickets: number
          created_at: string | null
          creator_id: string
          description: string | null
          event_date: string
          event_time: string
          id: string
          status: Database["public"]["Enums"]["event_status"] | null
          ticket_price: number
          title: string
          total_capacity: number
          updated_at: string | null
          venue: string
        }
        Insert: {
          available_tickets: number
          created_at?: string | null
          creator_id: string
          description?: string | null
          event_date: string
          event_time: string
          id?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          ticket_price: number
          title: string
          total_capacity: number
          updated_at?: string | null
          venue: string
        }
        Update: {
          available_tickets?: number
          created_at?: string | null
          creator_id?: string
          description?: string | null
          event_date?: string
          event_time?: string
          id?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          ticket_price?: number
          title?: string
          total_capacity?: number
          updated_at?: string | null
          venue?: string
        }
        Relationships: []
      }
      music: {
        Row: {
          artist_id: string
          created_at: string | null
          description: string | null
          duration: number | null
          file_url: string
          genre: string | null
          id: string
          is_approved: boolean | null
          is_video: boolean | null
          likes: number | null
          plays: number | null
          price: number
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_url: string
          genre?: string | null
          id?: string
          is_approved?: boolean | null
          is_video?: boolean | null
          likes?: number | null
          plays?: number | null
          price: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          file_url?: string
          genre?: string | null
          id?: string
          is_approved?: boolean | null
          is_video?: boolean | null
          likes?: number | null
          plays?: number | null
          price?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      music_purchases: {
        Row: {
          buyer_id: string
          id: string
          is_refunded: boolean | null
          music_id: string
          price_paid: number
          purchased_at: string | null
          refunded_at: string | null
        }
        Insert: {
          buyer_id: string
          id?: string
          is_refunded?: boolean | null
          music_id: string
          price_paid: number
          purchased_at?: string | null
          refunded_at?: string | null
        }
        Update: {
          buyer_id?: string
          id?: string
          is_refunded?: boolean | null
          music_id?: string
          price_paid?: number
          purchased_at?: string | null
          refunded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_purchases_music_id_fkey"
            columns: ["music_id"]
            isOneToOne: false
            referencedRelation: "music"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_banned: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_banned?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_banned?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price: number
          upload_limit: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          price: number
          upload_limit: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          price?: number
          upload_limit?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          plan_id: string
          starts_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          plan_id: string
          starts_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          plan_id?: string
          starts_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          buyer_id: string
          created_at: string | null
          event_id: string
          id: string
          is_resale: boolean | null
          price_paid: number
          purchased_at: string | null
          qr_code: string
          refunded_at: string | null
          resale_price: number | null
          status: Database["public"]["Enums"]["ticket_status"] | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          event_id: string
          id?: string
          is_resale?: boolean | null
          price_paid: number
          purchased_at?: string | null
          qr_code: string
          refunded_at?: string | null
          resale_price?: number | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          event_id?: string
          id?: string
          is_resale?: boolean | null
          price_paid?: number
          purchased_at?: string | null
          qr_code?: string
          refunded_at?: string | null
          resale_price?: number | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_limits: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string
          last_upload_at: string | null
          upload_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: string
          last_upload_at?: string | null
          upload_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string
          last_upload_at?: string | null
          upload_count?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_interactions: {
        Row: {
          comment_text: string | null
          created_at: string | null
          id: string
          interaction_type: string
          user_id: string
          video_id: string
        }
        Insert: {
          comment_text?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          user_id: string
          video_id: string
        }
        Update: {
          comment_text?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_interactions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "music"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "artist" | "admin"
      event_status: "pending" | "approved" | "rejected" | "cancelled"
      subscription_plan_type: "free" | "standard" | "premium"
      ticket_status: "active" | "refunded" | "cancelled"
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
      app_role: ["user", "artist", "admin"],
      event_status: ["pending", "approved", "rejected", "cancelled"],
      subscription_plan_type: ["free", "standard", "premium"],
      ticket_status: ["active", "refunded", "cancelled"],
    },
  },
} as const
