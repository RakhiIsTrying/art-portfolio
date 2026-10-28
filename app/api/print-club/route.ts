import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getResendClient } from '@/lib/resend'

type SignupBody = {
  name: string
  email: string
  country: string
  note?: string
}

export async function POST(req: NextRequest) {
  let body: SignupBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const name = body.name?.trim()
  const email = body.email?.trim().toLowerCase()
  const country = body.country?.trim()
  const note = body.note?.trim() || null

  if (!name || !email || !country || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const { error } = await admin.from('print_club_signups').insert({ name, email, country, note })

  // Unique violation: already signed up — treat as success so the visitor isn't confused
  if (error && error.code !== '23505') {
    return NextResponse.json({ error: 'Could not save sign-up' }, { status: 500 })
  }

  if (!error) {
    // Best effort: the sign-up is already saved, so a mail failure shouldn't fail the request
    await getResendClient().emails.send({
      from:    'noreply@resend.dev',
      to:      process.env.INQUIRE_TO_EMAIL!,
      subject: `New Print Club sign-up — ${name}`,
      text:    `Name: ${name}\nEmail: ${email}\nCountry: ${country}${note ? `\n\n${note}` : ''}`,
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true, checkoutUrl: process.env.NEXT_PUBLIC_PRINT_CLUB_CHECKOUT_URL || null })
}
