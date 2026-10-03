'use client'
import { useActionState } from 'react'
import { addVideo } from '@/app/admin/(shell)/videos/actions'

export default function VideoAddForm() {
  const [state, formAction, pending] = useActionState(addVideo, null)

  return (
    <form
      action={formAction}
      className="border-4 border-ink shadow-[4px_4px_0_#1f1f1f] bg-cream"
    >
      <div className="bg-rust px-5 py-3 border-b-4 border-ink">
        <h2 className="text-sm font-black uppercase tracking-widest text-cream">
          Add New Video
        </h2>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {state?.error && (
          <p className="text-rust font-black text-xs uppercase tracking-widest border-2 border-rust px-3 py-2">
            {state.error}
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
            YouTube URL *
          </label>
          <input
            name="youtube_url"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            className="border-2 border-ink px-3 py-2 bg-cream font-bold text-sm focus:outline-none focus:border-rust"
          />
          <p className="text-[9px] text-rose font-black uppercase tracking-widest">
            Thumbnail will be fetched automatically
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-black uppercase tracking-[4px] text-ink">
            Description
          </label>
          <textarea
            name="description"
            rows={2}
            className="border-2 border-ink px-3 py-2 bg-cream font-bold text-sm focus:outline-none focus:border-rust resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="self-start bg-ink text-cream font-black uppercase tracking-widest text-sm
                     px-6 py-3 border-2 border-ink shadow-[3px_3px_0_#b04a33]
                     hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#b04a33]
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Adding…' : 'Add Video →'}
        </button>
      </div>
    </form>
  )
}
