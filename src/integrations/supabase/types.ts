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
      automation_logs: {
        Row: {
          action: string
          agent_type: string
          created_at: string
          details: Json | null
          duration_ms: number | null
          error_message: string | null
          id: string
          status: string
        }
        Insert: {
          action: string
          agent_type: string
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Update: {
          action?: string
          agent_type?: string
          created_at?: string
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      blog_articles: {
        Row: {
          article_id: string
          category: string
          content: string
          created_at: string
          faqs: Json | null
          id: string
          image_url: string | null
          internal_link: Json | null
          meta_description: string | null
          meta_title: string | null
          primary_keyword: string | null
          published_at: string
          read_time: string | null
          secondary_keywords: Json | null
          slug: string
          source: string
          takeaways: Json | null
          title: string
          word_count: number | null
        }
        Insert: {
          article_id: string
          category: string
          content: string
          created_at?: string
          faqs?: Json | null
          id?: string
          image_url?: string | null
          internal_link?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          primary_keyword?: string | null
          published_at?: string
          read_time?: string | null
          secondary_keywords?: Json | null
          slug: string
          source?: string
          takeaways?: Json | null
          title: string
          word_count?: number | null
        }
        Update: {
          article_id?: string
          category?: string
          content?: string
          created_at?: string
          faqs?: Json | null
          id?: string
          image_url?: string | null
          internal_link?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          primary_keyword?: string | null
          published_at?: string
          read_time?: string | null
          secondary_keywords?: Json | null
          slug?: string
          source?: string
          takeaways?: Json | null
          title?: string
          word_count?: number | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      content_drafts: {
        Row: {
          agent_type: string
          ai_model: string | null
          category: string
          content: string
          created_at: string
          id: string
          keywords: Json | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          scheduled_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          agent_type?: string
          ai_model?: string | null
          category?: string
          content: string
          created_at?: string
          id?: string
          keywords?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          agent_type?: string
          ai_model?: string | null
          category?: string
          content?: string
          created_at?: string
          id?: string
          keywords?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          avg_time_on_page: number | null
          bounce_rate: number | null
          created_at: string
          id: string
          page_path: string
          page_views: number | null
          recorded_at: string
          source: string | null
          visitors: number | null
        }
        Insert: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          created_at?: string
          id?: string
          page_path: string
          page_views?: number | null
          recorded_at?: string
          source?: string | null
          visitors?: number | null
        }
        Update: {
          avg_time_on_page?: number | null
          bounce_rate?: number | null
          created_at?: string
          id?: string
          page_path?: string
          page_views?: number | null
          recorded_at?: string
          source?: string | null
          visitors?: number | null
        }
        Relationships: []
      }
      predictions_cache: {
        Row: {
          bias: string | null
          coin_id: string
          confidence: number | null
          created_at: string
          current_price: number | null
          expires_at: string
          id: string
          prediction_data: Json
          symbol: string
          timeframe: string
        }
        Insert: {
          bias?: string | null
          coin_id: string
          confidence?: number | null
          created_at?: string
          current_price?: number | null
          expires_at: string
          id?: string
          prediction_data: Json
          symbol: string
          timeframe: string
        }
        Update: {
          bias?: string | null
          coin_id?: string
          confidence?: number | null
          created_at?: string
          current_price?: number | null
          expires_at?: string
          id?: string
          prediction_data?: Json
          symbol?: string
          timeframe?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          email_notifications: boolean
          id: string
          is_premium: boolean
          preferences: Json | null
          updated_at: string
          watchlist: Json | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_notifications?: boolean
          id: string
          is_premium?: boolean
          preferences?: Json | null
          updated_at?: string
          watchlist?: Json | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          email_notifications?: boolean
          id?: string
          is_premium?: boolean
          preferences?: Json | null
          updated_at?: string
          watchlist?: Json | null
        }
        Relationships: []
      }
      user_alerts: {
        Row: {
          coin_id: string
          condition: string
          created_at: string
          email_sent: boolean
          id: string
          is_triggered: boolean
          note: string | null
          symbol: string
          target_price: number
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          coin_id: string
          condition?: string
          created_at?: string
          email_sent?: boolean
          id?: string
          is_triggered?: boolean
          note?: string | null
          symbol: string
          target_price: number
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          coin_id?: string
          condition?: string
          created_at?: string
          email_sent?: boolean
          id?: string
          is_triggered?: boolean
          note?: string | null
          symbol?: string
          target_price?: number
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_predictions: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
