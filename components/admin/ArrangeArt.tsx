'use client'
import { useState, useTransition } from 'react'
import SortableList from './SortableList'
import { saveArtworkOrder, updateArtwork } from '@/app/admin/(shell)/arrange/actions'
import type { Artwork } from '@/lib/types'

type Props = { collections: { slug: string; name: string }[]; initial: Record<string, Artwork[]> }

const input: React.CSSProperties = { border: '1px solid #e0dcdc', padding: '5px 7px', fontSize: 12, fontFamily: 'inherit', background: '#fff', color: '#1a1014' }
const btn = (dark?: boolean): React.CSSProperties => ({ padding: '8px 14px', fontSize: 10, letterSpacing: '.25em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer', border: '1px solid #1a1014', background: dark ? '#1a1014' : '#fff', color: dark ? '#fff' : '#1a1014' })

export default function ArrangeArt({ collections, initial }: Props) {
  const [tab, setTab] = useState(collections[0].slug)
  const [lists, setLists] = useState(initial)
  const [dirty, setDirty] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const list = lists[tab] ?? []
  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(null), 2500) }

  function saveOrder() {
    start(async () => {
      try { await saveArtworkOrder(tab, list.map(a => a.id)); setDirty(false); flash('Order saved ✓') }
      catch (e) { flash(e instanceof Error ? e.message : 'Could not save') }
    })
  }

  function saveRow(a: Artwork, fields: { title: string; medium: string; year: string; collection_slug: string }) {
    start(async () => {
      try {
        await updateArtwork(a.id, { title: fields.title, medium: fields.medium || null, year: fields.year ? Number(fields.year) : null, collection_slug: fields.collection_slug })
        setLists(prev => {
          const updated = { ...a, title: fields.title.trim(), medium: fields.medium || null, year: fields.year ? Number(fields.year) : null, collection_slug: fields.collection_slug }
          if (fields.collection_slug === a.collection_slug) return { ...prev, [tab]: prev[tab].map(x => (x.id === a.id ? updated : x)) }
          // Moved: take it out of this collection and add it to the end of the new one
          return { ...prev, [tab]: prev[tab].filter(x => x.id !== a.id), [fields.collection_slug]: [...(prev[fields.collection_slug] ?? []), updated] }
        })
        flash(fields.collection_slug === a.collection_slug ? `Saved “${fields.title.trim()}” ✓` : `Moved “${fields.title.trim()}” ✓`)
      } catch (e) { flash(e instanceof Error ? e.message : 'Could not save') }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {collections.map(c => (
          <button key={c.slug} type="button" onClick={() => { if (!dirty || confirmLeave()) { setTab(c.slug); setDirty(false) } }}
            style={{ ...btn(tab === c.slug), letterSpacing: '.15em' }}>
            {c.name} · {(lists[c.slug] ?? []).length}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 2, background: '#e6e6e6', padding: '8px 0' }}>
        <button type="button" onClick={saveOrder} disabled={!dirty || pending} style={{ ...btn(true), opacity: !dirty || pending ? .45 : 1 }}>
          {pending ? 'Saving…' : 'Save order'}
        </button>
        <span style={{ fontSize: 12, color: dirty ? '#7a3040' : '#787878' }}>{note ?? (dirty ? 'Unsaved changes to the order' : 'Drag ⠿ or use ↑ ↓, then save.')}</span>
      </div>

      {list.length === 0 ? (
        <p style={{ fontSize: 12, color: '#a0a0a0' }}>No pieces in this collection.</p>
      ) : (
        <SortableList items={list} getId={a => a.id}
          onChange={items => { setLists(prev => ({ ...prev, [tab]: items })); setDirty(true) }}
          renderItem={a => <Row key={a.id} art={a} collections={collections} onSave={fields => saveRow(a, fields)} disabled={pending} />} />
      )}
    </div>
  )
}

function confirmLeave() {
  return window.confirm('You have an unsaved order here. Switch collection anyway?')
}

function Row({ art, collections, onSave, disabled }: {
  art: Artwork; collections: { slug: string; name: string }[]; disabled: boolean
  onSave: (f: { title: string; medium: string; year: string; collection_slug: string }) => void
}) {
  const [f, setF] = useState({ title: art.title, medium: art.medium ?? '', year: art.year ? String(art.year) : '', collection_slug: art.collection_slug })
  const changed = f.title !== art.title || f.medium !== (art.medium ?? '') || f.year !== (art.year ? String(art.year) : '') || f.collection_slug !== art.collection_slug
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art.image_url} alt="" style={{ width: 48, height: 48, objectFit: 'contain', background: '#f4f2ef', flexShrink: 0 }} />
      <input aria-label="Title" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} style={{ ...input, flex: '1 1 160px', minWidth: 120 }} />
      <input aria-label="Medium" placeholder="Medium" value={f.medium} onChange={e => setF({ ...f, medium: e.target.value })} style={{ ...input, width: 120 }} />
      <input aria-label="Year" placeholder="Year" inputMode="numeric" value={f.year} onChange={e => setF({ ...f, year: e.target.value.replace(/\D/g, '').slice(0, 4) })} style={{ ...input, width: 62 }} />
      <select aria-label="Collection" value={f.collection_slug} onChange={e => setF({ ...f, collection_slug: e.target.value })} style={{ ...input, width: 150 }}>
        {collections.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
      <button type="button" disabled={!changed || disabled} onClick={() => onSave(f)}
        style={{ ...btn(changed), padding: '6px 10px', opacity: changed ? 1 : .35 }}>Save</button>
    </div>
  )
}
