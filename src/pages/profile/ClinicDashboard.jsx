import { useState } from 'react'
import { Link } from 'react-router-dom'
import Tabs from '../../components/Tabs'
import Overview, { plural } from '../../components/Overview'
import EmptyState from '../../components/EmptyState'
import { hasHours } from '../../lib/hours'
import { ReviewList } from '../../components/Reviews'
import { useStore } from '../../context/StoreContext'
import { AppointmentList, needsAnswer } from '../../components/Appointments'
import VerificationPanel from './VerificationPanel'
import { amenities as amenityOptions, days, species } from '../../data/procedures'
import { fileToDataUrl } from '../../lib/image'
import { formatDate, reviewsFor, vetsAt } from '../../lib/selectors'
import useSaved from './useSaved'

const MAX_PHOTOS = 6
const toggleIn = (list, value) => (list.includes(value) ? list.filter((x) => x !== value) : [...list, value])

function ClinicDetails({ clinic }) {
  const { dispatch } = useStore()
  const [form, setForm] = useState({
    ...clinic, amenities: clinic.amenities || [], languages: (clinic.languages || []).join(', '),
    openHours: clinic.openHours || {}, open24: !!clinic.open24,
  })
  const [saved, flash] = useSaved()
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  // Opening hours: null means closed that day.
  const setDay = (day, value) => setForm({ ...form, openHours: { ...form.openHours, [day]: value } })

  const save = (e) => {
    e.preventDefault()
    // Photos are saved from their own tab, so leave them out here.
    // License and verification are changed through the verification panel.
    const { photos, verification, licenseNumber, coords, ...details } = form
    dispatch({
      type: 'updateClinic', id: clinic.id,
      patch: { ...details, languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean) },
    })
    flash()
  }

  return (
    <form className="form narrow" onSubmit={save}>
      <label>Clinic name<input required value={form.name} onChange={set('name')} /></label>
      <label>About the clinic<textarea rows="4" value={form.about} onChange={set('about')} /></label>
      <label>Street address<input value={form.address} onChange={set('address')} /></label>
      <div className="form-grid">
        <label>City<input value={form.city} onChange={set('city')} /></label>
        <label>State<input maxLength="2" value={form.state} onChange={set('state')} /></label>
        <label>ZIP code<input maxLength="5" value={form.zip} onChange={set('zip')} /></label>
      </div>
      <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
      <fieldset>
        <legend>Opening hours</legend>
        <label className="radio">
          <input type="checkbox" checked={form.open24} onChange={(e) => setForm({ ...form, open24: e.target.checked })} />
          Open 24 hours, every day
        </label>
        {!form.open24 && days.map((d) => {
          const day = form.openHours[d]
          return (
            <div className="day-hours" key={d}>
              <label className="radio">
                <input type="checkbox" checked={!!day} onChange={(e) => setDay(d, e.target.checked ? { open: '08:00', close: '17:00' } : null)} />
                {d}
              </label>
              {day ? (
                <>
                  <input type="time" required aria-label={`${d} opens`} value={day.open} onChange={(e) => setDay(d, { ...day, open: e.target.value })} />
                  <span>to</span>
                  <input type="time" required aria-label={`${d} closes`} value={day.close} onChange={(e) => setDay(d, { ...day, close: e.target.value })} />
                </>
              ) : <span className="muted">Closed</span>}
            </div>
          )
        })}
      </fieldset>
      <label>Note about hours (optional)<input value={form.hours} onChange={set('hours')} placeholder="Farm calls and emergencies by phone" /></label>
      <label className="radio">
        <input type="checkbox" checked={form.emergency} onChange={(e) => setForm({ ...form, emergency: e.target.checked })} />
        We take emergencies
      </label>
      <fieldset>
        <legend>Animals we see</legend>
        <div className="check-grid">
          {species.map((s) => (
            <label className="radio" key={s.id}>
              <input type="checkbox" checked={form.species.includes(s.id)} onChange={() => setForm({ ...form, species: toggleIn(form.species, s.id) })} />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Amenities</legend>
        <div className="check-grid is-wide">
          {amenityOptions.map((a) => (
            <label className="radio" key={a}>
              <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => setForm({ ...form, amenities: toggleIn(form.amenities, a) })} />
              {a}
            </label>
          ))}
        </div>
      </fieldset>
      <label>Languages spoken (separate with commas)<input value={form.languages} onChange={set('languages')} /></label>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">Save clinic details</button>
        {saved && <span className="status" role="status">Clinic details saved</span>}
      </div>
    </form>
  )
}

function Photos({ clinic }) {
  const { dispatch } = useStore()
  const [error, setError] = useState('')
  const photos = clinic.photos || []
  const room = MAX_PHOTOS - photos.length

  const add = async (e) => {
    const files = [...e.target.files].slice(0, room)
    e.target.value = ''
    try {
      const added = await Promise.all(files.map((f) => fileToDataUrl(f, 900, 0.78)))
      dispatch({ type: 'updateClinic', id: clinic.id, patch: { photos: [...photos, ...added] } })
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }
  const remove = (index) =>
    dispatch({ type: 'updateClinic', id: clinic.id, patch: { photos: photos.filter((_, i) => i !== index) } })

  return (
    <>
      <p className="muted">Up to {MAX_PHOTOS} photos appear at the top of your clinic page. The first one is shown largest.</p>
      {photos.length ? (
        <ul className="photo-grid">
          {photos.map((src, i) => (
            <li key={i}>
              <img src={src} alt={`Clinic photo ${i + 1}`} />
              <button className="btn btn-outline" onClick={() => remove(i)}>Remove</button>
            </li>
          ))}
        </ul>
      ) : <EmptyState title="No photos yet" text="Owners like to see the building, the lobby and an exam room." />}
      {error && <p className="note" role="alert">{error}</p>}
      {room > 0 && (
        <label className="btn btn-primary file-button">
          Add photos
          <input type="file" accept="image/*" multiple onChange={add} />
        </label>
      )}
    </>
  )
}

const blankVet = { name: '', credentials: 'DVM', specialties: '', bio: '' }

function Team({ clinic }) {
  const { vets, invites, users, dispatch } = useStore()
  const team = vetsAt(vets, clinic.id)
  const myInvites = invites.filter((i) => i.clinicId === clinic.id && i.status !== 'accepted')
  const [mode, setMode] = useState(null) // null | 'invite' | 'create'
  const [invite, setInvite] = useState({ name: '', email: '' })
  const [form, setForm] = useState(blankVet)
  const [error, setError] = useState('')
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const sendInvite = (e) => {
    e.preventDefault()
    const email = invite.email.trim().toLowerCase()
    if (myInvites.some((i) => i.email === email && i.status === 'pending')) {
      setError('You already have a pending invite to that email.')
      return
    }
    const account = users.find((u) => u.role === 'vet' && u.email.toLowerCase() === email)
    if (account && team.some((v) => v.id === account.vetId)) {
      setError('That veterinarian is already on your team.')
      return
    }
    dispatch({ type: 'sendInvite', clinicId: clinic.id, email, name: invite.name.trim() })
    setInvite({ name: '', email: '' })
    setError('')
    setMode(null)
  }

  const create = (e) => {
    e.preventDefault()
    dispatch({
      type: 'addVet',
      vet: {
        clinicId: clinic.id, name: form.name.trim(), credentials: form.credentials.trim(), bio: form.bio.trim(),
        specialties: form.specialties.split(',').map((s) => s.trim()).filter(Boolean),
        species: clinic.species, yearsExperience: 0, acceptingNew: true, availability: {}, services: [],
        licenseState: clinic.state,
      },
    })
    setForm(blankVet)
    setMode(null)
  }

  return (
    <>
      {team.length ? (
        <ul className="row-list">
          {team.map((v) => (
            <li key={v.id}>
              <div>
                <Link to={`/vets/${v.id}`}><strong>{v.name}</strong>, {v.credentials}</Link>
                <span className="muted">{v.specialties.join(', ') || 'No specialties listed'}, {v.services.length} services</span>
              </div>
              <button className="btn btn-quiet" onClick={() => dispatch({ type: 'removeVet', id: v.id })}>Remove from clinic</button>
            </li>
          ))}
        </ul>
      ) : mode === null && <EmptyState title="No veterinarians yet" text="Invite your veterinarians so each one gets a profile owners can find." action={{ label: 'Invite a veterinarian', onClick: () => setMode('invite') }} />}

      {myInvites.length > 0 && (
        <>
          <h3>Invites</h3>
          <ul className="row-list">
            {myInvites.map((i) => (
              <li key={i.id}>
                <div>
                  <strong>{i.name || i.email}</strong>
                  <span className="muted">{i.email}, sent {formatDate(i.date)}</span>
                </div>
                <div className="form-actions">
                  <span className={i.status === 'declined' ? 'note' : 'muted'}>{i.status === 'declined' ? 'Declined' : 'Waiting for a reply'}</span>
                  <button className="btn btn-quiet" onClick={() => dispatch({ type: 'cancelInvite', id: i.id })}>
                    {i.status === 'declined' ? 'Dismiss' : 'Cancel invite'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {mode === 'invite' && (
        <form className="form narrow panel" onSubmit={sendInvite}>
          <h3>Invite a veterinarian</h3>
          <p className="muted">They see the invite in their profile when they log in or sign up with this email, and join your team when they accept.</p>
          <div className="form-grid">
            <label>Their name<input value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} placeholder="Dr. First Last" /></label>
            <label>Their email<input required type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} /></label>
          </div>
          {error && <p className="note" role="alert">{error}</p>}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Send invite</button>
            <button className="btn btn-quiet" type="button" onClick={() => { setMode(null); setError('') }}>Cancel</button>
          </div>
        </form>
      )}

      {mode === 'create' && (
        <form className="form narrow panel" onSubmit={create}>
          <h3>Create a profile for a veterinarian</h3>
          <p className="muted">Use this when a veterinarian will not manage their own account. The clinic keeps the profile up to date.</p>
          <div className="form-grid">
            <label>Name<input required value={form.name} onChange={set('name')} placeholder="Dr. First Last" /></label>
            <label>Credentials<input value={form.credentials} onChange={set('credentials')} /></label>
          </div>
          <label>Specialties (separate with commas)<input value={form.specialties} onChange={set('specialties')} /></label>
          <label>Short bio<textarea rows="3" value={form.bio} onChange={set('bio')} /></label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Create profile</button>
            <button className="btn btn-quiet" type="button" onClick={() => setMode(null)}>Cancel</button>
          </div>
        </form>
      )}

      {mode === null && (
        <div className="form-actions">
          <button className="btn btn-primary" onClick={() => setMode('invite')}>Invite a veterinarian</button>
          <button className="btn btn-outline" onClick={() => setMode('create')}>Create a profile for them</button>
        </div>
      )}
    </>
  )
}

export default function ClinicDashboard() {
  const { user, clinics, vets, reviews, stats, appointments } = useStore()
  const clinic = clinics.find((c) => c.id === user.clinicId)
  if (!clinic) return <p className="empty">This account is not linked to a clinic yet.</p>

  const team = vetsAt(vets, clinic.id)
  const clinicReviews = reviewsFor(reviews, 'clinic', clinic.id)
  const teamReviews = team.flatMap((v) => reviewsFor(reviews, 'vet', v.id))
  const teamAppointments = appointments.filter((a) => team.some((v) => v.id === a.vetId))

  const toConfirm = needsAnswer(teamAppointments, 'clinic')
  const unanswered = clinicReviews.filter((r) => !r.reply).length
  const photoCount = (clinic.photos || []).length

  const attention = [
    toConfirm > 0 && { text: `${plural(toConfirm, 'appointment request')} to answer`, cta: 'Review', tab: 'appointments' },
    !team.length && { text: 'Invite your veterinarians so owners can find them', cta: 'Invite', tab: 'team' },
    !hasHours(clinic) && { text: 'Add opening hours so you show up in “Open now” searches', cta: 'Add hours', tab: 'details' },
    !photoCount && { text: 'Add photos of the building, lobby and an exam room', cta: 'Add photos', tab: 'photos' },
    unanswered > 0 && { text: `${plural(unanswered, 'clinic review')} without a reply`, cta: 'Read', tab: 'reviews' },
  ].filter(Boolean)

  const tiles = [
    { label: 'Page views', value: stats[`clinic:${clinic.id}`] || 0 },
    { label: 'Veterinarians', value: team.length, tab: 'team' },
    { label: 'Clinic reviews', value: clinicReviews.length, tab: 'reviews' },
    { label: 'Team reviews', value: teamReviews.length, tab: 'team-reviews' },
    { label: 'Appointments', value: teamAppointments.length, tab: 'appointments' },
    { label: 'Photos', value: photoCount, tab: 'photos' },
  ]

  return (
    <>
      <VerificationPanel kind="clinic" entity={clinic} />
      <Tabs
        tabs={[
          {
            id: 'overview', label: 'Overview',
            content: (goTo) => (
              <Overview attention={attention} tiles={tiles} goTo={goTo}>
                <p><Link className="btn btn-outline" to={`/clinics/${clinic.id}`}>View your public clinic page</Link></p>
              </Overview>
            ),
          },
          { id: 'team', label: 'Veterinarians', count: team.length, content: <Team clinic={clinic} /> },
          { id: 'appointments', label: 'Appointments', count: toConfirm, alert: true, content: <AppointmentList appointments={teamAppointments} role="clinic" /> },
          { id: 'details', label: 'Clinic details', content: <ClinicDetails clinic={clinic} /> },
          { id: 'photos', label: 'Photos', count: photoCount, content: <Photos clinic={clinic} /> },
          { id: 'reviews', label: 'Clinic reviews', count: clinicReviews.length, content: <ReviewList reviews={clinicReviews} /> },
          { id: 'team-reviews', label: 'Team reviews', count: teamReviews.length, content: <ReviewList reviews={teamReviews} showTarget /> },
        ]}
      />
    </>
  )
}
