'use client'
import Image from 'next/image'
import type { Artwork } from '@/lib/types'

const categoryColors: Record<string, string> = {
  music:    '#7a3040',
  movies:   '#1e3a8a',
  comics:   '#1a6060',
  'bee-ben':'#4a3a7a',
  paper:    '#7a5020',
}

type Props = {
  artwork: Artwork
  onClick: (artwork: Artwork) => void
  size?: 'large' | 'medium' | 'small'
}

export default function ArtworkCard({ artwork, onClick, size = 'medium' }: Props) {
  const color = categoryColors[artwork.collection_slug] ?? '#1a1014'

  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', background: '#1a1014' }}
      onClick={() => onClick(artwork)}
      className="group"
    >
      <Image
        src={artwork.image_url}
        alt={artwork.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      {/* Dark overlay on hover */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(26,16,20,0)', transition: 'background .3s' }}
        className="group-hover:[background:rgba(26,16,20,0.55)]"
      />

      {/* Category colour bar — bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
        background: color,
        transform: 'translateY(100%)',
        transition: 'transform .3s',
      }} className="group-hover:[transform:translateY(0)]" />

      {/* Title + category — revealed on hover */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, right: 12,
        opacity: 0, transform: 'translateY(6px)',
        transition: 'opacity .25s, transform .25s',
      }} className="group-hover:[opacity:1] group-hover:[transform:translateY(0)]">
        <p style={{
          fontSize: '7px', letterSpacing: '.4em', textTransform: 'uppercase', fontWeight: 400,
          color: 'rgba(255,255,255,.55)', marginBottom: 4,
        }}>
          {artwork.collection_slug}
        </p>
        <p style={{
          fontSize: '10px', fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)',
          fontStyle: 'italic', fontWeight: 400, color: '#fff', lineHeight: 1.2,
        }}>
          {artwork.title}
        </p>
      </div>

      {/* Series dot top-right */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        width: 6, height: 6, borderRadius: '50%', background: color,
        boxShadow: `0 0 8px ${color}99`,
      }} />
    </div>
  )
}
