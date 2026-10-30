'use client'
import { useState, useTransition } from 'react'
import SortableList from './SortableList'
import { saveArtworkOrder, setCollectionSale, updateArtwork } from '@/app/admin/(shell)/arrange/actions'
import type { Artwork } from '@/lib/types'

type Props = { collections: { slug: string; name: string }[]; initial: Record<string, Artwork[]> }

const input: React.CSSProperties = { border: '1px solid #e0dcdc', padding: '5px 7px', fontSize: 12, fontFamily: 'inherit', background: '#fff', color: '#1a1014' }
// The four ways a piece can be offered in the shop
const SALE = {
  prints:  { label: 'Prints',                     prints: true,  original: false },
  both:    { label: 'Prints + original for sale', prints: true,  original: true },
  original:{ label: 'Original only',              prints: false, original: true },
  display: { label: 'Display only (not for sale)', prints: false, original: false },
} as const
type Sale = keyof typeof SALE
const saleOf = (a: Artwork): Sale => (a.prints_available !== false ? (a.original_available ? 'both' : 'prints') : a.original_available ? 'original' : 'display')

const btn = (dark?: boolean): React.CSSProperties => ({ padding: '8px 14px', fontSize: 11, letterSpacing: '.25em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer', border: '1px solid #1a1014', background: dark ? '#1a1014' : '#fff', color: dark ? '#fff' : '#1a1014' })

export default function ArrangeArt({ collections, initial }: Props) {
  const [tab, setTab] = useState(collections[0].slug)
  const [lists, setLists] = useState(initial)
  const [dirty, setDirty] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [rowKey, setRowKey] = useState(0)   // bumps after a whole-collection change so rows show the new setting

  const list = lists[tab] ?? []
  const [bulk, setBulk] = useState<Sale>('both')

  function applyToCollection() {
    const name = collections.find(c => c.slug === tab)?.name
    if (!window.confirm(`Set every piece in ${name} to “${SALE[bulk].label}”?`)) return
    start(async () => {
      try {
        await setCollectionSale(tab, SALE[bulk].prints, SALE[bulk].original)
        setLists(prev => ({ ...prev, [tab]: prev[tab].map(a => ({ ...a, prints_available: SALE[bulk].prints, original_available: SALE[bulk].original })) }))
        setRowKey(k => k + 1)
        flash(`All of ${name}: ${SALE[bulk].label} ✓`)
      } catch (e) { flash(e instanceof Error ? e.message : 'Could not save') }
    })
  }
  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(null), 2500) }

  function saveOrder() {
    start(async () => {
      try { await saveArtworkOrder(tab, list.map(a => a.id)); setDirty(false); flash('Order saved ✓') }
      catch (e) { flash(e instanceof Error ? e.message : 'Could not save') }
    })
  }

  function saveRow(a: Artwork, fields: { title: string; medium: string; year: string; collection_slug: string; sale: Sale }) {
    start(async () => {
      try {
        await updateArtwork(a.id, { title: fields.title, medium: fields.medium || null, year: fields.year ? Number(fields.year) : null, collection_slug: fields.collection_slug,
          prints_available: SALE[fields.sale].prints, original_available: SALE[fields.sale].original })
        setLists(prev => {
          const updated = { ...a, title: fields.title.trim(), medium: fields.medium || null, year: fields.year ? Number(fields.year) : null, collection_slug: fields.collection_slug,
            prints_available: SALE[fields.sale].prints, original_available: SALE[fields.sale].original }
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

      {/* Whole collection at once */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 12px', background: '#fff', border: '1px solid #e0dcdc' }}>
        <span style={{ fontSize: 12, color: '#1a1014' }}>Set the whole collection to</span>
        <select value={bulk} onChange={e => setBulk(e.target.value as Sale)} style={{ ...input, width: 220 }}>
          {(Object.keys(SALE) as Sale[]).map(k => <option key={k} value={k}>{SALE[k].label}</option>)}
        </select>
        <button type="button" onClick={applyToCollection} disabled={pending || !list.length} style={btn()}>Apply</button>
        <span style={{ fontSize: 12, color: '#a0a0a0' }}>or change pieces one by one below</span>
      </div>

      {list.length === 0 ? (
        <p style={{ fontSize: 12, color: '#a0a0a0' }}>No pieces in this collection.</p>
      ) : (
        <SortableList items={list} getId={a => a.id}
          onChange={items => { setLists(prev => ({ ...prev, [tab]: items })); setDirty(true) }}
          renderItem={a => <Row key={`${a.id}-${rowKey}`} art={a} collections={collections} onSave={fields => saveRow(a, fields)} disabled={pending} />} />
      )}
    </div>
  )
}

function confirmLeave() {
  return window.confirm('You have an unsaved order here. Switch collection anyway?')
}

function Row({ art, collections, onSave, disabled }: {
  art: Artwork; collections: { slug: string; name: string }[]; disabled: boolean
  onSave: (f: { title: string; medium: string; year: string; collection_slug: string; sale: Sale }) => void
}) {
  const [f, setF] = useState({ title: art.title, medium: art.medium ?? '', year: art.year ? String(art.year) : '', collection_slug: art.collection_slug, sale: saleOf(art) })
  const changed = f.title !== art.title || f.medium !== (art.medium ?? '') || f.year !== (art.year ? String(art.year) : '') || f.collection_slug !== art.collection_slug || f.sale !== saleOf(art)
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
      <select aria-label="In the shop" value={f.sale} onChange={e => setF({ ...f, sale: e.target.value as Sale })}
              style={{ ...input, width: 200, background: f.sale === 'display' ? '#f4f2ef' : f.sale === 'prints' ? '#fff' : '#fbf1f3' }}>
        {(Object.keys(SALE) as Sale[]).map(k => <option key={k} value={k}>{SALE[k].label}</option>)}
      </select>
      <button type="button" disabled={!changed || disabled} onClick={() => onSave(f)}
        style={{ ...btn(changed), padding: '6px 10px', opacity: changed ? 1 : .35 }}>Save</button>
    </div>
  )
}
