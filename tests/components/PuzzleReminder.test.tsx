import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import PuzzleReminder from '@/components/puzzles/PuzzleReminder'

beforeEach(() => localStorage.clear())
afterEach(() => { delete window.Capacitor })

const app = (display = 'granted') => {
  const notes = {
    requestPermissions: vi.fn().mockResolvedValue({ display }),
    schedule: vi.fn().mockResolvedValue({}),
    cancel: vi.fn().mockResolvedValue(undefined),
    addListener: vi.fn(),
  }
  window.Capacitor = { isNativePlatform: () => true, Plugins: { LocalNotifications: notes } }
  return notes
}

describe('PuzzleReminder', () => {
  it('is hidden on the website', () => {
    const { container } = render(<PuzzleReminder />)
    expect(container).toBeEmptyDOMElement()
  })

  it('schedules a daily reminder that opens the puzzles', async () => {
    const notes = app()
    render(<PuzzleReminder />)
    fireEvent.change(await screen.findByRole('combobox'), { target: { value: '09:00' } })
    await waitFor(() => expect(notes.schedule).toHaveBeenCalled())
    const sent = notes.schedule.mock.calls[0][0].notifications[0]
    expect(sent.schedule.on).toEqual({ hour: 9, minute: 0 })
    expect(sent.extra).toEqual({ url: '/puzzles' })
    expect(localStorage.getItem('vgb-puzzle-reminder')).toBe('09:00')
    await screen.findByText(/fetch you daily/i)
  })

  it('explains where to switch notifications on when they are refused', async () => {
    const notes = app('denied')
    render(<PuzzleReminder />)
    fireEvent.change(await screen.findByRole('combobox'), { target: { value: '09:00' } })
    await screen.findByText(/settings/i)
    expect(notes.schedule).not.toHaveBeenCalled()
    expect(localStorage.getItem('vgb-puzzle-reminder')).toBeNull()
  })
})
