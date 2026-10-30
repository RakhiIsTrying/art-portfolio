'use client'
import { useActionState, useRef, useEffect } from 'react'
import { uploadArtwork } from '@/app/admin/(shell)/artworks/actions'

const COLLECTIONS = [
  { slug: 'music',   name: 'Music & Pop Culture' },
  { slug: 'movies',  name: 'Movies & TV' },
  { slug: 'comics',  name: 'Comics & Anime' },
  { slug: 'bee-ben', name: 'Bee, Ben & Dug-Dug' },
  { slug: 'sketchbook', name: 'Sketchbook' },
]

export default function ArtworkUploadForm() {
  const [state, formAction, pending] = useActionState(uploadArtwork, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border border-[#d0d0d0] bg-white"
      encType="multipart/form-data"
    >
      <div className="px-5 py-3 border-b border-[#d0d0d0] border-l-[3px] border-l-[#7a3040] bg-[#fafafa]">
        <h2 className="text-[11px] font-medium uppercase tracking-[.4em] text-[#1a1014]">
          Upload New Artwork
        </h2>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {state?.error && (
          <p className="md:col-span-2 text-rust text-xs uppercase tracking-widest border border-rust px-3 py-2">
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p className="md:col-span-2 text-ink text-xs uppercase tracking-widest border border-ink px-3 py-2">
            ✓ Artwork uploaded!
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-[.3em] text-[#1a1014]">
            Title *
          </label>
          <input
            name="title"
            required
            className="border border-[#d0d0d0] px-3 py-2 bg-white text-sm text-[#1a1014] focus:outline-none focus:border-[#7a3040]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-[.3em] text-[#1a1014]">
            Collection *
          </label>
          <select
            name="collection_slug"
            required
            className="border border-[#d0d0d0] px-3 py-2 bg-white text-sm text-[#1a1014] focus:outline-none focus:border-[#7a3040]"
          >
            <option value="">Select…</option>
            {COLLECTIONS.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-[.3em] text-[#1a1014]">
            Medium
          </label>
          <input
            name="medium"
            placeholder="e.g. Digital illustration"
            className="border border-[#d0d0d0] px-3 py-2 bg-white text-sm text-[#1a1014] focus:outline-none focus:border-[#7a3040]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-[.3em] text-[#1a1014]">
            Year
          </label>
          <input
            name="year"
            type="number"
            placeholder="2024"
            min="1900"
            max="2099"
            className="border border-[#d0d0d0] px-3 py-2 bg-white text-sm text-[#1a1014] focus:outline-none focus:border-[#7a3040]"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-[.3em] text-[#1a1014]">
            Instagram Link
          </label>
          <input
            name="instagram_url"
            type="url"
            placeholder="https://www.instagram.com/p/..."
            className="border border-[#d0d0d0] px-3 py-2 bg-white text-sm text-[#1a1014] focus:outline-none focus:border-[#7a3040]"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-[.3em] text-[#1a1014]">
            Image File *
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            required
            className="border border-[#d0d0d0] px-3 py-2 bg-white text-sm text-[#1a1014]
                       file:mr-3 file:border-0 file:bg-[#1a1014] file:text-white
                       file:font-medium file:uppercase file:tracking-widest file:text-xs file:px-3 file:py-1"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="bg-[#1a1014] text-white font-medium uppercase tracking-[.3em] text-[11px] px-6 py-3 hover:bg-[#7a3040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Uploading…' : 'Upload Artwork →'}
          </button>
        </div>
      </div>
    </form>
  )
}
