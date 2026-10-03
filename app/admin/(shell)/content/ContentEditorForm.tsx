'use client'
import { useActionState, useState } from 'react'
import TiptapEditor from '@/components/admin/TiptapEditor'
import { savePageContent } from './actions'

type Props = { puzzlesHtml: string; aboutHtml: string }

export default function ContentEditorForm({ puzzlesHtml, aboutHtml }: Props) {
  const [activeTab, setActiveTab] = useState<'puzzles' | 'about'>('puzzles')
  const [state, formAction, pending] = useActionState(savePageContent, null)

  const currentHtml = activeTab === 'puzzles' ? puzzlesHtml : aboutHtml

  return (
    <div className="flex flex-col gap-6">
      <div className="flex border-b-4 border-ink">
        {(['puzzles', 'about'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-black uppercase tracking-widest transition-colors border-r-2 border-ink
              ${activeTab === tab
                ? 'bg-ink text-cream'
                : 'bg-cream text-ink hover:bg-blush'}`}
          >
            {tab === 'puzzles' ? '🧩 Puzzles' : '👤 About'}
          </button>
        ))}
      </div>

      {state?.saved && (
        <p className="text-ink font-black text-xs uppercase tracking-widest border-2 border-ink px-3 py-2">
          ✓ {state.saved} page saved!
        </p>
      )}
      {state?.error && (
        <p className="text-rust font-black text-xs uppercase tracking-widest border-2 border-rust px-3 py-2">
          {state.error}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="slug" value={activeTab} />

        <div className="flex flex-col gap-2">
          <label className="text-[9px] font-black uppercase tracking-[4px] text-ink">
            {activeTab === 'puzzles' ? 'Puzzles Page Content' : 'About Page Content'}
          </label>
          <TiptapEditor
            key={activeTab}
            name="content"
            initialHtml={currentHtml}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="self-start bg-rust text-cream font-black uppercase tracking-widest text-sm
                     px-6 py-3 border-2 border-ink shadow-[3px_3px_0_#1f1f1f]
                     hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#1f1f1f]
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Saving…' : `Save ${activeTab} page →`}
        </button>
      </form>
    </div>
  )
}
