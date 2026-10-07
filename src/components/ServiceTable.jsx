import { Link } from 'react-router-dom'
import PriceRange from './PriceRange'
import { inclusions, procedureById } from '../data/procedures'
import { median, money } from '../lib/selectors'

// A "What's included" toggle that opens a tick list. Closed by default so
// a long price list stays short.
export function Includes({ items }) {
  if (!items?.length) return <p className="includes muted">Ask what the price includes.</p>
  return (
    <details className="includes">
      <summary>What’s included <span className="muted">({items.length} of {inclusions.length})</span></summary>
      <ul className="include-list">
        {inclusions.map((item) => {
          const yes = items.includes(item)
          return (
            <li key={item} className={yes ? 'is-yes' : 'is-no'}>
              <span aria-hidden="true">{yes ? '✓' : '–'}</span>
              {item}
              <span className="visually-hidden">{yes ? ' (included)' : ' (not included)'}</span>
            </li>
          )
        })}
      </ul>
    </details>
  )
}

// services: [{ procedureId, priceLow, priceHigh, reported: [amounts], includes: [] }]
export default function ServiceTable({ services }) {
  if (!services.length) return <p className="empty">No services listed yet.</p>
  return (
    <div className="service-table">
      <div className="service-legend">
        <span><i className="legend-band" /> Listed price range</span>
        <span><i className="legend-dot" /> What a client reported paying</span>
      </div>
      {services.map((s) => {
        const procedure = procedureById[s.procedureId]
        return (
          <div className="service-row" key={s.procedureId}>
            <div>
              <h4><Link to={`/prices/${s.procedureId}`}>{procedure.name}</Link></h4>
              <p className="muted">{procedure.category}</p>
            </div>
            <PriceRange low={s.priceLow} high={s.priceHigh} reported={s.reported} />
            <p className="service-reported">
              {s.reported.length
                ? <>Clients paid <strong>{money(median(s.reported))}</strong> (median of {s.reported.length})</>
                : <span className="muted">No client reports yet</span>}
            </p>
            <Includes items={s.includes} />
          </div>
        )
      })}
    </div>
  )
}
