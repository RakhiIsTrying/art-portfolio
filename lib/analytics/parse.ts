// Works out where a visit came from and what it's using, from the request.
const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp\/|headless|lighthouse|vercel|monitor|curl|wget|python-requests/i

export const isBot = (ua: string) => !ua || BOTS.test(ua)

// The version number after a browser's or system's name, such as 17.4 or 129
const version = (ua: string, re: RegExp) => ua.match(re)?.[1]?.replace(/_/g, '.') ?? null

export function parseVersions(ua: string, browser: string, os: string) {
  const browserVersion =
    browser === 'Instagram app' ? version(ua, /Instagram ([\d.]+)/i)
    : browser === 'Facebook app' ? version(ua, /FBAV\/([\d.]+)/i)
    : browser === 'Edge' ? version(ua, /Edg\/([\d.]+)/)
    : browser === 'Opera' ? version(ua, /OPR\/([\d.]+)/)
    : browser === 'Samsung Internet' ? version(ua, /SamsungBrowser\/([\d.]+)/)
    : browser === 'Firefox' ? version(ua, /(?:Firefox|FxiOS)\/([\d.]+)/)
    : browser === 'Chrome' ? version(ua, /(?:Chrome|CriOS)\/([\d.]+)/)
    : browser === 'Safari' ? version(ua, /Version\/([\d.]+)/) : null
  const osVersion =
    os === 'iOS' ? version(ua, /OS ([\d_]+) like Mac/)
    : os === 'Android' ? version(ua, /Android ([\d.]+)/)
    : os === 'Mac' ? version(ua, /Mac OS X ([\d_.]+)/)
    : os === 'Windows' ? version(ua, /Windows NT ([\d.]+)/) : null
  // Keep it short: 129.0.6668.89 becomes 129.0
  const short = (v: string | null) => v?.split('.').slice(0, 2).join('.') ?? null
  return { browser_version: short(browserVersion), os_version: short(osVersion) }
}

export function parseDevice(ua: string) {
  const device = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? 'Tablet' : /mobi|iphone|android/i.test(ua) ? 'Phone' : 'Computer'
  const browser = /instagram/i.test(ua) ? 'Instagram app'
    : /fban|fbav/i.test(ua) ? 'Facebook app'
    : /edg\//i.test(ua) ? 'Edge'
    : /opr\/|opera/i.test(ua) ? 'Opera'
    : /samsungbrowser/i.test(ua) ? 'Samsung Internet'
    : /firefox|fxios/i.test(ua) ? 'Firefox'
    : /chrome|crios/i.test(ua) ? 'Chrome'
    : /safari/i.test(ua) ? 'Safari' : 'Other'
  const os = /iphone|ipad|ipod/i.test(ua) ? 'iOS'
    : /android/i.test(ua) ? 'Android'
    : /windows/i.test(ua) ? 'Windows'
    : /mac os/i.test(ua) ? 'Mac'
    : /cros/i.test(ua) ? 'ChromeOS'
    : /linux/i.test(ua) ? 'Linux' : 'Other'
  return { device, browser, os }
}

const NAMED: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, 'Instagram'], [/(^|\.)(youtube\.com|youtu\.be)$/, 'YouTube'], [/(^|\.)google\./, 'Google'],
  [/(^|\.)bing\.com$/, 'Bing'], [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'], [/(^|\.)(facebook\.com|fb\.com)$/, 'Facebook'],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, 'WhatsApp'], [/(^|\.)reddit\.com$/, 'Reddit'], [/(^|\.)pinterest\./, 'Pinterest'],
  [/(^|\.)linkedin\.com$/, 'LinkedIn'], [/(^|\.)(twitter\.com|x\.com|t\.co)$/, 'X'], [/(^|\.)(chatgpt\.com|openai\.com|claude\.ai|perplexity\.ai)$/, 'AI assistants'],
]

export function referrerHost(referrer: string) {
  try { return new URL(referrer).hostname.replace(/^www\./, '').toLowerCase() } catch { return '' }
}

/** A campaign tag wins, then the app it was opened in (they often hide the referrer), then the referring site. */
export function sourceOf({ referrer, utmSource, ua, siteHost }: { referrer: string; utmSource?: string; ua: string; siteHost?: string }) {
  if (utmSource?.trim()) {
    const named = NAMED.find(([re]) => re.test(`${utmSource.trim().toLowerCase()}.com`))
    return named ? named[1] : utmSource.trim().slice(0, 60)
  }
  const host = referrerHost(referrer)
  if (host && host !== siteHost?.replace(/^www\./, '')) return NAMED.find(([re]) => re.test(host))?.[1] ?? host
  if (/instagram/i.test(ua)) return 'Instagram'
  if (/fban|fbav/i.test(ua)) return 'Facebook'
  return 'Direct'
}
