import { Link } from 'react-router-dom'
import { site } from '../config/site'
import { useStore } from '../context/StoreContext'

export default function Footer() {
  const { dispatch } = useStore()
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <strong>{site.name}</strong>
          <p>
            Reviews and prices are shared by animal owners. Nothing on this site is veterinary advice.
            In an emergency, call your veterinarian or the nearest emergency clinic.
          </p>
        </div>
        <nav aria-label="Footer">
          <Link to="/search">Find care</Link>
          <Link to="/prices">Typical prices</Link>
          <Link to="/legal/terms">Terms</Link>
          <Link to="/legal/privacy">Privacy</Link>
          <Link to="/legal/reviews">Review policy</Link>
          <button className="link-button" onClick={() => dispatch({ type: 'reset' })}>
            Reset sample data
          </button>
        </nav>
      </div>
    </footer>
  )
}
