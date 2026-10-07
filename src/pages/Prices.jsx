import { Link, useParams, useSearchParams } from 'react-router-dom'
import PriceRange from '../components/PriceRange'
import Stars from '../components/Stars'
import VerifiedBadge from '../components/VerifiedBadge'
import { Includes } from '../components/ServiceTable'
import NotFound from './NotFound'
import { useStore } from '../context/StoreContext'
import { procedureById, procedures } from '../data/procedures'
import { median, money, offersFor, priceSummary, ratingSummary, reviewsFor } from '../lib/selectors'

// The cities that have at least one clinic, for the area picker.
const useCities = () => {
  const { clinics } = useStore()
  return [...new Set(clinics.filter((c) => c.verification !== 'rejected').map((c) => c.city))].sort()
}

function AreaPicker({ city, onChange, cities }) {
  return (
    <label className="sort">Area
      <select value={city} onChange={(e) => onChange(e.target.value)}>
        <option value="">Everywhere</option>
        {cities.map((c) => <option key={c}>{c}</option>)}
      </select>
    </label>
  )
}

const paidText = (summary) =>
  summary.paid == null ? 'No owner reports yet' : `${money(summary.paid)} (median of ${summary.reports})`

// /prices: every procedure with its typical price.
export function PriceIndex() {
  const store = useStore()
  const cities = useCities()
  const [params, setParams] = useSearchParams()
  const city = params.get('city') || ''

  const rows = procedures
    .map((p) => ({ procedure: p, summary: priceSummary(offersFor(store, p.id, city)) }))
    .filter((row) => row.summary)
  const categories = [...new Set(rows.map((r) => r.procedure.category))]

  return (
    <div className="container prices-page">
      <div className="results-head">
        <div>
          <h1>Typical prices{city && ` in ${city}`}</h1>
          <p className="lede">What veterinarians list, and what owners say they were charged.</p>
        </div>
        <AreaPicker city={city} cities={cities} onChange={(value) => setParams(value ? { city: value } : {}, { replace: true })} />
      </div>

      {rows.length ? (
        <div className="table-scroll">
          <table className="data-table price-table">
            <thead>
              <tr><th scope="col">Procedure</th><th scope="col">Listed prices</th><th scope="col">Owners paid</th><th scope="col">Offered by</th></tr>
            </thead>
            {categories.map((category) => (
              <tbody key={category}>
                <tr className="compare-divider"><th scope="rowgroup" colSpan="4">{category}</th></tr>
                {rows.filter((r) => r.procedure.category === category).map(({ procedure, summary }) => (
                  <tr key={procedure.id}>
                    <th scope="row"><Link to={`/prices/${procedure.id}${city ? `?city=${encodeURIComponent(city)}` : ''}`}>{procedure.name}</Link></th>
                    <td>{money(summary.low)} to {money(summary.high)}</td>
                    <td>{paidText(summary)}</td>
                    <td>{summary.vets} {summary.vets === 1 ? 'veterinarian' : 'veterinarians'}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      ) : <p className="empty">No veterinarians list prices in {city} yet.</p>}
    </div>
  )
}

// /prices/:id: one procedure, by city, with everyone who offers it.
export function PriceDetail() {
  const { id } = useParams()
  const store = useStore()
  const cities = useCities()
  const [params, setParams] = useSearchParams()
  const city = params.get('city') || ''
  const procedure = procedureById[id]
  if (!procedure) return <NotFound />

  const everywhere = offersFor(store, id)
  const offers = city ? everywhere.filter((o) => o.clinic.city === city) : everywhere
  const summary = priceSummary(offers)
  const byCity = [...new Set(everywhere.map((o) => o.clinic.city))].sort().map((name) => ({
    name,
    state: everywhere.find((o) => o.clinic.city === name).clinic.state,
    summary: priceSummary(everywhere.filter((o) => o.clinic.city === name)),
  }))
  const allReported = offers.flatMap((o) => o.reported)

  return (
    <div className="container prices-page">
      <p><Link to={`/prices${city ? `?city=${encodeURIComponent(city)}` : ''}`}>All procedures</Link></p>
      <div className="results-head">
        <div>
          <h1>{procedure.name} cost{city && ` in ${city}`}</h1>
          <p className="muted">{procedure.category}</p>
        </div>
        <AreaPicker city={city} cities={cities} onChange={(value) => setParams(value ? { city: value } : {}, { replace: true })} />
      </div>

      {summary ? (
        <>
          <section className="price-hero panel">
            <dl className="stat-grid">
              <div><dt>Listed prices</dt><dd>{money(summary.low)} to {money(summary.high)}</dd></div>
              <div><dt>Owners paid (median)</dt><dd>{summary.paid == null ? 'No reports' : money(summary.paid)}</dd></div>
              <div><dt>Owner reports</dt><dd>{summary.reports}</dd></div>
              <div><dt>Offered by</dt><dd>{summary.vets}</dd></div>
            </dl>
            <PriceRange low={summary.low} high={summary.high} reported={allReported} />
            <p className="muted">
              The band is the full spread of listed prices. Each dot is one owner’s bill. Prices vary with the animal’s size, age and health, so ask for a written estimate.
            </p>
          </section>

          {!city && byCity.length > 1 && (
            <section>
              <h2>By city</h2>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr><th scope="col">City</th><th scope="col">Listed prices</th><th scope="col">Owners paid</th><th scope="col">Offered by</th></tr>
                  </thead>
                  <tbody>
                    {byCity.map((c) => (
                      <tr key={c.name}>
                        <th scope="row"><Link to={`/prices/${id}?city=${encodeURIComponent(c.name)}`}>{c.name}, {c.state}</Link></th>
                        <td>{money(c.summary.low)} to {money(c.summary.high)}</td>
                        <td>{paidText(c.summary)}</td>
                        <td>{c.summary.vets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <h2>Who offers it</h2>
            <div className="service-table">
              {offers.map(({ vet, clinic, service, reported }) => (
                <div className="service-row" key={vet.id}>
                  <div>
                    <h4><Link to={`/vets/${vet.id}`}>{vet.name}</Link> <VerifiedBadge status={vet.verification} quiet /></h4>
                    <p className="muted">{clinic.name}, {clinic.city}, {clinic.state}</p>
                    <Stars {...ratingSummary(reviewsFor(store.reviews, 'vet', vet.id))} />
                  </div>
                  <PriceRange low={service.priceLow} high={service.priceHigh} reported={reported} />
                  <p className="service-reported">
                    {reported.length
                      ? <>Owners paid <strong>{money(median(reported))}</strong> (median of {reported.length})</>
                      : <span className="muted">No owner reports yet</span>}
                  </p>
                  <Includes items={service.includes} />
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <p className="empty">Nobody lists {procedure.name.toLowerCase()} in {city} yet. <Link to={`/prices/${id}`}>See everywhere</Link>.</p>
      )}
    </div>
  )
}
