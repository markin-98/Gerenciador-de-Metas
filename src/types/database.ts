export type GoalType = 'challenge' | 'target'
export type GoalStatus = 'active' | 'completed'
export type DepositStatus = 'pending' | 'completed'
export type SpaceRole = 'owner' | 'member'
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  name: string
  avatar_url: string | null
  created_at: string
}

export interface Space {
  id: string
  name: string
  owner_id: string
  created_at: string
}

export interface SpaceMember {
  id: string
  space_id: string
  user_id: string
  role: SpaceRole
  joined_at: string
  profile?: Profile
}

export interface Invite {
  id: string
  space_id: string
  goal_id: string | null
  token: string
  created_by: string
  created_at: string
  expires_at: string
}

export interface GoalMember {
  id: string
  goal_id: string
  user_id: string
  role: SpaceRole
  joined_at: string
  profile?: Profile
}

export interface GoalJoinRequest {
  id: string
  goal_id: string
  user_id: string
  status: JoinRequestStatus
  requested_at: string
  resolved_at: string | null
  resolved_by: string | null
  profile?: Profile
  goal?: Goal
}

export interface Goal {
  id: string
  space_id: string
  name: string
  type: GoalType
  total_amount_cents: number
  deposits_count: number
  status: GoalStatus
  created_by: string
  created_at: string
  completed_at: string | null
}

export interface Deposit {
  id: string
  goal_id: string
  sequence: number
  amount_cents: number
  status: DepositStatus
  completed_by: string | null
  completed_at: string | null
  profile?: Profile
}

export interface Achievement {
  id: string
  goal_id: string
  space_id: string
  user_id: string
  earned_at: string
  goal?: Goal
}

// As tabelas abaixo são escritas como literais de tipo inline (no padrão gerado
// por `supabase gen types`), e não como referências às interfaces acima: tipos
// nomeados referenciados não recebem assinatura de índice implícita e falham a
// checagem estrutural que o supabase-js faz contra `Record<string, unknown>`.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      spaces: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
        }
        Relationships: []
      }
      space_members: {
        Row: {
          id: string
          space_id: string
          user_id: string
          role: SpaceRole
          joined_at: string
        }
        Insert: {
          id?: string
          space_id: string
          user_id: string
          role?: SpaceRole
          joined_at?: string
        }
        Update: {
          id?: string
          space_id?: string
          user_id?: string
          role?: SpaceRole
          joined_at?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          id: string
          space_id: string
          goal_id: string | null
          token: string
          created_by: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          space_id: string
          goal_id?: string | null
          token?: string
          created_by: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          space_id?: string
          goal_id?: string | null
          token?: string
          created_by?: string
          created_at?: string
          expires_at?: string
        }
        Relationships: []
      }
      goal_members: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          role: SpaceRole
          joined_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          role?: SpaceRole
          joined_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          role?: SpaceRole
          joined_at?: string
        }
        Relationships: []
      }
      goal_join_requests: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          status: JoinRequestStatus
          requested_at: string
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          status?: JoinRequestStatus
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          status?: JoinRequestStatus
          requested_at?: string
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          space_id: string
          name: string
          type: GoalType
          total_amount_cents: number
          deposits_count: number
          status: GoalStatus
          created_by: string
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          space_id: string
          name: string
          type: GoalType
          total_amount_cents: number
          deposits_count: number
          status?: GoalStatus
          created_by: string
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          space_id?: string
          name?: string
          type?: GoalType
          total_amount_cents?: number
          deposits_count?: number
          status?: GoalStatus
          created_by?: string
          created_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      deposits: {
        Row: {
          id: string
          goal_id: string
          sequence: number
          amount_cents: number
          status: DepositStatus
          completed_by: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          goal_id: string
          sequence: number
          amount_cents: number
          status?: DepositStatus
          completed_by?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          goal_id?: string
          sequence?: number
          amount_cents?: number
          status?: DepositStatus
          completed_by?: string | null
          completed_at?: string | null
        }
        Relationships: []
      }
      achievements: {
        Row: {
          id: string
          goal_id: string
          space_id: string
          user_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          space_id: string
          user_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          space_id?: string
          user_id?: string
          earned_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_invite_by_token: {
        Args: { p_token: string }
        Returns: {
          id: string
          space_id: string
          goal_id: string | null
          goal_name: string | null
          created_by: string
          created_at: string
        }[]
      }
      get_my_goal_status: {
        Args: { p_goal_id: string }
        Returns: string
      }
    }
  }
}
