import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PageTracker from '@/components/analytics/PageTracker'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <PageTracker />
      <Nav />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  )
}
