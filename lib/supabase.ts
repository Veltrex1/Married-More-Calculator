import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ChatResponse = {
  id?: string
  created_at?: string
  name: string
  email: string
  relationship_status: string
  favorite_memory: string
  goals: string
}



