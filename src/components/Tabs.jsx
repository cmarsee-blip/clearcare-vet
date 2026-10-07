import { useSearchParams } from 'react-router-dom'

// The dashboard menu: a side list on wide screens, a dropdown on phones.
// The open section is kept in the URL (?tab=reviews) so links and the back
// button work.
//
// tabs: [{ id, label, count, alert, content }]
//   count   optional number shown beside the label
//   alert   true highlights the count (something needs doing)
//   content JSX, or a function (goTo) => JSX when the section needs to
//           switch to another one (the Overview does this)
export default function Tabs({ tabs }) {
  const [params, setParams] = useSearchParams()
  const current = tabs.find((t) => t.id === params.get('tab')) || tabs[0]

  const goTo = (id) => {
    const next = new URLSearchParams(params)
    if (id === tabs[0].id) next.delete('tab')
    else next.set('tab', id)
    setParams(next)
  }

  const hasCount = (t) => t.count != null && (t.count > 0 || t.alert === undefined)

  return (
    <div className="tabs">
      <label className="tab-select">
        <span className="visually-hidden">Section</span>
        <select value={current.id} onChange={(e) => goTo(e.target.value)}>
          {tabs.map((t) => (
            <option key={t.id} value={t.id}>{t.label}{hasCount(t) ? ` (${t.count})` : ''}</option>
          ))}
        </select>
      </label>

      <nav className="tab-list" aria-label="Profile sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={t.id === current.id ? 'tab is-active' : 'tab'}
            aria-current={t.id === current.id ? 'page' : undefined}
            onClick={() => goTo(t.id)}
          >
            <span>{t.label}</span>
            {hasCount(t) && <span className={t.alert && t.count > 0 ? 'tab-count is-alert' : 'tab-count'}>{t.count}</span>}
          </button>
        ))}
      </nav>

      <div className="tab-panel">
        <h2 className="tab-title">{current.label}</h2>
        {typeof current.content === 'function' ? current.content(goTo) : current.content}
      </div>
    </div>
  )
}
