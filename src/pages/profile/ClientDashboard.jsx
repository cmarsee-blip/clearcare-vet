import { useState } from 'react'
import { Link } from 'react-router-dom'
import Tabs from '../../components/Tabs'
import Overview, { plural } from '../../components/Overview'
import EmptyState from '../../components/EmptyState'
import Messages from '../../components/Messages'
import { ReviewList } from '../../components/Reviews'
import { AppointmentList, needsAnswer } from '../../components/Appointments'
import { useStore } from '../../context/StoreContext'
import { procedureById, procedures, species, speciesById } from '../../data/procedures'
import { formatDate, money } from '../../lib/selectors'
import useSaved from './useSaved'

const blankPet = { name: '', species: 'dog', breed: '', age: '', notes: '', records: [] }
const blankRecord = () => ({ date: new Date().toISOString().slice(0, 10), title: '', provider: '', cost: '', notes: '' })

function PetForm({ initial, onSave, onCancel }) {
  const [pet, setPet] = useState(initial)
  const set = (key) => (e) => setPet({ ...pet, [key]: e.target.value })
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); onSave(pet) }}>
      <div className="form-grid">
        <label>Name<input required value={pet.name} onChange={set('name')} /></label>
        <label>Animal
          <select value={pet.species} onChange={set('species')}>
            {species.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label>Breed<input value={pet.breed} onChange={set('breed')} /></label>
        <label>Age (years)<input value={pet.age} onChange={set('age')} /></label>
      </div>
      <label>Notes
        <textarea rows="2" value={pet.notes} onChange={set('notes')} placeholder="Conditions, medications, allergies" />
      </label>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">Save animal</button>
        <button className="btn btn-quiet" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

// The health history for one animal: visits and procedures, who did them
// and what they cost.
function HealthRecords({ pet }) {
  const { vets, clinics, dispatch } = useStore()
  const [adding, setAdding] = useState(false)
  const [record, setRecord] = useState(blankRecord)
  const set = (key) => (e) => setRecord({ ...record, [key]: e.target.value })
  const records = [...(pet.records || [])].sort((a, b) => b.date.localeCompare(a.date))
  const total = records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0)

  const add = (e) => {
    e.preventDefault()
    dispatch({
      type: 'addRecord', petId: pet.id,
      record: { ...record, title: record.title.trim(), provider: record.provider.trim(), cost: record.cost ? Number(record.cost) : null },
    })
    setRecord(blankRecord())
    setAdding(false)
  }

  return (
    <div className="records">
      <div className="records-head">
        <h4>Health records</h4>
        {total > 0 && <span className="muted">{money(total)} recorded</span>}
      </div>

      {records.length ? (
        <ul className="record-list">
          {records.map((r) => (
            <li key={r.id}>
              <div>
                <strong>{r.title}</strong>
                <span className="muted">{[formatDate(r.date), r.provider].filter(Boolean).join(', ')}</span>
                {r.notes && <span>{r.notes}</span>}
              </div>
              <div className="record-side">
                {r.cost ? <strong>{money(r.cost)}</strong> : null}
                <button className="link-button" onClick={() => dispatch({ type: 'removeRecord', petId: pet.id, id: r.id })} aria-label={`Remove ${r.title}`}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="muted">No records yet.</p>}

      {adding ? (
        <form className="form record-form" onSubmit={add}>
          <div className="form-grid">
            <label>Date<input type="date" required value={record.date} onChange={set('date')} /></label>
            <label>Cost ($)<input type="number" min="0" value={record.cost} onChange={set('cost')} placeholder="Optional" /></label>
          </div>
          <label>Procedure or visit
            <input required list={`procedures-${pet.id}`} value={record.title} onChange={set('title')} placeholder="Dental cleaning, annual exam" />
            <datalist id={`procedures-${pet.id}`}>{procedures.map((p) => <option key={p.id} value={p.name} />)}</datalist>
          </label>
          <label>Veterinarian or clinic
            <input list={`providers-${pet.id}`} value={record.provider} onChange={set('provider')} />
            <datalist id={`providers-${pet.id}`}>
              {vets.map((v) => <option key={v.id} value={v.name} />)}
              {clinics.map((c) => <option key={c.id} value={c.name} />)}
            </datalist>
          </label>
          <label>Notes<textarea rows="2" value={record.notes} onChange={set('notes')} /></label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Save record</button>
            <button className="btn btn-quiet" type="button" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="btn btn-outline" onClick={() => setAdding(true)}>Add a record</button>
      )}
    </div>
  )
}

function Animals() {
  const { user, dispatch } = useStore()
  const [editing, setEditing] = useState(null) // pet id, 'new', or null

  const save = (pet) => {
    dispatch(pet.id ? { type: 'updatePet', pet } : { type: 'addPet', pet })
    setEditing(null)
  }

  return (
    <>
      {!user.pets.length && editing !== 'new' && (
        <EmptyState title="No animals yet" text="Add an animal to keep its details and health history in one place." action={{ label: 'Add an animal', onClick: () => setEditing('new') }} />
      )}
      <ul className="card-list">
        {user.pets.map((pet) => (
          <li key={pet.id} className="panel">
            {editing === pet.id ? (
              <PetForm initial={pet} onSave={save} onCancel={() => setEditing(null)} />
            ) : (
              <>
                <h3>{pet.name}</h3>
                <p className="muted">{[speciesById[pet.species]?.label, pet.breed, pet.age && `${pet.age} years`].filter(Boolean).join(', ')}</p>
                {pet.notes && <p>{pet.notes}</p>}
                <div className="form-actions">
                  <button className="btn btn-outline" onClick={() => setEditing(pet.id)}>Edit details</button>
                  <button className="btn btn-quiet" onClick={() => dispatch({ type: 'removePet', id: pet.id })}>Remove animal</button>
                </div>
                <HealthRecords pet={pet} />
              </>
            )}
          </li>
        ))}
      </ul>
      {editing === 'new' ? (
        <div className="panel"><PetForm initial={blankPet} onSave={save} onCancel={() => setEditing(null)} /></div>
      ) : user.pets.length > 0 && (
        <button className="btn btn-primary" onClick={() => setEditing('new')}>Add an animal</button>
      )}
    </>
  )
}

function SavedList() {
  const { user, vets, clinics, dispatch } = useStore()
  if (!user.saved.length) return <EmptyState title="Nothing saved yet" text="Tap the heart on any veterinarian or clinic to keep it here." action={{ label: 'Find care', to: '/search' }} />
  return (
    <ul className="row-list">
      {user.saved.map((s) => {
        const item = (s.type === 'vet' ? vets : clinics).find((x) => x.id === s.id)
        if (!item) return null
        return (
          <li key={`${s.type}-${s.id}`}>
            <div>
              <Link to={`/${s.type}s/${item.id}`}><strong>{item.name}</strong></Link>
              <span className="muted">{s.type === 'vet' ? item.specialties.join(', ') : `${item.city}, ${item.state}`}</span>
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => dispatch({ type: 'toggleCompare', kind: s.type, id: s.id })}>Compare</button>
              <button className="btn btn-quiet" onClick={() => dispatch({ type: 'toggleSaved', kind: s.type, id: s.id })}>Remove</button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// Quick "what I paid" reports this owner has shared.
function PriceReports({ items }) {
  const { vets, dispatch } = useStore()
  if (!items.length) return <EmptyState title="No prices shared yet" text="Use “Share what you paid” on a veterinarian’s page. It takes about ten seconds." action={{ label: 'Find a veterinarian', to: '/search?type=vets' }} />
  return (
    <ul className="row-list">
      {items.map((p) => {
        const vet = vets.find((v) => v.id === p.vetId)
        return (
          <li key={p.id}>
            <div>
              <strong>{money(p.amount)} for {procedureById[p.procedureId]?.name}</strong>
              <span className="muted">
                {vet ? <Link to={`/vets/${vet.id}`}>{vet.name}</Link> : 'Veterinarian no longer listed'}, {formatDate(p.date)}
                {p.proof === 'verified' && ', verified visit'}{p.proof === 'pending' && ', invoice being checked'}
              </span>
            </div>
            <button className="btn btn-quiet" onClick={() => dispatch({ type: 'deletePriceReport', id: p.id })}>Delete</button>
          </li>
        )
      })}
    </ul>
  )
}

function Account() {
  const { user, dispatch } = useStore()
  const [form, setForm] = useState({ name: user.name, email: user.email, city: user.city || '', state: user.state || '', zip: user.zip || '' })
  const [saved, flash] = useSaved()
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <form className="form narrow" onSubmit={(e) => { e.preventDefault(); dispatch({ type: 'updateUser', patch: form }); flash() }}>
      <label>Name<input required value={form.name} onChange={set('name')} /></label>
      <label>Email<input required type="email" value={form.email} onChange={set('email')} /></label>
      <div className="form-grid">
        <label>City<input value={form.city} onChange={set('city')} /></label>
        <label>State<input maxLength="2" value={form.state} onChange={set('state')} /></label>
        <label>ZIP code<input maxLength="5" value={form.zip} onChange={set('zip')} /></label>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">Save changes</button>
        {saved && <span className="status" role="status">Changes saved</span>}
      </div>
    </form>
  )
}

export default function ClientDashboard() {
  const { user, reviews, threads, appointments, priceReports } = useStore()
  const myReviews = reviews.filter((r) => r.authorId === user.id)
  const myThreads = threads.filter((t) => t.clientId === user.id)
  const myAppointments = appointments.filter((a) => a.clientId === user.id)
  const myPrices = priceReports.filter((p) => p.authorId === user.id)
  const toAnswer = needsAnswer(myAppointments, 'client')

  const repliesWaiting = myThreads.filter((t) => t.messages[t.messages.length - 1].from === 'vet').length
  const upcoming = myAppointments.filter((a) => a.status === 'confirmed' && a.date >= new Date().toISOString().slice(0, 10)).length

  const attention = [
    toAnswer > 0 && { text: `${plural(toAnswer, 'appointment')} with a new time for you to accept`, cta: 'Review', tab: 'appointments' },
    !user.pets.length && { text: 'Add your first animal to keep its health history here', cta: 'Add an animal', tab: 'animals' },
  ].filter(Boolean)

  const tiles = [
    { label: 'Animals', value: user.pets.length, tab: 'animals' },
    { label: 'Upcoming appointments', value: upcoming, tab: 'appointments' },
    { label: 'Saved', value: user.saved.length, tab: 'saved' },
    { label: 'Reviews', value: myReviews.length, tab: 'reviews' },
    { label: 'Prices shared', value: myPrices.length, tab: 'prices' },
    { label: 'Conversations', value: myThreads.length, tab: 'messages' },
  ]

  return (
    <Tabs
      tabs={[
        {
          id: 'overview', label: 'Overview',
          content: (goTo) => (
            <Overview attention={attention} tiles={tiles} goTo={goTo}>
              <p><Link className="btn btn-outline" to="/search">Find care</Link></p>
            </Overview>
          ),
        },
        { id: 'animals', label: 'My animals', count: user.pets.length, content: <Animals /> },
        { id: 'appointments', label: 'Appointments', count: toAnswer || myAppointments.length, alert: toAnswer > 0, content: <AppointmentList appointments={myAppointments} role="client" /> },
        { id: 'saved', label: 'Saved', count: user.saved.length, content: <SavedList /> },
        { id: 'reviews', label: 'My reviews', count: myReviews.length, content: <ReviewList reviews={myReviews} showTarget /> },
        { id: 'prices', label: 'Prices I shared', count: myPrices.length, content: <PriceReports items={myPrices} /> },
        { id: 'messages', label: 'Messages', count: repliesWaiting || myThreads.length, content: <Messages threads={myThreads} me="client" /> },
        { id: 'account', label: 'Account', content: <Account /> },
      ]}
    />
  )
}
