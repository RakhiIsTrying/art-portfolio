import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, serviceRoleKey } from '@/lib/supabase/env'

export function getSupabaseAdminClient() {
  return createClient(SUPABASE_URL, serviceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },   // server-side: no browser session
  })
}
