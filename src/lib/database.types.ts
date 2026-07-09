/**
 * Auto-generated Supabase Database Types
 * 
 * These types mirror the PostgreSQL schema defined in:
 *   supabase/migrations/001_initial_schema.sql
 * 
 * Regenerate with: npx supabase gen types typescript --local > src/lib/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          avatar_url: string | null;
          salary: number;
          credit_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          salary?: number;
          credit_score?: number;
        };
        Update: {
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          salary?: number;
          credit_score?: number;
        };
      };

      cards: {
        Row: {
          id: string;
          name: string;
          bank: string;
          network: string;
          annual_fee: number;
          fee_waiver_spend: number | null;
          min_income: number;
          min_cibil: number;
          welcome_bonus: string | null;
          lounge_access: number;
          base_reward_rate: number;
          rewards: Json;
          highlights: Json;
          gradient_from: string | null;
          gradient_to: string | null;
          apply_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          bank: string;
          network: string;
          annual_fee?: number;
          fee_waiver_spend?: number | null;
          min_income?: number;
          min_cibil?: number;
          welcome_bonus?: string | null;
          lounge_access?: number;
          base_reward_rate?: number;
          rewards?: Json;
          highlights?: Json;
          gradient_from?: string | null;
          gradient_to?: string | null;
          apply_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['cards']['Insert']>;
      };

      user_cards: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          last_4_digits: string | null;
          cardholder_name: string | null;
          expiry: string | null;
          credit_limit: number;
          status: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          last_4_digits?: string | null;
          cardholder_name?: string | null;
          expiry?: string | null;
          credit_limit?: number;
          status?: string;
        };
        Update: Partial<Database['public']['Tables']['user_cards']['Insert']>;
      };

      transactions: {
        Row: {
          id: string;
          user_id: string;
          card_id: string | null;
          merchant: string;
          amount: number;
          category: string;
          type: string;
          is_pending: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id?: string | null;
          merchant: string;
          amount: number;
          category: string;
          type?: string;
          is_pending?: boolean;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };

      apply_clicks: {
        Row: {
          id: number;
          user_id: string | null;
          card_id: string;
          utm_source: string | null;
          utm_medium: string | null;
          clicked_at: string;
        };
        Insert: {
          user_id?: string | null;
          card_id: string;
          utm_source?: string | null;
          utm_medium?: string | null;
        };
        Update: Partial<Database['public']['Tables']['apply_clicks']['Insert']>;
      };

      score_history: {
        Row: {
          id: number;
          user_id: string;
          score: number;
          recorded_at: string;
        };
        Insert: {
          user_id: string;
          score: number;
        };
        Update: Partial<Database['public']['Tables']['score_history']['Insert']>;
      };

      notifications: {
        Row: {
          id: number;
          user_id: string;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: string;
          title: string;
          message: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
  };
}
