'use client'
import { useActionState, useState, useTransition } from 'react'
import { checkNow, connectInstagram, deleteSkippedPost, publishPost, skipPost, type Sale } from '@/app/admin/(shell)/instagram/actions'
import type { PendingPost } from '@/lib/instagram'
import { VIDEO_CATEGORIES } from '@/lib/collections'

const input: React.CSSProperties = { border: '1px solid #d0d0d0', background: '#fff', padding: '7px 10px', fontSize: 13, color: '#1a1014', fontFamily: 'inherit', width: '100%' }
const btn = (dark = false): React.CSSProperties => ({ fontSize: 11, letterSpacing: '.25em', textTransform: 'uppercase', padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit',
  border: '1px solid #1a1014', background: dark ? '#1a1014' : '#fff', color: dark ? '#fff' : '#1a1014', whiteSpace: 'nowrap' })
const SALES: { value: Sale; label: string }[] = [
  { value: 'display', label: 'Display only (not for sale)' },
  { value: 'prints', label: 'Prints only' },
  { value: 'both', label: 'Prints + original for sale' },
  { value: 'original', label: 'Original for sale only' },
]

export function ConnectForm() {
  const [state, action, pending] = useActionState(connectInstagram, null)
  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
      <ol style={{ fontSize: 12, lineHeight: 1.7, color: '#787878', paddingLeft: 18, whiteSpace: 'normal' }}>
        <li>Open developers.facebook.com → My Apps → Create app → “Other” → “Business”.</li>
        <li>Add the <b>Instagram</b> product → “API setup with Instagram login”.</li>
        <li>Under “Generate access tokens”, add @van_gone_broke, sign in, then click <b>Generate token</b> and copy it.</li>
        <li>Paste it here. The site keeps it private and renews it automatically.</li>
      </ol>
      <textarea name="token" rows={3} placeholder="Paste the access token" style={{ ...input, fontFamily: 'monospace', fontSize: 12 }} autoComplete="off" spellCheck={false} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button type="submit" disabled={pending} style={{ ...btn(true), opacity: pending ? .5 : 1 }}>{pending ? 'Connecting…' : 'Connect'}</button>
        {state?.error && <span role="alert" style={{ fontSize: 12, color: '#7a3040', whiteSpace: 'normal' }}>{state.error}</span>}
        {state?.ok && <span role="status" style={{ fontSize: 12, color: '#1a6060', whiteSpace: 'normal' }}>{state.ok}</span>}
      </div>
    </form>
  )
}

export function CheckNow() {
  const [pending, start] = useTransition()
  const [note, setNote] = useState<string | null>(null)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <button type="button" disabled={pending} onClick={() => start(async () => setNote(await checkNow()))} style={{ ...btn(), opacity: pending ? .5 : 1 }}>
        {pending ? 'Checking…' : 'Check now'}
      </button>
      {note && <span style={{ fontSize: 12, color: '#787878' }}>{note}</span>}
    </span>
  )
}

export function PendingCard({ post, defaultTitle, collections, skipped = false }: { post: PendingPost; defaultTitle: string; collections: { slug: string; name: string }[]; skipped?: boolean }) {
  const [title, setTitle] = useState(defaultTitle)
  const [collection, setCollection] = useState(post.kind === 'image' ? 'sketchbook' : '')
  const [sale, setSale] = useState<Sale>('display')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [pending, start] = useTransition()

  if (done) return <p style={{ fontSize: 13, color: '#1a6060', padding: '10px 0' }}>{done}</p>
  const run = (fn: () => Promise<{ error?: string }>, msg: string) => start(async () => {
    setError(null)
    try {
      const r = await fn()
      if (r.error) setError(r.error); else setDone(msg)
    } catch { setError('Something went wrong. Please try again.') }
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr]" style={{ gap: 16, background: '#fff', border: '1px solid #d0d0d0', padding: 16 }}>
      <div style={{ position: 'relative', background: '#f4f2ef', aspectRatio: '4/5' }}>
        {post.kind === 'reel' && post.videoUrl
          ? <video src={post.videoUrl} poster={post.imageUrl || undefined} controls muted playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          // eslint-disable-next-line @next/next/no-img-element
          : <img src={post.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
        <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', background: '#1a1014', color: '#fff', padding: '3px 6px' }}>
          {post.kind === 'reel' ? 'Reel' : 'Image'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: '#787878' }}>
          Posted {new Date(post.postedAt).toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' })} ·{' '}
          <a href={post.permalink} target="_blank" rel="noreferrer" style={{ color: '#1e3a8a' }}>View on Instagram ↗</a>
        </p>
        {post.caption && <p style={{ fontSize: 12, color: '#a0a0a0', whiteSpace: 'pre-line', maxHeight: 64, overflow: 'hidden' }}>{post.caption}</p>}
        <label style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#1a1014' }}>Title
          <input value={title} onChange={e => setTitle(e.target.value)} style={{ ...input, marginTop: 4, textTransform: 'none', letterSpacing: 0 }} />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 10 }}>
          <label style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#1a1014' }}>{post.kind === 'image' ? 'Collection' : 'Category'}
            <select value={collection} onChange={e => setCollection(e.target.value)} style={{ ...input, marginTop: 4, textTransform: 'none', letterSpacing: 0 }}>
              {post.kind === 'reel' && <option value="">None</option>}
              {collections.filter(c => post.kind === 'image' || (VIDEO_CATEGORIES as readonly string[]).includes(c.slug))
                .map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
          {post.kind === 'image' && (
            <label style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#1a1014' }}>In the shop
              <select value={sale} onChange={e => setSale(e.target.value as Sale)} style={{ ...input, marginTop: 4, textTransform: 'none', letterSpacing: 0 }}>
                {SALES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" disabled={pending} style={{ ...btn(true), opacity: pending ? .5 : 1 }}
            onClick={() => run(() => publishPost(post.id, { title, collection, sale }, skipped ? 'skipped' : 'pending'), `Published “${title || 'Untitled'}” ✓`)}>
            {post.kind === 'image' ? 'Publish to gallery' : 'Add to Videos'}
          </button>
          {skipped ? (
            <button type="button" disabled={pending} style={{ ...btn(), color: '#7a3040', borderColor: '#7a3040' }}
              onClick={() => { if (window.confirm('Delete this post for good? Its copied image or reel is removed too.')) run(() => deleteSkippedPost(post.id), 'Deleted') }}>
              Delete for good
            </button>
          ) : (
            <button type="button" disabled={pending} style={btn()}
              onClick={() => run(() => skipPost(post.id), 'Skipped. You can still publish it from Admin → Skipped.')}>
              Skip
            </button>
          )}
          {error && <span role="alert" style={{ fontSize: 12, color: '#7a3040' }}>{error}</span>}
        </div>
      </div>
    </div>
  )
}
