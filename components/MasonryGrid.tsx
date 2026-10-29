'use client'
import { useState } from 'react'
import ArtworkCard from '@/components/ArtworkCard'
import Lightbox from '@/components/Lightbox'
import type { Artwork } from '@/lib/types'

type Props = { artworks: Artwork[]; initialId?: string }

export default function MasonryGrid({ artworks, initialId }: Props) {
  // ?art=<id> opens that piece straight away (links from Club Boxes)
  const [selected, setSelected] = useState<Artwork | null>(() => artworks.find(a => a.id === initialId) ?? null)

  const columns: Artwork[][] = [[], [], []]
  artworks.forEach((art, i) => columns[i % 3].push(art))

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: '#d0d0d0', border: '1px solid #d0d0d0' }}>
        {columns.map((col, ci) => (
          <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#d0d0d0' }}>
            {col.map(art => (
              <div key={art.id} style={{ position: 'relative', aspectRatio: '1' }}>
                <ArtworkCard artwork={art} onClick={setSelected} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {selected && (
        <Lightbox artwork={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
