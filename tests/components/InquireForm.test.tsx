import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import InquireForm from '@/components/InquireForm'

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}))

global.fetch = vi.fn()

describe('InquireForm', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockResolvedValue({ ok: true } as Response)
  })

  it('renders all form fields', () => {
    render(<InquireForm />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('shows validation error when name is empty on submit', async () => {
    render(<InquireForm />)
    fireEvent.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
  })

  it('submits form data to /api/inquire', async () => {
    const user = userEvent.setup()
    render(<InquireForm />)
    await user.type(screen.getByLabelText(/name/i), 'Jane')
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await user.type(screen.getByLabelText(/message/i), 'I love your art!')
    await user.click(screen.getByRole('button', { name: /send/i }))
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/inquire', expect.objectContaining({
        method: 'POST',
      }))
    })
  })
})
