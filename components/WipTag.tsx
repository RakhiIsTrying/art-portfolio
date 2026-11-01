/** A small marker for things still being finished. */
export default function WipTag() {
  return (
    <span title="Work in progress" style={{ display: 'inline-block', marginLeft: 8, padding: '2px 6px', verticalAlign: 'middle', fontFamily: 'var(--font-inter, inherit)', fontStyle: 'normal', fontSize: 9, fontWeight: 600, letterSpacing: '.15em', lineHeight: 1.2, borderRadius: 3, background: '#e8c55a', color: '#1a1014' }}>
      WIP
    </span>
  )
}
