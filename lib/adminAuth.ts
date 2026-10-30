import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/adminEmail'

/** For server actions: only a signed-in admin may continue. Returns the service client. */
export async function requireAdmin() {
  const { data } = await (await getSupabaseServerClient()).auth.getClaims()
  if (!data?.claims || !isAdminEmail(data.claims.email as string | undefined)) throw new Error('Please sign in again.')
  return getSupabaseAdminClient()
}
