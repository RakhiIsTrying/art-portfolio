'use client'
import Image from 'next/image'
import type { Artwork } from '@/lib/types'

type Props = {
  artwork: Artwork
  onClick: (artwork: Artwork) => void
}

export default function ArtworkCard({ artwork, onClick }: Props) {
  return (
    <div
      className="relative aspect-square overflow-hidden cursor-pointer group
                 border-r-[3px] border-b-[3px] border-ink"
      onClick={() => onClick(artwork)}
    >
      <Image
        src={artwork.image_url}
        alt={artwork.title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-[1.07]"
        sizes="(max-width: 768px) 33vw, 25vw"
      />
      <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-all duration-300
                      flex items-end p-3">
        <span className="text-[8px] font-black uppercase tracking-widest
                         bg-cream text-ink px-2 py-0.5 rounded-sm border-2 border-ink
                         opacity-0 translate-y-2 group-hover:opacity-100
                         group-hover:translate-y-0 transition-all duration-200">
          {artwork.collection_slug}
        </span>
      </div>
    </div>
  )
}
