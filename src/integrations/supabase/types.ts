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
      compliance_checks: {
        Row: {
          check_type: string
          created_at: string
          details: Json | null
          id: string
          status: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          check_type: string
          created_at?: string
          details?: Json | null
          id?: string
          status: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          check_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      itc_claims: {
        Row: {
          amount: number
          claim_date: string
          created_at: string
          eligible_amount: number
          id: string
          invoice_number: string
          status: string | null
          supplier_gstin: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          claim_date: string
          created_at?: string
          eligible_amount: number
          id?: string
          invoice_number: string
          status?: string | null
          supplier_gstin: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          claim_date?: string
          created_at?: string
          eligible_amount?: number
          id?: string
          invoice_number?: string
          status?: string | null
          supplier_gstin?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          annual_turnover: number | null
          company_name: string | null
          created_at: string
          gstin: string | null
          id: string
          updated_at: string
        }
        Insert: {
          annual_turnover?: number | null
          company_name?: string | null
          created_at?: string
          gstin?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          annual_turnover?: number | null
          company_name?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          company_name: string
          compliance_score: number | null
          created_at: string
          gstin: string
          id: string
          last_verified_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          company_name: string
          compliance_score?: number | null
          created_at?: string
          gstin: string
          id?: string
          last_verified_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          company_name?: string
          compliance_score?: number | null
          created_at?: string
          gstin?: string
          id?: string
          last_verified_at?: string | null
          updated_at?: string
          user_id?: string | null
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

export type Invoice = {
  id?: string; // Optional if you are using auto-incrementing IDs
  invoice_number: string;
  invoice_date: string;
  buyer_gstin: string;
  supplier_gstin: string;
  cgst: string;
  sgst: string;
  igst: string;
  total_amount: string;
};
