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
      telegram_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          telegram_chat_id: number
          telegram_user_id: number
          threshold_value: number
          token_or_chain: string
          triggered_at: string | null
          updated_at: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          telegram_chat_id: number
          telegram_user_id: number
          threshold_value: number
          token_or_chain: string
          triggered_at?: string | null
          updated_at?: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          telegram_chat_id?: number
          telegram_user_id?: number
          threshold_value?: number
          token_or_chain?: string
          triggered_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      telegram_bot_usage: {
        Row: {
          command: string
          created_at: string
          id: string
          query_params: Json | null
          telegram_chat_id: number
          telegram_user_id: number
        }
        Insert: {
          command: string
          created_at?: string
          id?: string
          query_params?: Json | null
          telegram_chat_id: number
          telegram_user_id: number
        }
        Update: {
          command?: string
          created_at?: string
          id?: string
          query_params?: Json | null
          telegram_chat_id?: number
          telegram_user_id?: number
        }
        Relationships: []
      }
      telegram_conversations: {
        Row: {
          chat_id: number
          created_at: string
          id: string
          message_text: string
          message_type: string | null
          sentiment: string | null
          topics: string[] | null
          user_id: number | null
          username: string | null
        }
        Insert: {
          chat_id: number
          created_at?: string
          id?: string
          message_text: string
          message_type?: string | null
          sentiment?: string | null
          topics?: string[] | null
          user_id?: number | null
          username?: string | null
        }
        Update: {
          chat_id?: number
          created_at?: string
          id?: string
          message_text?: string
          message_type?: string | null
          sentiment?: string | null
          topics?: string[] | null
          user_id?: number | null
          username?: string | null
        }
        Relationships: []
      }
      telegram_groups: {
        Row: {
          auto_digest: boolean
          chat_id: number
          chat_title: string | null
          community_sentiment: string | null
          created_at: string
          id: string
          is_active: boolean
          learned_topics: string[] | null
          preferences: Json | null
        }
        Insert: {
          auto_digest?: boolean
          chat_id: number
          chat_title?: string | null
          community_sentiment?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          learned_topics?: string[] | null
          preferences?: Json | null
        }
        Update: {
          auto_digest?: boolean
          chat_id?: number
          chat_title?: string | null
          community_sentiment?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          learned_topics?: string[] | null
          preferences?: Json | null
        }
        Relationships: []
      }
      telegram_pinned: {
        Row: {
          chat_id: number
          content: string
          content_type: string
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
        }
        Insert: {
          chat_id: number
          content: string
          content_type: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
        }
        Update: {
          chat_id?: number
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
        }
        Relationships: []
      }
      telegram_polls: {
        Row: {
          chat_id: number
          created_at: string
          created_by: number
          expires_at: string | null
          id: string
          is_active: boolean
          is_pinned: boolean
          options: Json
          question: string
          votes: Json
        }
        Insert: {
          chat_id: number
          created_at?: string
          created_by: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          options?: Json
          question: string
          votes?: Json
        }
        Update: {
          chat_id?: number
          created_at?: string
          created_by?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          options?: Json
          question?: string
          votes?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
