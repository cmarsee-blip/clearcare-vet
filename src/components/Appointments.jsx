import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { procedureById, timesOfDay } from '../data/procedures'
import { formatDate } from '../lib/selectors'
import EmptyState from './EmptyState'
import { useToast } from './Toast'

const todayIso = () => new Date().toISOString().slice(0, 10)

const statusText = {
  requested: 'Waiting for an answer',
  confirmed: 'Confirmed',
  proposed: 'New time suggested',
  declined: 'Declined',
  cancelled: 'Cancelled',
}

// The request form on a veterinarian's page.
export function AppointmentRequest({ vet }) {
  const { user, dispatch } = useStore()
  const [form, setForm] = useState({ petName: '', procedureId: '', date: '', time: timesOfDay[0], note: '' })
  const [sent, setSent] = useState(false)
  const toast = useToast()
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  if (!user) return <p className="callout"><Link to="/login">Log in</Link> to ask for an appointment.</p>
  if (user.role !== 'client') return <p className="muted">Appointment requests are sent from owner accounts.</p>
  if (sent) {
    return <p className="callout" role="status">Request sent. You’ll get a notification when {vet.name} answers, and it is listed under Appointments in <Link to="/profile?tab=appointments">your profile</Link>.</p>
  }

  const submit = (e) => {
    e.preventDefault()
    dispatch({
      type: 'requestAppointment',
      appointment: { vetId: vet.id, ...form, petName: form.petName || user.pets[0]?.name || '', procedureId: form.procedureId || null },
    })
    setSent(true)
    toast({ title: 'Request sent', text: `${vet.name} will confirm or suggest another time.`, action: { label: 'See my appointments', to: '/profile?tab=appointments' } })
  }

  return (
    <form className="form" onSubmit={submit}>
      {!vet.acceptingNew && <p className="note">Not taking new patients right now. Existing patients can still ask.</p>}
      <label>Animal
        {user.pets.length ? (
          <select value={form.petName || user.pets[0].name} onChange={set('petName')}>
            {user.pets.map((p) => <option key={p.id}>{p.name}</option>)}
          </select>
        ) : <input required value={form.petName} onChange={set('petName')} placeholder="Name" />}
      </label>
      <label>Reason
        <select value={form.procedureId} onChange={set('procedureId')}>
          <option value="">General visit or consult</option>
          {vet.services.map((s) => <option key={s.procedureId} value={s.procedureId}>{procedureById[s.procedureId].name}</option>)}
        </select>
      </label>
      <div className="form-grid">
        <label>Preferred day
          <input type="date" required min={todayIso()} value={form.date} onChange={set('date')} />
        </label>
        <label>Time of day
          <select value={form.time} onChange={set('time')}>{timesOfDay.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
      </div>
      <label>Anything they should know (optional)
        <textarea rows="2" value={form.note} onChange={set('note')} />
      </label>
      <button className="btn btn-primary" type="submit">Request appointment</button>
      <p className="muted">This is a request, not a booking. The clinic confirms or suggests another time.</p>
    </form>
  )
}

function AppointmentRow({ appointment: a, role }) {
  const { vets, dispatch } = useStore()
  const [suggesting, setSuggesting] = useState(false)
  const [proposal, setProposal] = useState({ proposedDate: a.date, proposedTime: a.time, reply: '' })
  const vet = vets.find((v) => v.id === a.vetId)
  const update = (patch) => dispatch({ type: 'updateAppointment', id: a.id, patch })
  const staff = role !== 'client'

  const suggest = (e) => {
    e.preventDefault()
    update({ status: 'proposed', ...proposal })
    setSuggesting(false)
  }

  return (
    <li className={`appointment is-${a.status}`}>
      <div className="appointment-main">
        <strong>
          {role === 'client'
            ? (vet ? <Link to={`/vets/${vet.id}`}>{vet.name}</Link> : 'Veterinarian no longer listed')
            : <>{a.clientName}{role === 'clinic' && vet && <span className="muted"> with {vet.name}</span>}</>}
        </strong>
        <span>
          {[a.petName, a.procedureId ? procedureById[a.procedureId]?.name : 'General visit'].filter(Boolean).join(', ')}
        </span>
        <span className="muted">{formatDate(a.date)}, {a.time.toLowerCase()}</span>
        {a.note && <span>“{a.note}”</span>}
        {a.status === 'proposed' && (
          <span className="appointment-proposal">
            Suggested instead: <strong>{formatDate(a.proposedDate)}, {a.proposedTime.toLowerCase()}</strong>
            {a.reply && <>. {a.reply}</>}
          </span>
        )}
      </div>

      <div className="appointment-side">
        <span className={`badge is-${a.status}`}>{statusText[a.status]}</span>
        {staff && a.status === 'requested' && !suggesting && (
          <div className="form-actions">
            <button className="btn btn-primary" onClick={() => update({ status: 'confirmed' })}>Confirm</button>
            <button className="btn btn-outline" onClick={() => setSuggesting(true)}>Suggest another time</button>
            <button className="btn btn-quiet" onClick={() => update({ status: 'declined' })}>Decline</button>
          </div>
        )}
        {!staff && a.status === 'proposed' && (
          <div className="form-actions">
            <button className="btn btn-primary" onClick={() => update({ status: 'confirmed', date: a.proposedDate, time: a.proposedTime })}>Accept new time</button>
            <button className="btn btn-quiet" onClick={() => update({ status: 'cancelled' })}>Cancel request</button>
          </div>
        )}
        {!staff && (a.status === 'requested' || a.status === 'confirmed') && (
          <button className="btn btn-quiet" onClick={() => update({ status: 'cancelled' })}>Cancel request</button>
        )}
      </div>

      {suggesting && (
        <form className="form record-form appointment-suggest" onSubmit={suggest}>
          <div className="form-grid">
            <label>Day<input type="date" required min={todayIso()} value={proposal.proposedDate} onChange={(e) => setProposal({ ...proposal, proposedDate: e.target.value })} /></label>
            <label>Time of day
              <select value={proposal.proposedTime} onChange={(e) => setProposal({ ...proposal, proposedTime: e.target.value })}>
                {timesOfDay.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <label>Note to the owner (optional)<input value={proposal.reply} onChange={(e) => setProposal({ ...proposal, reply: e.target.value })} /></label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Send suggestion</button>
            <button className="btn btn-quiet" type="button" onClick={() => setSuggesting(false)}>Cancel</button>
          </div>
        </form>
      )}
    </li>
  )
}

// role: 'client' | 'vet' | 'clinic'
export function AppointmentList({ appointments, role }) {
  if (!appointments.length) {
    return role === 'client'
      ? <EmptyState title="No appointment requests yet" text="Open a veterinarian’s profile to ask for a day that suits you." action={{ label: 'Find a veterinarian', to: '/search?type=vets' }} />
      : <EmptyState title="No appointment requests yet" text="Requests from owners show up here for you to confirm, decline or move." />
  }
  const order = { requested: 0, proposed: 1, confirmed: 2, declined: 3, cancelled: 3 }
  const sorted = [...appointments].sort((a, b) => order[a.status] - order[b.status] || a.date.localeCompare(b.date))
  return <ul className="appointment-list">{sorted.map((a) => <AppointmentRow key={a.id} appointment={a} role={role} />)}</ul>
}

// How many need this role to do something.
export const needsAnswer = (appointments, role) =>
  appointments.filter((a) => (role === 'client' ? a.status === 'proposed' : a.status === 'requested')).length
