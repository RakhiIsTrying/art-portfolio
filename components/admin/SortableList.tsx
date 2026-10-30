'use client'
import { useState } from 'react'

type Props<T> = {
  items: T[]
  getId: (item: T) => string
  onChange: (items: T[]) => void
  renderItem: (item: T, index: number) => React.ReactNode
}

/** Drag rows to reorder them (or use ↑ ↓ on touch screens). */
export default function SortableList<T>({ items, getId, onChange, renderItem }: Props<T>) {
  const [dragging, setDragging] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return
    const next = [...items]
    const [it] = next.splice(from, 1)
    next.splice(to, 0, it)
    onChange(next)
  }

  const arrow: React.CSSProperties = { width: 26, height: 22, border: '1px solid #d0d0d0', background: '#fff', cursor: 'pointer', fontSize: 11, lineHeight: 1, padding: 0 }

  return (
    <ol style={{ listStyle: 'none', border: '1px solid #d0d0d0', background: '#fff' }}>
      {items.map((item, i) => (
        <li key={getId(item)} draggable
            onDragStart={e => { setDragging(i); e.dataTransfer.effectAllowed = 'move' }}
            onDragOver={e => { e.preventDefault(); setOver(i) }}
            onDragLeave={() => setOver(o => (o === i ? null : o))}
            onDrop={e => { e.preventDefault(); if (dragging !== null) move(dragging, i); setDragging(null); setOver(null) }}
            onDragEnd={() => { setDragging(null); setOver(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderTop: i ? '1px solid #ebebeb' : 'none',
                     background: over === i && dragging !== i ? '#f3effa' : dragging === i ? '#fafafa' : '#fff', opacity: dragging === i ? .5 : 1 }}>
          <span aria-hidden title="Drag to move" style={{ cursor: 'grab', color: '#a0a0a0', fontSize: 16, userSelect: 'none' }}>⠿</span>
          <span style={{ width: 22, fontSize: 11, color: '#a0a0a0', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
          <div style={{ flex: 1, minWidth: 0 }}>{renderItem(item, i)}</div>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <button type="button" aria-label="Move up" style={arrow} onClick={() => move(i, i - 1)} disabled={i === 0}>↑</button>
            <button type="button" aria-label="Move down" style={arrow} onClick={() => move(i, i + 1)} disabled={i === items.length - 1}>↓</button>
          </span>
        </li>
      ))}
    </ol>
  )
}
