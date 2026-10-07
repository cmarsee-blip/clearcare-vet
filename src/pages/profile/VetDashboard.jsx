import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../../components/Avatar'
import Tabs from '../../components/Tabs'
import Overview, { plural } from '../../components/Overview'
import Messages from '../../components/Messages'
import { ReviewList } from '../../components/Reviews'
import { useStore } from '../../context/StoreContext'
import { AppointmentList, needsAnswer } from '../../components/Appointments'
import VerificationPanel from './VerificationPanel'
import { days, inclusions, procedureById, procedures, species } from '../../data/procedures'
import { fileToDataUrl } from '../../lib/image'
import { median, money, ratingSummary, reportedPrices, reviewsFor } from '../../lib/selectors'
import useSaved from './useSaved'

function ServicesEditor({ vet }) {
  const { dispatch } = useStore()
  const [rows, setRows] = useState(vet.services)
  const [saved, flash] = useSaved()

  const update = (i, key, value) =>
    setRows(rows.map((row, n) => (n === i ? { ...row, [key]: key === 'procedureId' ? value : Number(value) } : row)))
  const toggleInclude = (i, item) =>
    setRows(rows.map((row, n) => {
      if (n !== i) return row
      const has = (row.includes || []).includes(item)
      return { ...row, includes: has ? row.includes.filter((x) => x !== item) : [...(row.includes || []), item] }
    }))
  const unused = procedures.find((p) => !rows.some((r) => r.procedureId === p.id))

  const save = (e) => {
    e.preventDefault()
    dispatch({ type: 'updateVet', id: vet.id, patch: { services: rows } })
    flash()
  }

  return (
    <form className="form" onSubmit={save}>
      <p className="muted">These prices appear on your profile next to what clients report paying. Ticking what each price includes lets owners compare like with like.</p>
      {rows.map((row, i) => (
        <div className="service-edit" key={i}>
          <label>Procedure
            <select value={row.procedureId} onChange={(e) => update(i, 'procedureId', e.target.value)}>
              {procedures.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label>Price from ($)
            <input type="number" min="0" required value={row.priceLow} onChange={(e) => update(i, 'priceLow', e.target.value)} />
          </label>
          <label>Price to ($)
            <input type="number" min={row.priceLow} required value={row.priceHigh} onChange={(e) => update(i, 'priceHigh', e.target.value)} />
          </label>
          <button type="button" className="btn btn-quiet" onClick={() => setRows(rows.filter((_, n) => n !== i))}>Remove</button>
          <fieldset className="service-includes">
            <legend>This price includes</legend>
            <div className="check-grid is-wide">
              {inclusions.map((item) => (
                <label className="radio" key={item}>
                  <input type="checkbox" checked={(row.includes || []).includes(item)} onChange={() => toggleInclude(i, item)} />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      ))}
      <div className="form-actions">
        {unused && (
          <button type="button" className="btn btn-outline" onClick={() => setRows([...rows, { procedureId: unused.id, priceLow: 0, priceHigh: 0, includes: [] }])}>
            Add a service
          </button>
        )}
        <button className="btn btn-primary" type="submit">Save services</button>
        {saved && <span className="status" role="status">Services saved</span>}
      </div>
    </form>
  )
}

function AvailabilityEditor({ vet }) {
  const { dispatch } = useStore()
  const [hours, setHours] = useState(vet.availability || {})
  const [acceptingNew, setAcceptingNew] = useState(vet.acceptingNew)
  const [saved, flash] = useSaved()

  const save = (e) => {
    e.preventDefault()
    dispatch({ type: 'updateVet', id: vet.id, patch: { availability: hours, acceptingNew } })
    flash()
  }

  return (
    <form className="form narrow" onSubmit={save}>
      <label className="radio">
        <input type="checkbox" checked={acceptingNew} onChange={(e) => setAcceptingNew(e.target.checked)} />
        Taking new patients
      </label>
      {days.map((d) => (
        <label className="hours-edit" key={d}>
          <span>{d}</span>
          <input value={hours[d] || ''} placeholder="Closed" onChange={(e) => setHours({ ...hours, [d]: e.target.value })} />
        </label>
      ))}
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">Save availability</button>
        {saved && <span className="status" role="status">Availability saved</span>}
      </div>
    </form>
  )
}

function DetailsEditor({ vet }) {
  const { dispatch } = useStore()
  const [form, setForm] = useState({
    name: vet.name, credentials: vet.credentials, bio: vet.bio,
    specialties: vet.specialties.join(', '), species: vet.species,
    photo: vet.photo || null, education: vet.education || '',
    licenseState: vet.licenseState || '', yearsExperience: vet.yearsExperience || '',
  })
  const [photoError, setPhotoError] = useState('')
  const [saved, flash] = useSaved()
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const toggleSpecies = (id) =>
    setForm({ ...form, species: form.species.includes(id) ? form.species.filter((s) => s !== id) : [...form.species, id] })

  const choosePhoto = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const photo = await fileToDataUrl(file, 320)
      setForm((f) => ({ ...f, photo }))
      setPhotoError('')
    } catch (err) {
      setPhotoError(err.message)
    }
  }

  const save = (e) => {
    e.preventDefault()
    dispatch({
      type: 'updateVet', id: vet.id,
      patch: {
        ...form,
        yearsExperience: Number(form.yearsExperience) || 0,
        licenseState: form.licenseState.toUpperCase(),
        specialties: form.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      },
    })
    flash()
  }

  return (
    <form className="form narrow" onSubmit={save}>
      <div className="photo-edit">
        <Avatar name={form.name || 'Vet'} photo={form.photo} size={96} />
        <div>
          <label className="btn btn-outline file-button">
            {form.photo ? 'Change photo' : 'Add a photo'}
            <input type="file" accept="image/*" onChange={choosePhoto} />
          </label>
          {form.photo && <button type="button" className="btn btn-quiet" onClick={() => setForm({ ...form, photo: null })}>Remove photo</button>}
          {photoError && <p className="note" role="alert">{photoError}</p>}
        </div>
      </div>

      <div className="form-grid">
        <label>Name<input required value={form.name} onChange={set('name')} /></label>
        <label>Credentials<input value={form.credentials} onChange={set('credentials')} placeholder="DVM, DACVS" /></label>
      </div>
      <label>Education and training
        <input value={form.education} onChange={set('education')} placeholder="DVM, Purdue University. Residency, ..." />
      </label>
      <div className="form-grid">
        <label>State licensed in<input maxLength="2" value={form.licenseState} onChange={set('licenseState')} placeholder="IN" /></label>
        <label>Years in practice<input type="number" min="0" value={form.yearsExperience} onChange={set('yearsExperience')} /></label>
      </div>
      <label>Specialties (separate with commas)<input value={form.specialties} onChange={set('specialties')} /></label>
      <label>About you<textarea rows="4" value={form.bio} onChange={set('bio')} /></label>
      <fieldset>
        <legend>Animals you see</legend>
        <div className="check-grid">
          {species.map((s) => (
            <label className="radio" key={s.id}>
              <input type="checkbox" checked={form.species.includes(s.id)} onChange={() => toggleSpecies(s.id)} />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">Save details</button>
        {saved && <span className="status" role="status">Details saved</span>}
      </div>
    </form>
  )
}

// How the profile is doing, and whether clients are paying what is listed.
function Stats({ vet, threads }) {
  const { reviews, users, stats, pricePoints } = useStore()
  const myReviews = reviewsFor(reviews, 'vet', vet.id)
  const { average, count } = ratingSummary(myReviews)
  const savedBy = users.filter((u) => u.saved?.some((s) => s.type === 'vet' && s.id === vet.id)).length
  const waiting = threads.filter((t) => t.messages[t.messages.length - 1].from === 'client').length

  const tiles = [
    ['Profile views', stats[`vet:${vet.id}`] || 0],
    ['Saved by owners', savedBy],
    ['Conversations', threads.length],
    ['Waiting on your reply', waiting],
    ['Average rating', count ? average.toFixed(1) : 'None yet'],
    ['Reviews', count],
  ]

  const verdict = (s, paid) => {
    if (paid == null) return { text: 'No client reports yet', tone: 'muted' }
    if (paid > s.priceHigh) return { text: `${money(paid - s.priceHigh)} above your range`, tone: 'note' }
    if (paid < s.priceLow) return { text: `${money(s.priceLow - paid)} below your range`, tone: 'note is-good' }
    return { text: 'Within your range', tone: 'note is-good' }
  }

  return (
    <>
      <dl className="stat-grid">
        {tiles.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>

      <h3>Your listed prices and what clients report</h3>
      {vet.services.length ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr><th scope="col">Procedure</th><th scope="col">Your range</th><th scope="col">Clients paid (median)</th><th scope="col">Reports</th><th scope="col">Result</th></tr>
            </thead>
            <tbody>
              {vet.services.map((s) => {
                const reported = reportedPrices(pricePoints, vet.id, s.procedureId)
                const paid = median(reported)
                const v = verdict(s, paid)
                return (
                  <tr key={s.procedureId}>
                    <th scope="row">{procedureById[s.procedureId].name}</th>
                    <td>{money(s.priceLow)} to {money(s.priceHigh)}</td>
                    <td>{paid == null ? '' : money(paid)}</td>
                    <td>{reported.length}</td>
                    <td><span className={v.tone}>{v.text}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : <p className="empty">Add services to see how your listed prices compare with what clients report.</p>}
    </>
  )
}

// Invites from clinics, matched to this account by email.
function Invites({ vet }) {
  const { user, invites, clinics, dispatch } = useStore()
  const pending = invites.filter((i) => i.status === 'pending' && i.email === user.email.toLowerCase() && i.clinicId !== vet.clinicId)
  if (!pending.length) return null

  return (
    <ul className="invite-list">
      {pending.map((invite) => {
        const clinic = clinics.find((c) => c.id === invite.clinicId)
        if (!clinic) return null
        return (
          <li key={invite.id} className="callout">
            <p>
              <strong><Link to={`/clinics/${clinic.id}`}>{clinic.name}</Link></strong> in {clinic.city}, {clinic.state} invited you to join their team.
              {vet.clinicId && ' Accepting moves your profile from your current clinic to this one.'}
            </p>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={() => dispatch({ type: 'respondInvite', id: invite.id, vetId: vet.id, accept: true })}>Accept invite</button>
              <button className="btn btn-quiet" onClick={() => dispatch({ type: 'respondInvite', id: invite.id, vetId: vet.id, accept: false })}>Decline</button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default function VetDashboard() {
  const { user, vets, clinics, reviews, threads, appointments, stats } = useStore()
  const vet = vets.find((v) => v.id === user.vetId)
  if (!vet) return <p className="empty">This account is not linked to a veterinarian profile yet.</p>

  const clinic = clinics.find((c) => c.id === vet.clinicId)
  const myThreads = threads.filter((t) => t.vetId === vet.id)
  const waiting = myThreads.filter((t) => t.messages[t.messages.length - 1].from === 'client').length
  const myReviews = reviewsFor(reviews, 'vet', vet.id)
  const myAppointments = appointments.filter((a) => a.vetId === vet.id)

  const toConfirm = needsAnswer(myAppointments, 'vet')
  const unanswered = myReviews.filter((r) => !r.reply).length
  const { average, count } = ratingSummary(myReviews)

  const attention = [
    waiting > 0 && { text: `${plural(waiting, 'message')} waiting for your reply`, cta: 'Answer', tab: 'messages' },
    toConfirm > 0 && { text: `${plural(toConfirm, 'appointment request')} to answer`, cta: 'Review', tab: 'appointments' },
    !vet.services.length && { text: 'List your services and prices so owners can find you by procedure', cta: 'Add services', tab: 'services' },
    !vet.bio && { text: 'Your profile has no bio yet', cta: 'Write one', tab: 'details' },
    !vet.photo && { text: 'Profiles with a photo get more messages', cta: 'Add a photo', tab: 'details' },
  ].filter(Boolean)

  const tiles = [
    { label: 'Profile views', value: stats[`vet:${vet.id}`] || 0, tab: 'stats' },
    { label: 'Average rating', value: count ? average.toFixed(1) : 'None yet', tab: 'reviews' },
    { label: 'Reviews', value: count, tab: 'reviews' },
    { label: 'Reviews without a reply', value: unanswered, tab: 'reviews' },
    { label: 'Services listed', value: vet.services.length, tab: 'services' },
    { label: 'Appointments', value: myAppointments.length, tab: 'appointments' },
  ]

  return (
    <>
      <VerificationPanel kind="vet" entity={vet} />
      {!clinic && (
        <p className="callout">
          You are not linked to a clinic yet, so owners can’t find you in search. Ask your clinic to invite <strong>{user.email}</strong> from their Veterinarians section.
        </p>
      )}
      <Invites vet={vet} />
      <Tabs
        tabs={[
          {
            id: 'overview', label: 'Overview',
            content: (goTo) => (
              <Overview attention={attention} tiles={tiles} goTo={goTo}>
                <p>
                  <Link className="btn btn-outline" to={`/vets/${vet.id}`}>View your public profile</Link>
                  {clinic && <span className="muted"> Listed at <Link to={`/clinics/${clinic.id}`}>{clinic.name}</Link></span>}
                </p>
              </Overview>
            ),
          },
          { id: 'messages', label: 'Messages', count: waiting, alert: true, content: <Messages threads={myThreads} me="vet" /> },
          { id: 'appointments', label: 'Appointments', count: toConfirm, alert: true, content: <AppointmentList appointments={myAppointments} role="vet" /> },
          { id: 'services', label: 'Services and prices', content: <ServicesEditor vet={vet} /> },
          { id: 'availability', label: 'Availability', content: <AvailabilityEditor vet={vet} /> },
          { id: 'details', label: 'Profile details', content: <DetailsEditor vet={vet} /> },
          { id: 'reviews', label: 'Reviews', count: myReviews.length, content: <ReviewList reviews={myReviews} /> },
          { id: 'stats', label: 'Stats', content: <Stats vet={vet} threads={myThreads} /> },
        ]}
      />
    </>
  )
}
