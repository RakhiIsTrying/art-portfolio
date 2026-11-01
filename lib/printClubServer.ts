import { headers } from 'next/headers'
import type { PlanId } from './printClub'

/** The visitor's two-letter country (Vercel geo header), when known. */
export async function countryForVisitor() {
  return (await headers()).get('x-vercel-ip-country')
}

/** Best guess for a visitor before they enter an address (Vercel geo header). */
export async function planForVisitor(): Promise<PlanId> {
  return (await headers()).get('x-vercel-ip-country') === 'IN' ? 'india' : 'international'
}
