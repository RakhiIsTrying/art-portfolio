// Fills in city and state from a postal code. No word on a code just means the visitor types them in.
export type Place = { city: string; state: string }

const TIMEOUT_MS = 4000
const A_DAY = 86_400

const getJson = async (url: string) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), next: { revalidate: A_DAY } })
  return res.ok ? res.json() : null
}

/** Is this enough of a code to be worth looking up? */
export function postcodeReady(code: string, iso: string) {
  const c = code.trim()
  if (iso === 'IN') return /^\d{6}$/.test(c)
  if (iso === 'US') return /^\d{5}$/.test(c)
  return /^[a-z0-9][a-z0-9 -]{2,9}$/i.test(c)
}

async function fromIndiaPost(code: string): Promise<Place | null> {
  const office = (await getJson(`https://api.postalpincode.in/pincode/${code}`))?.[0]?.PostOffice?.[0]
  return office?.District && office?.State ? { city: office.District, state: office.State } : null
}

async function fromZippopotam(code: string, iso: string): Promise<Place | null> {
  const place = (await getJson(`https://api.zippopotam.us/${iso.toLowerCase()}/${encodeURIComponent(code)}`))?.places?.[0]
  // Some place names carry a long list of neighbourhoods in brackets
  return place ? { city: String(place['place name']).replace(/\s*\(.*\)\s*$/, ''), state: place.state ?? '' } : null
}

export async function lookupPostcode(code: string, iso: string): Promise<Place | null> {
  const c = code.trim()
  if (!postcodeReady(c, iso)) return null
  const attempt = async (get: () => Promise<Place | null>) => { try { return await get() } catch { return null } }
  if (iso === 'IN') {
    return (await attempt(() => fromIndiaPost(c))) ?? attempt(() => fromZippopotam(c, iso))
  }
  // The UK and Canada are listed by the first part of the code only
  return (await attempt(() => fromZippopotam(c, iso))) ?? (c.includes(' ') ? attempt(() => fromZippopotam(c.split(' ')[0], iso)) : null)
}
