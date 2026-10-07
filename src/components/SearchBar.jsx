import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { procedures } from '../data/procedures'
import { parseWhere } from '../lib/search'

// The big two-field search used on the home page.
export default function SearchBar() {
  const [what, setWhat] = useState('')
  const [where, setWhere] = useState('')
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (what.trim()) params.set('q', what.trim())
    Object.entries(parseWhere(where)).forEach(([key, value]) => params.set(key, value))
    navigate(`/search?${params}`)
  }

  return (
    <form className="searchbar" onSubmit={submit} role="search">
      <label className="searchbar-field">
        <span>Procedure, clinic or veterinarian</span>
        <input
          list="procedure-options"
          value={what}
          onChange={(e) => setWhat(e.target.value)}
          placeholder="TPLO, dental cleaning"
        />
        <datalist id="procedure-options">
          {procedures.map((p) => <option key={p.id} value={p.name} />)}
        </datalist>
      </label>
      <label className="searchbar-field">
        <span>City, state or ZIP</span>
        <input value={where} onChange={(e) => setWhere(e.target.value)} placeholder="Indianapolis or 46220" />
      </label>
      <button className="btn btn-primary btn-large" type="submit">Search</button>
    </form>
  )
}
