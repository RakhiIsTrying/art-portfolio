import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Van Gone Broke — Art Studio',
  description: 'Pop culture digital and paper art — music, movies, comics, originals.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
