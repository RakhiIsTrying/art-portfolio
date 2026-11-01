import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const insert = vi.fn()
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: () => ({ from: () => ({ insert }) }) }))

import { POST } from '@/app/api/track/route'

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1 Mobile'
const good = { name: 'pageview', path: '/shop', visitor: 'abcd1234-aaaa', session: 'efgh5678-bbbb', referrer: 'https://www.instagram.com/some/private?x=1' }
const post = (body: unknown, headers: Record<string, string> = {}) => POST(new NextRequest('https://faradaycage.xyz/api/track', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body), headers: { 'user-agent': UA, ...headers } }))

describe('POST /api/track', () => {
  beforeEach(() => { insert.mockReset(); insert.mockResolvedValue({ error: null }) })

  it('saves source, location and device, and only the referring site, never its full address or the IP', async () => {
    expect((await post(good, { 'x-vercel-ip-country': 'IN', 'x-vercel-ip-city': 'New%20Delhi', 'x-forwarded-for': '1.2.3.4' })).status).toBe(204)
    const row = insert.mock.calls[0][0]
    expect(row).toMatchObject({ name: 'pageview', source: 'Instagram', referrer: 'instagram.com', country: 'IN', city: 'New Delhi', device: 'Phone' })
    expect(JSON.stringify(row)).not.toContain('1.2.3.4')
    expect(JSON.stringify(row)).not.toContain('private')
  })

  it('ignores bots, bad data and unknown events', async () => {
    await post(good, { 'user-agent': 'Googlebot/2.1' })
    await post({ ...good, name: 'hack' })
    await post({ ...good, visitor: "'; drop table" })
    await post('not json')
    await post({ ...good, path: 'x'.repeat(5000) })
    expect(insert).not.toHaveBeenCalled()
  })

  it('only sets a source on the first page, and caps time', async () => {
    await post({ name: 'leave', path: '/', visitor: good.visitor, session: good.session, seconds: 999999 })
    expect(insert.mock.calls[0][0]).toMatchObject({ source: null, seconds: 14400 })
  })

  it('never fails the visitor if saving fails', async () => {
    insert.mockResolvedValue({ error: { message: 'no table' } })
    expect((await post(good)).status).toBe(204)
  })
})
