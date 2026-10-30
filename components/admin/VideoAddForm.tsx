'use client'
import { useActionState } from 'react'
import { addVideo } from '@/app/admin/(shell)/videos/actions'

export default function VideoAddForm() {
  const [state, formAction, pending] = useActionState(addVideo, null)

  return (
    <form
      action={formAction}
      className="border border-[#d0d0d0] bg-white"
    >
      <div className="px-5 py-3 border-b border-[#d0d0d0] border-l-[3px] border-l-[#7a3040] bg-[#fafafa]">
        <h2 className="text-[11px] font-medium uppercase tracking-[.4em] text-[#1a1014]">
          Add New Video
        </h2>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {state?.error && (
          <p className="text-rust text-xs uppercase tracking-widest border border-rust px-3 py-2">
            {state.error}
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
            YouTube URL *
          </label>
          <input
            name="youtube_url"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            className="border border-[#d0d0d0] px-3 py-2 bg-white text-sm text-[#1a1014] focus:outline-none focus:border-[#7a3040]"
          />
          <p className="text-[11px] text-[#7a3040]">
            Thumbnail will be fetched automatically
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-[.3em] text-[#1a1014]">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            className="border border-[#d0d0d0] px-3 py-2 bg-white text-sm text-[#1a1014] focus:outline-none focus:border-[#7a3040] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-[.3em] text-[#1a1014]">
              Category
            </label>
            <select name="category" defaultValue="" className="border border-[#d0d0d0] px-3 py-2 bg-white text-sm text-[#1a1014] focus:outline-none focus:border-[#7a3040]">
              <option value="">None</option>
              <option value="movies">Movie Art</option>
              <option value="music">Music</option>
              <option value="comics">Comics</option>
              <option value="bee-ben">Bee Ben &amp; Dug-Dug</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium uppercase tracking-[.3em] text-[#1a1014]">
              Instagram Link
            </label>
            <input
              name="instagram_url"
              type="url"
              placeholder="https://www.instagram.com/reel/..."
              className="border border-[#d0d0d0] px-3 py-2 bg-white text-sm text-[#1a1014] focus:outline-none focus:border-[#7a3040]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="self-start bg-[#1a1014] text-white font-medium uppercase tracking-[.3em] text-[11px] px-6 py-3 hover:bg-[#7a3040] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Adding…' : 'Add Video →'}
        </button>
      </div>
    </form>
  )
}
