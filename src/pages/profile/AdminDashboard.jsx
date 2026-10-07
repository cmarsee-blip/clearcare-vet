import { Link } from 'react-router-dom'
import Tabs from '../../components/Tabs'
import Overview, { plural } from '../../components/Overview'
import { useToast } from '../../components/Toast'
import { useStore } from '../../context/StoreContext'
import { procedureById } from '../../data/procedures'
import { formatDate, money } from '../../lib/selectors'

const roleLabel = { client: 'Owner', vet: 'Veterinarian', clinic: 'Clinic', admin: 'Admin' }

// Licenses waiting to be checked.
function VerificationQueue({ pending }) {
  const { clinics, dispatch } = useStore()
  const toast = useToast()
  if (!pending.length) return <p className="empty">No licenses waiting. New veterinarians and clinics appear here when they sign up.</p>
  const decide = (item, status) => {
    dispatch({ type: 'verify', kind: item.kind, id: item.id, status })
    toast({ title: status === 'verified' ? `${item.name} verified` : `${item.name} rejected`, text: 'They have been notified.' })
  }

  return (
    <ul className="queue">
      {pending.map((item) => (
        <li key={`${item.kind}-${item.id}`} className="panel">
          <div>
            <span className={`kind-tag is-${item.kind}`}>{item.kind === 'vet' ? 'Veterinarian' : 'Clinic'}</span>
            <h3><Link to={`/${item.kind}s/${item.id}`}>{item.name}</Link></h3>
            <dl className="facts is-inline">
              <div><dt>License number</dt><dd>{item.licenseNumber || 'Not given'}</dd></div>
              {item.kind === 'vet'
                ? <>
                    <div><dt>State</dt><dd>{item.licenseState || 'Not given'}</dd></div>
                    <div><dt>Clinic</dt><dd>{clinics.find((c) => c.id === item.clinicId)?.name || 'None yet'}</dd></div>
                  </>
                : <div><dt>Address</dt><dd>{[item.address, item.city, item.state, item.zip].filter(Boolean).join(', ')}</dd></div>}
            </dl>
            <p className="muted">Check the number against the state licensing board’s public lookup before approving.</p>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={() => decide(item, 'verified')}>Approve</button>
            <button className="btn btn-outline" onClick={() => decide(item, 'rejected')}>Reject</button>
          </div>
        </li>
      ))}
    </ul>
  )
}

// Reviews people have reported.
function ReportQueue({ open }) {
  const { reviews, vets, clinics, dispatch } = useStore()
  // One card per review, however many people reported it.
  const reviewIds = [...new Set(open.map((rp) => rp.reviewId))]
  if (!reviewIds.length) return <p className="empty">No reported reviews.</p>

  return (
    <ul className="queue">
      {reviewIds.map((reviewId) => {
        const review = reviews.find((r) => r.id === reviewId)
        if (!review) return null
        const target = (review.targetType === 'vet' ? vets : clinics).find((t) => t.id === review.targetId)
        return (
          <li key={reviewId} className="panel">
            <div>
              <h3>Review of <Link to={`/${review.targetType}s/${review.targetId}`}>{target?.name}</Link></h3>
              <blockquote className="quoted">
                <p>{review.text}</p>
                <footer>{review.authorName}, {review.rating} stars, {formatDate(review.date)}{review.proof === 'verified' && ', verified visit'}</footer>
              </blockquote>
              {open.filter((rp) => rp.reviewId === reviewId).map((rp) => (
                <p key={rp.id}>
                  <strong>{rp.reason}.</strong> {rp.note} <span className="muted">Reported by {rp.reporterName || 'a visitor'}, {formatDate(rp.date)}</span>
                </p>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn btn-outline" onClick={() => dispatch({ type: 'resolveReport', reviewId, remove: false })}>Keep review</button>
              <button className="btn btn-danger" onClick={() => dispatch({ type: 'resolveReport', reviewId, remove: true })}>Remove review</button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// Invoices owners attached to prove a visit.
function InvoiceQueue({ items }) {
  const { vets, clinics, dispatch } = useStore()
  if (!items.length) return <p className="empty">No invoices waiting.</p>
  const nameOf = (item) =>
    item.kind === 'review'
      ? (item.targetType === 'vet' ? vets : clinics).find((t) => t.id === item.targetId)?.name
      : vets.find((v) => v.id === item.vetId)?.name

  return (
    <ul className="queue">
      {items.map((item) => (
        <li key={`${item.kind}-${item.id}`} className="panel">
          <div>
            <h3>{item.kind === 'review' ? 'Review' : 'Price report'} for {nameOf(item)}</h3>
            <dl className="facts is-inline">
              <div><dt>From</dt><dd>{item.authorName}</dd></div>
              <div><dt>Procedure</dt><dd>{procedureById[item.procedureId]?.name || 'General visit'}</dd></div>
              <div><dt>Amount claimed</dt><dd>{item.amount ? money(item.amount) : 'Not given'}</dd></div>
              <div><dt>File</dt><dd>{item.proofFile}</dd></div>
            </dl>
            <p className="muted">This preview keeps only the file name. With a backend, the invoice opens here.</p>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'setProof', kind: item.kind, id: item.id, status: 'verified' })}>Invoice matches</button>
            <button className="btn btn-outline" onClick={() => dispatch({ type: 'setProof', kind: item.kind, id: item.id, status: 'rejected' })}>Doesn’t match</button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Accounts() {
  const { users, vets, clinics, dispatch } = useStore()
  const profileLink = (u) => {
    if (u.vetId && vets.some((v) => v.id === u.vetId)) return `/vets/${u.vetId}`
    if (u.clinicId && clinics.some((c) => c.id === u.clinicId)) return `/clinics/${u.clinicId}`
    return null
  }
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Email</th><th scope="col">Status</th><th scope="col" /></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <th scope="row">{profileLink(u) ? <Link to={profileLink(u)}>{u.name}</Link> : u.name}</th>
              <td>{roleLabel[u.role]}</td>
              <td>{u.email}</td>
              <td>{u.suspended ? <span className="note">Suspended</span> : 'Active'}</td>
              <td>
                {u.role !== 'admin' && (
                  <button className="btn btn-quiet" onClick={() => dispatch({ type: 'setSuspended', id: u.id, suspended: !u.suspended })}>
                    {u.suspended ? 'Reinstate' : 'Suspend'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminDashboard() {
  const { vets, clinics, reviews, priceReports, reports, users } = useStore()

  const pending = [
    ...vets.filter((v) => v.verification === 'pending').map((v) => ({ ...v, kind: 'vet' })),
    ...clinics.filter((c) => c.verification === 'pending').map((c) => ({ ...c, kind: 'clinic' })),
  ]
  const openReports = reports.filter((rp) => rp.status === 'open')
  const invoices = [
    ...reviews.filter((r) => r.proof === 'pending').map((r) => ({ ...r, kind: 'review', amount: r.amountPaid })),
    ...priceReports.filter((p) => p.proof === 'pending').map((p) => ({ ...p, kind: 'priceReport' })),
  ]
  const reportedReviews = new Set(openReports.map((rp) => rp.reviewId)).size

  const attention = [
    pending.length > 0 && { text: `${plural(pending.length, 'license')} to check`, cta: 'Check', tab: 'verify' },
    reportedReviews > 0 && { text: `${plural(reportedReviews, 'reported review')} waiting for a decision`, cta: 'Decide', tab: 'reports' },
    invoices.length > 0 && { text: `${plural(invoices.length, 'invoice')} to check for a Verified visit badge`, cta: 'Check', tab: 'invoices' },
  ].filter(Boolean)

  const tiles = [
    { label: 'Veterinarians', value: vets.length },
    { label: 'Clinics', value: clinics.length },
    { label: 'Reviews', value: reviews.length },
    { label: 'Price reports', value: priceReports.length },
    { label: 'Accounts', value: users.length, tab: 'accounts' },
  ]

  return (
    <Tabs
      tabs={[
        { id: 'overview', label: 'Overview', content: (goTo) => <Overview attention={attention} tiles={tiles} goTo={goTo} /> },
        { id: 'verify', label: 'Licenses', count: pending.length, alert: true, content: <VerificationQueue pending={pending} /> },
        { id: 'reports', label: 'Reported reviews', count: reportedReviews, alert: true, content: <ReportQueue open={openReports} /> },
        { id: 'invoices', label: 'Invoices', count: invoices.length, alert: true, content: <InvoiceQueue items={invoices} /> },
        { id: 'accounts', label: 'Accounts', count: users.length, content: <Accounts /> },
      ]}
    />
  )
}
