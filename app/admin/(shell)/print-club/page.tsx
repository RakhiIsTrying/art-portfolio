import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { PLANS, type PlanId } from '@/lib/printClub'

export const dynamic = 'force-dynamic'

const formatBirthday = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

/** Days from today until the next occurrence of this birthday (0 = today). */
function daysUntilBirthday(iso: string, now = new Date()) {
  const [, m, d] = iso.split('-').map(Number)
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  let next = Date.UTC(now.getFullYear(), m - 1, d)
  if (next < today) next = Date.UTC(now.getFullYear() + 1, m - 1, d)
  return Math.round((next - today) / 86_400_000)
}

export default async function AdminPrintClubPage() {
  const admin = getSupabaseAdminClient()
  const { data: signups } = await admin
    .from('print_club_signups')
    .select('*')
    .order('created_at', { ascending: false })

  const upcoming = (signups ?? [])
    .filter(s => s.birthday)
    .map(s => ({ ...s, inDays: daysUntilBirthday(s.birthday) }))
    .filter(s => s.inDays <= 30)
    .sort((a, b) => a.inDays - b.inDays)

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

      {/* Upcoming birthdays */}
      <div style={{ border: '1px solid #d0d0d0', background: '#fff' }}>
        <div style={{ padding: '10px 20px', borderBottom: '1px solid #d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
          <h2 style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.4em', textTransform: 'uppercase', color: '#1a1014' }}>
            🎂 Upcoming birthdays
          </h2>
          <span style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.2em', color: '#a0a0a0' }}>next 30 days</span>
        </div>
        {upcoming.length === 0 ? (
          <p style={{ padding: '16px 20px', fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 300, color: '#a0a0a0' }}>
            None coming up.
          </p>
        ) : upcoming.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '10px 20px', borderBottom: i < upcoming.length - 1 ? '1px solid #ebebeb' : 'none' }}>
            <span style={{ width: 70, flexShrink: 0, fontSize: 12, fontWeight: 500, color: '#7a3040' }}>{formatBirthday(s.birthday)}</span>
            <span style={{ flex: 1, fontSize: 13, color: '#1a1014' }}>{s.name}</span>
            <a href={`mailto:${s.email}?subject=${encodeURIComponent('Happy birthday! 🎂')}`} style={{ fontSize: 11, color: '#1e3a8a' }}>{s.email}</a>
            <span style={{ width: 70, textAlign: 'right', fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: s.inDays === 0 ? '#7a3040' : '#a0a0a0', fontWeight: s.inDays === 0 ? 500 : 300 }}>
              {s.inDays === 0 ? 'Today' : `in ${s.inDays}d`}
            </span>
          </div>
        ))}
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
                {s.name}
                {PLANS[s.plan as PlanId] && (
                  <span style={{ marginLeft: 10, fontSize: 10, letterSpacing: '.2em', fontWeight: 400, color: '#4a3a7a' }}>
                    {PLANS[s.plan as PlanId].price} / mo
                  </span>
                )}
              </p>
              <p style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 11, letterSpacing: '.05em', fontWeight: 300 }}>
                <a href={`mailto:${s.email}`} style={{ color: '#1e3a8a' }}>{s.email}</a>
                <a href={`tel:${s.phone}`} style={{ color: '#1e3a8a' }}>{s.phone}</a>
                {s.birthday && <span style={{ color: '#787878' }}>🎂 {formatBirthday(s.birthday)}</span>}
              </p>
              <p style={{ fontSize: 12, lineHeight: 1.6, fontWeight: 300, color: '#1a1014', marginTop: 6 }}>
                {[s.address_line1, s.address_line2].filter(Boolean).join(', ')}<br />
                {[s.city, s.region, s.postal_code].filter(Boolean).join(', ')} · {s.country}
              </p>
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
