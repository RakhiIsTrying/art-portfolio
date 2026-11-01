// Emails to Print Club members. These stay switched off until PRINT_CLUB_FROM_EMAIL is set to an address
// on a domain verified in Resend, because Resend's test sender can only write to the account's owner.
import { Resend } from 'resend'
import { ARTIST_EMAIL } from '@/lib/notify'
import { shipsPrints, TIERS, type TierId } from '@/lib/printClub'

export type MemberEmail = { to: string; subject: string; text: string }

const BATCH_SIZE = 100
const firstName = (name: string) => name.trim().split(/\s+/)[0]

const fromAddress = () => process.env.PRINT_CLUB_FROM_EMAIL?.trim() ?? ''
export const memberEmailReady = () => !!fromAddress() && !!process.env.RESEND_API_KEY?.trim()

export function welcomeEmail({ to, name, tier, price, checkoutUrl }: { to: string; name: string; tier: TierId; price: string; checkoutUrl?: string | null }): MemberEmail {
  const arrives = shipsPrints(tier) ? 'Your prints will be on their way to your door.' : 'Your paint-along print will land in this inbox every month.'
  const pay = checkoutUrl ? `To finish joining (${price} / month), pay here:\n${checkoutUrl}` : `I’ll write again soon about paying (${price} / month).`
  return {
    to,
    subject: `Welcome to ${TIERS[tier].name}!`,
    text: `Hi ${firstName(name)},\n\nYou’re in! Welcome to ${TIERS[tier].name}. ${arrives}\n\n${pay}\n\nQuestions? Just reply to this email.\n\nVan Gone Broke`,
  }
}

export function monthlyPrintEmail({ to, name, subject, message, fileUrl }: { to: string; name: string; subject: string; message: string; fileUrl: string }): MemberEmail {
  return {
    to,
    subject,
    text: `Hi ${firstName(name)},\n\n${message ? `${message}\n\n` : ''}This month’s paint-along print is ready:\n${fileUrl}\n\nHappy painting!\n\nVan Gone Broke`,
  }
}

/** Sends each email separately, so members never see each other's addresses. Returns how many went out. */
export async function sendMemberEmails(emails: MemberEmail[]) {
  if (!memberEmailReady() || !emails.length) return 0
  const resend = new Resend((process.env.RESEND_API_KEY ?? '').replace(/\s+/g, ''))
  let sent = 0
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE)
    const { error } = await resend.batch.send(batch.map(e => ({ ...e, from: fromAddress(), replyTo: ARTIST_EMAIL })))
    if (error) throw new Error(`Sent ${sent} of ${emails.length}, then: ${error.message}`)
    sent += batch.length
  }
  return sent
}
