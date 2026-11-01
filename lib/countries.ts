import COUNTRIES from '@/lib/countries.json'

export type Country = { iso: string; name: string; dial: string }
export const ALL_COUNTRIES: Country[] = COUNTRIES

// Other names people type
const ALIASES: Record<string, string> = {
  usa: 'US', america: 'US', 'united states of america': 'US', uk: 'GB', britain: 'GB', 'great britain': 'GB', england: 'GB', scotland: 'GB', wales: 'GB',
  uae: 'AE', emirates: 'AE', bharat: 'IN', ind: 'IN', turkey: 'TR', burma: 'MM', holland: 'NL', 'south korea': 'KR', 'czech republic': 'CZ',
}

// Lower case without accents, so "turkiye" finds Türkiye
const plain = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').trim().toLowerCase()

export const countryByIso = (iso: string) => ALL_COUNTRIES.find(c => c.iso === iso)

/** The country this text names exactly, if any. */
export function findCountry(text: string): Country | undefined {
  const t = plain(text)
  if (!t) return undefined
  const iso = ALIASES[t]?.toLowerCase() ?? t
  return ALL_COUNTRIES.find(c => c.iso.toLowerCase() === iso || plain(c.name) === t)
}

/** Countries for the picker's search box: by name, other name, ISO code or dialling code. Names starting with the text come first. */
export function searchCountries(text: string): Country[] {
  const t = plain(text)
  if (!t) return ALL_COUNTRIES
  const digits = t.replace(/^\+/, '')
  const aliased = Object.entries(ALIASES).filter(([a]) => a.startsWith(t)).map(([, iso]) => iso)
  const hits = ALL_COUNTRIES.filter(c => plain(c.name).includes(t) || c.iso.toLowerCase() === t || aliased.includes(c.iso) || (/^\d+$/.test(digits) && c.dial.slice(1).startsWith(digits)))
  return [...hits].sort((a, b) => Number(plain(b.name).startsWith(t)) - Number(plain(a.name).startsWith(t)))
}

/** The flag emoji for a two-letter country code. */
export const flagOf = (iso: string) => String.fromCodePoint(...[...iso].map(ch => 0x1f1a5 + ch.charCodeAt(0)))
