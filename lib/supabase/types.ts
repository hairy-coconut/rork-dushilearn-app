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
          name: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          completed_lessons: string[]
          lesson_progress: Json
          streak: number
          last_streak: string | null
          xp: number
          level: number
          perfect_lessons: string[]
          total_exercises_completed: number
          unlocked_lessons: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          completed_lessons?: string[]
          lesson_progress?: Json
          streak?: number
          last_streak?: string | null
          xp?: number
          level?: number
          perfect_lessons?: string[]
          total_exercises_completed?: number
          unlocked_lessons?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          completed_lessons?: string[]
          lesson_progress?: Json
          streak?: number
          last_streak?: string | null
          xp?: number
          level?: number
          perfect_lessons?: string[]
          total_exercises_completed?: number
          unlocked_lessons?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          requirement: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description: string
          icon: string
          requirement: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          requirement?: string
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_date?: string
          created_at?: string
        }
      }
    }
    Functions: {
      update_user_progress: {
        Args: {
          p_user_id: string
          p_completed_lesson: string
          p_xp_gained: number
          p_perfect?: boolean
        }
        Returns: Json
      }
      get_user_stats: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      update_user_streak: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_leaderboard: {
        Args: {
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          user_id: string
          name: string
          avatar_url: string | null
          xp: number
          level: number
          streak: number
          rank: number
        }[]
      }
    }
  }
} 