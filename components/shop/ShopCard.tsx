import Image from 'next/image'
import Link from 'next/link'
import type { Artwork } from '@/lib/types'

// Sizes offered for prints — edit here to change what the shop lists
export const PRINT_SIZES = ['A5', 'A4', 'A3', 'A2']

export const CATEGORY_COLORS: Record<string, string> = {
  music:     '#7a3040',
  movies:    '#1e3a8a',
  comics:    '#1a6060',
  'bee-ben': '#4a3a7a',
  paper:     '#7a5020',
}

export function inquireHref(artwork: Artwork, kind: 'print' | 'original') {
  const piece = `${kind === 'print' ? 'Print' : 'Original'} — ${artwork.title}`
  return `/inquire?piece=${encodeURIComponent(piece)}`
}

type Props = { artwork: Artwork; kind: 'print' | 'original'; collectionName: string }

export default function ShopCard({ artwork, kind, collectionName }: Props) {
  const color = CATEGORY_COLORS[artwork.collection_slug] ?? '#1a1014'

  return (
    <Link href={inquireHref(artwork, kind)} className="group" style={{ display: 'block', background: '#fff', textDecoration: 'none' }}>
      {/* Mat — the piece sits on paper like a framed print */}
      <div style={{ position: 'relative', aspectRatio: '4/5', background: '#f4f2ef', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '9%', boxShadow: '0 10px 28px rgba(26,16,20,.18), 0 2px 6px rgba(26,16,20,.12)' }}>
          <Image
            src={artwork.image_url}
            alt={artwork.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          />
        </div>
        <span style={{
          position: 'absolute', top: 10, left: 10, fontSize: 8, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500,
          color: '#fff', background: kind === 'original' ? '#1a1014' : color, padding: '4px 7px',
        }}>
          {kind === 'original' ? 'Original · 1/1' : 'Print'}
        </span>
      </div>

      <div style={{ padding: '12px 14px 14px', borderTop: `2px solid ${color}` }}>
        <p style={{ fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 400, color, marginBottom: 5 }}>
          {collectionName}
        </p>
        <p style={{
          fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontStyle: 'italic', fontSize: 18,
          lineHeight: 1.2, color: '#1a1014', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 10,
        }}>
          {artwork.title}
        </p>
        <span
          className="group-hover:[color:#7a3040] group-hover:[border-color:#7a3040]"
          style={{
            fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014',
            borderBottom: '1px solid #1a1014', paddingBottom: 1, transition: 'color .2s, border-color .2s',
          }}
        >
          {kind === 'original' ? 'Inquire about original →' : 'Request a print →'}
        </span>
      </div>
    </Link>
  )
}
