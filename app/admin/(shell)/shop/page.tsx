import { getSettings } from '@/lib/settings'
import ShopSettingsEditor from '@/components/admin/ShopSettingsEditor'

export const dynamic = 'force-dynamic'

export default async function AdminShopPage() {
  const s = await getSettings()
  return (
    <div style={{ padding: '32px 36px', maxWidth: 980, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #d0d0d0', paddingBottom: 20 }}>
        <div style={{ width: 3, background: '#a0521d', marginRight: 16, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#a0521d', marginBottom: 6 }}>Shop</p>
          <h1 style={{ fontFamily: 'var(--font-playfair,"Playfair Display",Georgia,serif)', fontSize: 28, fontWeight: 700, color: '#1a1014', lineHeight: 1 }}>Shop settings</h1>
          <p style={{ fontSize: 12, fontWeight: 300, color: '#787878', marginTop: 8 }}>Print sizes and prices, greeting-card messages, Print Club prices and the shop intro.</p>
        </div>
      </div>
      <ShopSettingsEditor initial={{ printSizes: s.printSizes, greetings: s.greetings, plans: s.plans, shopIntro: s.shopIntro }} />
    </div>
  )
}
