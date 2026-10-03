import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import FeaturedPicker from '@/components/admin/FeaturedPicker'

export const dynamic = 'force-dynamic'

export default async function AdminFeaturedPage() {
  const admin = getSupabaseAdminClient()
  const { data: artworks } = await admin
    .from('artworks')
    .select('*')
    .order('title', { ascending: true })

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-widest text-ink">
          ⭐ Featured Grid
        </h1>
        <p className="text-xs font-black uppercase tracking-widest text-rose mt-1">
          Select up to 9 artworks to show on the homepage
        </p>
      </div>

      <FeaturedPicker artworks={artworks ?? []} />
    </div>
  )
}
