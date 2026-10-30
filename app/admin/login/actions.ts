'use server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/adminEmail'

export async function loginAction(
  _prev: { error?: string; sent?: string } | null,
  formData: FormData
): Promise<{ error?: string; sent?: string } | null> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  // Only the site owner can sign in
  if (!isAdminEmail(email)) return { error: 'Invalid login credentials.' }

  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Invalid login credentials.' }

  redirect('/admin/artworks')
}

/** Emails a link to set a new password — only ever to the owner's address. */
export async function forgotPasswordAction(
  _prev: { error?: string; sent?: string } | null,
  formData: FormData
): Promise<{ error?: string; sent?: string } | null> {
  const email = String(formData.get('email') ?? '').trim()
  const done = { sent: 'If that’s the admin email, a link to set a new password is on its way. Check your inbox.' }
  if (!isAdminEmail(email)) return done

  const h = await headers()
  const origin = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`
  const supabase = await getSupabaseServerClient()
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/admin/reset` })
  return done
}
