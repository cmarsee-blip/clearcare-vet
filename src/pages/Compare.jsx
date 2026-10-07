import { Link } from 'react-router-dom'
import Stars from '../components/Stars'
import EmptyState from '../components/EmptyState'
import VerifiedBadge from '../components/VerifiedBadge'
import { useStore } from '../context/StoreContext'
import { procedureById, speciesById } from '../data/procedures'
import { clinicServices, median, money, ratingSummary, reportedPrices, reviewsFor } from '../lib/selectors'

// Builds one column of the comparison from a vet or a clinic.
function toColumn(pick, { vets, clinics, reviews, pricePoints }) {
  if (pick.type === 'vet') {
    const vet = vets.find((v) => v.id === pick.id)
    if (!vet) return null
    const clinic = clinics.find((c) => c.id === vet.clinicId)
    const open = Object.entries(vet.availability || {}).filter(([, hours]) => hours && hours !== 'Closed')
    return {
      key: `vet-${vet.id}`, kind: 'vet', id: vet.id, name: vet.name, href: `/vets/${vet.id}`,
      where: clinic ? `${clinic.name}, ${clinic.city}, ${clinic.state}` : 'No clinic listed',
      rating: ratingSummary(reviewsFor(reviews, 'vet', vet.id)), verification: vet.verification,
      status: vet.acceptingNew ? 'Taking new patients' : 'Not taking new patients',
      hours: open.length ? `${open.map(([day]) => day).join(', ')}` : 'Not listed',
      animals: vet.species,
      services: vet.services.map((s) => ({ ...s, reported: reportedPrices(pricePoints, vet.id, s.procedureId) })),
    }
  }
  const clinic = clinics.find((c) => c.id === pick.id)
  if (!clinic) return null
  return {
    key: `clinic-${clinic.id}`, kind: 'clinic', id: clinic.id, name: clinic.name, href: `/clinics/${clinic.id}`,
    where: `${clinic.city}, ${clinic.state} ${clinic.zip}`,
    rating: ratingSummary(reviewsFor(reviews, 'clinic', clinic.id)), verification: clinic.verification,
    status: clinic.emergency ? 'Takes emergencies' : 'No emergency service',
    hours: clinic.open24
      ? 'Open 24 hours'
      : Object.entries(clinic.openHours || {}).filter(([, day]) => day).map(([day]) => day).join(', ') || 'Not listed',
    animals: clinic.species,
    services: clinicServices(vets, pricePoints, clinic.id),
  }
}

export default function Compare() {
  const store = useStore()
  const columns = store.compare.map((pick) => toColumn(pick, store)).filter(Boolean)

  if (columns.length < 2) {
    return (
      <div className="container compare-page">
        <h1>Compare veterinarians and clinics</h1>
        <EmptyState
          title={columns.length ? 'Pick one more' : 'Nothing to compare yet'}
          text="Use the compare button on any search result or profile to pick two or three, then come back here."
          action={{ label: 'Find care', to: '/search' }}
        />
      </div>
    )
  }

  // Procedures offered by more of the picks come first.
  const offeredBy = (id) => columns.filter((c) => c.services.some((s) => s.procedureId === id)).length
  const procedureIds = [...new Set(columns.flatMap((c) => c.services.map((s) => s.procedureId)))].sort(
    (a, b) => offeredBy(b) - offeredBy(a) || procedureById[a].name.localeCompare(procedureById[b].name),
  )
  const lowestFor = (id) => {
    const lows = columns.map((c) => c.services.find((s) => s.procedureId === id)?.priceLow).filter((n) => n != null)
    return lows.length > 1 ? Math.min(...lows) : null
  }

  return (
    <div className="container compare-page">
      <div className="results-head">
        <h1>Side by side</h1>
        <button className="btn btn-outline" onClick={() => store.dispatch({ type: 'clearCompare' })}>Clear all</button>
      </div>

      <div className="table-scroll">
        <table className="compare-table">
          <thead>
            <tr>
              <td />
              {columns.map((c) => (
                <th scope="col" key={c.key}>
                  <span className={`kind-tag is-${c.kind}`}>{c.kind === 'vet' ? 'Veterinarian' : 'Clinic'}</span>
                  <Link to={c.href}>{c.name}</Link>
                  <button className="link-button" onClick={() => store.dispatch({ type: 'toggleCompare', kind: c.kind, id: c.id })}>
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row">Location</th>{columns.map((c) => <td key={c.key}>{c.where}</td>)}</tr>
            <tr><th scope="row">Rating</th>{columns.map((c) => <td key={c.key}><Stars {...c.rating} /></td>)}</tr>
            <tr><th scope="row">License</th>{columns.map((c) => <td key={c.key}><VerifiedBadge status={c.verification} /></td>)}</tr>
            <tr><th scope="row">Status</th>{columns.map((c) => <td key={c.key}>{c.status}</td>)}</tr>
            <tr><th scope="row">Open</th>{columns.map((c) => <td key={c.key}>{c.hours}</td>)}</tr>
            <tr>
              <th scope="row">Animals</th>
              {columns.map((c) => <td key={c.key}>{c.animals.map((a) => speciesById[a]?.label).join(', ') || 'Not listed'}</td>)}
            </tr>

            <tr className="compare-divider"><th scope="rowgroup" colSpan={columns.length + 1}>Procedures and prices</th></tr>
            {procedureIds.map((id) => {
              const lowest = lowestFor(id)
              return (
                <tr key={id}>
                  <th scope="row">{procedureById[id].name}</th>
                  {columns.map((c) => {
                    const s = c.services.find((x) => x.procedureId === id)
                    if (!s) return <td key={c.key} className="muted">Not offered</td>
                    return (
                      <td key={c.key}>
                        <strong>{money(s.priceLow)} to {money(s.priceHigh)}</strong>
                        {lowest === s.priceLow && <span className="tag lowest">Lowest listed</span>}
                        <span className="compare-paid">
                          {s.reported.length
                            ? `Owners paid ${money(median(s.reported))} (median of ${s.reported.length})`
                            : 'No owner reports yet'}
                        </span>
                        {s.includes?.length > 0 && <span className="compare-paid">Includes {s.includes.join(', ').toLowerCase()}</span>}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
