import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { inclusions, procedureById } from '../data/procedures'
import { useToast } from './Toast'

// A ten-second "what I paid" form, with no review needed.
// vets: the veterinarians the report can be about (one on a vet's page,
// the whole team on a clinic's page).
export default function PriceReportForm({ vets }) {
  const { user, dispatch } = useStore()
  const offering = vets.filter((v) => v.services.length)
  const [open, setOpen] = useState(false)
  const toast = useToast()
  const [vetId, setVetId] = useState(offering[0]?.id || '')
  const [form, setForm] = useState({ procedureId: '', amount: '', includes: [], proofFile: '' })

  if (!offering.length) return null
  if (!user) return <p className="callout"><Link to="/login">Log in</Link> to share what you paid. It takes about ten seconds.</p>
  if (user.role !== 'client') return null

  const vet = offering.find((v) => v.id === vetId) || offering[0]
  const toggle = (item) =>
    setForm({ ...form, includes: form.includes.includes(item) ? form.includes.filter((x) => x !== item) : [...form.includes, item] })

  const submit = (e) => {
    e.preventDefault()
    dispatch({
      type: 'addPriceReport',
      report: {
        vetId: vet.id, procedureId: form.procedureId || vet.services[0].procedureId,
        amount: Number(form.amount), includes: form.includes, proofFile: form.proofFile || undefined,
      },
    })
    setForm({ procedureId: '', amount: '', includes: [], proofFile: '' })
    setOpen(false)
    toast({ title: 'Price shared', text: 'Your bill is now a dot on the chart.', action: { label: 'See prices I shared', to: '/profile?tab=prices' } })
  }

  if (!open) {
    return (
      <div className="price-report-prompt">
        <button className="btn btn-outline" onClick={() => setOpen(true)}>Share what you paid</button>
        <span className="muted">No review needed. Your name is not shown.</span>
      </div>
    )
  }

  return (
    <form className="form review-form" onSubmit={submit}>
      <h3>Share what you paid</h3>
      <div className="form-grid">
        {offering.length > 1 && (
          <label>Veterinarian
            <select value={vet.id} onChange={(e) => { setVetId(e.target.value); setForm({ ...form, procedureId: '' }) }}>
              {offering.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </label>
        )}
        <label>Procedure
          <select value={form.procedureId || vet.services[0].procedureId} onChange={(e) => setForm({ ...form, procedureId: e.target.value })}>
            {vet.services.map((s) => <option key={s.procedureId} value={s.procedureId}>{procedureById[s.procedureId].name}</option>)}
          </select>
        </label>
        <label>Total on your bill ($)
          <input type="number" min="1" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        </label>
      </div>
      <fieldset>
        <legend>What did the bill cover? (optional)</legend>
        <div className="check-grid is-wide">
          {inclusions.map((item) => (
            <label className="radio" key={item}>
              <input type="checkbox" checked={form.includes.includes(item)} onChange={() => toggle(item)} />
              {item}
            </label>
          ))}
        </div>
      </fieldset>
      <label>Attach your invoice to mark this as a verified visit (optional)
        <input type="file" accept="image/*,.pdf" onChange={(e) => setForm({ ...form, proofFile: e.target.files[0]?.name || '' })} />
      </label>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit">Submit price</button>
        <button className="btn btn-quiet" type="button" onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}
