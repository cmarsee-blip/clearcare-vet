import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Stars from '../components/Stars'
import SaveButton from '../components/SaveButton'
import CompareButton from '../components/CompareButton'
import ServiceTable from '../components/ServiceTable'
import { ReviewForm, ReviewList } from '../components/Reviews'
import NotFound from './NotFound'
import { useStore } from '../context/StoreContext'
import { days, speciesById } from '../data/procedures'
import VerifiedBadge from '../components/VerifiedBadge'
import PriceReportForm from '../components/PriceReportForm'
import { AppointmentRequest } from '../components/Appointments'
import { ratingSummary, reportedPrices, reviewsFor } from '../lib/selectors'
import useRecordView from '../lib/useRecordView'
import { useToast } from '../components/Toast'

function AskQuestion({ vet }) {
  const { user, dispatch } = useStore()
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)
  const toast = useToast()

  if (!user) return <p className="callout"><Link to="/login">Log in</Link> to message {vet.name}.</p>
  if (user.role !== 'client') return <p className="muted">Messages are sent from owner accounts.</p>
  if (sent) return <p className="callout" role="status">Message sent. Replies appear under Messages in <Link to="/profile?tab=messages">your profile</Link>.</p>

  const send = (e) => {
    e.preventDefault()
    dispatch({
      type: 'sendMessage', vetId: vet.id, clientId: user.id, clientName: user.name,
      from: 'client', subject: subject.trim(), text: text.trim(),
    })
    setSent(true)
    toast({ title: 'Message sent', text: `You’ll get a notification when ${vet.name} replies.`, action: { label: 'See my messages', to: '/profile?tab=messages' } })
  }

  return (
    <form className="form" onSubmit={send}>
      <label>Subject
        <input required value={subject} onChange={(e) => setSubject(e.target.value)} />
      </label>
      <label>Your question
        <textarea required rows="4" value={text} onChange={(e) => setText(e.target.value)} />
      </label>
      <button className="btn btn-primary" type="submit">Send message</button>
    </form>
  )
}

export default function VetDetail() {
  const { id } = useParams()
  const { vets, clinics, reviews, pricePoints, user } = useStore()
  const vet = vets.find((v) => v.id === id)
  useRecordView('vet', vet?.id, user?.vetId === id)
  if (!vet) return <NotFound />

  const clinic = clinics.find((c) => c.id === vet.clinicId)
  const vetReviews = reviewsFor(reviews, 'vet', vet.id)
  const services = vet.services.map((s) => ({ ...s, reported: reportedPrices(pricePoints, vet.id, s.procedureId) }))
  const credentials = [
    ['Education', vet.education],
    ['Licensed in', vet.licenseState],
    ['In practice', vet.yearsExperience ? `${vet.yearsExperience} years` : ''],
  ].filter(([, value]) => value)

  return (
    <div className="container detail-page">
      <header className="detail-head">
        <div className="detail-identity">
          <Avatar name={vet.name} photo={vet.photo} size={96} />
          <div>
            <div className="result-tags">
              <span className="kind-tag is-vet">Veterinarian</span>
              <VerifiedBadge status={vet.verification} />
            </div>
            <h1>{vet.name}<span className="credentials">, {vet.credentials}</span></h1>
            <p className="detail-where">
              {clinic
                ? <><Link to={`/clinics/${clinic.id}`}>{clinic.name}</Link>, {clinic.city}, {clinic.state} {clinic.zip}</>
                : 'Not linked to a clinic yet'}
            </p>
            <Stars {...ratingSummary(vetReviews)} />
          </div>
        </div>
        <div className="detail-actions">
          <SaveButton kind="vet" id={vet.id} />
          <CompareButton kind="vet" id={vet.id} />
        </div>
      </header>

      <div className="detail-layout">
        <div className="detail-main">
          <section>
            <h2>About</h2>
            <p>{vet.bio || 'This veterinarian has not written a bio yet.'}</p>
            <ul className="tag-list">
              {vet.specialties.map((s) => <li key={s} className="tag">{s}</li>)}
              {vet.species.map((s) => <li key={s} className="tag is-plain">{speciesById[s]?.label}</li>)}
            </ul>
          </section>

          <section>
            <h2>Services and prices</h2>
            <ServiceTable services={services} />
            <PriceReportForm vets={[vet]} />
          </section>

          <section>
            <h2>Reviews</h2>
            <ReviewList reviews={vetReviews} />
            <ReviewForm targetType="vet" targetId={vet.id} procedureIds={vet.services.map((s) => s.procedureId)} />
          </section>
        </div>

        <aside className="detail-side">
          <section className="panel">
            <h2>Availability</h2>
            <p className={vet.acceptingNew ? 'note is-good' : 'note'}>
              {vet.acceptingNew ? 'Taking new patients' : 'Not taking new patients right now'}
            </p>
            <table className="hours">
              <tbody>
                {days.map((d) => (
                  <tr key={d}><th scope="row">{d}</th><td>{vet.availability?.[d] || 'Closed'}</td></tr>
                ))}
              </tbody>
            </table>
            {clinic && <p>Book through the clinic: <a href={`tel:${clinic.phone}`}>{clinic.phone}</a></p>}
          </section>

          <section className="panel">
            <h2>Ask for an appointment</h2>
            <AppointmentRequest vet={vet} />
          </section>

          {credentials.length > 0 && (
            <section className="panel">
              <h2>Credentials</h2>
              <dl className="facts">
                {credentials.map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
            </section>
          )}

          <section className="panel">
            <h2>Ask a question</h2>
            <AskQuestion vet={vet} />
          </section>
        </aside>
      </div>
    </div>
  )
}
