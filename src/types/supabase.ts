export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'dispatcher' | 'driver' | 'customer'
  
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          email: string | null
          created_at: string
          updated_at: string
          organization_id: string | null
          role: UserRole
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
          organization_id?: string | null
          role?: UserRole
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
          organization_id?: string | null
          role?: UserRole
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          subscription_tier_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subscription_tier_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subscription_tier_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          organization_id: string | null
          first_name: string
          last_name: string
          email: string
          phone: string
          license_number: string
          license_expiry: string
          status: string
          truck_number: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          first_name: string
          last_name: string
          email: string
          phone: string
          license_number: string
          license_expiry: string
          status?: string
          truck_number: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          license_number?: string
          license_expiry?: string
          status?: string
          truck_number?: string
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          organization_id: string
          name: string
          contact_name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          contact_name: string
          email: string
          phone: string
          address: string
          city: string
          state: string
          zip: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          contact_name?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          state?: string
          zip?: string
          created_at?: string
          updated_at?: string
        }
      }
      loads: {
        Row: {
          id: string
          organization_id: string
          customer_id: string
          driver_id: string | null
          status: string
          pickup_date: string
          delivery_date: string
          pickup_location: string
          delivery_location: string
          cargo_description: string
          weight: number
          rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          customer_id: string
          driver_id?: string | null
          status?: string
          pickup_date: string
          delivery_date: string
          pickup_location: string
          delivery_location: string
          cargo_description: string
          weight: number
          rate: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          customer_id?: string
          driver_id?: string | null
          status?: string
          pickup_date?: string
          delivery_date?: string
          pickup_location?: string
          delivery_location?: string
          cargo_description?: string
          weight?: number
          rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      subscription_tiers: {
        Row: {
          id: string
          name: string
          max_team_members: number
          max_drivers: number
          max_customers: number
          max_loads_per_month: number
          can_export_csv: boolean
          can_export_xlsx: boolean
          can_use_ai_features: boolean
          price_monthly: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          max_team_members: number
          max_drivers: number
          max_customers: number
          max_loads_per_month: number
          can_export_csv: boolean
          can_export_xlsx: boolean
          can_use_ai_features: boolean
          price_monthly: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          max_team_members?: number
          max_drivers?: number
          max_customers?: number
          max_loads_per_month?: number
          can_export_csv?: boolean
          can_export_xlsx?: boolean
          can_use_ai_features?: boolean
          price_monthly?: number
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          type: string
          vote_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          type: string
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          type?: string
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      community_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      post_votes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          vote_type: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          vote_type: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: string
          created_at?: string
        }
      }
    }
    Views: {
      posts_with_users: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          type: string
          vote_count: number
          created_at: string
          updated_at: string
          user_email: string | null
          user_full_name: string | null
        }
      }
    }
    Functions: {
      update_post_vote_count: {
        Args: {
          post_id: string
          vote_change: number
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 