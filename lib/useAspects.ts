'use client'
import { useEffect, useState } from 'react'

// Width ÷ height of each image, measured in the browser (shared across components)
const cache = new Map<string, number>()

export function useAspects(urls: string[]) {
  const [aspects, setAspects] = useState<Record<string, number>>(() =>
    Object.fromEntries(urls.filter(u => cache.has(u)).map(u => [u, cache.get(u)!])))
  const key = urls.join('|')

  useEffect(() => {
    let alive = true
    for (const url of urls) {
      if (cache.has(url)) { setAspects(a => (a[url] ? a : { ...a, [url]: cache.get(url)! })); continue }
      const img = new Image()
      img.onload = () => {
        if (!img.naturalWidth || !img.naturalHeight) return
        const ratio = img.naturalWidth / img.naturalHeight
        cache.set(url, ratio)
        if (alive) setAspects(a => ({ ...a, [url]: ratio }))
      }
      img.src = url
    }
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return aspects
}

export const useAspect = (url: string | undefined) => useAspects(url ? [url] : [])[url ?? '']
