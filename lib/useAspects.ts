'use client'
import { useEffect, useState } from 'react'

// Shape (width ÷ height) and edge colour of each image, measured in the browser
// and shared across components. The edge colour fills any space around the art.
export type ArtMeta = { aspect: number; edge: string | null }   // edge: null when the border isn't one flat colour
const cache = new Map<string, ArtMeta>()
const pending = new Map<string, Promise<ArtMeta | null>>()

/**
 * The art's border colour — but only when its corners are one flat colour (solid black,
 * red…). Shaded, textured or mixed edges return null, so the space stays plain white.
 */
function edgeColour(img: HTMLImageElement) {
  const size = 40
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)
  const px = (x: number, y: number) => { const i = (y * size + x) * 4; return [data[i], data[i + 1], data[i + 2]] }
  const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
  const mean = (list: number[][]) => [0, 1, 2].map(k => list.reduce((s, p) => s + p[k], 0) / list.length)

  // Each corner patch must be one even colour…
  const patch = 6
  const corners = [[0, 0], [size - patch, 0], [0, size - patch], [size - patch, size - patch]].map(([x0, y0]) => {
    const pts: number[][] = []
    for (let y = y0; y < y0 + patch; y++) for (let x = x0; x < x0 + patch; x++) pts.push(px(x, y))
    const m = mean(pts)
    return { m, flat: pts.every(p => dist(p, m) < 22) }
  })
  if (!corners.every(c => c.flat)) return null
  // …and all four corners the same colour
  const colour = mean(corners.map(c => c.m))
  if (!corners.every(c => dist(c.m, colour) < 26)) return null

  // Most of the outer ring should match too (a flat background, not just flat corners)
  let match = 0, total = 0
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (x > 1 && y > 1 && x < size - 2 && y < size - 2) continue
    total++
    if (dist(px(x, y), colour) < 34) match++
  }
  if (match / total < .8) return null

  return `rgb(${colour.map(Math.round).join(', ')})`
}

function measure(url: string) {
  if (!pending.has(url)) {
    pending.set(url, new Promise(resolve => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        if (!img.naturalWidth || !img.naturalHeight) return resolve(null)
        let edge: string | null = null
        try { edge = edgeColour(img) } catch { /* image not readable: keep white */ }
        const meta = { aspect: img.naturalWidth / img.naturalHeight, edge }
        cache.set(url, meta)
        resolve(meta)
      }
      img.onerror = () => resolve(null)
      img.src = url
    }))
  }
  return pending.get(url)!
}

export function useArtMeta(urls: string[]) {
  const [meta, setMeta] = useState<Record<string, ArtMeta>>(() =>
    Object.fromEntries(urls.filter(u => cache.has(u)).map(u => [u, cache.get(u)!])))
  const key = urls.join('|')

  useEffect(() => {
    let alive = true
    for (const url of urls) {
      if (!url) continue
      measure(url).then(m => { if (m && alive) setMeta(prev => (prev[url] ? prev : { ...prev, [url]: m })) })
    }
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return meta
}

export function useAspects(urls: string[]) {
  const meta = useArtMeta(urls)
  return Object.fromEntries(Object.entries(meta).map(([u, m]) => [u, m.aspect])) as Record<string, number>
}

export const useAspect = (url: string | undefined) => useArtMeta(url ? [url] : [])[url ?? '']?.aspect
export const useEdge = (url: string | null | undefined) => useArtMeta(url ? [url] : [])[url ?? '']?.edge ?? undefined
