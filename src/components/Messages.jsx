import { useState } from 'react'
import { formatDate } from '../lib/selectors'
import { useStore } from '../context/StoreContext'
import EmptyState from './EmptyState'

// Shared inbox. `me` is 'client' or 'vet' and decides which side is "You".
export default function Messages({ threads, me }) {
  const { vets, dispatch } = useStore()
  const [openId, setOpenId] = useState(threads[0]?.id || null)
  const [reply, setReply] = useState('')

  if (!threads.length) {
    return me === 'client'
      ? <EmptyState title="No messages yet" text="Open a veterinarian’s profile to ask a question before you book." action={{ label: 'Find a veterinarian', to: '/search?type=vets' }} />
      : <EmptyState title="No messages yet" text="Questions from owners will show up here." />
  }

  const open = threads.find((t) => t.id === openId) || threads[0]
  const otherName = (t) => (me === 'client' ? vets.find((v) => v.id === t.vetId)?.name : t.clientName)
  const last = (t) => t.messages[t.messages.length - 1]

  const send = (e) => {
    e.preventDefault()
    if (!reply.trim()) return
    dispatch({ type: 'sendMessage', threadId: open.id, from: me, text: reply.trim() })
    setReply('')
  }

  return (
    <div className="messages">
      <ul className="thread-list">
        {threads.map((t) => (
          <li key={t.id}>
            <button className={t.id === open.id ? 'thread is-open' : 'thread'} onClick={() => setOpenId(t.id)}>
              <strong>{otherName(t)}</strong>
              <span>{t.subject}</span>
              {last(t).from !== me && <em>Needs a reply</em>}
            </button>
          </li>
        ))}
      </ul>
      <div className="thread-view">
        <h3>{open.subject}</h3>
        <ol className="bubbles">
          {open.messages.map((m, i) => (
            <li key={i} className={m.from === me ? 'bubble is-mine' : 'bubble'}>
              <p>{m.text}</p>
              <span className="muted">{m.from === me ? 'You' : otherName(open)}, {formatDate(m.date)}</span>
            </li>
          ))}
        </ol>
        <form className="form reply-form" onSubmit={send}>
          <label>Reply
            <textarea rows="3" value={reply} onChange={(e) => setReply(e.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit">Send reply</button>
        </form>
      </div>
    </div>
  )
}
