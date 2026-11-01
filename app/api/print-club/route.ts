import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { notifyArtist } from '@/lib/notify'
import { isTierId, planForCountry, shipsPrints, tierPrice, TIERS } from '@/lib/printClub'
import { getSettings } from '@/lib/settings'

const REQUIRED = ['name', 'email', 'phone', 'country'] as const
const SHIPPING = ['address_line1', 'city', 'region', 'postal_code'] as const
const OPTIONAL = ['birthday', 'birthday_request', 'address_line2'] as const
type Field = typeof REQUIRED[number] | typeof SHIPPING[number] | typeof OPTIONAL[number]

export async function POST(req: NextRequest) {
  let body: Partial<Record<Field | 'tier', unknown>>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Requests from a page loaded before tiers existed have none: those visitors saw the higher price
  const tier = body.tier === undefined ? 'baroque' : body.tier
  if (!isTierId(tier)) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  const needed = shipsPrints(tier) ? [...REQUIRED, ...SHIPPING] : REQUIRED

  const clean = (k: Field) => (typeof body[k] === 'string' ? (body[k] as string).trim().slice(0, 500) : '')
  const row: Record<string, string | null> = {}
  for (const k of needed) row[k] = clean(k)
  for (const k of OPTIONAL) row[k] = clean(k) || null
  // The Digital Pass keeps no address
  if (!shipsPrints(tier)) { for (const k of SHIPPING) row[k] = null; row.address_line2 = null }
  row.email = row.email!.toLowerCase()

  if (needed.some(k => !row[k]) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (row.birthday && (!/^\d{4}-\d{2}-\d{2}$/.test(row.birthday) || isNaN(Date.parse(row.birthday)) || Date.parse(row.birthday) > Date.now())) {
    return NextResponse.json({ error: 'Invalid birthday' }, { status: 400 })
  }
  if (row.phone!.replace(/\D/g, '').length < 7) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
  }

  // The birthday special is a Gone Baroque perk
  if (tier !== 'baroque') { row.birthday = null; row.birthday_request = null }

  const plan = planForCountry(row.country!)
  const PLANS = (await getSettings()).plans
  const price = tierPrice(PLANS[plan], tier)
  const admin = getSupabaseAdminClient()
  let { error } = await admin.from('print_club_signups').insert({ ...row, plan, tier })
  // Until migration 010 has run there's no tier column. Keep the sign-up; the email below still names the tier.
  if (error?.code === 'PGRST204' || error?.code === '42703') {
    ({ error } = await admin.from('print_club_signups').insert({ ...row, plan }))
  }

  // Unique violation: already signed up, treat as success so the visitor isn't confused
  if (error && error.code !== '23505') {
    return NextResponse.json({ error: 'Could not save sign-up' }, { status: 500 })
  }

  if (!error) {
    const address = !shipsPrints(tier) ? `Digital only, in ${row.country}` : [row.address_line1, row.address_line2, [row.city, row.region, row.postal_code].filter(Boolean).join(', '), row.country]
      .filter(Boolean).join('\n')
    // Best effort: the sign-up is already saved, so a mail failure shouldn't fail the request
    await notifyArtist({
      kind: 'Print Club',
      subject: `${row.name}, ${TIERS[tier].name}, ${price} / month`,
      text: `Tier: ${TIERS[tier].name}\nPlan: ${price} / month (${PLANS[plan].region})\n\nName: ${row.name}\nEmail: ${row.email}\nPhone: ${row.phone}${row.birthday ? `\nBirthday: ${row.birthday}` : ''}${row.birthday_request ? `\nBirthday request: ${row.birthday_request}` : ''}\n\nAddress:\n${address}`,
      replyTo: row.email!,
    })
  }

  // Separate payment links per region and tier, once configured. A tier without its own link never uses the other's price.
  const checkoutUrl = process.env[`PRINT_CLUB_CHECKOUT_URL_${plan === 'india' ? 'INDIA' : 'INTERNATIONAL'}${{ digital: '_DIGITAL', broke: '_BROKE', baroque: '' }[tier]}`]
  return NextResponse.json({ ok: true, checkoutUrl: checkoutUrl || null })
}
