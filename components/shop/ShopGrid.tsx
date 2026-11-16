'use client'

import { useState } from 'react'
import { COLLECTIONS } from '@/lib/collections'
import type { Artwork } from '@/lib/types'
import type { Currency } from '@/lib/prints'
import ShopCard, { CATEGORY_COLORS } from './ShopCard'

type Props = {
  artworks: Artwork[]; kind: 'print' | 'original'; currency: Currency; showFilters?: boolean
  onSelect?: (a: Artwork) => void; selectedId?: string; columns?: string; onExpand?: (a: Artwork) => void
  /** On phones, show only the first six pieces (the page links to the rest). */
  phoneFirstSix?: boolean
}

export default function ShopGrid({ artworks, kind, currency, showFilters = true, onSelect, selectedId, columns, onExpand, phoneFirstSix }: Props) {
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
                  fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: active ? 500 : 300,
                  color: active ? '#1a1014' : '#767676', borderBottom: `2px solid ${active ? color : 'transparent'}`,
                  transition: 'color .2s, border-color .3s',
                }}
              >
                {t.name}
                <span style={{ fontSize: 10, letterSpacing: '.1em', color: '#767676' }}>{String(t.count).padStart(2, '0')}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className={`grid ${columns ?? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-5`}>
        {shown.map((a, i) => {
          const card = <ShopCard key={a.id} artwork={a} kind={kind} currency={currency} collectionName={nameOf(a.collection_slug)} onSelect={onSelect} selected={a.id === selectedId} onExpand={onExpand} />
          return phoneFirstSix && i >= 6 ? <div key={a.id} className="max-sm:hidden">{card}</div> : card
        })}
      </div>
    </>
  )
}
