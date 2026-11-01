import { describe, it, expect, vi, afterEach } from 'vitest'

const batchSend = vi.fn()
vi.mock('resend', () => ({ Resend: class { batch = { send: batchSend } } }))
vi.mock('@/lib/notify', () => ({ ARTIST_EMAIL: 'artist@example.com' }))

import { memberEmailReady, monthlyPrintEmail, sendMemberEmails, welcomeEmail } from '@/lib/memberEmail'

const mail = (i: number) => ({ to: `m${i}@example.com`, subject: 's', text: 't' })
afterEach(() => { vi.unstubAllEnvs(); batchSend.mockReset() })

describe('member emails', () => {
  it('stay switched off until a sender is set', async () => {
    vi.stubEnv('RESEND_API_KEY', 'key')
    vi.stubEnv('PRINT_CLUB_FROM_EMAIL', '')
    expect(memberEmailReady()).toBe(false)
    expect(await sendMemberEmails([mail(1)])).toBe(0)
    expect(batchSend).not.toHaveBeenCalled()
  })

  it('send separately in batches, from the set address, with replies to the artist', async () => {
    vi.stubEnv('RESEND_API_KEY', 'key')
    vi.stubEnv('PRINT_CLUB_FROM_EMAIL', 'Van Gone Broke <club@faradaycage.xyz>')
    batchSend.mockResolvedValue({ error: null })
    expect(await sendMemberEmails(Array.from({ length: 150 }, (_, i) => mail(i)))).toBe(150)
    expect(batchSend).toHaveBeenCalledTimes(2)
    expect(batchSend.mock.calls[0][0]).toHaveLength(100)
    expect(batchSend.mock.calls[0][0][0]).toMatchObject({ to: 'm0@example.com', from: 'Van Gone Broke <club@faradaycage.xyz>', replyTo: 'artist@example.com' })
  })

  it('says how far it got if a batch fails', async () => {
    vi.stubEnv('RESEND_API_KEY', 'key')
    vi.stubEnv('PRINT_CLUB_FROM_EMAIL', 'club@faradaycage.xyz')
    batchSend.mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: { message: 'limit' } })
    await expect(sendMemberEmails(Array.from({ length: 150 }, (_, i) => mail(i)))).rejects.toThrow('Sent 100 of 150, then: limit')
  })

  it('writes the welcome and monthly emails', () => {
    const digital = welcomeEmail({ to: 'a@x.com', name: 'Maya K', tier: 'digital', price: '₹199', checkoutUrl: 'https://pay/x' })
    expect(digital.subject).toBe('Welcome to Van Gogh Anywhere!')
    expect(digital.text).toContain('Hi Maya,')
    expect(digital.text).toContain('https://pay/x')
    expect(digital.text).toContain('this inbox')
    expect(welcomeEmail({ to: 'a@x.com', name: 'Maya', tier: 'broke', price: '₹499' }).text).toContain('I’ll write again soon about paying (₹499 / month)')
    const monthly = monthlyPrintEmail({ to: 'a@x.com', name: 'Maya', subject: 'S', message: 'Enjoy!', fileUrl: 'https://f/x.pdf' })
    expect(monthly.text).toContain('Enjoy!')
    expect(monthly.text).toContain('https://f/x.pdf')
  })
})
