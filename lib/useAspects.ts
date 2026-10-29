'use client'
import { useEffect, useState } from 'react'

// Shape (width ÷ height) and edge colour of each image, measured in the browser
// and shared across components. The edge colour fills any space around the art.
export type ArtMeta = { aspect: number; edge: string }
const cache = new Map<string, ArtMeta>()
const pending = new Map<string, Promise<ArtMeta | null>>()

/** Median colour of the outer ring of pixels: the art's own border colour. */
function edgeColour(img: HTMLImageElement) {
  const size = 40
  const canvas = document.createElement('canvas')
  canvas.width = size; canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, size, size)
  const { data } = ctx.getImageData(0, 0, size, size)
  const r: number[] = [], g: number[] = [], b: number[] = []
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (x > 1 && y > 1 && x < size - 2 && y < size - 2) continue
    const i = (y * size + x) * 4
    r.push(data[i]); g.push(data[i + 1]); b.push(data[i + 2])
  }
  const median = (a: number[]) => a.sort((p, q) => p - q)[a.length >> 1]
  return `rgb(${median(r)}, ${median(g)}, ${median(b)})`
}

function measure(url: string) {
  if (!pending.has(url)) {
    pending.set(url, new Promise(resolve => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        if (!img.naturalWidth || !img.naturalHeight) return resolve(null)
        let edge = '#fff'
        try { edge = edgeColour(img) ?? edge } catch { /* image not readable: keep white */ }
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
export const useEdge = (url: string | null | undefined) => useArtMeta(url ? [url] : [])[url ?? '']?.edge
