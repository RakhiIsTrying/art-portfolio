'use client'
import { useState, useTransition } from 'react'
import SortableList from './SortableList'
import { saveVideoOrder } from '@/app/admin/(shell)/videos/actions'
import type { Video } from '@/lib/types'

const btn = (dark?: boolean): React.CSSProperties => ({ padding: '7px 12px', fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer', border: '1px solid #1a1014', background: dark ? '#1a1014' : '#fff', color: dark ? '#fff' : '#1a1014' })

/** Drag reels into order; the first one is "Now showing" at the top of the Videos page. */
export default function VideoOrder({ videos }: { videos: Video[] }) {
  const [list, setList] = useState(videos)
  const [dirty, setDirty] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const change = (items: Video[]) => { setList(items); setDirty(true) }

  return (
    <div style={{ border: '1px solid #d0d0d0', background: '#fff', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.35em', textTransform: 'uppercase', color: '#1a1014' }}>Order &amp; “Now showing”</h2>
      <p style={{ fontSize: 12, fontWeight: 300, color: '#787878' }}>The first reel plays at the top of the Videos page. Drag to reorder, or press “Now showing” to move a reel to the top.</p>
      <SortableList items={list} getId={v => v.id} onChange={change}
        renderItem={(v, i) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {v.thumbnail_url ? <img src={v.thumbnail_url} alt="" style={{ width: 30, height: 52, objectFit: 'contain', background: '#1a1014' }} /> : <span style={{ width: 30, height: 52, background: '#1a1014' }} />}
            <span style={{ flex: 1, fontSize: 13 }}>{v.title}</span>
            {i === 0
              ? <span style={{ fontSize: 9, letterSpacing: '.3em', textTransform: 'uppercase', color: '#fff', background: '#7a3040', padding: '4px 8px' }}>Now showing</span>
              : <button type="button" style={btn()} onClick={() => change([v, ...list.filter(x => x.id !== v.id)])}>Now showing</button>}
          </span>
        )} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" disabled={!dirty || pending} style={{ ...btn(true), opacity: !dirty || pending ? .45 : 1 }}
          onClick={() => start(async () => {
            try { await saveVideoOrder(list.map(v => v.id)); setDirty(false); setNote('Saved ✓') } catch (e) { setNote(e instanceof Error ? e.message : 'Could not save') }
            setTimeout(() => setNote(null), 2500)
          })}>
          {pending ? 'Saving…' : 'Save order'}
        </button>
        {note && <span role="status" style={{ fontSize: 12, color: '#1a6060' }}>{note}</span>}
      </div>
    </div>
  )
}
