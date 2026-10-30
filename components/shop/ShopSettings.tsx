'use client'
import { createContext, useContext } from 'react'
import { DEFAULT_GREETINGS, DEFAULT_PRINT_SIZES, type PrintSize } from '@/lib/prints'

/** Print sizes, prices and card greetings from Admin → Shop settings, shared by the shop components. */
type ShopSettings = { sizes: PrintSize[]; greetings: string[] }
const Ctx = createContext<ShopSettings>({ sizes: DEFAULT_PRINT_SIZES, greetings: DEFAULT_GREETINGS })

export function ShopSettingsProvider({ sizes, greetings, children }: ShopSettings & { children: React.ReactNode }) {
  return <Ctx.Provider value={{ sizes, greetings }}>{children}</Ctx.Provider>
}
export const useShopSettings = () => useContext(Ctx)
