'use client'
import { useState } from 'react'
import ArtworkCard from '@/components/ArtworkCard'
import Lightbox from '@/components/Lightbox'
import type { Artwork } from '@/lib/types'

type Props = { artworks: Artwork[] }

export default function FeaturedGrid({ artworks }: Props) {
  const [selected, setSelected] = useState<Artwork | null>(null)
  const cells = artworks.slice(0, 9)

  return (
    <>
      <div className="grid grid-cols-3 border-b-4 border-ink">
        {cells.map((artwork) => (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            onClick={setSelected}
          />
        ))}
      </div>

      {selected && (
        <Lightbox artwork={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
