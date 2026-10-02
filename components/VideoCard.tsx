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
        className="border-4 border-ink overflow-hidden cursor-pointer group
                   hover:shadow-[4px_4px_0_#b04a33] transition-all"
        onClick={() => setOpen(true)}
      >
        <div className="relative aspect-video">
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 flex items-center justify-center
                          bg-ink/0 group-hover:bg-ink/30 transition-all">
            <div className="w-12 h-12 bg-rust border-2 border-ink flex items-center
                            justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-cream text-lg ml-1">▶</span>
            </div>
          </div>
        </div>
        <div className="p-3 border-t-4 border-ink bg-cream">
          <h3 className="text-xs font-black uppercase tracking-widest text-ink">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-[9px] text-rose mt-1 font-black uppercase tracking-widest">
              {video.description}
            </p>
          )}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/85 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl aspect-video border-4 border-ink"
            onClick={e => e.stopPropagation()}
          >
            {videoId && (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                title={video.title}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
