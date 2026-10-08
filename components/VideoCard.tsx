'use client'
import Image from 'next/image'
import { useState } from 'react'
import type { Video } from '@/lib/types'

type Props = { video: Video }

export default function VideoCard({ video }: Props) {
  const [open, setOpen] = useState(false)

  const videoId = video.youtube_url.match(
    /(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )?.[1]

  return (
    <>
      <div
        style={{ overflow: 'hidden', cursor: 'pointer', background: '#1a1014' }}
        onClick={() => setOpen(true)}
        className="group"
      >
        {/* Thumbnail */}
        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
          {/* Overlay + play button */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,16,20,0)', transition: 'background .3s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            className="group-hover:[background:rgba(26,16,20,0.5)]">
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: '#7a3040',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transform: 'scale(0.85)', transition: 'opacity .25s, transform .25s',
            }} className="group-hover:[opacity:1] group-hover:[transform:scale(1)]">
              <span style={{ color: '#fff', fontSize: 14, marginLeft: 3 }}>▶</span>
            </div>
          </div>
        </div>

        {/* Caption */}
        <div style={{ padding: '12px 14px', background: '#e6e6e6', borderTop: '1px solid #d0d0d0' }}>
          <h3 style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.3em', textTransform: 'uppercase', color: '#1a1014', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {video.title}
          </h3>
          {video.description && (
            <p style={{ fontSize: 10, fontWeight: 300, letterSpacing: '.15em', color: '#a0a0a0' }}>
              {video.description}
            </p>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(26,16,20,.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{ width: '100%', maxWidth: 860, aspectRatio: '16/9', background: '#000' }}
            onClick={e => e.stopPropagation()}
          >
            {videoId && (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; fullscreen"
                title={video.title}
              />
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', top: 20, right: 24, fontSize: 10, letterSpacing: '.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Close ✕
          </button>
        </div>
      )}
    </>
  )
}
