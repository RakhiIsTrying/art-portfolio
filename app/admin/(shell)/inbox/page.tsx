import { listInbox, SUBJECT_PREFIX } from '@/lib/notify'

export const dynamic = 'force-dynamic'

const KIND_COLOR: Record<string, string> = { Inquiry: '#1e3a8a', 'Print order': '#a0521d', 'Print Club': '#4a3a7a' }

export default async function AdminInboxPage() {
  const messages = await listInbox()
  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 py-6 md:px-9 md:py-9" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#1e3a8a', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 11, letterSpacing: '.45em', textTransform: 'uppercase', color: '#1e3a8a', marginBottom: 6 }}>Messages</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Inbox</h1>
          <p style={{ fontSize: 12, fontWeight: 300, color: '#787878', marginTop: 8 }}>
            Every inquiry, print order and Print Club sign-up, newest first. Each is also emailed to you with a subject starting “{SUBJECT_PREFIX}:”.
          </p>
        </div>
      </div>
      {!messages.length && <p style={{ fontSize: 12, color: '#a0a0a0' }}>No messages yet.</p>}
      {messages.map((m, i) => (
        <article key={i} style={{ background: '#fff', border: '1px solid #d0d0d0', borderLeft: `4px solid ${KIND_COLOR[m.kind] ?? '#1a1014'}`, padding: '14px 18px' }}>
          <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 12px', marginBottom: 8 }}>
            <span style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', color: '#fff', background: KIND_COLOR[m.kind] ?? '#1a1014', padding: '3px 7px' }}>{m.kind}</span>
            <strong style={{ fontSize: 14, color: '#1a1014' }}>{m.subject}</strong>
            <span style={{ fontSize: 12, color: '#a0a0a0' }}>{new Date(m.at).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
            {!m.emailed && <span style={{ fontSize: 11, color: '#7a3040' }}>· email not sent</span>}
          </header>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6, color: '#3a3a3a', margin: 0 }}>{m.text}</pre>
          {m.from && <a href={`mailto:${m.from}`} style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: '#1e3a8a' }}>Reply to {m.from} →</a>}
        </article>
      ))}
    </div>
  )
}
