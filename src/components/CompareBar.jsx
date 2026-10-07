import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

// Sticks to the bottom of the window while anything is picked for comparing.
export default function CompareBar() {
  const { compare, vets, clinics, dispatch } = useStore()
  const { pathname } = useLocation()
  if (!compare.length || pathname === '/compare') return null

  const nameOf = (c) => (c.type === 'vet' ? vets : clinics).find((x) => x.id === c.id)?.name

  return (
    <div className="compare-bar" role="region" aria-label="Compare">
      <div className="container compare-bar-inner">
        <ul>
          {compare.map((c) => (
            <li key={`${c.type}-${c.id}`}>
              {nameOf(c)}
              <button aria-label={`Remove ${nameOf(c)}`} onClick={() => dispatch({ type: 'toggleCompare', kind: c.type, id: c.id })}>×</button>
            </li>
          ))}
        </ul>
        <div className="compare-bar-actions">
          {compare.length < 2 && <span>Pick one more to compare</span>}
          <button className="btn btn-quiet" onClick={() => dispatch({ type: 'clearCompare' })}>Clear</button>
          {compare.length >= 2 && <Link className="btn btn-primary" to="/compare">Compare {compare.length}</Link>}
        </div>
      </div>
    </div>
  )
}
