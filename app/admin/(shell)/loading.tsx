/** Shown the moment you switch admin pages, while the page loads. */
export default function AdminLoading() {
  const bar = (w: string, h = 14) => <div style={{ width: w, height: h, background: '#d8d4d4', borderRadius: 2 }} />
  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 py-6 md:px-9 md:py-9 animate-pulse" aria-busy="true" aria-label="Loading">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20, borderBottom: '1px solid #d0d0d0', marginBottom: 24 }}>
        {bar('90px', 10)}{bar('220px', 26)}
      </div>
      <div style={{ background: '#fff', border: '1px solid #d0d0d0', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, background: '#ebe8e8' }} />{bar(`${40 + (i % 3) * 15}%`)}
          </div>
        ))}
      </div>
    </div>
  )
}
