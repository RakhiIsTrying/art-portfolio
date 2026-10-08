'use client'
import { useState } from 'react'
import ArtworkCard from '@/components/ArtworkCard'
import Lightbox from '@/components/Lightbox'
import type { Artwork } from '@/lib/types'

type Props = { artworks: Artwork[] }

export default function FeaturedGrid({ artworks }: Props) {
  const [selected, setSelected] = useState<Artwork | null>(null)
  if (!artworks.length) return null

  const [hero, ...rest] = artworks
  const row1 = rest.slice(0, 2)   // 2 medium beside the hero
  const row2 = rest.slice(2, 5)   // 3 across the bottom

  return (
    <>
      <div style={{ display: 'grid', gridTemplateRows: 'auto auto', borderBottom: '1px solid #d0d0d0' }}>

        {/* Row 1: 1 large left + 2 medium right */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', borderBottom: '1px solid #d0d0d0', minHeight: 420 }}>

          {/* Hero artwork */}
          <div style={{ position: 'relative', borderRight: '1px solid #d0d0d0' }}>
            <ArtworkCard artwork={hero} onClick={setSelected} />
          </div>

          {/* 2 stacked mediums */}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr' }}>
            {row1.map((artwork, i) => (
              <div key={artwork.id} style={{ position: 'relative', borderBottom: i === 0 ? '1px solid #d0d0d0' : 'none' }}>
                <ArtworkCard artwork={artwork} onClick={setSelected} />
              </div>
            ))}
            {/* Fill empty slots */}
            {Array.from({ length: Math.max(0, 2 - row1.length) }).map((_, i) => (
              <div key={`empty-${i}`} style={{ background: '#e0e0e0', borderBottom: i === 0 ? '1px solid #d0d0d0' : 'none' }} />
            ))}
          </div>
        </div>

        {/* Row 2: 3 equal across the bottom */}
        {row2.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', minHeight: 260 }}>
            {row2.map((artwork, i) => (
              <div key={artwork.id} style={{ position: 'relative', borderRight: i < 2 ? '1px solid #d0d0d0' : 'none' }}>
                <ArtworkCard artwork={artwork} onClick={setSelected} />
              </div>
            ))}
            {Array.from({ length: Math.max(0, 3 - row2.length) }).map((_, i) => (
              <div key={`empty2-${i}`} style={{ background: '#e0e0e0', borderRight: i < 1 ? '1px solid #d0d0d0' : 'none' }} />
            ))}
          </div>
        )}

      </div>

      {selected && (
        <Lightbox artwork={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
