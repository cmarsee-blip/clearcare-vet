import { Link, NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { useStore } from '../context/StoreContext'
import { unreadCount } from '../lib/selectors'

export default function Header() {
  const { user, compare, notifications, dispatch } = useStore()
  const navigate = useNavigate()
  const unread = user ? unreadCount(notifications, user.id) : 0

  const logOut = () => {
    dispatch({ type: 'logout' })
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" aria-label="Home"><Logo /></Link>
        <nav className="site-nav" aria-label="Main">
          <NavLink to="/search">Find care</NavLink>
          <NavLink to="/prices">Typical prices</NavLink>
          <NavLink to="/compare">Compare{compare.length ? ` (${compare.length})` : ''}</NavLink>
        </nav>
        <div className="header-account">
          <ThemeToggle />
          {user ? (
            <>
              <Link className="bell" to="/notifications" aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}>
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0-6 6v3.600L4.300 16a1 1 0 0 0 .900 1.500h13.600a1 1 0 0 0 .900-1.500L18 12.600V9a6 6 0 0 0-6-6zm-2.500 16.500a2.500 2.500 0 0 0 5 0z" fill="currentColor" />
                </svg>
                {unread > 0 && <span className="bell-count">{unread}</span>}
              </Link>
              <Link className="btn btn-quiet" to="/profile">{user.name}</Link>
              <button className="btn btn-outline" onClick={logOut}>Log out</button>
            </>
          ) : (
            <Link className="btn btn-primary" to="/login">Log in</Link>
          )}
        </div>
      </div>
    </header>
  )
}
