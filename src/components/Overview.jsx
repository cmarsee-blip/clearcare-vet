// The first screen of every dashboard: what needs doing, then the numbers.
//
// attention: [{ text, cta, tab }]   things waiting on this account
// tiles:     [{ label, value, tab }] headline numbers; a tab makes it clickable
// goTo:      switches the dashboard to another section
export default function Overview({ attention = [], tiles = [], goTo, children }) {
  return (
    <div className="overview">
      {children}

      <section>
        <h3>Needs your attention</h3>
        {attention.length ? (
          <ul className="attention-list">
            {attention.map((item) => (
              <li key={item.text}>
                <span>{item.text}</span>
                {item.tab && <button className="btn btn-primary" onClick={() => goTo(item.tab)}>{item.cta}</button>}
              </li>
            ))}
          </ul>
        ) : <p className="all-clear">You’re all caught up.</p>}
      </section>

      {tiles.length > 0 && (
        <section>
          <h3>At a glance</h3>
          <dl className="stat-grid">
            {tiles.map((tile) => (
              <div key={tile.label} className={tile.tab ? 'is-link' : undefined}>
                <dt>{tile.label}</dt>
                <dd>
                  {tile.tab
                    ? <button onClick={() => goTo(tile.tab)} aria-label={`${tile.label}: ${tile.value}`}>{tile.value}</button>
                    : tile.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}

// "1 message" / "3 messages"
export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
