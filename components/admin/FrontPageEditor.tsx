'use client'
import { useState, useTransition } from 'react'
import SortableList from './SortableList'
import { reorderFeatured, setHero } from '@/app/admin/(shell)/featured/actions'
import type { Artwork } from '@/lib/types'

const btn = (dark?: boolean): React.CSSProperties => ({ padding: '8px 14px', fontSize: 11, letterSpacing: '.25em', textTransform: 'uppercase', fontFamily: 'inherit', cursor: 'pointer', border: '1px solid #1a1014', background: dark ? '#1a1014' : '#fff', color: dark ? '#fff' : '#1a1014' })
const panel: React.CSSProperties = { border: '1px solid #d0d0d0', background: '#fff', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }
const h2: React.CSSProperties = { fontSize: 12, fontWeight: 500, letterSpacing: '.35em', textTransform: 'uppercase', color: '#1a1014' }

/** Choose the big front-page piece and the order of the Featured collage. */
export default function FrontPageEditor({ artworks, heroId, defaultHeroId }: { artworks: Artwork[]; heroId: string | null; defaultHeroId: string | null }) {
  const [hero, setHeroState] = useState(heroId ?? defaultHeroId ?? 'latest')
  const [featured, setFeatured] = useState(artworks.filter(a => a.featured).sort((a, b) => (a.featured_order ?? 0) - (b.featured_order ?? 0)))
  const [dirty, setDirty] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const flash = (m: string) => { setNote(m); setTimeout(() => setNote(null), 2500) }
  const heroArt = artworks.find(a => a.id === hero)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={panel}>
        <h2 style={h2}>Big front-page piece</h2>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {heroArt ? <img src={heroArt.image_url} alt="" style={{ width: 72, height: 72, objectFit: 'contain', background: '#f4f2ef' }} />
                   : <span style={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f2ef', fontSize: 11, color: '#787878', textAlign: 'center' }}>Newest upload</span>}
          <select value={hero} onChange={e => setHeroState(e.target.value)} style={{ border: '1px solid #d0d0d0', padding: '8px', fontFamily: 'inherit', fontSize: 13, minWidth: 260 }}>
            <option value="latest">Always the newest upload</option>
            {[...artworks].sort((a, b) => a.title.localeCompare(b.title)).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
          <button type="button" disabled={pending} style={btn(true)}
            onClick={() => start(async () => { try { await setHero(hero); flash('Front page updated ✓') } catch (e) { flash(e instanceof Error ? e.message : 'Could not save') } })}>
            Save
          </button>
        </div>
      </div>

      <div style={panel}>
        <h2 style={h2}>Featured collage order</h2>
        <p style={{ fontSize: 12, fontWeight: 300, color: '#787878' }}>Drag to set the order pieces appear in on the front page. Add or remove pieces in the picker below.</p>
        {featured.length ? (
          <SortableList items={featured} getId={a => a.id} onChange={items => { setFeatured(items); setDirty(true) }}
            renderItem={a => (
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image_url} alt="" style={{ width: 40, height: 40, objectFit: 'contain', background: '#f4f2ef' }} />
                <span style={{ fontSize: 13 }}>{a.title}</span>
              </span>
            )} />
        ) : <p style={{ fontSize: 12, color: '#a0a0a0' }}>No featured pieces yet.</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" disabled={!dirty || pending} style={{ ...btn(true), opacity: !dirty || pending ? .45 : 1 }}
            onClick={() => start(async () => { try { await reorderFeatured(featured.map(a => a.id)); setDirty(false); flash('Collage order saved ✓') } catch (e) { flash(e instanceof Error ? e.message : 'Could not save') } })}>
            {pending ? 'Saving…' : 'Save order'}
          </button>
        </div>
      </div>
      {note && <p role="status" style={{ fontSize: 12, color: '#1a6060' }}>{note}</p>}
    </div>
  )
}
