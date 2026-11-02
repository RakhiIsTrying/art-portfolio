// The local currency for a visitor's country, for fun displays only (real prices live in lib/prints and lib/printClub).
const EURO = ['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK']
const BY_COUNTRY: Record<string, string> = {
  IN: 'INR', GB: 'GBP', JP: 'JPY', CN: 'CNY', KR: 'KRW', AU: 'AUD', NZ: 'NZD', CA: 'CAD', SG: 'SGD', HK: 'HKD', MY: 'MYR', TH: 'THB', ID: 'IDR', PH: 'PHP', VN: 'VND',
  AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR', PK: 'PKR', BD: 'BDT', LK: 'LKR', NP: 'NPR', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON',
  TR: 'TRY', IL: 'ILS', ZA: 'ZAR', NG: 'NGN', KE: 'KES', EG: 'EGP', BR: 'BRL', MX: 'MXN', AR: 'ARS', CL: 'CLP', CO: 'COP', TW: 'TWD', RU: 'RUB', UA: 'UAH',
  ...Object.fromEntries(EURO.map(c => [c, 'EUR'])),
}

export const currencyForCountry = (country?: string | null) => (country && BY_COUNTRY[country.toUpperCase()]) || 'USD'

/** A whole amount in that currency, such as ₹53,100, $4,200 or €900. */
export const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(amount)
