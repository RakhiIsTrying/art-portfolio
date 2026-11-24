import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import ShareButton from '@/components/ShareButton'

afterEach(() => { delete window.Capacitor; vi.unstubAllGlobals() })

describe('ShareButton', () => {
  it('uses the iPhone share sheet inside the app', async () => {
    const share = vi.fn().mockResolvedValue({})
    window.Capacitor = { isNativePlatform: () => true, Plugins: { Share: { share } } }
    render(<ShareButton title="Koi Pond" path="/gallery/sketchbook?art=1" />)
    fireEvent.click(screen.getByRole('button', { name: /share/i }))
    await waitFor(() => expect(share).toHaveBeenCalledWith(expect.objectContaining({ title: 'Koi Pond', url: 'http://localhost:3000/gallery/sketchbook?art=1' })))
  })

  it('copies the link when there is no share menu', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, share: undefined, clipboard: { writeText } })
    render(<ShareButton title="Koi Pond" path="/gallery/sketchbook?art=1" />)
    fireEvent.click(screen.getByRole('button', { name: /share/i }))
    await screen.findByText(/link copied/i)
    expect(writeText).toHaveBeenCalledWith('http://localhost:3000/gallery/sketchbook?art=1')
  })
})
