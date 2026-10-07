import { Link } from 'react-router-dom'
import { LogoMark } from './Logo'

// What a screen shows when there is nothing to list yet: what goes here,
// and a button for the next step.
// action: { label, to } for a link, or { label, onClick } for a button
export default function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <LogoMark width={56} />
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action && (action.to
        ? <Link className="btn btn-primary" to={action.to}>{action.label}</Link>
        : <button className="btn btn-primary" onClick={action.onClick}>{action.label}</button>)}
    </div>
  )
}
