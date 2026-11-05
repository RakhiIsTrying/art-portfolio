import Link from 'next/link'
import { Suspense } from 'react'
import InquireForm from '@/components/InquireForm'
import { planForVisitor } from '@/lib/printClubServer'
import { getSettings } from '@/lib/settings'
import { ShopSettingsProvider } from '@/components/shop/ShopSettings'

export default async function InquirePage() {
  const currency = (await planForVisitor()) === 'india' ? 'inr' : 'usd'
  const settings = await getSettings()

  return (
    <div className="page-width pt-8 sm:pt-10 pb-16">

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #d0d0d0' }}>
        <div style={{ width: 3, background: '#4a3a7a', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#4a3a7a', marginBottom: 6 }}>Get in touch</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 30, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Inquire</h1>
          <p style={{ fontSize: 12, fontWeight: 300, letterSpacing: '.15em', color: '#a0a0a0', marginTop: 8 }}>
            Interested in a piece? Commission? Just want to say hello?
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12 items-start">
        <nav aria-label="Looking for something else?" style={{ fontSize: 14, lineHeight: 1.6, color: '#3a3a3a' }}>
          <p style={{ fontWeight: 600, color: '#1a1014', marginBottom: 8 }}>Looking for something else?</p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[['/shop', 'Prints and cards'], ['/originals', 'Originals for sale'], ['/print-club', 'Print Club']].map(([href, label]) => (
              <li key={href}><Link href={href} style={{ color: '#4a3a7a', textDecoration: 'underline' }}>{label}</Link></li>
            ))}
          </ul>
        </nav>
        <div style={{ minWidth: 0 }}>
          <Suspense fallback={null}>
            <ShopSettingsProvider sizes={settings.printSizes} greetings={settings.greetings}>
              <InquireForm currency={currency} />
            </ShopSettingsProvider>
          </Suspense>
        </div>
      </div>

    </div>
  )
}
