'use client'
import { useActionState, useRef, useEffect } from 'react'
import { uploadArtwork } from '@/app/admin/(shell)/artworks/actions'

const COLLECTIONS = [
  { slug: 'music',   name: 'Music & Pop Culture' },
  { slug: 'movies',  name: 'Movies & TV' },
  { slug: 'comics',  name: 'Comics & Anime' },
  { slug: 'bee-ben', name: 'Bee, Ben & Dug-Dug' },
  { slug: 'paper',   name: 'Paper Art' },
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
      className="border-4 border-ink shadow-[4px_4px_0_#1f1f1f] bg-cream"
      encType="multipart/form-data"
    >
      <div className="bg-rust px-5 py-3 border-b-4 border-ink">
        <h2 className="text-sm font-black uppercase tracking-widest text-cream">
          Upload New Artwork
        </h2>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {state?.error && (
          <p className="md:col-span-2 text-rust font-black text-xs uppercase tracking-widest border-2 border-rust px-3 py-2">
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p className="md:col-span-2 text-ink font-black text-xs uppercase tracking-widest border-2 border-ink px-3 py-2">
            ✓ Artwork uploaded!
          </p>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black uppercase tracking-[4px] text-ink">
            Title *
          </label>
          <input
            name="title"
            required
            className="border-2 border-ink px-3 py-2 bg-cream font-bold text-sm focus:outline-none focus:border-rust"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black uppercase tracking-[4px] text-ink">
            Collection *
          </label>
          <select
            name="collection_slug"
            required
            className="border-2 border-ink px-3 py-2 bg-cream font-bold text-sm focus:outline-none focus:border-rust"
          >
            <option value="">Select…</option>
            {COLLECTIONS.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black uppercase tracking-[4px] text-ink">
            Medium
          </label>
          <input
            name="medium"
            placeholder="e.g. Digital illustration"
            className="border-2 border-ink px-3 py-2 bg-cream font-bold text-sm focus:outline-none focus:border-rust"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black uppercase tracking-[4px] text-ink">
            Year
          </label>
          <input
            name="year"
            type="number"
            placeholder="2024"
            min="1900"
            max="2099"
            className="border-2 border-ink px-3 py-2 bg-cream font-bold text-sm focus:outline-none focus:border-rust"
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="text-[9px] font-black uppercase tracking-[4px] text-ink">
            Image File *
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            required
            className="border-2 border-ink px-3 py-2 bg-cream font-bold text-sm
                       file:mr-3 file:border-0 file:bg-ink file:text-cream
                       file:font-black file:uppercase file:tracking-widest file:text-xs file:px-3 file:py-1"
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="bg-ink text-cream font-black uppercase tracking-widest text-sm
                       px-6 py-3 border-2 border-ink shadow-[3px_3px_0_#b04a33]
                       hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#b04a33]
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Uploading…' : 'Upload Artwork →'}
          </button>
        </div>
      </div>
    </form>
  )
}
