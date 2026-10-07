import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Stars from '../components/Stars'
import SaveButton from '../components/SaveButton'
import CompareButton from '../components/CompareButton'
import ServiceTable from '../components/ServiceTable'
import { ReviewForm, ReviewList } from '../components/Reviews'
import NotFound from './NotFound'
import { useStore } from '../context/StoreContext'
import { speciesById } from '../data/procedures'
import { clinicServices, ratingSummary, reviewsFor, vetsAt } from '../lib/selectors'
import useRecordView from '../lib/useRecordView'
import VerifiedBadge from '../components/VerifiedBadge'
import PriceReportForm from '../components/PriceReportForm'
import ClinicMap from '../components/ClinicMap'
import { HoursTable, OpenNow } from '../components/OpenStatus'

export default function ClinicDetail() {
  const { id } = useParams()
  const { clinics, vets, reviews, pricePoints, user } = useStore()
  const clinic = clinics.find((c) => c.id === id)
  useRecordView('clinic', clinic?.id, user?.clinicId === id)
  if (!clinic) return <NotFound />

  const team = vetsAt(vets, clinic.id)
  const clinicReviews = reviewsFor(reviews, 'clinic', clinic.id)
  const services = clinicServices(vets, pricePoints, clinic.id)
  const photos = clinic.photos || []
  const amenities = clinic.amenities || []
  const languages = clinic.languages || []

  return (
    <div className="container detail-page">
      <header className="detail-head">
        <div>
          <div className="result-tags">
            <span className="kind-tag is-clinic">Clinic</span>
            <VerifiedBadge status={clinic.verification} />
          </div>
          <h1>{clinic.name}</h1>
          <p className="detail-where">{[clinic.address, clinic.city, `${clinic.state} ${clinic.zip}`].filter(Boolean).join(', ')}</p>
          <Stars {...ratingSummary(clinicReviews)} />
        </div>
        <div className="detail-actions">
          <SaveButton kind="clinic" id={clinic.id} />
          <CompareButton kind="clinic" id={clinic.id} />
        </div>
      </header>

      {photos.length > 0 && (
        <ul className="gallery" aria-label="Clinic photos">
          {photos.map((src, i) => <li key={i}><img src={src} alt={`${clinic.name}, photo ${i + 1}`} /></li>)}
        </ul>
      )}

      <div className="detail-layout">
        <div className="detail-main">
          <section>
            <h2>About</h2>
            <p>{clinic.about || 'This clinic has not written a description yet.'}</p>
            <ul className="tag-list">
              {clinic.species.map((s) => <li key={s} className="tag is-plain">{speciesById[s]?.label}</li>)}
            </ul>
          </section>

          <section>
            <h2>Veterinarians</h2>
            {team.length ? (
              <ul className="team-list">
                {team.map((v) => (
                  <li key={v.id}>
                    <Avatar name={v.name} photo={v.photo} size={52} />
                    <div>
                      <Link to={`/vets/${v.id}`}><strong>{v.name}</strong>, {v.credentials}</Link>
                      <span className="muted">{v.specialties.join(', ')}</span>
                      <Stars {...ratingSummary(reviewsFor(reviews, 'vet', v.id))} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="empty">This clinic has not added its veterinarians yet.</p>}
          </section>

          <section>
            <h2>Services and prices</h2>
            <ServiceTable services={services} />
            <PriceReportForm vets={team} />
          </section>

          <section>
            <h2>Reviews</h2>
            <ReviewList reviews={clinicReviews} />
            <ReviewForm targetType="clinic" targetId={clinic.id} procedureIds={services.map((s) => s.procedureId)} />
          </section>
        </div>

        <aside className="detail-side">
          <section className="panel">
            <h2>Visit</h2>
            <p className="result-notes">
              <OpenNow clinic={clinic} />
              {clinic.emergency && <span className="note is-good">Takes emergencies</span>}
            </p>
            <HoursTable clinic={clinic} />
            {clinic.hours && <p className="muted">{clinic.hours}</p>}
            <p>{clinic.address}<br />{clinic.city}, {clinic.state} {clinic.zip}</p>
            {clinic.phone && <p><a href={`tel:${clinic.phone}`}>{clinic.phone}</a></p>}
            {clinic.coords && (
              <ClinicMap height={200} points={[{ id: clinic.id, name: clinic.name, coords: clinic.coords, href: `/clinics/${clinic.id}`, detail: clinic.address }]} />
            )}
          </section>

          {(amenities.length > 0 || languages.length > 0) && (
            <section className="panel">
              <h2>Good to know</h2>
              {amenities.length > 0 && (
                <ul className="check-list">{amenities.map((a) => <li key={a}>{a}</li>)}</ul>
              )}
              {languages.length > 0 && (
                <dl className="facts"><div><dt>Languages</dt><dd>{languages.join(', ')}</dd></div></dl>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
