import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container not-found">
      <h1>That page doesn’t exist</h1>
      <p>The link may be old, or the profile may have been removed.</p>
      <Link className="btn btn-primary" to="/search">Search for care</Link>
    </div>
  )
}
