import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import AppBridge from '@/components/AppBridge'

// The fonts live in app/fonts, so a build never has to fetch them from Google.
// Each family comes in two files: everyday letters (loaded up front), and extra
// symbols such as ₹ (only fetched by pages that use them). One file holds every
// weight, so it is listed once per weight the site uses.
// next/font needs every value written out in full here: no shared constants.
const inter = localFont({
  src: [
    { path: './fonts/inter-latin.woff2', weight: '300', style: 'normal' },
    { path: './fonts/inter-latin.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin.woff2', weight: '500', style: 'normal' },
    { path: './fonts/inter-latin.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-inter-latin',
  display: 'swap',
  adjustFontFallback: false,
})
const interExtra = localFont({
  src: [
    { path: './fonts/inter-latin-ext.woff2', weight: '300', style: 'normal' },
    { path: './fonts/inter-latin-ext.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-latin-ext.woff2', weight: '500', style: 'normal' },
    { path: './fonts/inter-latin-ext.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-inter-extra',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
  declarations: [{ prop: 'unicode-range', value: 'U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF' }],
})

const playfair = localFont({
  src: [
    { path: './fonts/playfair-display-latin.woff2', weight: '400', style: 'normal' },
    { path: './fonts/playfair-display-latin.woff2', weight: '700', style: 'normal' },
    { path: './fonts/playfair-display-italic-latin.woff2', weight: '400', style: 'italic' },
    { path: './fonts/playfair-display-italic-latin.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-playfair-latin',
  display: 'swap',
  adjustFontFallback: false,
})
const playfairExtra = localFont({
  src: [
    { path: './fonts/playfair-display-latin-ext.woff2', weight: '400', style: 'normal' },
    { path: './fonts/playfair-display-latin-ext.woff2', weight: '700', style: 'normal' },
    { path: './fonts/playfair-display-italic-latin-ext.woff2', weight: '400', style: 'italic' },
    { path: './fonts/playfair-display-italic-latin-ext.woff2', weight: '700', style: 'italic' },
  ],
  variable: '--font-playfair-extra',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
  declarations: [{ prop: 'unicode-range', value: 'U+100-2BA,U+2BD-2C5,U+2C7-2CC,U+2CE-2D7,U+2DD-2FF,U+304,U+308,U+329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C4,U+2113,U+2C60-2C7F,U+A720-A7FF' }],
})

export const metadata: Metadata = {
  title: 'Van Gone Broke | Art Studio',
  description: 'Pop culture digital and traditional art: music, movies, comics and originals.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${interExtra.variable} ${playfair.variable} ${playfairExtra.variable}`}>
      <body style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        {children}
        <AppBridge />
      </body>
    </html>
  )
}
