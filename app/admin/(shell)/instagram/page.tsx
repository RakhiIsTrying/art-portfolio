import { getState, listPending, firstLine } from '@/lib/instagram'
import { COLLECTIONS } from '@/lib/collections'
import { ConnectForm, CheckNow, PendingCard } from '@/components/admin/InstagramReview'

export const dynamic = 'force-dynamic'

export default async function AdminInstagramPage() {
  const [state, pending] = await Promise.all([getState(), listPending()])
  const when = (iso?: string) => iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }) : 'never'

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 py-6 md:px-9 md:py-9" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#b0552f', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 11, letterSpacing: '.45em', textTransform: 'uppercase', color: '#b0552f', marginBottom: 6 }}>New posts</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Instagram</h1>
          <p style={{ fontSize: 13, color: '#787878', marginTop: 8, maxWidth: 640, whiteSpace: 'normal' }}>
            Every night at 11:30 PM (India time) the site checks @van_gone_broke. New posts wait here: give them a title and a home, then publish. Images go to the gallery, reels to the Videos page.
          </p>
        </div>
      </div>

      {/* Connection */}
      <div style={{ background: '#fff', border: '1px solid #d0d0d0', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 12, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014' }}>Connection</h2>
        {state.token ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 24px', fontSize: 13, color: '#1a1014' }}>
            <span style={{ color: '#1a6060' }}>● Connected{state.username ? ` as @${state.username}` : ''}</span>
            <span style={{ color: '#787878' }}>Last check: {when(state.lastRunAt)}</span>
            {state.lastResult && <span style={{ color: state.lastResult.startsWith('Check failed') ? '#7a3040' : '#787878', whiteSpace: 'normal' }}>{state.lastResult}</span>}
            <CheckNow />
          </div>
        ) : (
          <p style={{ fontSize: 13, color: '#7a3040' }}>Not connected yet. Paste an access token below.</p>
        )}
        <details open={!state.token}>
          <summary style={{ cursor: 'pointer', fontSize: 12, color: '#1e3a8a' }}>{state.token ? 'Replace the access token' : 'Connect Instagram'}</summary>
          <ConnectForm />
        </details>
      </div>

      {/* Review queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 12, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 500, color: '#1a1014' }}>
          Waiting for review <span style={{ color: '#a0a0a0' }}>· {pending.length}</span>
        </h2>
        {pending.length === 0 && <p style={{ fontSize: 13, color: '#a0a0a0' }}>Nothing new. New posts show up here the night after you post them.</p>}
        {pending.map(p => (
          <PendingCard key={p.id} post={p} defaultTitle={firstLine(p.caption)} collections={COLLECTIONS.map(c => ({ slug: c.slug, name: c.name }))} />
        ))}
      </div>
    </div>
  )
}
