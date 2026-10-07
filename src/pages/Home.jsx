import { useState } from 'react'
import { Link } from 'react-router-dom'
import HeroPets from '../components/HeroPets'
import SearchBar from '../components/SearchBar'
import PriceRange from '../components/PriceRange'
import Stars from '../components/Stars'
import { useStore } from '../context/StoreContext'
import { procedureById } from '../data/procedures'
import { money, offersFor, priceSummary, ratingSummary, reviewsFor, vetsAt } from '../lib/selectors'

const popular = ['tplo', 'dental', 'spay', 'cataract', 'foreign', 'echo', 'colic', 'float', 'beak']

// The procedures visitors can flip between on the home page price card.
const heroProcedures = [
  ['tplo', 'TPLO'], ['dental', 'Dental cleaning'], ['spay', 'Spay'], ['cataract', 'Cataract surgery'], ['foreign', 'Foreign body'],
]

const audiences = [
  {
    title: 'Animal owners',
    points: ['Search by procedure, distance and who is open now', 'Compare listed prices with what owners were charged', 'Ask for an appointment and keep health records in one place'],
  },
  {
    title: 'Veterinarians',
    points: ['List your procedures, prices and what each price includes', 'Get a Verified badge once your license is checked', 'Answer questions and appointment requests from owners'],
  },
  {
    title: 'Clinics',
    points: ['Get a clinic page with hours, location and services', 'Add your veterinarians so each has a profile', 'See every review left for your team'],
  },
]

export default function Home() {
  const store = useStore()
  const { clinics, vets, reviews } = store
  const [heroId, setHeroId] = useState(heroProcedures[0][0])

  // The price card uses live sample data: everyone who lists the chosen
  // procedure, and every bill owners reported for it.
  const offers = offersFor(store, heroId)
  const summary = priceSummary(offers)
  const reported = offers.flatMap((o) => o.reported)
  const featured = clinics.filter((c) => c.featured)

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>Find the vet who does the procedure. See what it costs.</h1>
            <p className="lede">
              Search veterinarians and clinics by surgery or procedure, then compare their listed
              prices with what other owners were charged.
            </p>
            <SearchBar />
          </div>

          <div className="hero-visual">
            <HeroPets />
            <aside className="hero-example" aria-label="Example prices">
              <div className="hero-picker" role="group" aria-label="Choose a procedure">
                {heroProcedures.map(([id, label]) => (
                  <button key={id} className={id === heroId ? 'pill is-on' : 'pill'} aria-pressed={id === heroId} onClick={() => setHeroId(id)}>
                    {label}
                  </button>
                ))}
              </div>
              <p className="example-title">{procedureById[heroId].name}</p>
              {summary ? (
                <>
                  <PriceRange low={summary.low} high={summary.high} reported={reported} />
                  <dl className="example-facts">
                    <div><dt>Listed</dt><dd>{money(summary.low)} to {money(summary.high)}</dd></div>
                    <div><dt>Owners paid (median)</dt><dd>{summary.paid == null ? 'No reports yet' : money(summary.paid)}</dd></div>
                  </dl>
                  <p className="example-key">
                    <span><i className="legend-band" /> Listed range</span>
                    <span><i className="legend-dot" /> One owner’s bill</span>
                  </p>
                  <Link className="btn btn-outline" to={`/prices/${heroId}`}>
                    See the {summary.vets === 1 ? 'veterinarian who offers' : `${summary.vets} veterinarians who offer`} it
                  </Link>
                </>
              ) : <p className="muted">Nobody lists this yet.</p>}
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>What does it usually cost?</h2>
          <ul className="chip-list">
            {popular.map((id) => (
              <li key={id}>
                <Link className="chip" to={`/prices/${id}`}>{procedureById[id].name}</Link>
              </li>
            ))}
            <li><Link className="chip is-more" to="/prices">All procedures</Link></li>
          </ul>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <h2>Who it’s for</h2>
          <div className="audience-grid">
            {audiences.map((a) => (
              <div className="audience" key={a.title}>
                <h3>{a.title}</h3>
                <ul>{a.points.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
            ))}
          </div>
          <Link className="btn btn-primary" to="/login">Create an account</Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Featured clinics</h2>
          <div className="featured-grid">
            {featured.map((c) => (
              <Link className="featured-card" to={`/clinics/${c.id}`} key={c.id}>
                <h3>{c.name}</h3>
                <p className="muted">{c.city}, {c.state}</p>
                <p>{c.about}</p>
                <div className="featured-foot">
                  <Stars {...ratingSummary(reviewsFor(reviews, 'clinic', c.id))} />
                  <span>{vetsAt(vets, c.id).length} veterinarians</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
