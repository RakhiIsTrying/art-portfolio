'use client'
import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { monthLabel } from '@/lib/printClubExport'
import { addMedia, createBox, createUploadUrl, deleteBox, removeMedia, updateBox } from '@/app/admin/(shell)/club-boxes/actions'
import type { Artwork, ClubBox } from '@/lib/types'

type Piece = Pick<Artwork, 'id' | 'title' | 'image_url'>

const small: React.CSSProperties = { fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 400 }
const button = (dark = false): React.CSSProperties => ({
  ...small, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit',
  border: '1px solid #1a1014', background: dark ? '#1a1014' : '#fff', color: dark ? '#fff' : '#1a1014',
})

export function NewBoxForm() {
  const [state, action, pending] = useActionState(createBox, null)
  return (
    <form action={action} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <input type="month" name="month" required defaultValue={new Date().toISOString().slice(0, 7)}
             style={{ padding: '7px 10px', border: '1px solid #d0d0d0', fontFamily: 'inherit', fontSize: 13 }} />
      <button type="submit" disabled={pending} style={button(true)}>{pending ? 'Creating…' : '+ New month'}</button>
      {state?.error && <span style={{ ...small, color: '#7a3040' }}>{state.error}</span>}
    </form>
  )
}

export default function ClubBoxEditor({ box, pieces }: { box: ClubBox; pieces: Piece[] }) {
  const router = useRouter()
  const [status, setStatus] = useState<string | null>(null)
  const [selected, setSelected] = useState(new Set(box.artwork_ids))
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const supabase = getSupabaseBrowserClient()
    const list = [...files]
    try {
      for (const [i, file] of list.entries()) {
        setStatus(`Uploading ${i + 1} of ${list.length}…`)
        const { path, token, publicUrl } = await createUploadUrl(box.id, file.name)
        const { error } = await supabase.storage.from('club-boxes').uploadToSignedUrl(path, token, file, { contentType: file.type })
        if (error) throw error
        await addMedia(box.id, file.type.startsWith('video/') ? 'video' : 'photo', publicUrl)
      }
      setStatus(null)
    } catch (e) {
      setStatus(`Upload failed: ${e instanceof Error ? e.message : 'unknown error'}`)
    }
    router.refresh()
  }

  async function togglePiece(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
    await updateBox(box.id, { artwork_ids: [...next] })
  }

  const remove = async (url: string) => { await removeMedia(box.id, url); router.refresh() }

  return (
    <div style={{ border: '1px solid #d0d0d0', background: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #d0d0d0', background: '#fafafa' }}>
        <h2 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 20, fontWeight: 700, color: '#1a1014' }}>
          📁 {monthLabel(box.month)}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={`/print-club/boxes#${box.month}`} target="_blank" style={{ ...button(), textDecoration: 'none' }}>View ↗</a>
          {confirmDelete ? (
            <>
              <button onClick={() => deleteBox(box.id)} style={{ ...button(true), background: '#7a3040', borderColor: '#7a3040' }}>Delete month + files</button>
              <button onClick={() => setConfirmDelete(false)} style={button()}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} style={button()}>Delete</button>
          )}
        </div>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Upload */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <label style={{ ...button(true), display: 'inline-block' }}>
            + Add photos / unboxing video
            <input type="file" multiple accept="image/*,video/*" hidden
                   onChange={e => { handleFiles(e.target.files); e.target.value = '' }} />
          </label>
          {status && <span style={{ ...small, color: status.startsWith('Upload failed') ? '#7a3040' : '#787878' }}>{status}</span>}
        </div>

        {/* Media */}
        {(box.video_url || box.photo_urls.length > 0) ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            {box.video_url && (
              <div style={{ position: 'relative', gridColumn: 'span 2' }}>
                <video src={box.video_url} controls muted playsInline style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', background: '#000' }} />
                <span style={{ ...small, position: 'absolute', top: 6, left: 6, background: '#1a1014', color: '#fff', padding: '3px 6px', fontSize: 8 }}>Unboxing</span>
                <RemoveButton onClick={() => remove(box.video_url!)} />
              </div>
            )}
            {box.photo_urls.map(url => (
              <div key={url} style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                <RemoveButton onClick={() => remove(url)} />
              </div>
            ))}
          </div>
        ) : (
          <p style={{ ...small, color: '#a0a0a0' }}>No photos or video yet.</p>
        )}

        {/* Note */}
        <div>
          <p style={{ ...small, color: '#1a1014', marginBottom: 6 }}>Note <span style={{ color: '#a0a0a0' }}>(optional)</span></p>
          <textarea defaultValue={box.note ?? ''} rows={2} placeholder="What was in this month's box…"
                    onBlur={e => { if (e.target.value !== (box.note ?? '')) updateBox(box.id, { note: e.target.value.trim() || null }) }}
                    style={{ width: '100%', border: '1px solid #d0d0d0', padding: 10, fontFamily: 'inherit', fontSize: 13, resize: 'vertical' }} />
        </div>

        {/* Pieces in the box */}
        <details>
          <summary style={{ ...small, color: '#1a1014', cursor: 'pointer' }}>
            Prints in this box · {selected.size} selected
          </summary>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 8, marginTop: 12 }}>
            {pieces.map(p => {
              const on = selected.has(p.id)
              return (
                <button key={p.id} type="button" onClick={() => togglePiece(p.id)} title={p.title}
                        style={{ padding: 0, cursor: 'pointer', background: '#fff', border: `2px solid ${on ? '#4a3a7a' : 'transparent'}`, opacity: on ? 1 : .55, position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt={p.title} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                  {on && <span style={{ position: 'absolute', top: 3, right: 3, background: '#4a3a7a', color: '#fff', fontSize: 10, width: 16, height: 16, lineHeight: '16px' }}>✓</span>}
                </button>
              )
            })}
          </div>
        </details>
      </div>
    </div>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Remove"
            style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, border: 'none', cursor: 'pointer', background: 'rgba(26,16,20,.75)', color: '#fff', fontSize: 13, lineHeight: '22px', padding: 0 }}>
      ×
    </button>
  )
}
