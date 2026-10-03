'use client'
import Image from 'next/image'
import { useTransition } from 'react'
import { toggleFeatured } from '@/app/admin/(shell)/featured/actions'
import type { Artwork } from '@/lib/types'

export default function FeaturedPicker({ artworks }: { artworks: Artwork[] }) {
  const [pending, startTransition] = useTransition()

  function handleToggle(artwork: Artwork) {
    startTransition(() => {
      toggleFeatured(artwork.id, artwork.featured)
    })
  }

  const featured = artworks
    .filter(a => a.featured)
    .sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0))

  const unfeatured = artworks.filter(a => !a.featured)

  return (
    <div className="flex flex-col gap-6">
      <div className="border-4 border-rust shadow-[4px_4px_0_#b04a33]">
        <div className="bg-rust px-5 py-3 border-b-4 border-ink">
          <h2 className="text-sm font-black uppercase tracking-widest text-cream">
            Featured ({featured.length}/9) — shown on homepage
          </h2>
        </div>
        {featured.length === 0 && (
          <p className="p-5 font-black text-xs uppercase tracking-widest text-rose">
            No featured artworks. Click artworks below to add them.
          </p>
        )}
        <div className="grid grid-cols-3 gap-0">
          {featured.map(art => (
            <button
              key={art.id}
              onClick={() => handleToggle(art)}
              disabled={pending}
              className="relative aspect-square border-2 border-ink overflow-hidden
                         hover:opacity-80 transition-opacity disabled:cursor-not-allowed group"
              title={`Remove "${art.title}" from featured`}
            >
              <Image src={art.image_url} alt={art.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors" />
              <span className="absolute top-1 left-1 bg-rust text-cream text-[9px] font-black px-1.5 py-0.5 border border-ink">
                {art.featured_order}
              </span>
              <span className="absolute bottom-0 left-0 right-0 bg-ink/80 text-cream text-[8px] font-black uppercase tracking-widest px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                ✕ Remove
              </span>
            </button>
          ))}
          {Array.from({ length: 9 - featured.length }).map((_, i) => (
            <div
              key={i}
              className="aspect-square border-2 border-ink bg-blush/20 flex items-center justify-center"
            >
              <span className="text-blush font-black text-xl">+</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-4 border-ink">
        <div className="bg-ink px-5 py-3 border-b-4 border-ink">
          <h2 className="text-sm font-black uppercase tracking-widest text-cream">
            All Artworks — click to add to featured
          </h2>
        </div>
        {unfeatured.length === 0 && featured.length > 0 && (
          <p className="p-5 font-black text-xs uppercase tracking-widest text-rose">
            All artworks are featured.
          </p>
        )}
        {unfeatured.length === 0 && featured.length === 0 && (
          <p className="p-5 font-black text-xs uppercase tracking-widest text-rose">
            No artworks uploaded yet. Upload some in the Artworks section.
          </p>
        )}
        <div className="grid grid-cols-4 gap-0">
          {unfeatured.map(art => (
            <button
              key={art.id}
              onClick={() => handleToggle(art)}
              disabled={pending || featured.length >= 9}
              className="relative aspect-square border border-ink overflow-hidden
                         hover:opacity-80 transition-opacity disabled:cursor-not-allowed group"
              title={`Feature "${art.title}"`}
            >
              <Image src={art.image_url} alt={art.title} fill className="object-cover" />
              <span className="absolute bottom-0 left-0 right-0 bg-ink/80 text-cream text-[8px] font-black uppercase tracking-widest px-1 py-0.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                + Feature
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
