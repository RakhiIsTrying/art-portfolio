'use server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/adminEmail'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

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

/** Emails a link to set a new password, only ever to the owner's address. */
export async function forgotPasswordAction(
  _prev: { error?: string; sent?: string } | null,
  formData: FormData
): Promise<{ error?: string; sent?: string } | null> {
  const email = String(formData.get('email') ?? '').trim()
  const done = { sent: 'If that’s the admin email, a link to set a new password is on its way. Check your inbox (and Spam).' }
  if (!isAdminEmail(email)) return done

  const h = await headers()
  const redirectTo = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}/admin/reset`

  // Sent through Resend: Supabase's own mailer only allows a couple of emails an hour and often lands in Spam
  const key = (process.env.RESEND_API_KEY ?? '').replace(/\s+/g, '')
  if (key) {
    try {
      const { data, error } = await getSupabaseAdminClient().auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo } })
      if (error) throw error
      const link = data.properties.action_link
      const sent = await new Resend(key).emails.send({
        from: 'Van Gone Broke website <onboarding@resend.dev>',
        to: email,
        subject: 'Set a new password for your Van Gone Broke admin',
        text: `Open this link to choose a new admin password for faradaycage.xyz:\n\n${link}\n\nIt works once and expires in an hour. If you didn’t ask for this, ignore this email.`,
        html: `<p>Open this link to choose a new admin password for faradaycage.xyz:</p><p><a href="${link}">Set a new password →</a></p><p style="color:#787878">It works once and expires in an hour. If you didn’t ask for this, ignore this email.</p>`,
      })
      if (!sent.error) return done
      console.error('Reset email not sent:', sent.error.message)
    } catch (e) { console.error('Reset email not sent:', e) }
  }

  // Fallback: Supabase's own mailer. "Implicit" links carry the sign-in in the link itself, so they work on any device
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { flowType: 'implicit', persistSession: false, autoRefreshToken: false } })
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) return { error: `Couldn’t send the email: ${error.message}. Try again in a few minutes.` }
  return done
}
