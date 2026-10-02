'use client'
import Image from 'next/image'
import Link from 'next/link'
import type { Artwork } from '@/lib/types'

type Props = {
  artwork: Artwork
  onClose: () => void
}

export default function Lightbox({ artwork, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream border-4 border-ink max-w-2xl w-full
                   shadow-[8px_8px_0_#b04a33] overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative aspect-square w-full">
          <Image
            src={artwork.image_url}
            alt={artwork.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>

        <div className="p-5 border-t-4 border-ink flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rust mb-1">
              {artwork.collection_slug}
              {artwork.medium && ` · ${artwork.medium}`}
              {artwork.year && ` · ${artwork.year}`}
            </p>
            <h2 className="text-lg font-black uppercase tracking-wide text-ink">
              {artwork.title}
            </h2>
          </div>

          <Link
            href={`/inquire?piece=${encodeURIComponent(artwork.title)}`}
            className="shrink-0 text-[9px] font-black uppercase tracking-widest
                       bg-rust text-cream px-4 py-2 border-2 border-ink
                       shadow-[3px_3px_0_#1f1f1f]
                       hover:translate-x-0.5 hover:translate-y-0.5
                       hover:shadow-[1px_1px_0_#1f1f1f] transition-all"
          >
            Inquire →
          </Link>
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 bg-ink text-cream
                     font-black text-sm flex items-center justify-center
                     border-2 border-ink hover:bg-rust transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
