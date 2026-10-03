'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

type Props = {
  name: string
  initialHtml?: string
  onChange?: (html: string) => void
}

export default function TiptapEditor({ name, initialHtml = '', onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialHtml,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'min-h-48 px-4 py-3 focus:outline-none font-bold text-sm text-ink leading-relaxed',
      },
    },
  })

  // Sync content when tab switches (initialHtml changes)
  useEffect(() => {
    if (editor && initialHtml !== editor.getHTML()) {
      editor.commands.setContent(initialHtml || '')
    }
  }, [initialHtml, editor])

  return (
    <div className="border-2 border-ink bg-cream focus-within:border-rust transition-colors">
      <div className="flex gap-1 flex-wrap px-3 py-2 border-b-2 border-ink bg-blush/20">
        {[
          { label: 'B',      active: editor?.isActive('bold'),                  action: () => editor?.chain().focus().toggleBold().run() },
          { label: 'I',      active: editor?.isActive('italic'),                action: () => editor?.chain().focus().toggleItalic().run() },
          { label: 'H2',     active: editor?.isActive('heading', { level: 2 }), action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
          { label: 'H3',     active: editor?.isActive('heading', { level: 3 }), action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
          { label: '• List', active: editor?.isActive('bulletList'),            action: () => editor?.chain().focus().toggleBulletList().run() },
          { label: 'HR',     active: false,                                     action: () => editor?.chain().focus().setHorizontalRule().run() },
        ].map(({ label, action, active }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-ink transition-colors
              ${active ? 'bg-ink text-cream' : 'bg-cream text-ink hover:bg-blush'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <EditorContent editor={editor} />

      <input
        type="hidden"
        name={name}
        value={editor?.getHTML() ?? ''}
        readOnly
      />
    </div>
  )
}
