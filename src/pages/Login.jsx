import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

// There is no real authentication yet. The three sample buttons log you in
// as a ready-made account for each role, and the sign-up form creates an
// account that only exists in this browser. Replace with real auth (and
// verification for veterinarians and clinics) when you add a backend.
const demos = [
  { userId: 'u-client', label: 'animal owner', detail: 'Jordan, with two animals, saved vets and past reviews' },
  { userId: 'u-vet', label: 'veterinarian', detail: 'Dr. Raman, with services, an inbox and a clinic invite' },
  { userId: 'u-clinic', label: 'clinic', detail: 'Broad Ripple Animal Surgery, with two veterinarians' },
  { userId: 'u-admin', label: 'site admin', detail: 'You: licenses to check, reported reviews, invoices and accounts' },
]

const roles = [
  { id: 'client', label: 'Animal owner' },
  { id: 'vet', label: 'Veterinarian' },
  { id: 'clinic', label: 'Clinic' },
]

const blank = { name: '', email: '', zip: '', credentials: 'DVM', state: '', address: '', city: '', phone: '', licenseNumber: '' }

export default function Login() {
  const { users, dispatch } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState('client')
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const goNext = () => navigate(location.state?.from || '/profile')

  const demoLogin = (userId) => {
    if (users.find((u) => u.id === userId)?.suspended) {
      setError('This account is suspended. Log in as the site admin to reinstate it.')
      return
    }
    dispatch({ type: 'login', userId })
    goNext()
  }

  const signUp = (e) => {
    e.preventDefault()
    const email = form.email.trim().toLowerCase()
    if (users.some((u) => u.email.toLowerCase() === email)) {
      setError('An account with that email already exists. Use a different email.')
      return
    }
    dispatch({ type: 'signup', user: { ...form, role, name: form.name.trim(), email } })
    navigate('/profile')
  }

  return (
    <div className="container login-page">
      <section>
        <h1>Log in</h1>
        <p className="lede">Pick a sample account to see the site from each side.</p>
        <ul className="demo-list">
          {demos.map((d) => (
            <li key={d.userId}>
              <button className="demo-button" onClick={() => demoLogin(d.userId)}>
                <strong>Log in as {d.label}</strong>
                <span>{d.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Create an account</h2>
        <form className="form" onSubmit={signUp}>
          <fieldset>
            <legend>I am signing up as</legend>
            <div className="role-picker">
              {roles.map((r) => (
                <label key={r.id} className={role === r.id ? 'role is-picked' : 'role'}>
                  <input type="radio" name="role" checked={role === r.id} onChange={() => { setRole(r.id); setError('') }} />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label>{role === 'clinic' ? 'Clinic name' : 'Your name'}
            <input required value={form.name} onChange={set('name')} placeholder={role === 'vet' ? 'Dr. First Last' : ''} autoComplete={role === 'clinic' ? 'organization' : 'name'} />
          </label>
          <label>Email
            <input required type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          </label>

          {role === 'client' && (
            <label>ZIP code
              <input inputMode="numeric" maxLength="5" value={form.zip} onChange={set('zip')} />
            </label>
          )}

          {role === 'vet' && (
            <>
              <div className="form-grid">
                <label>Credentials
                  <input value={form.credentials} onChange={set('credentials')} placeholder="DVM, DACVS" />
                </label>
                <label>State licensed in
                  <input maxLength="2" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} placeholder="IN" />
                </label>
              </div>
              <label>Veterinary license number
                <input required value={form.licenseNumber} onChange={set('licenseNumber')} />
              </label>
              <p className="muted">We check your license before your profile shows the Verified badge. Use the email your clinic knows you by. Clinics invite veterinarians by email, and the invite shows up in your profile.</p>
            </>
          )}

          {role === 'clinic' && (
            <>
              <label>Street address
                <input required value={form.address} onChange={set('address')} autoComplete="street-address" />
              </label>
              <div className="form-grid">
                <label>City<input required value={form.city} onChange={set('city')} /></label>
                <label>State<input required maxLength="2" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} /></label>
                <label>ZIP code<input required inputMode="numeric" maxLength="5" value={form.zip} onChange={set('zip')} /></label>
              </div>
              <label>Phone
                <input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
              </label>
              <label>Clinic or premises license number
                <input required value={form.licenseNumber} onChange={set('licenseNumber')} />
              </label>
              <p className="muted">We check this before your clinic page shows the Verified badge.</p>
            </>
          )}

          <label className="radio">
            <input type="checkbox" required />
            <span>I agree to the <Link to="/legal/terms">terms</Link>, <Link to="/legal/privacy">privacy policy</Link> and <Link to="/legal/reviews">review policy</Link></span>
          </label>
          {error && <p className="note" role="alert">{error}</p>}
          <button className="btn btn-primary" type="submit">Create account</button>
        </form>
        <p className="muted">This preview stores accounts in your browser only.</p>
      </section>
    </div>
  )
}
