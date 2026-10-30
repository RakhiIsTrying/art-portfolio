import Link from 'next/link'
import type { Artwork } from '@/lib/types'
import { formatPrice, lowestPrice, type Currency } from '@/lib/prints'
import { useShopSettings } from './ShopSettings'
import ArtFill from '@/components/ArtFill'

export const CATEGORY_COLORS: Record<string, string> = {
  music:     '#7a3040',
  movies:    '#1e3a8a',
  comics:    '#1a6060',
  'bee-ben': '#4a3a7a',
  sketchbook: '#3d4f45',
}

export function inquireHref(artwork: Artwork, kind: 'print' | 'original') {
  const piece = `${kind === 'print' ? 'Print' : 'Original'} — ${artwork.title}`
  return `/inquire?piece=${encodeURIComponent(piece)}`
}

type Props = {
  artwork: Artwork; kind: 'print' | 'original'; currency: Currency; collectionName: string
  /** When set, the card picks this piece instead of linking to the inquiry form */
  onSelect?: (a: Artwork) => void
  selected?: boolean
  /** Shows a ⤢ button that opens the piece full size */
  onExpand?: (a: Artwork) => void
}

export default function ShopCard({ artwork, kind, currency, collectionName, onSelect, selected, onExpand }: Props) {
  const { sizes } = useShopSettings()
  const color = CATEGORY_COLORS[artwork.collection_slug] ?? '#1a1014'

  const inner = (
    <>
      {/* The whole piece; spare space is white, or the art's flat border colour if it has one */}
      <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
        <ArtFill src={artwork.image_url} alt={artwork.title} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px" />
        <span style={{
          position: 'absolute', top: 10, left: 10, fontSize: 8, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500,
          color: '#fff', background: kind === 'original' ? '#1a1014' : color, padding: '4px 7px',
        }}>
          {kind === 'original' ? 'Original · 1/1' : 'Print'}
        </span>
      </div>

      <div style={{ padding: '12px 14px 14px', borderTop: `2px solid ${color}` }}>
        <p style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 9, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 400, color, marginBottom: 5 }}>
          <span>{collectionName}</span>
          <span style={{ color: '#787878', letterSpacing: '.15em', whiteSpace: 'nowrap' }}>
            {kind === 'original' ? 'Price on request' : `From ${formatPrice(lowestPrice(sizes, currency), currency)}`}
          </span>
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
          {onSelect ? (selected ? 'Selected ✓' : 'Choose this piece →') : kind === 'original' ? 'Ask for the price →' : 'Order a print →'}
        </span>
      </div>
    </>
  )

  const box: React.CSSProperties = { display: 'block', width: '100%', background: '#fff', textDecoration: 'none', textAlign: 'left', padding: 0, border: 'none', fontFamily: 'inherit', cursor: 'pointer',
                                     outline: selected ? '3px solid #4a3a7a' : 'none', outlineOffset: -3 }
  const card = onSelect
    ? <button type="button" className="group" onClick={() => onSelect(artwork)} aria-pressed={selected} style={box}>{inner}</button>
    : <Link href={inquireHref(artwork, kind)} className="group" style={box}>{inner}</Link>
  if (!onExpand) return card
  return (
    <div style={{ position: 'relative' }}>
      {card}
      <button type="button" onClick={() => onExpand(artwork)} aria-label={`View ${artwork.title} full size`} title="View full size"
              style={{ position: 'absolute', top: 8, right: 8, width: 30, height: 30, border: 'none', cursor: 'zoom-in', fontSize: 15, lineHeight: '30px',
                       background: 'rgba(255,255,255,.88)', color: '#1a1014', boxShadow: '0 2px 8px rgba(26,16,20,.2)' }}>⤢</button>
    </div>
  )
}
