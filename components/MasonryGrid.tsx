'use client'
import { useState } from 'react'
import ArtworkCard from '@/components/ArtworkCard'
import Lightbox from '@/components/Lightbox'
import type { Artwork } from '@/lib/types'

type Props = { artworks: Artwork[] }

export default function MasonryGrid({ artworks }: Props) {
  const [selected, setSelected] = useState<Artwork | null>(null)

  const columns: Artwork[][] = [[], [], []]
  artworks.forEach((art, i) => columns[i % 3].push(art))

  return (
    <>
      <div className="grid grid-cols-3 gap-0 border-4 border-ink">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col border-r-4 border-ink last:border-r-0">
            {col.map(art => (
              <ArtworkCard key={art.id} artwork={art} onClick={setSelected} />
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
