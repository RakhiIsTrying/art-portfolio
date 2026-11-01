import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { DEFAULT_PLANS } from '@/lib/printClub'

const insert = vi.fn()
const notifyArtist = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: () => ({ from: () => ({ insert }) }) }))
vi.mock('@/lib/notify', () => ({ notifyArtist: (m: unknown) => notifyArtist(m) }))
vi.mock('@/lib/settings', () => ({ getSettings: async () => ({ plans: DEFAULT_PLANS }) }))

import { POST } from '@/app/api/print-club/route'

const signup = {
  name: 'Maya', email: 'maya@example.com', phone: '+91 98765 43210', address_line1: '1 Lane',
  city: 'Pune', region: 'MH', postal_code: '411001', country: 'India',
  birthday: '1990-01-02', birthday_request: 'A koi',
}
const post = (body: object) => POST(new NextRequest('http://x/api/print-club', { method: 'POST', body: JSON.stringify(body) }))

describe('POST /api/print-club', () => {
  beforeEach(() => { vi.clearAllMocks(); insert.mockResolvedValue({ error: null }) })
  afterEach(() => vi.unstubAllEnvs())

  it('saves the chosen tier and tells the artist its price', async () => {
    expect((await post({ ...signup, tier: 'broke' })).status).toBe(200)
    expect(insert.mock.calls[0][0]).toMatchObject({ tier: 'broke', plan: 'india' })
    expect(notifyArtist.mock.calls[0][0].subject).toBe('Maya, Monet Can’t Buy Me Love, ₹499 / month')
  })

  it('keeps birthday details only for Gone Baroque', async () => {
    await post({ ...signup, tier: 'broke' })
    expect(insert.mock.calls[0][0]).toMatchObject({ birthday: null, birthday_request: null })
    await post({ ...signup, tier: 'baroque' })
    expect(insert.mock.calls[1][0]).toMatchObject({ birthday: '1990-01-02', birthday_request: 'A koi' })
  })

  it('treats a request with no tier as the higher tier, and rejects an unknown one', async () => {
    await post(signup)
    expect(insert.mock.calls[0][0].tier).toBe('baroque')
    expect((await post({ ...signup, tier: 'free' })).status).toBe(400)
    expect(insert).toHaveBeenCalledTimes(1)
  })

  it('still saves the sign-up if the tier column hasn’t been added yet', async () => {
    insert.mockResolvedValueOnce({ error: { code: 'PGRST204' } })
    expect((await post({ ...signup, tier: 'broke' })).status).toBe(200)
    expect(insert.mock.calls[1][0]).not.toHaveProperty('tier')
    expect(notifyArtist.mock.calls[0][0].subject).toContain('Monet Can’t Buy Me Love')
  })

  it('takes Van Gogh Anywhere with no address, and keeps none', async () => {
    const { name, email, phone, country } = signup
    expect((await post({ name, email, phone, country, tier: 'digital' })).status).toBe(200)
    expect(insert.mock.calls[0][0]).toMatchObject({ tier: 'digital', plan: 'india', address_line1: null, city: null, region: null, postal_code: null, birthday: null })
    expect(notifyArtist.mock.calls[0][0].subject).toBe('Maya, Van Gogh Anywhere, ₹199 / month')
    expect(notifyArtist.mock.calls[0][0].text).toContain('Digital only, in India')
  })

  it('ignores an address sent with Van Gogh Anywhere, but still needs a country', async () => {
    await post({ ...signup, tier: 'digital' })
    expect(insert.mock.calls[0][0]).toMatchObject({ address_line1: null, postal_code: null })
    expect((await post({ ...signup, country: '', tier: 'digital' })).status).toBe(400)
  })

  it('still needs an address for tiers that ship', async () => {
    const { name, email, phone, country } = signup
    expect((await post({ name, email, phone, country, tier: 'broke' })).status).toBe(400)
    expect(insert).not.toHaveBeenCalled()
  })

  it('never sends the lower tier to the higher tier’s payment link', async () => {
    vi.stubEnv('PRINT_CLUB_CHECKOUT_URL_INDIA', 'https://pay/high')
    expect(await (await post({ ...signup, tier: 'broke' })).json()).toEqual({ ok: true, checkoutUrl: null })
    expect(await (await post({ ...signup, tier: 'baroque' })).json()).toEqual({ ok: true, checkoutUrl: 'https://pay/high' })
    expect(await (await post({ ...signup, tier: 'digital' })).json()).toEqual({ ok: true, checkoutUrl: null })
    vi.stubEnv('PRINT_CLUB_CHECKOUT_URL_INDIA_BROKE', 'https://pay/low')
    expect(await (await post({ ...signup, tier: 'broke' })).json()).toEqual({ ok: true, checkoutUrl: 'https://pay/low' })
    vi.stubEnv('PRINT_CLUB_CHECKOUT_URL_INDIA_DIGITAL', 'https://pay/digital')
    expect(await (await post({ ...signup, tier: 'digital' })).json()).toEqual({ ok: true, checkoutUrl: 'https://pay/digital' })
  })
})
