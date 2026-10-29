'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import type { Video } from '@/lib/types'

export const PLAYFAIR = 'var(--font-playfair), "Playfair Display", Georgia, serif'

type Props = { video: Video; index: number; onOpen: () => void }

export default function VideoTile({ video, index, onOpen }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [previewing, setPreviewing] = useState(false)

  // Silent preview on hover — only on devices with a real pointer
  const startPreview = () => {
    const v = ref.current
    if (!v || !window.matchMedia('(hover: hover)').matches) return
    v.currentTime = 0
    v.play().then(() => setPreviewing(true)).catch(() => {})
  }
  const stopPreview = () => {
    ref.current?.pause()
    setPreviewing(false)
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onFocus={startPreview}
      onBlur={stopPreview}
      aria-label={`Play ${video.title}`}
      className="group vgb-motion focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b07880]"
      style={{
        position: 'relative', display: 'block', width: '100%', aspectRatio: '9/16',
        overflow: 'hidden', padding: 0, border: 'none', cursor: 'pointer', textAlign: 'left',
        background: '#1a1014', fontFamily: 'inherit',
        animation: 'vgb-rise .8s cubic-bezier(.2,.7,.2,1) both',
        animationDelay: `${Math.min(index, 12) * 55}ms`,
      }}
    >
      {video.thumbnail_url && (
        <Image
          src={video.thumbnail_url}
          alt=""
          fill
          className="object-contain vgb-motion"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          unoptimized={!video.video_url}
        />
      )}

      {video.video_url && (
        <video
          ref={ref}
          src={video.thumbnail_url ? video.video_url : `${video.video_url}#t=0.5`}
          muted loop playsInline
          preload={video.thumbnail_url ? 'none' : 'metadata'}
          className="vgb-motion"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain',
            opacity: previewing || !video.thumbnail_url ? 1 : 0, transition: 'opacity .5s',
          }}
        />
      )}

      {/* Scrim */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(14,10,12,.45) 0%, transparent 18%, transparent 50%, rgba(14,10,12,.92) 100%)',
      }} />

      {/* Index + preview indicator */}
      <span style={{
        position: 'absolute', top: 12, left: 14,
        fontSize: 10, letterSpacing: '.3em', fontWeight: 400, color: 'rgba(255,255,255,.7)',
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span
        className="vgb-motion"
        style={{
          position: 'absolute', top: 15, right: 14, width: 6, height: 6, borderRadius: '50%',
          background: '#b07880', boxShadow: '0 0 10px rgba(176,120,128,.8)',
          opacity: previewing ? 1 : 0, transition: 'opacity .3s',
          animation: previewing ? 'vgb-pulse 1.6s ease-in-out infinite' : 'none',
        }}
      />

      {/* Caption */}
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14 }}>
        <div
          className="vgb-motion w-6 group-hover:w-full group-focus-visible:w-full"
          style={{ height: 1, background: '#b07880', marginBottom: 10, transition: 'width .6s cubic-bezier(.2,.7,.2,1)' }}
        />
        <h3 style={{
          fontFamily: PLAYFAIR, fontStyle: 'italic', fontWeight: 400,
          fontSize: 17, lineHeight: 1.2, color: '#fff',
        }}>
          {video.title}
        </h3>
        {video.description && (
          <p style={{
            marginTop: 4, fontSize: 11, fontWeight: 300, lineHeight: 1.5, color: 'rgba(255,255,255,.55)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {video.description}
          </p>
        )}
      </div>
    </button>
  )
}
