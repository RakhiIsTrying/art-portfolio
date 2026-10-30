'use server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/adminAuth'
import { saveSettings } from '@/lib/settings'
import type { PrintSize } from '@/lib/prints'
import type { Plans } from '@/lib/printClub'

export type ShopSettingsInput = { printSizes: PrintSize[]; greetings: string[]; plans: Plans; shopIntro: string }

/** Save print sizes & prices, card greetings, Print Club prices and the shop intro. */
export async function saveShopSettings(input: ShopSettingsInput) {
  await requireAdmin()
  const sizes = input.printSizes.map((s, i) => {
    const w = Number(s.w), h = Number(s.h), inr = Number(s.inr), usd = Number(s.usd)
    if (!s.name.trim()) throw new Error(`Size ${i + 1} needs a name`)
    if (!(w > 0 && h > 0)) throw new Error(`“${s.name}” needs a width and height`)
    if (!(inr >= 0 && usd >= 0)) throw new Error(`“${s.name}” needs prices`)
    return {
      id: s.id || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: s.name.trim(), w, h, inr, usd,
      dims: `${w}" × ${h}"`,
      ...(Number(s.min) > 1 ? { min: Number(s.min) } : {}),
      ...(s.card ? { card: true } : {}),
    } satisfies PrintSize
  })
  if (!sizes.length) throw new Error('Keep at least one size')
  if (sizes.filter(s => s.card).length > 1) throw new Error('Only one size can be the greeting card')
  if (new Set(sizes.map(s => s.id)).size !== sizes.length) throw new Error('Two sizes have the same name')
  const greetings = input.greetings.map(g => g.trim()).filter(Boolean).slice(0, 30)
  if (!greetings.length) throw new Error('Add at least one greeting')
  if (!input.plans.india.price.trim() || !input.plans.international.price.trim()) throw new Error('Add both Print Club prices')

  await saveSettings({
    printSizes: sizes, greetings,
    plans: { india: { ...input.plans.india, price: input.plans.india.price.trim() }, international: { ...input.plans.international, price: input.plans.international.price.trim() } },
    shopIntro: input.shopIntro.trim().slice(0, 400),
  })
  revalidatePath('/', 'layout')
}
