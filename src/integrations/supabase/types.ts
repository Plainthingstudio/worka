export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          lead_source: string | null
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          lead_source?: string | null
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          lead_source?: string | null
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      graphic_design_briefs: {
        Row: {
          about_company: string | null
          barrier_to_entry: string | null
          brand_positioning: string | null
          company_name: string
          competitor1: string | null
          competitor2: string | null
          competitor3: string | null
          competitor4: string | null
          digital_media: Json | null
          email: string
          features_and_benefits: string | null
          id: string
          logo_feelings: Json | null
          logo_type: string | null
          market_category: string | null
          name: string
          print_media: Json | null
          products_services: string | null
          reference1: string | null
          reference2: string | null
          reference3: string | null
          reference4: string | null
          services: Json | null
          slogan: string | null
          specific_imagery: string | null
          status: string
          submission_date: string
          submitted_for_id: string | null
          target_age: string | null
          target_demography: string | null
          target_gender: string | null
          target_personality: string | null
          target_profession: string | null
          user_id: string | null
          vision_mission: string | null
        }
        Insert: {
          about_company?: string | null
          barrier_to_entry?: string | null
          brand_positioning?: string | null
          company_name: string
          competitor1?: string | null
          competitor2?: string | null
          competitor3?: string | null
          competitor4?: string | null
          digital_media?: Json | null
          email: string
          features_and_benefits?: string | null
          id?: string
          logo_feelings?: Json | null
          logo_type?: string | null
          market_category?: string | null
          name: string
          print_media?: Json | null
          products_services?: string | null
          reference1?: string | null
          reference2?: string | null
          reference3?: string | null
          reference4?: string | null
          services?: Json | null
          slogan?: string | null
          specific_imagery?: string | null
          status?: string
          submission_date?: string
          submitted_for_id?: string | null
          target_age?: string | null
          target_demography?: string | null
          target_gender?: string | null
          target_personality?: string | null
          target_profession?: string | null
          user_id?: string | null
          vision_mission?: string | null
        }
        Update: {
          about_company?: string | null
          barrier_to_entry?: string | null
          brand_positioning?: string | null
          company_name?: string
          competitor1?: string | null
          competitor2?: string | null
          competitor3?: string | null
          competitor4?: string | null
          digital_media?: Json | null
          email?: string
          features_and_benefits?: string | null
          id?: string
          logo_feelings?: Json | null
          logo_type?: string | null
          market_category?: string | null
          name?: string
          print_media?: Json | null
          products_services?: string | null
          reference1?: string | null
          reference2?: string | null
          reference3?: string | null
          reference4?: string | null
          services?: Json | null
          slogan?: string | null
          specific_imagery?: string | null
          status?: string
          submission_date?: string
          submitted_for_id?: string | null
          target_age?: string | null
          target_demography?: string | null
          target_gender?: string | null
          target_personality?: string | null
          target_profession?: string | null
          user_id?: string | null
          vision_mission?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "graphic_design_briefs_submitted_for_id_fkey"
            columns: ["submitted_for_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      illustration_design_briefs: {
        Row: {
          about_company: string | null
          brand_guidelines: string | null
          color_preferences: string | null
          company_name: string
          competitor1: string | null
          competitor2: string | null
          competitor3: string | null
          competitor4: string | null
          completion_deadline: string | null
          deliverables: Json | null
          email: string
          general_style: string | null
          id: string
          illustration_details: Json | null
          illustrations_count: number | null
          illustrations_for: string | null
          illustrations_purpose: string | null
          illustrations_style: string | null
          like_dislike_design: string | null
          name: string
          phone: string | null
          reference1: string | null
          reference2: string | null
          reference3: string | null
          reference4: string | null
          status: string
          submission_date: string
          submitted_for_id: string | null
          target_audience: string | null
          user_id: string | null
        }
        Insert: {
          about_company?: string | null
          brand_guidelines?: string | null
          color_preferences?: string | null
          company_name: string
          competitor1?: string | null
          competitor2?: string | null
          competitor3?: string | null
          competitor4?: string | null
          completion_deadline?: string | null
          deliverables?: Json | null
          email: string
          general_style?: string | null
          id?: string
          illustration_details?: Json | null
          illustrations_count?: number | null
          illustrations_for?: string | null
          illustrations_purpose?: string | null
          illustrations_style?: string | null
          like_dislike_design?: string | null
          name: string
          phone?: string | null
          reference1?: string | null
          reference2?: string | null
          reference3?: string | null
          reference4?: string | null
          status?: string
          submission_date?: string
          submitted_for_id?: string | null
          target_audience?: string | null
          user_id?: string | null
        }
        Update: {
          about_company?: string | null
          brand_guidelines?: string | null
          color_preferences?: string | null
          company_name?: string
          competitor1?: string | null
          competitor2?: string | null
          competitor3?: string | null
          competitor4?: string | null
          completion_deadline?: string | null
          deliverables?: Json | null
          email?: string
          general_style?: string | null
          id?: string
          illustration_details?: Json | null
          illustrations_count?: number | null
          illustrations_for?: string | null
          illustrations_purpose?: string | null
          illustrations_style?: string | null
          like_dislike_design?: string | null
          name?: string
          phone?: string | null
          reference1?: string | null
          reference2?: string | null
          reference3?: string | null
          reference4?: string | null
          status?: string
          submission_date?: string
          submitted_for_id?: string | null
          target_audience?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "illustration_design_briefs_submitted_for_id_fkey"
            columns: ["submitted_for_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          rate: number
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity: number
          rate: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          rate?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string
          date: string
          discount_amount: number | null
          discount_percentage: number | null
          due_date: string
          id: string
          invoice_number: string
          notes: string | null
          payment_terms: string
          status: string
          subtotal: number
          tax_amount: number | null
          tax_percentage: number | null
          terms_and_conditions: string | null
          total: number
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date: string
          discount_amount?: number | null
          discount_percentage?: number | null
          due_date: string
          id?: string
          invoice_number: string
          notes?: string | null
          payment_terms: string
          status: string
          subtotal: number
          tax_amount?: number | null
          tax_percentage?: number | null
          terms_and_conditions?: string | null
          total: number
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date?: string
          discount_amount?: number | null
          discount_percentage?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          payment_terms?: string
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_percentage?: number | null
          terms_and_conditions?: string | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          stage?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          notes: string | null
          payment_type: string
          project_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          payment_type: string
          project_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          payment_type?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          state: string | null
          street_address: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          categories: string[]
          client_id: string
          created_at: string
          currency: string
          deadline: string
          fee: number
          id: string
          name: string
          project_type: string
          status: string
          team_members: string[] | null
          user_id: string
        }
        Insert: {
          categories: string[]
          client_id: string
          created_at?: string
          currency: string
          deadline: string
          fee: number
          id?: string
          name: string
          project_type: string
          status: string
          team_members?: string[] | null
          user_id: string
        }
        Update: {
          categories?: string[]
          client_id?: string
          created_at?: string
          currency?: string
          deadline?: string
          fee?: number
          id?: string
          name?: string
          project_type?: string
          status?: string
          team_members?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          name: string
          position: string
          skills: string[] | null
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position: string
          skills?: string[] | null
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: string
          skills?: string[] | null
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      ui_design_briefs: {
        Row: {
          about_company: string | null
          brand_guidelines_details: string | null
          color_preferences: string | null
          company_name: string
          competitor1: string | null
          competitor2: string | null
          competitor3: string | null
          competitor4: string | null
          completion_deadline: string | null
          current_website: string | null
          development_service: string | null
          email: string
          existing_brand_assets: string | null
          font_preferences: string | null
          general_style: string | null
          has_brand_guidelines: string | null
          has_wireframe: string | null
          id: string
          name: string
          page_count: number | null
          page_details: Json | null
          project_description: string | null
          project_size: string | null
          project_type: string | null
          reference1: string | null
          reference2: string | null
          reference3: string | null
          reference4: string | null
          status: string
          style_preferences: string | null
          submission_date: string
          submitted_for_id: string | null
          target_audience: string | null
          user_id: string | null
          website_content: string | null
          website_purpose: string | null
          website_type_interest: Json | null
          wireframe_details: string | null
        }
        Insert: {
          about_company?: string | null
          brand_guidelines_details?: string | null
          color_preferences?: string | null
          company_name: string
          competitor1?: string | null
          competitor2?: string | null
          competitor3?: string | null
          competitor4?: string | null
          completion_deadline?: string | null
          current_website?: string | null
          development_service?: string | null
          email: string
          existing_brand_assets?: string | null
          font_preferences?: string | null
          general_style?: string | null
          has_brand_guidelines?: string | null
          has_wireframe?: string | null
          id?: string
          name: string
          page_count?: number | null
          page_details?: Json | null
          project_description?: string | null
          project_size?: string | null
          project_type?: string | null
          reference1?: string | null
          reference2?: string | null
          reference3?: string | null
          reference4?: string | null
          status?: string
          style_preferences?: string | null
          submission_date?: string
          submitted_for_id?: string | null
          target_audience?: string | null
          user_id?: string | null
          website_content?: string | null
          website_purpose?: string | null
          website_type_interest?: Json | null
          wireframe_details?: string | null
        }
        Update: {
          about_company?: string | null
          brand_guidelines_details?: string | null
          color_preferences?: string | null
          company_name?: string
          competitor1?: string | null
          competitor2?: string | null
          competitor3?: string | null
          competitor4?: string | null
          completion_deadline?: string | null
          current_website?: string | null
          development_service?: string | null
          email?: string
          existing_brand_assets?: string | null
          font_preferences?: string | null
          general_style?: string | null
          has_brand_guidelines?: string | null
          has_wireframe?: string | null
          id?: string
          name?: string
          page_count?: number | null
          page_details?: Json | null
          project_description?: string | null
          project_size?: string | null
          project_type?: string | null
          reference1?: string | null
          reference2?: string | null
          reference3?: string | null
          reference4?: string | null
          status?: string
          style_preferences?: string | null
          submission_date?: string
          submitted_for_id?: string | null
          target_audience?: string | null
          user_id?: string | null
          website_content?: string | null
          website_purpose?: string | null
          website_type_interest?: Json | null
          wireframe_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ui_design_briefs_submitted_for_id_fkey"
            columns: ["submitted_for_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_briefs: {
        Args: {
          user_uuid: string
        }
        Returns: {
          id: string
          user_id: string
          name: string
          email: string
          company_name: string
          type: string
          status: string
          submission_date: string
          submitted_for_id: string
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
