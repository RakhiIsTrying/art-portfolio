import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import OriginalChoice from '@/components/shop/OriginalChoice'
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

const show = (a: Artwork) => {
  render(<OriginalChoice artwork={a}>{open => <button type="button" onClick={open}>Open {a.title}</button>}</OriginalChoice>)
  fireEvent.click(screen.getByRole('button', { name: 'Open Koi Pond' }))
}

describe('OriginalChoice', () => {
  it('opens the piece big, with the ask and shop call-outs', () => {
    show(art)
    expect(screen.getByRole('dialog', { name: 'Koi Pond' })).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Koi Pond')
    expect(screen.getByRole('link', { name: /ask about the original/i })).toHaveAttribute('href', '/inquire?piece=Original%3A%20Koi%20Pond')
    expect(screen.getByRole('link', { name: /shop prints & cards/i })).toHaveAttribute('href', '/shop?piece=Koi%20Pond#prints')
  })

  it('leaves out the prints call-out when prints are off', () => {
    show({ ...art, prints_available: false })
    expect(screen.getByRole('link', { name: /ask about the original/i })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /shop prints/i })).toBeNull()
  })

  it('closes on Esc and on Close', () => {
    show(art)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Open Koi Pond' }))
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
