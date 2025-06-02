import { UserRole } from '@/types/auth'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          organization_id: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          organization_id: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          organization_id?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          phone: string | null
          email: string | null
          website: string | null
          created_at: string
          updated_at: string
          subscription_tier_id: string
          subscription_expires_at: string | null
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier_id: string
          subscription_expires_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
          subscription_tier_id?: string
          subscription_expires_at?: string | null
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
          can_export_csv?: boolean
          can_export_xlsx?: boolean
          can_use_ai_features?: boolean
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
      admin_settings: {
        Row: {
          id: string
          profile_id: string
          dashboard_layout: Json
          notification_preferences: Json
          export_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          dashboard_layout?: Json
          notification_preferences?: Json
          export_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          dashboard_layout?: Json
          notification_preferences?: Json
          export_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      drivers: {
        Row: {
          id: string
          organization_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string
          license_number: string
          license_expiry: string
          status: string
          truck_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone: string
          license_number: string
          license_expiry: string
          status?: string
          truck_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string
          license_number?: string
          license_expiry?: string
          status?: string
          truck_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      driver_performance: {
        Row: {
          id: string
          driver_id: string
          loads_completed: number
          on_time_delivery_rate: number
          revenue_generated: number
          miles_driven: number
          fuel_consumed: number
          month: string
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          loads_completed?: number
          on_time_delivery_rate?: number
          revenue_generated?: number
          miles_driven?: number
          fuel_consumed?: number
          month: string
          year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          loads_completed?: number
          on_time_delivery_rate?: number
          revenue_generated?: number
          miles_driven?: number
          fuel_consumed?: number
          month?: string
          year?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          organization_id: string
          name: string
          contact_name: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          payment_terms: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          payment_terms?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          payment_terms?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customer_performance: {
        Row: {
          id: string
          customer_id: string
          loads_completed: number
          revenue_generated: number
          average_rate_per_mile: number
          month: string
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          loads_completed?: number
          revenue_generated?: number
          average_rate_per_mile?: number
          month: string
          year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          loads_completed?: number
          revenue_generated?: number
          average_rate_per_mile?: number
          month?: string
          year?: number
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
          load_number: string
          status: string
          pickup_date: string
          delivery_date: string
          pickup_location: string
          delivery_location: string
          distance: number | null
          rate: number
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          organization_id: string
          customer_id: string
          driver_id?: string | null
          load_number: string
          status?: string
          pickup_date: string
          delivery_date: string
          pickup_location: string
          delivery_location: string
          distance?: number | null
          rate: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          organization_id?: string
          customer_id?: string
          driver_id?: string | null
          load_number?: string
          status?: string
          pickup_date?: string
          delivery_date?: string
          pickup_location?: string
          delivery_location?: string
          distance?: number | null
          rate?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      load_timeline: {
        Row: {
          id: string
          load_id: string
          event_type: string
          event_time: string
          location: string | null
          notes: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          load_id: string
          event_type: string
          event_time: string
          location?: string | null
          notes?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          load_id?: string
          event_type?: string
          event_time?: string
          location?: string | null
          notes?: string | null
          created_at?: string
          created_by?: string
        }
      }
      documents: {
        Row: {
          id: string
          organization_id: string
          related_id: string | null
          related_type: string | null
          name: string
          file_path: string
          file_type: string
          file_size: number
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          organization_id: string
          related_id?: string | null
          related_type?: string | null
          name: string
          file_path: string
          file_type: string
          file_size: number
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          organization_id?: string
          related_id?: string | null
          related_type?: string | null
          name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          created_at?: string
          created_by?: string
        }
      }
    }
    Views: {
      admin_organization_summary: {
        Row: {
          organization_id: string
          organization_name: string
          total_users: number
          admin_count: number
          dispatcher_count: number
          total_drivers: number
          total_customers: number
          total_loads: number
        }
      }
    }
    Functions: {
      admin_export_user_data: {
        Args: {
          target_organization_id: string
        }
        Returns: string
      }
      admin_assign_role: {
        Args: {
          target_user_id: string
          new_role: string
        }
        Returns: boolean
      }
      belongs_to_organization: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_dispatcher: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_admin_of_organization: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
      current_organization_id: {
        Args: Record<string, never>
        Returns: string
      }
      get_organization_features: {
        Args: {
          org_id: string
        }
        Returns: {
          feature_name: string
          feature_enabled: boolean
          feature_limit: number | null
          feature_usage: number | null
        }[]
      }
      check_subscription_limit: {
        Args: {
          org_id: string
          resource_type: string
        }
        Returns: boolean
      }
    }
    Enums: {
      driver_status: 'available' | 'on_duty' | 'off_duty' | 'inactive'
      load_status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled'
      event_type: 'assigned' | 'pickup' | 'in_transit' | 'delivered' | 'delayed' | 'note'
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Organization = Database['public']['Tables']['organizations']['Row']
export type SubscriptionTier = Database['public']['Tables']['subscription_tiers']['Row']
export type AdminSettings = Database['public']['Tables']['admin_settings']['Row']
export type Driver = Database['public']['Tables']['drivers']['Row']
export type DriverPerformance = Database['public']['Tables']['driver_performance']['Row']
export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerPerformance = Database['public']['Tables']['customer_performance']['Row']
export type Load = Database['public']['Tables']['loads']['Row']
export type LoadTimeline = Database['public']['Tables']['load_timeline']['Row']
export type Document = Database['public']['Tables']['documents']['Row']

// Enum types
export type DriverStatus = Database['public']['Enums']['driver_status']
export type LoadStatus = Database['public']['Enums']['load_status']
export type EventType = Database['public']['Enums']['event_type']

// View types
export type AdminOrganizationSummary = Database['public']['Views']['admin_organization_summary']['Row']

// Function return types
export type OrganizationFeature = {
  feature_name: string
  feature_enabled: boolean
  feature_limit: number | null
  feature_usage: number | null
}
