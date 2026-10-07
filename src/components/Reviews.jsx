import { useState } from 'react'
import { Link } from 'react-router-dom'
import { procedureById, reportReasons } from '../data/procedures'
import { useStore } from '../context/StoreContext'
import { formatDate, money } from '../lib/selectors'
import { StarRow } from './Stars'
import { useToast } from './Toast'

// One review. Its author can edit or delete it, the veterinarian or clinic
// it is about can post one public reply, and any other logged-in visitor
// can report it to the site admin.
function ReviewItem({ review: r, showTarget }) {
  const { user, vets, clinics, reports, dispatch } = useStore()
  const [mode, setMode] = useState('view') // 'view' | 'edit' | 'delete' | 'reply' | 'report'
  const [draft, setDraft] = useState({ rating: r.rating, amountPaid: r.amountPaid ?? '', text: r.text })
  const [replyText, setReplyText] = useState(r.reply?.text || '')
  const [report, setReport] = useState({ reason: reportReasons[0], note: '' })
  const toast = useToast()

  const target = (r.targetType === 'vet' ? vets : clinics).find((t) => t.id === r.targetId)
  const isMine = user?.id === r.authorId
  const canReply =
    (user?.role === 'vet' && r.targetType === 'vet' && r.targetId === user.vetId) ||
    (user?.role === 'clinic' && r.targetType === 'clinic' && r.targetId === user.clinicId)
  const reported = reports.some((rp) => rp.reviewId === r.id && rp.reporterId === user?.id && rp.status === 'open')
  const canReport = user && !isMine && user.role !== 'admin'

  const saveEdit = (e) => {
    e.preventDefault()
    dispatch({
      type: 'updateReview', id: r.id,
      patch: { rating: Number(draft.rating), amountPaid: draft.amountPaid ? Number(draft.amountPaid) : null, text: draft.text.trim() },
    })
    setMode('view')
  }
  const saveReply = (e) => {
    e.preventDefault()
    dispatch({ type: 'replyReview', id: r.id, text: replyText.trim(), authorName: target?.name })
    setMode('view')
    if (replyText.trim()) toast({ title: 'Reply posted', text: `${r.authorName} has been notified.` })
  }
  const sendReport = (e) => {
    e.preventDefault()
    dispatch({ type: 'reportReview', reviewId: r.id, reason: report.reason, note: report.note.trim() })
    setMode('view')
    toast({ title: 'Report sent', text: 'The review stays up while our team looks at it. You’ll get a notification with the decision.' })
  }

  if (mode === 'edit') {
    return (
      <li className="review">
        <form className="form" onSubmit={saveEdit}>
          <div className="form-grid">
            <label>Rating
              <select value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: e.target.value })}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
            </label>
            <label>Total you were charged ($)
              <input type="number" min="0" value={draft.amountPaid} onChange={(e) => setDraft({ ...draft, amountPaid: e.target.value })} />
            </label>
          </div>
          <label>Your review
            <textarea rows="4" required value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Save review</button>
            <button className="btn btn-quiet" type="button" onClick={() => setMode('view')}>Cancel</button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="review">
      <div className="review-head">
        <span className="review-stars" role="img" aria-label={`${r.rating} out of 5`}><StarRow value={r.rating} /></span>
        <strong>
          {showTarget && target ? <Link to={`/${r.targetType}s/${target.id}`}>{target.name}</Link> : r.authorName}
        </strong>
        <span className="muted">{formatDate(r.date)}{r.edited && ', edited'}</span>
        {r.proof === 'verified' && <span className="badge is-verified" title="The owner’s invoice was checked by our team">✓ Verified visit</span>}
        {r.proof === 'pending' && isMine && <span className="badge is-pending">Invoice being checked</span>}
      </div>
      <p>{r.text}</p>
      <p className="review-meta">
        {r.procedureId && <span>{procedureById[r.procedureId]?.name}</span>}
        {r.animal && <span>{r.animal}</span>}
        {r.amountPaid ? <span className="paid">Paid {money(r.amountPaid)}</span> : null}
      </p>

      {r.reply && mode !== 'reply' && (
        <div className="review-reply">
          <p className="review-reply-head"><strong>Reply from {r.reply.authorName}</strong> <span className="muted">{formatDate(r.reply.date)}</span></p>
          <p>{r.reply.text}</p>
        </div>
      )}

      {mode === 'reply' && (
        <form className="form review-reply" onSubmit={saveReply}>
          <label>Your public reply
            <textarea rows="3" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Leave empty and save to remove your reply" />
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Post reply</button>
            <button className="btn btn-quiet" type="button" onClick={() => setMode('view')}>Cancel</button>
          </div>
        </form>
      )}

      {mode === 'report' && (
        <form className="form review-reply" onSubmit={sendReport}>
          <label>Why are you reporting this review?
            <select value={report.reason} onChange={(e) => setReport({ ...report, reason: e.target.value })}>
              {reportReasons.map((reason) => <option key={reason}>{reason}</option>)}
            </select>
          </label>
          <label>Details (optional)
            <textarea rows="2" value={report.note} onChange={(e) => setReport({ ...report, note: e.target.value })} />
          </label>
          <p className="muted">The review stays up while our team looks at it. See the <Link to="/legal/reviews">review policy</Link>.</p>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Send report</button>
            <button className="btn btn-quiet" type="button" onClick={() => setMode('view')}>Cancel</button>
          </div>
        </form>
      )}

      {mode === 'delete' && (
        <div className="form-actions review-actions" role="alert">
          <span>Delete this review? This can’t be undone.</span>
          <button className="btn btn-danger" onClick={() => dispatch({ type: 'deleteReview', id: r.id })}>Delete review</button>
          <button className="btn btn-quiet" onClick={() => setMode('view')}>Keep it</button>
        </div>
      )}

      {mode === 'view' && (isMine || canReply || canReport) && (
        <div className="form-actions review-actions">
          {isMine && <button className="btn btn-quiet" onClick={() => setMode('edit')}>Edit</button>}
          {isMine && <button className="btn btn-quiet" onClick={() => setMode('delete')}>Delete</button>}
          {canReply && <button className="btn btn-quiet" onClick={() => setMode('reply')}>{r.reply ? 'Edit reply' : 'Reply'}</button>}
          {canReport && (reported
            ? <span className="muted" role="status">Reported. Our team will take a look.</span>
            : <button className="btn btn-quiet" onClick={() => setMode('report')}>Report</button>)}
        </div>
      )}
    </li>
  )
}

export function ReviewList({ reviews, showTarget = false }) {
  if (!reviews.length) return <p className="empty">No reviews yet.</p>
  return (
    <ul className="review-list">
      {reviews.map((r) => <ReviewItem key={r.id} review={r} showTarget={showTarget} />)}
    </ul>
  )
}

// procedureIds: the procedures this vet or clinic offers.
export function ReviewForm({ targetType, targetId, procedureIds }) {
  const { user, dispatch } = useStore()
  const blank = { rating: 5, procedureId: '', amountPaid: '', animal: '', text: '', proofFile: '' }
  const [form, setForm] = useState(blank)
  const toast = useToast()
  const [formKey, setFormKey] = useState(0) // changing it clears the file input
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  if (!user) {
    return <p className="callout"><Link to="/login">Log in</Link> to post a review and share what you were charged.</p>
  }
  if (user.role !== 'client') return null

  const submit = (e) => {
    e.preventDefault()
    dispatch({
      type: 'addReview',
      review: {
        targetType, targetId, authorId: user.id,
        authorName: user.name.replace(/^(\S+)\s+(\S).*$/, '$1 $2.'),
        rating: Number(form.rating), procedureId: form.procedureId || null,
        amountPaid: form.amountPaid ? Number(form.amountPaid) : null,
        animal: form.animal, text: form.text.trim(), proofFile: form.proofFile || undefined,
      },
    })
    setForm(blank)
    setFormKey((k) => k + 1)
    toast({
      title: 'Review posted',
      text: form.proofFile ? 'We’ll check your invoice and add the Verified visit badge.' : 'Thanks for helping other owners.',
      action: { label: 'See my reviews', to: '/profile?tab=reviews' },
    })
  }

  return (
    <form className="form review-form" onSubmit={submit} key={formKey}>
      <h3>Post a review</h3>
      <div className="form-grid">
        <label>Rating
          <select value={form.rating} onChange={set('rating')}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
          </select>
        </label>
        <label>Procedure
          <select value={form.procedureId} onChange={set('procedureId')}>
            <option value="">General visit</option>
            {procedureIds.map((id) => <option key={id} value={id}>{procedureById[id].name}</option>)}
          </select>
        </label>
        <label>Total you were charged ($)
          <input type="number" min="0" step="1" value={form.amountPaid} onChange={set('amountPaid')} placeholder="Optional" />
        </label>
        <label>Animal
          <select value={form.animal} onChange={set('animal')}>
            <option value="">Prefer not to say</option>
            {user.pets.map((p) => <option key={p.id} value={`${p.name} (${p.species})`}>{p.name}</option>)}
          </select>
        </label>
      </div>
      <label>Your review
        <textarea rows="4" required value={form.text} onChange={set('text')} placeholder="How did it go? Was the bill what you expected?" />
      </label>
      <label>Attach your invoice to earn a “Verified visit” badge (optional)
        <input type="file" accept="image/*,.pdf" onChange={(e) => setForm({ ...form, proofFile: e.target.files[0]?.name || '' })} />
      </label>
      <p className="muted">By posting you agree to the <Link to="/legal/reviews">review policy</Link>: your own visit, honest, and no private details.</p>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">Post review</button>
      </div>
    </form>
  )
}
