import { days } from '../data/procedures'
import { formatSpan, hasHours, isOpenNow } from '../lib/hours'

// "Open now" / "Closed now" for a clinic that has listed its hours.
export function OpenNow({ clinic }) {
  if (!hasHours(clinic)) return null
  return isOpenNow(clinic)
    ? <span className="note is-good">Open now</span>
    : <span className="note">Closed now</span>
}

export function HoursTable({ clinic }) {
  if (clinic.open24) return <p>Open 24 hours, every day.</p>
  if (!hasHours(clinic)) return <p className="muted">Hours not listed.</p>
  return (
    <table className="hours">
      <tbody>
        {days.map((d) => (
          <tr key={d}><th scope="row">{d}</th><td>{formatSpan(clinic.openHours?.[d])}</td></tr>
        ))}
      </tbody>
    </table>
  )
}
