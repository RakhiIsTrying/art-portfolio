import { headers } from 'next/headers'
import type { PlanId } from './printClub'

/** Best guess for a visitor before they enter an address (Vercel geo header). */
export async function planForVisitor(): Promise<PlanId> {
  return (await headers()).get('x-vercel-ip-country') === 'IN' ? 'india' : 'international'
}
