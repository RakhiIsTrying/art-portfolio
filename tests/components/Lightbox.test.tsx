import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Lightbox from '@/components/Lightbox'
import type { Artwork } from '@/lib/types'

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

const art: Artwork = {
  id: '1', title: 'Koi Pond', collection_slug: 'sketchbook', image_url: 'https://example.com/koi.jpg',
  medium: 'Pencil', year: 2026, featured: false, featured_order: null, instagram_url: null,
  prints_available: true, original_available: true, created_at: '2026-01-01T00:00:00Z',
}

describe('Lightbox', () => {
  it('shows the art with its name and both ways to buy', () => {
    render(<Lightbox artwork={art} onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: 'Koi Pond' })).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Koi Pond')
    expect(screen.getByRole('link', { name: /buy the original/i })).toHaveAttribute('href', '/inquire?piece=Original%3A%20Koi%20Pond')
    expect(screen.getByRole('link', { name: /get a print/i })).toHaveAttribute('href', '/inquire?piece=Print%3A%20Koi%20Pond')
  })

  it('says display only when nothing is for sale', () => {
    render(<Lightbox artwork={{ ...art, prints_available: false, original_available: false }} onClose={() => {}} />)
    expect(screen.getByText(/display only/i)).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('closes on Esc, on Close and on a click outside, but not on the art', () => {
    const onClose = vi.fn()
    render(<Lightbox artwork={art} onClose={onClose} />)
    fireEvent.click(screen.getByRole('img'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).toHaveBeenCalledTimes(3)
  })
})
