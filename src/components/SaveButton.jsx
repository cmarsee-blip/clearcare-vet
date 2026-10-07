import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

// compact: an icon-only button, used on search results.
export default function SaveButton({ kind, id, compact = false }) {
  const { user, dispatch } = useStore()
  const navigate = useNavigate()
  if (user && user.role !== 'client') return null

  const saved = !!user?.saved.some((s) => s.type === kind && s.id === id)
  const toggle = () => {
    if (!user) return navigate('/login')
    dispatch({ type: 'toggleSaved', kind, id })
  }
  const heart = (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M12 20.500s-7.500-4.600-7.500-10.200A4.300 4.300 0 0 1 12 7.600a4.300 4.300 0 0 1 7.500 2.700c0 5.600-7.500 10.200-7.500 10.200z"
        fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
      />
    </svg>
  )

  if (compact) {
    return (
      <button className={`icon-button save-button${saved ? ' is-saved' : ''}`} onClick={toggle} aria-pressed={saved} aria-label={saved ? 'Saved. Remove from saved' : 'Save'} title={saved ? 'Saved' : 'Save'}>
        {heart}
      </button>
    )
  }
  return (
    <button className={`btn btn-outline save-button${saved ? ' is-saved' : ''}`} onClick={toggle} aria-pressed={saved}>
      {heart} {saved ? 'Saved' : 'Save'}
    </button>
  )
}
