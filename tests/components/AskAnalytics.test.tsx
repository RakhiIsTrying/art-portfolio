import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import AskAnalytics from '@/components/admin/AskAnalytics'

const chart = { title: 'Page views by page', rows: [{ key: '/about', value: 5 }, { key: '/', value: 1 }, { key: '/shop', value: 2 }], valueLabel: 'Page views', type: 'bars', overTime: false, total: 8, source: { view: 'custom_query' } }
const fetchMock = vi.fn()
const ask = (q: string) => { fireEvent.change(screen.getByLabelText('Your question'), { target: { value: q } }); fireEvent.click(screen.getByRole('button', { name: 'Ask' })) }

describe('AskAnalytics', () => {
  beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal('fetch', fetchMock); fetchMock.mockResolvedValue({ ok: true, json: async () => ({ answer: 'Mostly **your About page**, so far.', charts: [chart], mode: 'ai' }) }) })
  afterEach(() => vi.unstubAllGlobals())

  it('shows bold instead of stars, and draws the chart with friendly names', async () => {
    render(<AskAnalytics smart />)
    ask('chart page views')
    const bold = await screen.findByText('your About page')
    expect(bold.tagName).toBe('B')
    expect(screen.queryByText(/\*\*/)).toBeNull()
    expect(screen.getByText('Page views by page')).toBeTruthy()
    expect(screen.getByText('Home page')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Bars' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('changes format by tap, and by typing without asking the server again', async () => {
    render(<AskAnalytics smart />)
    ask('chart page views')
    await screen.findByText('Page views by page')
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    expect(screen.getByRole('table')).toBeTruthy()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    ask('make it a pie')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Pie' }).getAttribute('aria-pressed')).toBe('true'))
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('/about 63%')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('tells the AI about earlier charts, so follow-ups can change them', async () => {
    render(<AskAnalytics smart />)
    ask('chart page views')
    await screen.findByText('Page views by page')
    ask('now split that by country')
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const body = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(body.history[1].content).toContain('Charts shown')
    expect(body.history[1].content).toContain('custom_query')
  })

  it('keeps a stars-free question as typed', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({ error: 'Please sign in' }) })
    render(<AskAnalytics smart={false} />)
    ask('hello')
    expect(await screen.findByText('Please sign in')).toBeTruthy()
    expect(screen.getByText(/Basic mode/)).toBeTruthy()
  })
})
