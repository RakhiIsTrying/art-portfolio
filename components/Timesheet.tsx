const PLAYFAIR = 'var(--font-playfair,"Playfair Display",Georgia,serif)'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const INK = '#1a1014'
const RED = '#b3261e'
const PAPER = '#fffdf6'
const RULE = '#b9cfe6'

// A joke, not a timesheet. Please don't show this one to HR.
const ENTRIES = [
  { at: '9:00 AM', what: 'Logs on. Has no memory of applying for this job.', stamp: 'Billable', color: '#1a6060', tilt: -3 },
  { at: '11:30 AM', what: 'A man explains my own spreadsheet to me. Draws him as Pennywise. Very little editing needed.', stamp: 'Art', color: '#4a3a7a', tilt: 2 },
  { at: '1:00 PM', what: 'Hears a card machine in the canteen. Stands up. Follows it. Nobody asks.', stamp: 'Medical', color: RED, tilt: -2 },
  { at: '4:47 PM', what: 'Has been staring at one Excel cell for 40 minutes. It has started staring back.', stamp: 'Deep work', color: '#1a6060', tilt: 3 },
  { at: '6:30 PM', what: 'Leaves through the fire exit. There was no fire. I just wanted it more.', stamp: 'Escaped', color: '#7a5020', tilt: -3 },
  { at: '10:00 PM', what: '“Just one more layer.”', stamp: 'Lie', color: RED, tilt: -4 },
  { at: '3:00 AM', what: 'Layer 247. Has not eaten. Is now speaking to the Joker as an equal.', stamp: 'Thriving', color: '#2f7a43', tilt: 2 },
  { at: '9:00 AM', what: 'Logs on. “No blockers.”', stamp: 'Repeat', color: '#5a4a4e', tilt: -2 },
]

/** A perfectly normal day, filed as a corporate timesheet. */
export default function Timesheet() {
  return (
    <section aria-labelledby="timesheet" style={{ position: 'relative', marginBottom: 48, background: PAPER, border: `2px solid ${INK}`, borderRadius: 6, boxShadow: '0 22px 50px rgba(26,16,20,.16)' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '6px 18px', padding: 'clamp(16px, 3vw, 24px) clamp(16px, 3vw, 26px) 14px clamp(38px, 6vw, 70px)', borderBottom: `3px double ${INK}` }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: '.3em', textTransform: 'uppercase', fontWeight: 600, color: RED, marginBottom: 4 }}>Form VGB-247 · Daily timesheet</p>
          <h2 id="timesheet" style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(26px, 4.4vw, 40px)', fontWeight: 700, lineHeight: 1.05, color: INK }}>
            Timesheet of a <span style={{ fontWeight: 400, fontStyle: 'italic', color: '#b07880' }}>known flight risk</span>
          </h2>
        </div>
        <p style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.5, color: '#5a4a4e' }}>Employee: R. Sinha<br />Manager: has stopped asking</p>
      </header>

      {/* Binder holes and the red margin line of a ledger page */}
      <div aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, left: 'clamp(26px, 5vw, 54px)', borderLeft: `2px solid ${RED}`, opacity: .45, pointerEvents: 'none' }} />
      {[18, 50, 82].map(top => (
        <span key={top} aria-hidden style={{ position: 'absolute', top: `${top}%`, left: 'clamp(6px, 1.6vw, 16px)', width: 14, height: 14, borderRadius: '50%', background: '#e6e6e6', boxShadow: 'inset 0 2px 3px rgba(26,16,20,.35)' }} />
      ))}

      <ol style={{ listStyle: 'none', margin: 0, padding: '0 clamp(16px, 3vw, 26px) 0 clamp(38px, 6vw, 70px)' }}>
        {ENTRIES.map(e => (
          <li key={e.at + e.stamp} className="grid grid-cols-[1fr_auto] sm:grid-cols-[92px_1fr_128px]" style={{ alignItems: 'center', gap: '4px 16px', padding: '13px 0', borderBottom: `1px solid ${RULE}` }}>
            <time style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: RED, whiteSpace: 'nowrap' }}>{e.at}</time>
            <span className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto sm:col-start-2" style={{ fontFamily: PLAYFAIR, fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.35, color: INK, whiteSpace: 'normal' }}>{e.what}</span>
            <span className="justify-self-end sm:justify-self-center sm:col-start-3 sm:row-start-1" style={{ display: 'inline-block', padding: '3px 8px', fontSize: 10, fontWeight: 800, letterSpacing: '.12em', lineHeight: 1.25, textAlign: 'center', textTransform: 'uppercase', color: e.color, border: `2px solid ${e.color}`, borderRadius: 3, opacity: .85, transform: `rotate(${e.tilt}deg)`, whiteSpace: 'nowrap' }}>{e.stamp}</span>
          </li>
        ))}
      </ol>

      <footer style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px 18px', padding: '14px clamp(16px, 3vw, 26px) 18px clamp(38px, 6vw, 70px)' }}>
        <p style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, lineHeight: 1.5, color: INK }}>Total corporate: 9.5 hrs<br />Total sleep: pending approval</p>
        <p style={{ textAlign: 'center' }}>
          <span aria-hidden style={{ display: 'block', fontFamily: PLAYFAIR, fontStyle: 'italic', fontSize: 20, lineHeight: 1.1, color: '#1e3a8a', transform: 'rotate(-3deg)' }}>R. Sinha</span>
          <span style={{ display: 'block', marginTop: 4, paddingTop: 3, borderTop: `1px solid ${INK}`, fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#5a4a4e' }}>Signed under duress</span>
        </p>
      </footer>
    </section>
  )
}
