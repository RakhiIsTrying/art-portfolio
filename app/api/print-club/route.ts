import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getResendClient } from '@/lib/resend'
import { planForCountry } from '@/lib/printClub'
import { getSettings } from '@/lib/settings'

const REQUIRED = ['name', 'email', 'phone', 'address_line1', 'city', 'region', 'postal_code', 'country'] as const
const OPTIONAL = ['birthday', 'birthday_request', 'address_line2'] as const
type Field = typeof REQUIRED[number] | typeof OPTIONAL[number]

export async function POST(req: NextRequest) {
  let body: Partial<Record<Field, unknown>>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const clean = (k: Field) => (typeof body[k] === 'string' ? (body[k] as string).trim().slice(0, 500) : '')
  const row: Record<string, string | null> = {}
  for (const k of REQUIRED) row[k] = clean(k)
  for (const k of OPTIONAL) row[k] = clean(k) || null
  row.email = row.email!.toLowerCase()

  if (REQUIRED.some(k => !row[k]) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (row.birthday && (!/^\d{4}-\d{2}-\d{2}$/.test(row.birthday) || isNaN(Date.parse(row.birthday)) || Date.parse(row.birthday) > Date.now())) {
    return NextResponse.json({ error: 'Invalid birthday' }, { status: 400 })
  }
  if (row.phone!.replace(/\D/g, '').length < 7) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
  }

  const plan = planForCountry(row.country!)
  const PLANS = (await getSettings()).plans
  const admin = getSupabaseAdminClient()
  const { error } = await admin.from('print_club_signups').insert({ ...row, plan })

  // Unique violation: already signed up — treat as success so the visitor isn't confused
  if (error && error.code !== '23505') {
    return NextResponse.json({ error: 'Could not save sign-up' }, { status: 500 })
  }

  if (!error) {
    const address = [row.address_line1, row.address_line2, [row.city, row.region, row.postal_code].filter(Boolean).join(', '), row.country]
      .filter(Boolean).join('\n')
    // Best effort: the sign-up is already saved, so a mail failure shouldn't fail the request
    await getResendClient().emails.send({
      from:    'noreply@resend.dev',
      to:      process.env.INQUIRE_TO_EMAIL!,
      subject: `New Print Club sign-up — ${row.name}`,
      text:    `Plan: ${PLANS[plan].price} / month (${PLANS[plan].region})\n\nName: ${row.name}\nEmail: ${row.email}\nPhone: ${row.phone}${row.birthday ? `\nBirthday: ${row.birthday}` : ''}${row.birthday_request ? `\nBirthday request: ${row.birthday_request}` : ''}\n\nAddress:\n${address}`,
    }).catch(() => {})
  }

  // Separate payment links per plan, once configured
  const checkoutUrl = plan === 'india'
    ? process.env.PRINT_CLUB_CHECKOUT_URL_INDIA
    : process.env.PRINT_CLUB_CHECKOUT_URL_INTERNATIONAL
  return NextResponse.json({ ok: true, checkoutUrl: checkoutUrl || null })
}
