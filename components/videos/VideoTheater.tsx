'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import type { Video } from '@/lib/types'
import { PLAYFAIR } from './VideoTile'
import InstagramLink from './InstagramLink'

type Props = {
  videos: Video[]
  index: number
  onClose: () => void
  onNavigate: (delta: number) => void
  onSelect: (index: number) => void
}

const navButton: React.CSSProperties = {
  fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', fontWeight: 400,
  color: 'rgba(255,255,255,.75)', background: 'none', border: '1px solid rgba(255,255,255,.25)',
  padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .2s, color .2s',
}

export default function VideoTheater({ videos, index, onClose, onNavigate, onSelect }: Props) {
  const video = videos[index]
  const touchX = useRef<number | null>(null)
  const activeThumb = useRef<HTMLButtonElement>(null)

  const youtubeId = video.youtube_url?.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1]

  // Keyboard controls + lock page scroll while open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNavigate(1)
      if (e.key === 'ArrowLeft') onNavigate(-1)
    }
    window.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose, onNavigate])

  useEffect(() => {
    activeThumb.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [index])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="vgb-motion"
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: '#0e0a0c', overflow: 'hidden', animation: 'vgb-fade .35s ease both' }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 60) onNavigate(dx < 0 ? 1 : -1)
        touchX.current = null
      }}
    >
      {/* Blurred poster backdrop */}
      {video.thumbnail_url && (
        <Image
          key={`bg-${video.id}`}
          src={video.thumbnail_url}
          alt=""
          fill
          sizes="64px"
          unoptimized={!video.video_url}
          className="object-cover vgb-motion"
          style={{ filter: 'blur(48px) brightness(.4) saturate(1.3)', transform: 'scale(1.25)', animation: 'vgb-fade .6s ease both' }}
        />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(14,10,12,.45)' }} onClick={onClose} />

      <button
        onClick={onClose}
        style={{ ...navButton, position: 'absolute', top: 18, right: 20, zIndex: 2, border: 'none', color: 'rgba(255,255,255,.6)' }}
      >
        Close ✕
      </button>

      {/* Stage */}
      <div
        className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14 px-5 pt-16 pb-6 md:pb-28"
        style={{ position: 'relative', height: '100%', pointerEvents: 'none' }}
      >
        <div key={video.id} className="vgb-motion" style={{ pointerEvents: 'auto', animation: 'vgb-rise .5s cubic-bezier(.2,.7,.2,1) both', maxWidth: '100%' }}>
          {video.video_url ? (
            <video
              src={video.video_url}
              poster={video.thumbnail_url ?? undefined}
              controls autoPlay playsInline
              className="h-[58svh] md:h-[calc(100svh-200px)]"
              style={{ display: 'block', aspectRatio: '9/16', maxWidth: '100%', background: '#000', boxShadow: '0 40px 100px rgba(0,0,0,.65)' }}
            />
          ) : (
            <div style={{ width: 'min(860px, 90vw)', aspectRatio: '16/9', background: '#000', boxShadow: '0 40px 100px rgba(0,0,0,.65)' }}>
              {youtubeId && (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="autoplay; fullscreen"
                  title={video.title}
                />
              )}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="w-full md:w-[280px]" style={{ pointerEvents: 'auto', maxWidth: 420 }}>
          <p style={{ fontSize: 10, letterSpacing: '.4em', fontWeight: 400, color: 'rgba(255,255,255,.5)', marginBottom: 14 }}>
            {String(index + 1).padStart(2, '0')} <span style={{ color: 'rgba(255,255,255,.25)' }}>/ {String(videos.length).padStart(2, '0')}</span>
          </p>
          <h2 key={`t-${video.id}`} className="vgb-motion" style={{
            fontFamily: PLAYFAIR, fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(24px, 3vw, 34px)', lineHeight: 1.1, color: '#fff',
            animation: 'vgb-rise .5s .05s cubic-bezier(.2,.7,.2,1) both',
          }}>
            {video.title}
          </h2>
          <div style={{ width: 28, height: 1, background: '#b07880', margin: '16px 0' }} />
          {video.description && (
            <p style={{ fontSize: 13, lineHeight: 1.75, fontWeight: 300, color: 'rgba(255,255,255,.65)', marginBottom: 24 }}>
              {video.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={navButton} onClick={() => onNavigate(-1)} aria-label="Previous video"
              className="hover:[border-color:#fff] hover:[color:#fff]">← Prev</button>
            <button style={navButton} onClick={() => onNavigate(1)} aria-label="Next video"
              className="hover:[border-color:#fff] hover:[color:#fff]">Next →</button>
          </div>
          {video.instagram_url && (
            <div style={{ marginTop: 22 }}><InstagramLink href={video.instagram_url} /></div>
          )}
          <p className="hidden md:block" style={{ marginTop: 18, fontSize: 10, letterSpacing: '.2em', color: 'rgba(255,255,255,.3)' }}>
            ← → to browse · Esc to close
          </p>
        </div>
      </div>

      {/* Filmstrip */}
      <div
        className="no-scrollbar hidden md:flex"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, gap: 6, padding: '14px 24px 18px', overflowX: 'auto', justifyContent: 'safe center', background: 'linear-gradient(0deg, rgba(14,10,12,.85), transparent)' }}
      >
        {videos.map((v, i) => (
          <button
            key={v.id}
            ref={i === index ? activeThumb : undefined}
            onClick={() => onSelect(i)}
            aria-label={v.title}
            aria-current={i === index}
            className="hover:[opacity:.85]"
            style={{
              position: 'relative', flexShrink: 0, width: 42, height: 74, padding: 0, cursor: 'pointer',
              background: '#1a1014', border: 'none',
              outline: i === index ? '1px solid #b07880' : 'none', outlineOffset: 3,
              opacity: i === index ? 1 : .4, transition: 'opacity .25s',
            }}
          >
            {v.thumbnail_url && (
              <Image src={v.thumbnail_url} alt="" fill sizes="42px" className="object-contain" unoptimized={!v.video_url} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
