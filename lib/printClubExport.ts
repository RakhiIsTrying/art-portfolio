// Month grouping + CSV export for Print Club sign-ups (months follow India time)
const TZ = 'Asia/Kolkata'

/** "2026-10" for a timestamp, in India time. */
export function monthKey(iso: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit' }).formatToParts(new Date(iso))
  return `${parts.find(p => p.type === 'year')!.value}-${parts.find(p => p.type === 'month')!.value}`
}

/** "October 2026" for "2026-10". */
export const monthLabel = (key: string) =>
  new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

type Signup = Record<string, unknown> & { created_at: string }

const COLUMNS: [string, (s: Signup) => unknown][] = [
  ['Signed up',        s => new Date(s.created_at).toLocaleString('en-GB', { timeZone: TZ })],
  ['Name',             s => s.name],
  ['Plan',             s => (s.plan === 'india' ? '₹750 / month' : '$16 / month')],
  ['Email',            s => s.email],
  ['Phone',            s => s.phone],
  ['Birthday',         s => s.birthday],
  ['Birthday request', s => s.birthday_request],
  ['Address',          s => s.address_line1],
  ['Apt / suite',      s => s.address_line2],
  ['City',             s => s.city],
  ['State',            s => s.region],
  ['Postal code',      s => s.postal_code],
  ['Country',          s => s.country],
]

const cell = (v: unknown) => {
  const s = v == null ? '' : String(v)
  // Quote everything; neutralise leading =,+,-,@ so spreadsheets don't run it as a formula (phone numbers are safe)
  const risky = /^[=+\-@]/.test(s) && !/^\+?[\d\s()-]+$/.test(s)
  return `"${(risky ? `'${s}` : s).replace(/"/g, '""')}"`
}

export function signupsToCsv(rows: Signup[]) {
  const lines = [COLUMNS.map(([h]) => cell(h)).join(','), ...rows.map(r => COLUMNS.map(([, get]) => cell(get(r))).join(','))]
  // BOM so Excel reads ₹ and accents correctly
  return '﻿' + lines.join('\r\n')
}
