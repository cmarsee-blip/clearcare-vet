import { useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatDate } from '../lib/selectors'
import EmptyState from '../components/EmptyState'

// In-app notifications. Nothing is emailed or texted in this preview; the
// place to add that is the notify() helper in context/StoreContext.jsx.
export default function Notifications() {
  const { user, notifications, dispatch } = useStore()
  const navigate = useNavigate()
  const mine = notifications.filter((n) => n.userId === user.id)
  const unread = mine.filter((n) => !n.read).length

  const open = (n) => {
    dispatch({ type: 'markRead', id: n.id })
    navigate(n.link || '/profile')
  }

  return (
    <div className="container notifications-page">
      <div className="results-head">
        <h1>Notifications</h1>
        {unread > 0 && <button className="btn btn-outline" onClick={() => dispatch({ type: 'markAllRead' })}>Mark all as read</button>}
      </div>
      {mine.length ? (
        <ul className="notification-list">
          {mine.map((n) => (
            <li key={n.id}>
              <button className={n.read ? 'notification' : 'notification is-unread'} onClick={() => open(n)}>
                <span>{n.text}</span>
                <span className="muted">{formatDate(n.date)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : <EmptyState title="Nothing yet" text="Messages, reviews, appointment answers and invites will show up here." />}
      <p className="muted">These appear on the site only. Email and text alerts come with the backend.</p>
    </div>
  )
}
