import { describe, it, expect } from 'vitest'
import { currencyForCountry, formatMoney } from '@/lib/currency'

describe('currency', () => {
  it('follows the country, with dollars when it’s unknown', () => {
    expect(currencyForCountry('IN')).toBe('INR')
    expect(currencyForCountry('fr')).toBe('EUR')
    expect(currencyForCountry('GB')).toBe('GBP')
    expect(currencyForCountry('US')).toBe('USD')
    expect(currencyForCountry('ZZ')).toBe('USD')
    expect(currencyForCountry(null)).toBe('USD')
  })

  it('formats whole amounts', () => {
    expect(formatMoney(53100, 'INR')).toBe('₹53,100')
    expect(formatMoney(4200, 'USD')).toBe('$4,200')
    expect(formatMoney(900, 'EUR')).toBe('€900')
    expect(formatMoney(1200, 'JPY')).toBe('¥1,200')
  })

  it('has a working format for every currency it can pick', () => {
    for (const c of ['IN','GB','JP','CN','KR','AU','NZ','CA','SG','HK','MY','TH','ID','PH','VN','AE','SA','QA','KW','BH','OM','PK','BD','LK','NP','CH','SE','NO','DK','PL','CZ','HU','RO','TR','IL','ZA','NG','KE','EG','BR','MX','AR','CL','CO','TW','RU','UA','DE']) {
      expect(formatMoney(100, currencyForCountry(c))).toMatch(/100/)
    }
  })
})
