import { money } from '../lib/selectors'

// Draws the listed price range as a band and each client-reported payment
// as a dot on the same scale, so it is easy to see whether bills land
// inside the posted range.
export default function PriceRange({ low, high, reported = [] }) {
  const values = [low, high, ...reported]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min) * 0.15 || max * 0.1
  const start = min - pad
  const span = max + pad - start
  const pct = (v) => `${((v - start) / span) * 100}%`

  const label = reported.length
    ? `Listed ${money(low)} to ${money(high)}. Clients reported paying ${reported.map(money).join(', ')}.`
    : `Listed ${money(low)} to ${money(high)}. No client reports yet.`

  return (
    <div className="price-range" role="img" aria-label={label}>
      <div className="price-track">
        <div className="price-band" style={{ left: pct(low), width: `calc(${pct(high)} - ${pct(low)})` }} />
        {reported.map((amount, i) => (
          <span
            key={i}
            className={`price-dot${amount > high || amount < low ? ' is-outside' : ''}`}
            style={{ left: pct(amount) }}
            title={`A client paid ${money(amount)}`}
          />
        ))}
      </div>
      <div className="price-ends">
        <span style={{ left: pct(low) }}>{money(low)}</span>
        <span style={{ left: pct(high) }}>{money(high)}</span>
      </div>
    </div>
  )
}
