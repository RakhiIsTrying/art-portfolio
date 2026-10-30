import { listSkipped, firstLine } from '@/lib/instagram'
import { COLLECTIONS } from '@/lib/collections'
import { PendingCard } from '@/components/admin/InstagramReview'

export const dynamic = 'force-dynamic'

export default async function AdminSkippedPage() {
  const skipped = await listSkipped()
  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 py-6 md:px-9 md:py-9" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#b0552f', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 11, letterSpacing: '.45em', textTransform: 'uppercase', color: '#b0552f', marginBottom: 6 }}>Instagram</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Skipped posts</h1>
          <p style={{ fontSize: 13, color: '#787878', marginTop: 8, maxWidth: 640, whiteSpace: 'normal' }}>
            Posts you skipped in review. They’re not on the site, but you can publish any of them here whenever you like, or delete them for good.
          </p>
        </div>
      </div>
      <h2 style={{ fontSize: 12, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014' }}>
        Skipped <span style={{ color: '#a0a0a0' }}>· {skipped.length}</span>
      </h2>
      {skipped.length === 0 && <p style={{ fontSize: 13, color: '#a0a0a0' }}>Nothing skipped. Posts you skip in Admin → Instagram show up here.</p>}
      {skipped.map(p => (
        <PendingCard key={p.id} post={p} defaultTitle={firstLine(p.caption)} collections={COLLECTIONS.map(c => ({ slug: c.slug, name: c.name }))} skipped />
      ))}
    </div>
  )
}
