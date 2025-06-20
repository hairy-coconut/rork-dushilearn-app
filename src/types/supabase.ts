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
          created_at: string
          updated_at: string
          username: string
          full_name: string | null
          avatar_url: string | null
          email: string
          native_language: string
          learning_language: string
          level: number
          xp: number
          streak: number
          last_active: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          email: string
          native_language: string
          learning_language: string
          level?: number
          xp?: number
          streak?: number
          last_active?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string
          native_language?: string
          learning_language?: string
          level?: number
          xp?: number
          streak?: number
          last_active?: string | null
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          score: number
          time_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          score?: number
          time_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          completed?: boolean
          score?: number
          time_spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string
          criteria: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url: string
          criteria: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string
          criteria?: Json
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_stats: {
        Args: { user_id: string }
        Returns: {
          total_lessons: number
          completed_lessons: number
          total_xp: number
          current_level: number
          current_streak: number
          badges_earned: number
        }
      }
      get_leaderboard: {
        Args: { limit?: number }
        Returns: {
          user_id: string
          username: string
          avatar_url: string | null
          level: number
          xp: number
          streak: number
          rank: number
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 