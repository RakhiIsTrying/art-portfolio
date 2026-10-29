'use client'
import Image from 'next/image'
import { useEdge } from '@/lib/useAspects'

type Props = {
  src: string
  alt?: string
  sizes?: string
  priority?: boolean
  unoptimized?: boolean
  /** Shown until the art's edge colour is known */
  fallback?: string
  style?: React.CSSProperties
}

/**
 * Fills its (positioned) parent with the whole artwork — never cropped — and paints
 * any space around it in the art's own border colour so it blends in.
 */
export default function ArtFill({ src, alt = '', sizes, priority, unoptimized, fallback = '#fff', style }: Props) {
  const edge = useEdge(src)
  return (
    <div style={{ position: 'absolute', inset: 0, background: edge ?? fallback, transition: 'background .4s', ...style }}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={unoptimized} className="object-contain" />
    </div>
  )
}
