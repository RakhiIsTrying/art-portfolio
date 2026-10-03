'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const links = [
  { href: '/admin/artworks',  label: '🖼️  Artworks' },
  { href: '/admin/videos',    label: '🎬  Videos' },
  { href: '/admin/featured',  label: '⭐  Featured' },
  { href: '/admin/content',   label: '✏️  Content' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-56 min-h-screen bg-ink border-r-4 border-ink flex flex-col shrink-0">
      <div className="px-5 py-5 border-b-4 border-rust">
        <p className="text-[9px] font-black uppercase tracking-[4px] text-rose">
          Admin
        </p>
        <p className="text-base font-black uppercase tracking-widest text-cream mt-0.5">
          Van Gone Broke
        </p>
      </div>

      <nav className="flex flex-col flex-1 py-4">
        {links.map(({ href, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors
                ${active
                  ? 'bg-rust text-cream border-l-4 border-cream'
                  : 'text-blush hover:bg-rust/20 hover:text-cream border-l-4 border-transparent'
                }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-5 pb-6">
        <button
          onClick={handleLogout}
          className="w-full text-[9px] font-black uppercase tracking-widest
                     text-rose hover:text-cream transition-colors text-left"
        >
          ← Sign Out
        </button>
      </div>
    </aside>
  )
}
