import Link from 'next/link'
import { COLLECTIONS } from '@/lib/collections'

const dotColors = ['bg-rust', 'bg-rose', 'bg-ink', 'bg-rust', 'bg-blush']

export default function CollectionsStrip() {
  return (
    <div className="grid grid-cols-5 border-b-4 border-ink">
      {COLLECTIONS.map((col, i) => (
        <Link
          key={col.slug}
          href={`/gallery/${col.slug}`}
          className="flex flex-col items-center gap-1.5 py-4 px-2 text-center
                     border-r-[3px] border-ink last:border-r-0
                     bg-cream hover:bg-blush transition-colors"
        >
          <span className="text-2xl">{col.icon_emoji}</span>
          <span className="text-[8px] font-black uppercase tracking-tight text-ink leading-tight">
            {col.name}
          </span>
          <span className={`w-2 h-2 rounded-full border-2 border-ink ${dotColors[i]}`} />
        </Link>
      ))}
    </div>
  )
}
