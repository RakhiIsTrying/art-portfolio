'use client'

import { useState } from 'react'
import { COLLECTIONS } from '@/lib/collections'
import type { Artwork } from '@/lib/types'
import ShopCard, { CATEGORY_COLORS } from './ShopCard'

type Props = { artworks: Artwork[]; kind: 'print' | 'original'; showFilters?: boolean }

export default function ShopGrid({ artworks, kind, showFilters = true }: Props) {
  const [filter, setFilter] = useState('all')

  const tabs = COLLECTIONS
    .map(c => ({ ...c, count: artworks.filter(a => a.collection_slug === c.slug).length }))
    .filter(c => c.count > 0)
  const shown = filter === 'all' ? artworks : artworks.filter(a => a.collection_slug === filter)
  const nameOf = (slug: string) => COLLECTIONS.find(c => c.slug === slug)?.name ?? slug

  return (
    <>
      {showFilters && tabs.length > 1 && (
        <div role="tablist" aria-label="Filter by collection" className="no-scrollbar"
          style={{ display: 'flex', gap: 24, overflowX: 'auto', borderBottom: '1px solid #d0d0d0', marginBottom: 18 }}>
          {[{ slug: 'all', name: 'All', count: artworks.length }, ...tabs].map(t => {
            const active = filter === t.slug
            const color = CATEGORY_COLORS[t.slug] ?? '#1a1014'
            return (
              <button
                key={t.slug}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(t.slug)}
                className="hover:[color:#1a1014]"
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap',
                  padding: '10px 0 11px', marginBottom: -1, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: active ? 500 : 300,
                  color: active ? '#1a1014' : '#a0a0a0', borderBottom: `2px solid ${active ? color : 'transparent'}`,
                  transition: 'color .2s, border-color .3s',
                }}
              >
                {t.name}
                <span style={{ fontSize: 9, letterSpacing: '.1em', color: '#a0a0a0' }}>{String(t.count).padStart(2, '0')}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {shown.map(a => (
          <ShopCard key={a.id} artwork={a} kind={kind} collectionName={nameOf(a.collection_slug)} />
        ))}
      </div>
    </>
  )
}
