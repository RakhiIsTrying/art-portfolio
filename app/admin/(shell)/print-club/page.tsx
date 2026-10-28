import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function AdminPrintClubPage() {
  const admin = getSupabaseAdminClient()
  const { data: signups } = await admin
    .from('print_club_signups')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#4a3a7a', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#4a3a7a', marginBottom: 6 }}>Members</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Print Club</h1>
        </div>
      </div>

      <div style={{ border: '1px solid #d0d0d0', background: '#fff' }}>
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
          <h2 style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.4em', textTransform: 'uppercase', color: '#1a1014' }}>
            Sign-ups
          </h2>
          <span style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.2em', color: '#a0a0a0' }}>
            {signups?.length ?? 0} total
          </span>
        </div>

        {!signups?.length && (
          <p style={{ padding: '20px', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0' }}>
            No sign-ups yet.
          </p>
        )}

        {signups?.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '12px 20px', borderBottom: i < signups.length - 1 ? '1px solid #ebebeb' : 'none' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1014', marginBottom: 3 }}>
                {s.name} <span style={{ fontWeight: 300, color: '#787878' }}>· {s.country}</span>
              </p>
              <a href={`mailto:${s.email}`} style={{ fontSize: 11, letterSpacing: '.05em', fontWeight: 300, color: '#1e3a8a' }}>{s.email}</a>
              {s.note && <p style={{ fontSize: 12, fontWeight: 300, color: '#787878', marginTop: 6 }}>{s.note}</p>}
            </div>
            <span style={{ flexShrink: 0, fontSize: 10, letterSpacing: '.2em', fontWeight: 300, color: '#a0a0a0' }}>
              {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}
