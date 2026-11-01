'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { track } from '@/lib/analytics/client'

/** Records each page visited, the time spent looking at it and links out of the site. */
export default function PageTracker() {
  const path = usePathname()

  useEffect(() => {
    // Where the visit came from only matters on its first page
    let first = false
    try { first = !sessionStorage.getItem('vgb-seen'); sessionStorage.setItem('vgb-seen', '1') } catch {}
    const params = new URLSearchParams(location.search)
    const utm = Object.fromEntries(['source', 'medium', 'campaign'].flatMap(k => { const v = params.get(`utm_${k}`); return v ? [[k, v]] : [] }))
    track('pageview', { path, referrer: first ? document.referrer : '', utm: first ? utm : undefined })

    // Only time with the page on screen counts
    let shownAt: number | null = Date.now()
    const report = () => {
      if (shownAt === null) return
      const seconds = Math.round((Date.now() - shownAt) / 1000)
      shownAt = null
      if (seconds > 0) track('leave', { path, seconds })
    }
    const onVisibility = () => { if (document.visibilityState === 'hidden') report(); else shownAt ??= Date.now() }
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest?.('a[href^="http"]') as HTMLAnchorElement | null
      if (link && link.hostname !== location.hostname) track('outbound', { path, label: link.hostname.replace(/^www\./, '') })
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', report)
    document.addEventListener('click', onClick)
    return () => {
      report()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', report)
      document.removeEventListener('click', onClick)
    }
  }, [path])

  return null
}
