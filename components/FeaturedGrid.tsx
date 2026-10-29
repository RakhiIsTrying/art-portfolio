'use client'
import { useEffect, useRef, useState } from 'react'
import ArtworkCard from '@/components/ArtworkCard'
import Lightbox from '@/components/Lightbox'
import { useAspects } from '@/lib/useAspects'
import type { Artwork } from '@/lib/types'

type Props = { artworks: Artwork[] }

const GAP = 1

/**
 * Collage that follows each artwork's real shape: pieces are packed into rows
 * that fill the full width, so nothing is cropped and no space is left empty.
 */
function packRows(items: { art: Artwork; aspect: number }[], width: number, target: number) {
  // How many rows make pieces roughly the target height, then split them so each row is balanced
  const total = items.reduce((s, i) => s + i.aspect, 0)
  const count = Math.max(1, Math.min(items.length, Math.round((total * target) / width)))
  const rows: { items: typeof items; height: number }[] = []
  let row: typeof items = []
  let sum = 0
  let done = 0
  for (const [i, item] of items.entries()) {
    row.push(item); sum += item.aspect
    const remainingRows = count - rows.length - 1
    const boundary = (total / count) * (rows.length + 1)
    const next = items[i + 1]
    // Close the row when adding the next piece would overshoot this row's share more than stopping here
    const closeHere = next && remainingRows > 0 &&
      Math.abs(done + sum - boundary) <= Math.abs(done + sum + next.aspect - boundary) &&
      items.length - i - 1 >= remainingRows
    if (closeHere || !next) {
      rows.push({ items: row, height: (width - GAP * (row.length - 1)) / sum })
      done += sum; row = []; sum = 0
    }
  }
  return rows
}

export default function FeaturedGrid({ artworks }: Props) {
  const [selected, setSelected] = useState<Artwork | null>(null)
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const aspects = useAspects(artworks.map(a => a.image_url))

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!artworks.length) return null

  const target = width < 640 ? 170 : width < 1100 ? 260 : 320
  const rows = width ? packRows(artworks.map(art => ({ art, aspect: aspects[art.image_url] ?? .8 })), width, target) : []

  return (
    <>
      <div ref={ref} style={{ background: '#d0d0d0', borderBottom: '1px solid #d0d0d0', display: 'flex', flexDirection: 'column', gap: GAP, minHeight: width ? undefined : 420 }}>
        {rows.map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: GAP, height: row.height }}>
            {row.items.map(({ art, aspect }) => (
              <div key={art.id} style={{ position: 'relative', width: aspect * row.height, flexShrink: 1, minWidth: 0, transition: 'width .3s, height .3s' }}>
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
