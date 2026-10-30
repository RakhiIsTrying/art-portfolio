import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/adminEmail'

/** For server actions: only a signed-in admin may continue. Returns the service client. */
export async function requireAdmin() {
  const { data: { user } } = await (await getSupabaseServerClient()).auth.getUser()
  if (!user || !isAdminEmail(user.email)) throw new Error('Please sign in again.')
  return getSupabaseAdminClient()
}
