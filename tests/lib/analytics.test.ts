import { describe, it, expect } from 'vitest'
import { isBot, parseDevice, parseVersions, sourceOf } from '@/lib/analytics/parse'
import { istDay, percent, recentVisits, summarise, type AnalyticsEvent } from '@/lib/analytics/summary'

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
  })
})

describe('versions', () => {
  it('reads browser and system versions', () => {
    const chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/129.0.6668.89 Safari/537.36'
    expect(parseVersions(chrome, 'Chrome', 'Windows')).toEqual({ browser_version: '129.0', os_version: '10.0' })
    expect(parseVersions(IPHONE, 'Safari', 'iOS')).toEqual({ browser_version: '17.0', os_version: '17.0' })
    expect(parseVersions('nothing useful', 'Other', 'Other')).toEqual({ browser_version: null, os_version: null })
  })
})

describe('recentVisits', () => {
  it('makes one row per visit, newest first, with how long it lasted and what happened', () => {
    const rows = recentVisits([
      ev({ session_id: 'a', created_at: '2026-11-02T10:00:00Z', source: 'Instagram', ip: '1.2.3.4', browser_version: '17.4', os_version: '17.4', screen: '390x844' }),
      ev({ session_id: 'a', path: '/shop', created_at: '2026-11-02T10:02:00Z' }),
      ev({ session_id: 'a', name: 'piece_selected', label: 'Koi Pond', created_at: '2026-11-02T10:03:00Z' }),
      ev({ session_id: 'a', name: 'leave', seconds: 30, path: '/shop', created_at: '2026-11-02T10:04:30Z' }),
      ev({ session_id: 'b', created_at: '2026-11-03T09:00:00Z' }),
    ])
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ returning: true, pages: ['/'] })
    expect(rows[1]).toMatchObject({ minutes: 4.5, pages: ['/', '/shop'], source: 'Instagram', ip: '1.2.3.4', browser: 'Safari 17.4', os: 'iOS 17.4', screen: '390x844', actions: ['piece selected: Koi Pond'], returning: false })
  })
})
