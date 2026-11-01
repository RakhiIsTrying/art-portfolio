import { describe, it, expect } from 'vitest'
import { isBot, parseDevice, sourceOf } from '@/lib/analytics/parse'
import { istDay, monthlyIncome, percent, summarise, type AnalyticsEvent } from '@/lib/analytics/summary'

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'
const NOW = new Date('2026-11-02T12:00:00Z')
const ev = (o: Partial<AnalyticsEvent>): AnalyticsEvent => ({ created_at: '2026-11-02T10:00:00Z', name: 'pageview', path: '/', label: null, seconds: null, visitor_id: 'v1', session_id: 's1', source: null, referrer: null, utm_medium: null, utm_campaign: null, country: 'IN', region: 'MH', city: 'Mumbai', device: 'Phone', browser: 'Safari', os: 'iOS', ...o })

describe('parse', () => {
  it('spots bots and devices', () => {
    expect(isBot('Googlebot/2.1')).toBe(true)
    expect(isBot('')).toBe(true)
    expect(isBot(IPHONE)).toBe(false)
    expect(parseDevice(IPHONE)).toEqual({ device: 'Phone', browser: 'Safari', os: 'iOS' })
    expect(parseDevice(`${IPHONE} Instagram 300.0`).browser).toBe('Instagram app')
  })

  it('names sources: campaign tag, then referrer, then app, then direct', () => {
    expect(sourceOf({ referrer: 'https://www.google.com/x', utmSource: 'instagram', ua: IPHONE })).toBe('Instagram')
    expect(sourceOf({ referrer: 'https://l.instagram.com/', ua: IPHONE })).toBe('Instagram')
    expect(sourceOf({ referrer: 'https://www.google.co.in/', ua: IPHONE })).toBe('Google')
    expect(sourceOf({ referrer: 'https://youtu.be/x', ua: IPHONE })).toBe('YouTube')
    expect(sourceOf({ referrer: 'https://someblog.net/post', ua: IPHONE })).toBe('someblog.net')
    expect(sourceOf({ referrer: '', ua: `${IPHONE} Instagram 300.0` })).toBe('Instagram')
    expect(sourceOf({ referrer: '', ua: IPHONE })).toBe('Direct')
    expect(sourceOf({ referrer: 'https://faradaycage.xyz/shop', ua: IPHONE, siteHost: 'faradaycage.xyz' })).toBe('Direct')
  })
})

describe('summarise', () => {
  const events = [
    ev({ source: 'Instagram', path: '/print-club', visitor_id: 'a', session_id: 'a1', created_at: '2026-11-02T10:00:00Z' }),
    ev({ name: 'leave', path: '/print-club', seconds: 90, visitor_id: 'a', session_id: 'a1', created_at: '2026-11-02T10:01:30Z' }),
    ev({ name: 'tier_selected', label: 'digital', visitor_id: 'a', session_id: 'a1', created_at: '2026-11-02T10:01:40Z' }),
    ev({ name: 'club_signup', label: 'digital', visitor_id: 'a', session_id: 'a1', created_at: '2026-11-02T10:02:00Z' }),
    ev({ source: 'Direct', path: '/', visitor_id: 'b', session_id: 'b1', country: 'JP', city: 'Tokyo', region: '13', created_at: '2026-11-01T10:00:00Z' }),
    ev({ path: '/', visitor_id: 'a', session_id: 'a2', created_at: '2026-11-01T09:00:00Z', source: 'Google' }),
    ev({ path: '/old', visitor_id: 'old', session_id: 'o1', created_at: '2026-10-20T10:00:00Z' }),
  ]
  const s = summarise(events, 7, NOW)

  it('counts the headline numbers for the range only', () => {
    expect(s.now).toMatchObject({ visitors: 2, sessions: 3, pageviews: 3, returning: 1, conversions: 1, bounceRate: 67, avgSeconds: 30 })
    expect(s.before.visitors).toBe(1)
  })

  it('credits a sign-up to where the visitor first came from, and keeps funnels unique', () => {
    expect(s.sources.find(r => r.key === 'Google')).toMatchObject({ value: 1, extra: 1 })
    expect(s.countries.find(r => r.key === 'IN')?.extra).toBe(1)
    expect(s.clubFunnel.map(f => f.value)).toEqual([1, 1, 1])
    expect(s.signups).toEqual([{ key: 'digital', value: 1 }])
  })

  it('fills every day and uses India time', () => {
    expect(s.daily).toHaveLength(7)
    expect(istDay('2026-11-01T20:00:00Z')).toBe('2026-11-02')
    expect(s.heat.flat().reduce((a, b) => a + b, 0)).toBe(3)
    expect(s.pages.find(p => p.key === '/print-club')).toMatchObject({ value: 1, seconds: 90 })
  })

  it('copes with nothing', () => {
    expect(summarise([], 30, NOW).now).toMatchObject({ visitors: 0, bounceRate: 0, conversionRate: 0 })
  })

  it('does sums', () => {
    expect(percent(1, 0)).toBe(0)
    expect(monthlyIncome(['₹499', '₹199', '$3', ''])).toBe('₹698 + $3')
    expect(monthlyIncome([])).toBe('0')
  })
})
