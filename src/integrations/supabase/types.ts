export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      collection_dashboards: {
        Row: {
          collection_id: string
          created_at: string
          dashboard_id: string
          id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          dashboard_id: string
          id?: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          dashboard_id?: string
          id?: string
        }
        Relationships: []
      }
      collection_questions: {
        Row: {
          collection_id: string
          created_at: string
          id: string
          question_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          id?: string
          question_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          id?: string
          question_id?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_sections: {
        Row: {
          created_at: string
          dashboard_id: string
          display_order: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          dashboard_id: string
          display_order?: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          display_order?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          created_at: string
          dashboard_id: string
          grid_position: Json | null
          id: string
          question_id: string
          section_id: string
        }
        Insert: {
          created_at?: string
          dashboard_id: string
          grid_position?: Json | null
          id?: string
          question_id: string
          section_id: string
        }
        Update: {
          created_at?: string
          dashboard_id?: string
          grid_position?: Json | null
          id?: string
          question_id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_widgets_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_widgets_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "dashboard_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string
          id: string
          name: string
          query: string
          visualization_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          query: string
          visualization_type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          query?: string
          visualization_type?: string
        }
        Relationships: []
      }
      scraped_data_juanm: {
        Row: {
          analyze_post: string | null
          comments_count: number | null
          date: string | null
          date_unix_timestamp: number | null
          dimensions: string | null
          engagement_rate: number | null
          engagement_rate_pct: number | null
          images_description: string | null
          images_quant: number | null
          images_url: string | null
          isrecent: string
          last_modified_time: string | null
          likes_count: number | null
          post_caption: string | null
          post_type: string | null
          post_url: string | null
          profile: string
          profile_url: string | null
          reel_duration: number | null
          reel_play_count: number | null
          reel_transcript: string | null
          reel_url: string | null
          test: boolean | null
          text_in_the_images: string | null
          videos_duration: number | null
          videos_quant: number | null
          videos_transcript: string | null
          videos_url: string | null
        }
        Insert: {
          analyze_post?: string | null
          comments_count?: number | null
          date?: string | null
          date_unix_timestamp?: number | null
          dimensions?: string | null
          engagement_rate?: number | null
          engagement_rate_pct?: number | null
          images_description?: string | null
          images_quant?: number | null
          images_url?: string | null
          isrecent?: string
          last_modified_time?: string | null
          likes_count?: number | null
          post_caption?: string | null
          post_type?: string | null
          post_url?: string | null
          profile: string
          profile_url?: string | null
          reel_duration?: number | null
          reel_play_count?: number | null
          reel_transcript?: string | null
          reel_url?: string | null
          test?: boolean | null
          text_in_the_images?: string | null
          videos_duration?: number | null
          videos_quant?: number | null
          videos_transcript?: string | null
          videos_url?: string | null
        }
        Update: {
          analyze_post?: string | null
          comments_count?: number | null
          date?: string | null
          date_unix_timestamp?: number | null
          dimensions?: string | null
          engagement_rate?: number | null
          engagement_rate_pct?: number | null
          images_description?: string | null
          images_quant?: number | null
          images_url?: string | null
          isrecent?: string
          last_modified_time?: string | null
          likes_count?: number | null
          post_caption?: string | null
          post_type?: string | null
          post_url?: string | null
          profile?: string
          profile_url?: string | null
          reel_duration?: number | null
          reel_play_count?: number | null
          reel_transcript?: string | null
          reel_url?: string | null
          test?: boolean | null
          text_in_the_images?: string | null
          videos_duration?: number | null
          videos_quant?: number | null
          videos_transcript?: string | null
          videos_url?: string | null
        }
        Relationships: []
      }
      setting_analytics: {
        Row: {
          account: string | null
          created_at: string | null
          event_type: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          account?: string | null
          created_at?: string | null
          event_type?: string | null
          id: string
          metadata?: Json | null
        }
        Update: {
          account?: string | null
          created_at?: string | null
          event_type?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      execute_sql_query: {
        Args: { query_text: string }
        Returns: {
          result: Json
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
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
