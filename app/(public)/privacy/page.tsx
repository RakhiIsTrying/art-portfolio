import type { Metadata } from 'next'
import Link from 'next/link'
import AnalyticsOptOut from '@/components/AnalyticsOptOut'

export const metadata: Metadata = {
  title: 'Privacy Policy | Van Gone Broke',
  description: 'What Van Gone Broke collects, why, who helps run it, and how to get your data changed or deleted.',
}

const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'
const UPDATED = '6 November 2026'

const h2: React.CSSProperties = { fontFamily: PLAYFAIR, fontSize: 24, fontWeight: 700, lineHeight: 1.2, color: '#1a1014', margin: '36px 0 10px' }
const list: React.CSSProperties = { paddingLeft: 20, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 8 }
const link: React.CSSProperties = { color: '#7a3040', textDecoration: 'underline' }

export default function PrivacyPage() {
  return (
    <div className="px-4 sm:px-9 pt-8 sm:pt-10 pb-16" style={{ maxWidth: 760, margin: '0 auto', fontSize: 15, lineHeight: 1.75, fontWeight: 300, color: '#3a3a3a', whiteSpace: 'normal' }}>
      <p style={{ fontSize: 10, letterSpacing: '.45em', textTransform: 'uppercase', fontWeight: 400, color: '#7a5020', marginBottom: 8 }}>The boring but important bit</p>
      <h1 style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 700, lineHeight: 1, color: '#1a1014', marginBottom: 10 }}>Privacy Policy</h1>
      <p style={{ fontSize: 13, color: '#787878', marginBottom: 20 }}>Last updated {UPDATED}</p>

      <p>Van Gone Broke is run by me, Rakhi Sinha, from India. I’m one artist, not a data company. I only collect what I need to run this site, answer you and send you art, and I don’t sell your information to anyone.</p>

      <h2 style={h2}>What I collect when you just browse</h2>
      <p style={{ marginBottom: 10 }}>The site keeps its own simple visitor statistics, so I can see what people enjoy. For each visit it records:</p>
      <ul style={list}>
        <li>the pages you view, roughly how long you spend on them, and what you do on the site, such as picking a piece or a tier, opening or solving a puzzle, or clicking a link away;</li>
        <li>the website or app that sent you here, and any campaign tag in the link you used;</li>
        <li>your approximate location (country, region and city), worked out from your connection;</li>
        <li>your type of device, browser and operating system, with their version numbers, and your screen size;</li>
        <li>your browser’s language and time zone;</li>
        <li>your IP address (the number your internet connection uses);</li>
        <li>a random ID, stored in your browser, that lets me tell a returning visitor from a new one.</li>
      </ul>
      <p style={{ marginTop: 10 }}>These statistics don’t include your name or email, and they aren’t linked to anything you type into a form. Only I can see them, in my private Admin page.</p>

      <h2 style={h2}>What I collect when you fill in a form</h2>
      <ul style={list}>
        <li><b style={{ fontWeight: 600 }}>Print orders and messages:</b> your name, email, the piece, sizes and card message you choose, and anything you write to me.</li>
        <li><b style={{ fontWeight: 600 }}>Print Club:</b> your name, email, phone number, country and tier. For tiers I post, also your shipping address. For Gone Baroque, also your birthday and birthday request, if you choose to share them.</li>
      </ul>
      <p style={{ marginTop: 10 }}>I use these to reply to you, process your request, send what you’ve signed up for, and send emails about your membership. Payments aren’t taken on this site at the moment. I’ll update this page before that changes.</p>

      <h2 style={h2}>What stays in your browser</h2>
      <p>Your browser’s storage keeps your puzzle progress, the visitor ID above and your analytics choice. Puzzle progress never leaves your device. The site doesn’t use advertising cookies. If you sign in to Admin, which is only for me, a sign-in cookie keeps you signed in.</p>

      <h2 style={h2}>Your choice on analytics</h2>
      <p style={{ marginBottom: 12 }}>You can turn visitor statistics off in this browser at any time. This also removes the ID from your browser.</p>
      <AnalyticsOptOut />

      <h2 style={h2}>Who helps run the site</h2>
      <p style={{ marginBottom: 10 }}>These services handle data for me, and some of them are outside your country, including outside India:</p>
      <ul style={list}>
        <li><b style={{ fontWeight: 600 }}>Vercel</b> hosts the site and provides the approximate location.</li>
        <li><b style={{ fontWeight: 600 }}>Supabase</b> stores sign-ups, messages and statistics.</li>
        <li><b style={{ fontWeight: 600 }}>Resend</b> delivers the site’s emails.</li>
        <li><b style={{ fontWeight: 600 }}>Anthropic</b> powers a question box in my private Admin page, if switched on. It can receive visitor statistics and sales totals, never names, emails, phone numbers, addresses or IP addresses.</li>
        <li><b style={{ fontWeight: 600 }}>India Post’s pincode service and Zippopotam</b> receive the postal code you type, so your city and state can fill in. They get only the code and country.</li>
        <li><b style={{ fontWeight: 600 }}>YouTube and Instagram</b> are separate services with their own policies. Video players and links to them may collect information once you use them.</li>
      </ul>
      <p style={{ marginTop: 10 }}>I may also share information if the law requires it.</p>

      <h2 style={h2}>How long I keep it</h2>
      <p>Sign-ups and messages stay for as long as I need them for your membership, order or conversation, and for any records I have to keep. Visitor statistics stay until I no longer find them useful. You can ask me to delete your details at any time.</p>

      <h2 style={h2}>Your rights</h2>
      <p>You can ask to see, correct or delete your information, withdraw your consent, or complain about how I’ve handled it. <Link href="/inquire" style={link}>Send me a message</Link> and I’ll sort it out. Depending on where you live, you may also be able to complain to your local data protection authority.</p>

      <h2 style={h2}>Children</h2>
      <p>The site is for a general audience, but forms and Print Club are meant for adults. If you’re under 18, please ask a parent or guardian to fill them in.</p>

      <h2 style={h2}>Changes</h2>
      <p>This whole website is a work in progress, and this page will change as it does. I’ll update the date at the top each time.</p>
    </div>
  )
}
