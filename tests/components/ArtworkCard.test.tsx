import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ArtworkCard from '@/components/ArtworkCard'
import type { Artwork } from '@/lib/types'

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

const mockArtwork: Artwork = {
  id: '1',
  title: 'Test Piece',
  collection_slug: 'music',
  image_url: 'https://example.com/image.jpg',
  medium: 'Digital',
  year: 2024,
  featured: true,
  featured_order: 1,
  created_at: '2024-01-01T00:00:00Z',
}

describe('ArtworkCard', () => {
  it('renders artwork image with alt text', () => {
    render(<ArtworkCard artwork={mockArtwork} onClick={() => {}} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', 'Test Piece')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<ArtworkCard artwork={mockArtwork} onClick={onClick} />)
    fireEvent.click(screen.getByRole('img').closest('div')!)
    expect(onClick).toHaveBeenCalledWith(mockArtwork)
  })
})
