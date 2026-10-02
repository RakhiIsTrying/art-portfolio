import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Nav from '@/components/Nav'

describe('Nav', () => {
  it('renders all navigation links', () => {
    render(<Nav />)
    expect(screen.getByText('Gallery')).toBeInTheDocument()
    expect(screen.getByText('Videos')).toBeInTheDocument()
    expect(screen.getByText('Puzzles')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Inquire')).toBeInTheDocument()
  })

  it('renders the Inquire link pointing to /inquire', () => {
    render(<Nav />)
    const inquire = screen.getByRole('link', { name: 'Inquire' })
    expect(inquire).toHaveAttribute('href', '/inquire')
  })
})
