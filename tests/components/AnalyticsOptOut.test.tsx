import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import AnalyticsOptOut from '@/components/AnalyticsOptOut'
import { track } from '@/lib/analytics/client'

describe('AnalyticsOptOut', () => {
  beforeEach(() => localStorage.clear())

  it('turns tracking off, removes the id, and can turn it back on', () => {
    localStorage.setItem('vgb-vid', 'abc')
    render(<AnalyticsOptOut />)
    fireEvent.click(screen.getByRole('button', { name: 'Turn analytics off' }))
    expect(localStorage.getItem('vgb-no-track')).toBe('1')
    expect(localStorage.getItem('vgb-vid')).toBeNull()
    track('pageview', { path: '/' })
    expect(localStorage.getItem('vgb-vid')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Turn analytics on' }))
    expect(localStorage.getItem('vgb-no-track')).toBeNull()
  })
})
