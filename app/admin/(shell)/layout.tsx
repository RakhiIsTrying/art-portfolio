import AdminNav from '@/components/admin/AdminNav'

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100svh', background: '#e6e6e6' }}>
      <AdminNav />
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  )
}
