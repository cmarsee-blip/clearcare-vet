import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ClinicMap from '../components/ClinicMap'
import ResultCard from '../components/ResultCard'
import EmptyState from '../components/EmptyState'
import { useStore } from '../context/StoreContext'
import { distanceOptions, procedures, species, states } from '../data/procedures'
import { coordsForZip, formatMiles, searchOrigin } from '../lib/geo'
import { search } from '../lib/search'

const FIELDS = ['q', 'type', 'city', 'state', 'zip', 'within', 'lat', 'lng', 'species', 'open', 'emergency', 'sort']

// Filters live in the URL (?q=tplo&state=IN) so searches can be shared
// and the back button works.
export default function Search() {
  const [params, setParams] = useSearchParams()
  const store = useStore()
  const [showMap, setShowMap] = useState(true)
  const [locating, setLocating] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false) // phones only
  const [activeClinic, setActiveClinic] = useState(null) // result under the pointer
  const filters = Object.fromEntries(FIELDS.map((key) => [key, params.get(key) || '']))
  const origin = searchOrigin(filters)
  const usingMyLocation = !!(filters.lat && filters.lng)

  const results = useMemo(
    () => search(store, { ...filters, type: filters.type || 'all', sort: filters.sort || (origin ? 'distance' : 'rating') }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.clinics, store.vets, store.reviews, store.pricePoints, params.toString()],
  )

  const setFilters = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
    setParams(next, { replace: true })
  }
  const bind = (key) => ({ value: filters[key], onChange: (e) => setFilters({ [key]: e.target.value }) })
  const check = (key) => ({ checked: !!filters[key], onChange: (e) => setFilters({ [key]: e.target.checked ? '1' : '' }) })
  const activeFilters = FIELDS.filter((key) => !['sort', 'lng'].includes(key) && filters[key]).length
  const hasFilters = activeFilters > 0

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocating('Your browser can’t share a location. Enter a ZIP code instead.')
      return
    }
    setLocating('Finding your location…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating('')
        setFilters({ lat: pos.coords.latitude.toFixed(3), lng: pos.coords.longitude.toFixed(3), zip: '', within: filters.within || '25' })
      },
      () => setLocating('We couldn’t get your location. Enter a ZIP code instead.'),
      { timeout: 8000 },
    )
  }

  // One pin per clinic, however many of its vets are in the results.
  const pins = useMemo(() => {
    const seen = new Map()
    for (const r of results) {
      if (!r.clinic.coords || seen.has(r.clinic.id)) continue
      seen.set(r.clinic.id, {
        id: r.clinic.id, name: r.clinic.name, coords: r.clinic.coords, href: `/clinics/${r.clinic.id}`,
        detail: [`${r.clinic.city}, ${r.clinic.state}`, r.distance != null && formatMiles(r.distance)].filter(Boolean).join(', '),
      })
    }
    return [...seen.values()]
  }, [results])

  const zipUnknown = filters.zip.length === 5 && !coordsForZip(filters.zip)

  return (
    <div className="container search-page">
      <aside className={filtersOpen ? 'filters is-open' : 'filters'} aria-label="Filters">
        <h2>Filters</h2>
        <button className="btn btn-outline filters-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}>
          {filtersOpen ? 'Hide filters' : `Filters${activeFilters ? ` (${activeFilters})` : ''}`}
        </button>
        <div className="form">
          <label>Procedure, clinic or veterinarian
            <input list="filter-procedures" placeholder="Anything" {...bind('q')} />
            <datalist id="filter-procedures">
              {procedures.map((p) => <option key={p.id} value={p.name} />)}
            </datalist>
          </label>

          <fieldset>
            <legend>Show</legend>
            {[['', 'Everything'], ['vets', 'Veterinarians'], ['clinics', 'Clinics']].map(([value, label]) => (
              <label className="radio" key={label}>
                <input type="radio" name="type" checked={filters.type === value} onChange={() => setFilters({ type: value })} />
                {label}
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Right now</legend>
            <label className="radio"><input type="checkbox" {...check('open')} /> Open now</label>
            <label className="radio"><input type="checkbox" {...check('emergency')} /> Takes emergencies</label>
          </fieldset>

          <fieldset>
            <legend>Near</legend>
            {usingMyLocation ? (
              <p className="callout tight">
                Using your location. <button className="link-button" onClick={() => setFilters({ lat: '', lng: '' })}>Stop</button>
              </p>
            ) : (
              <>
                <label>ZIP code
                  <input inputMode="numeric" maxLength="5" placeholder="Any" {...bind('zip')} />
                </label>
                <button type="button" className="btn btn-outline" onClick={useMyLocation}>Use my location</button>
              </>
            )}
            {locating && <p className="muted" role="status">{locating}</p>}
            <label>Within
              <select {...bind('within')} disabled={!origin}>
                <option value="">{origin ? (usingMyLocation ? 'Any distance' : '50 miles') : 'Enter a ZIP first'}</option>
                {distanceOptions.map((d) => <option key={d} value={d}>{d} miles</option>)}
              </select>
            </label>
            {zipUnknown && <p className="muted">This preview only knows where some ZIP codes are, so it is matching ZIPs that start with {filters.zip.slice(0, 3)}.</p>}
          </fieldset>

          <label>City
            <input placeholder="Any city" {...bind('city')} />
          </label>
          <label>State
            <select {...bind('state')}>
              <option value="">Any</option>
              {states.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>Animal
            <select {...bind('species')}>
              <option value="">Any animal</option>
              {species.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
          {hasFilters && (
            <button className="btn btn-outline" onClick={() => setParams({}, { replace: true })}>Clear filters</button>
          )}
        </div>
      </aside>

      <section className="results" aria-live="polite">
        <div className="results-head">
          <h1>{results.length} {results.length === 1 ? 'result' : 'results'}{filters.q && <> for “{filters.q}”</>}</h1>
          <div className="results-tools">
            <button className="btn btn-quiet" onClick={() => setShowMap(!showMap)} aria-pressed={showMap}>
              {showMap ? 'Hide map' : 'Show map'}
            </button>
            <label className="sort">Sort by
              <select {...bind('sort')}>
                {origin && <option value="">Nearest</option>}
                <option value={origin ? 'rating' : ''}>Highest rated</option>
                <option value="reviews">Most reviewed</option>
                <option value="price">Lowest listed price</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
        </div>

        {showMap && pins.length > 0 && <ClinicMap points={pins} origin={origin} activeId={activeClinic} />}

        {results.length ? (
          results.map((r) => <ResultCard key={`${r.kind}-${r.id}`} result={r} onHover={setActiveClinic} />)
        ) : (
          <EmptyState
            title="Nothing matches those filters"
            text="Try a wider distance, a broader procedure name, or turn off “Open now”."
            action={{ label: 'Clear filters', onClick: () => setParams({}, { replace: true }) }}
          />
        )}
      </section>
    </div>
  )
}
