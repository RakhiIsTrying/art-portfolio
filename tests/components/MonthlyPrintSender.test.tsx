import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MonthlyPrintSender from '@/components/admin/MonthlyPrintSender'

vi.mock('@/lib/supabase/client', () => ({ getSupabaseBrowserClient: () => ({}) }))
vi.mock('@/app/admin/(shell)/print-club/actions', () => ({ createPrintUploadUrl: vi.fn(), sendMonthlyPrint: vi.fn() }))

const pickFile = (container: HTMLElement) =>
  fireEvent.change(container.querySelector('input[type=file]')!, { target: { files: [new File(['x'], 'print.pdf', { type: 'application/pdf' })] } })

describe('MonthlyPrintSender', () => {
  it('shows WIP and can’t send until emails are switched on', () => {
    const { container } = render(<MonthlyPrintSender ready={false} members={3} />)
    expect(screen.getByText('WIP')).toBeInTheDocument()
    pickFile(container)
    expect(screen.getByRole('button', { name: 'Send to members' })).toBeDisabled()
  })

  it('needs a file and members, and asks once before sending', () => {
    const { container } = render(<MonthlyPrintSender ready members={3} />)
    expect(screen.getByRole('button', { name: 'Send to members' })).toBeDisabled()
    pickFile(container)
    fireEvent.click(screen.getByRole('button', { name: 'Send to members' }))
    expect(screen.getByRole('button', { name: 'Yes, email 3 members' })).toBeEnabled()
  })
})
