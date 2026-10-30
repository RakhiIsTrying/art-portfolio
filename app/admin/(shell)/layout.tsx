import AdminNav from '@/components/admin/AdminNav'

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row" style={{ minHeight: '100svh', background: '#e6e6e6' }}>
      <AdminNav />
      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  )
}
