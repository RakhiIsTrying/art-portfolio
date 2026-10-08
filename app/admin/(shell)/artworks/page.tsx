import Image from 'next/image'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import ArtworkUploadForm from '@/components/admin/ArtworkUploadForm'
import { deleteArtwork } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminArtworksPage() {
  const admin = getSupabaseAdminClient()
  const { data: artworks } = await admin
    .from('artworks')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#7a3040', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '7px', letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', marginBottom: 6 }}>Manage</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Artworks</h1>
        </div>
      </div>

      <ArtworkUploadForm />

      {/* Table */}
      <div style={{ border: '1px solid #d0d0d0', background: '#fff' }}>
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
          <h2 style={{ fontSize: '8px', fontWeight: 500, letterSpacing: '.4em', textTransform: 'uppercase', color: '#1a1014' }}>
            All Artworks
          </h2>
          <span style={{ fontSize: '7px', fontWeight: 300, letterSpacing: '.2em', color: '#a0a0a0' }}>
            {artworks?.length ?? 0} total
          </span>
        </div>

        {!artworks?.length && (
          <p style={{ padding: '20px', fontSize: '8px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0' }}>
            No artworks yet — upload one above.
          </p>
        )}

        <div>
          {artworks?.map((art, i) => (
            <div key={art.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', borderBottom: i < artworks.length - 1 ? '1px solid #ebebeb' : 'none' }}>
              <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0, background: '#e6e6e6', overflow: 'hidden' }}>
                <Image src={art.image_url} alt={art.title} fill className="object-cover" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '11px', fontWeight: 500, color: '#1a1014', letterSpacing: '.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                  {art.title}
                </p>
                <p style={{ fontSize: '7px', letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0' }}>
                  {art.collection_slug}{art.medium && ` · ${art.medium}`}{art.year && ` · ${art.year}`}{art.featured && ' · Featured'}
                </p>
              </div>
              <form action={deleteArtwork.bind(null, art.id)}>
                <button type="submit" style={{ fontSize: '7px', letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 400, color: '#7a3040', background: 'none', border: '1px solid #7a3040', padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
