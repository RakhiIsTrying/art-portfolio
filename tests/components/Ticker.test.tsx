import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Ticker from '@/components/Ticker'

describe('Ticker', () => {
  it('renders provided text content', () => {
    render(<Ticker text="★ POP ART ✦ DIGITAL" direction="left" variant="rust" />)
    const items = screen.getAllByText(/POP ART/)
    expect(items.length).toBeGreaterThanOrEqual(1)
  })

  it('applies rust background for rust variant', () => {
    const { container } = render(
      <Ticker text="test" direction="left" variant="rust" />
    )
    expect(container.firstChild).toHaveStyle({ background: '#7a3040' })
  })

  it('applies blush background for blush variant', () => {
    const { container } = render(
      <Ticker text="test" direction="right" variant="blush" />
    )
    expect(container.firstChild).toHaveStyle({ background: '#1a1014' })
  })
})
