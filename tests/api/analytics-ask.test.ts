import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const create = vi.fn()
const requireAdmin = vi.fn()
vi.mock('@anthropic-ai/sdk', async original => {
  const real = await original<typeof import('@anthropic-ai/sdk')>()
  class Anthropic { beta = { messages: { create } } }
  return { default: Object.assign(Anthropic, { APIError: real.default.APIError, AuthenticationError: real.default.AuthenticationError, RateLimitError: real.default.RateLimitError }) }
})
vi.mock('@/lib/adminAuth', () => ({ requireAdmin: () => requireAdmin() }))
vi.mock('@/lib/analytics/load', () => ({
  loadEvents: async () => ({ events: [{ created_at: new Date().toISOString(), name: 'pageview', path: '/', label: null, seconds: null, visitor_id: 'a', session_id: 's', source: 'Instagram', referrer: null, utm_medium: null, utm_campaign: null, country: 'IN', region: null, city: null, device: 'Phone', browser: 'Safari', os: 'iOS' }], error: null }),
  loadSales: async () => ({ members: [{ name: 'Maya Secret', email: 'maya@secret.com', country: 'India', at: new Date().toISOString(), tier: 'Gone Baroque', tierId: 'baroque', price: '₹750' }], orders: [] }),
}))

import { POST } from '@/app/api/admin/analytics-ask/route'

const post = (body: unknown) => POST(new NextRequest('http://x/api/admin/analytics-ask', { method: 'POST', body: JSON.stringify(body) }))
const text = (t: string) => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: t }] })
const toolCall = (name: string, input: object, id = 't1') => ({ stop_reason: 'tool_use', content: [{ type: 'tool_use', id, name, input }] })

describe('POST /api/admin/analytics-ask', () => {
  beforeEach(() => { create.mockReset(); requireAdmin.mockReset(); requireAdmin.mockResolvedValue({}) })
  afterEach(() => vi.unstubAllEnvs())

  it('is for the signed-in owner only', async () => {
    requireAdmin.mockRejectedValue(new Error('no'))
    expect((await post({ question: 'hi' })).status).toBe(401)
    expect(create).not.toHaveBeenCalled()
  })

  it('needs a question', async () => {
    expect((await post({ question: '  ' })).status).toBe(400)
  })

  it('works without an AI key, using the calculator', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', '')
    expect(await (await post({ question: 'how many visitors from india?' })).json()).toEqual({ answer: '1 visitor in India in the last 30 days.', mode: 'basic' })
    expect(create).not.toHaveBeenCalled()
  })

  it('lets the AI look up real numbers, then answers', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')
    create.mockResolvedValueOnce(toolCall('query_visits', { metric: 'visitors', days: 30, group_by: 'source', filters: { country: 'India', city: null, source: null, device: null, path_contains: null, label_contains: null } })).mockResolvedValueOnce(text('Instagram sent your 1 visitor.'))
    expect(await (await post({ question: 'where do they come from?' })).json()).toEqual({ answer: 'Instagram sent your 1 visitor.', mode: 'ai' })
    const second = create.mock.calls[1][0]
    expect(second.model).toBe('claude-opus-5-5')
    const result = JSON.parse(second.messages.at(-1).content[0].content)
    expect(result).toMatchObject({ total: 1, rows: [{ key: 'Instagram', value: 1 }] })
  })

  it('never sends buyer names or emails to the AI', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')
    create.mockResolvedValueOnce(toolCall('get_sales', { days: 30 })).mockResolvedValueOnce(toolCall('get_overview', { days: 30 }, 't2')).mockResolvedValueOnce(text('Done.'))
    await post({ question: 'who is buying?' })
    const sent = JSON.stringify(create.mock.calls.at(-1)![0].messages)
    expect(sent).not.toContain('Secret')
    expect(sent).not.toContain('secret.com')
    expect(sent).toContain('Gone Baroque')
  })

  it('reports a failed lookup to the AI instead of crashing', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')
    create.mockResolvedValueOnce(toolCall('delete_everything', {})).mockResolvedValueOnce(text('Sorry.'))
    await post({ question: 'x' })
    expect(create.mock.calls[1][0].messages.at(-1).content[0]).toMatchObject({ is_error: true })
  })

  it('stops after too many lookups, handles a refusal, and falls back if the AI is down', async () => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')
    create.mockResolvedValue(toolCall('get_sales', { days: 30 }))
    expect((await (await post({ question: 'x' })).json()).answer).toMatch(/too many lookups/)
    expect(create).toHaveBeenCalledTimes(6)
    create.mockReset(); create.mockResolvedValue({ stop_reason: 'refusal', content: [] })
    expect((await (await post({ question: 'x' })).json()).answer).toMatch(/different way/)
    create.mockReset(); create.mockRejectedValue(new Error('down'))
    const body = await (await post({ question: 'how many visitors?' })).json()
    expect(body).toMatchObject({ mode: 'basic', notice: expect.stringContaining('basic') })
    expect(body.answer).toMatch(/1 visitor /)
  })
})
