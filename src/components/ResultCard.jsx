import { Link } from 'react-router-dom'
import Stars from './Stars'
import SaveButton from './SaveButton'
import CompareButton from './CompareButton'
import VerifiedBadge from './VerifiedBadge'
import { procedureById } from '../data/procedures'
import { formatMiles } from '../lib/geo'
import { hasHours } from '../lib/hours'
import { money } from '../lib/selectors'

// One search result. `result` comes from lib/search.js.
// onHover(clinicId | null) lets the search page highlight the matching map pin.
export default function ResultCard({ result, onHover = () => {} }) {
  const { kind, item, clinic, services, average, count, distance, openNow } = result
  const isVet = kind === 'vet'
  const href = isVet ? `/vets/${item.id}` : `/clinics/${item.id}`

  // One short status line instead of a stack of notes.
  const status = [
    hasHours(clinic) && { text: openNow ? 'Open now' : 'Closed now', good: openNow },
    clinic.emergency && { text: 'Emergencies', good: true },
    isVet && !item.acceptingNew && { text: 'Not taking new patients', good: false },
  ].filter(Boolean)

  return (
    <article
      className={`result-card is-${kind}`}
      onMouseEnter={() => onHover(clinic.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(clinic.id)}
      onBlur={() => onHover(null)}
    >
      <div className="result-main">
        <div className="result-tags">
          <span className={`kind-tag is-${kind}`}>{isVet ? 'Veterinarian' : 'Clinic'}</span>
          <VerifiedBadge status={item.verification} quiet />
        </div>
        <h3><Link to={href}>{item.name}</Link>{isVet && <span className="credentials">, {item.credentials}</span>}</h3>
        <p className="result-where">
          {isVet && <>{clinic.name}, </>}
          {clinic.city}, {clinic.state}
          {distance != null && <strong className="distance"> {formatMiles(distance)} away</strong>}
        </p>
        <div className="result-meta">
          <Stars average={average} count={count} />
          {status.map((s) => <span key={s.text} className={s.good ? 'note is-good' : 'note'}>{s.text}</span>)}
        </div>
      </div>

      <ul className="result-services">
        {services.map((s) => (
          <li key={s.procedureId}>
            <span>{procedureById[s.procedureId].name}</span>
            <strong>{money(s.priceLow)} to {money(s.priceHigh)}</strong>
          </li>
        ))}
      </ul>

      <div className="result-actions">
        <Link className="btn btn-primary" to={href}>View profile</Link>
        <div className="icon-row">
          <SaveButton kind={kind} id={item.id} compact />
          <CompareButton kind={kind} id={item.id} compact />
        </div>
      </div>
    </article>
  )
}
