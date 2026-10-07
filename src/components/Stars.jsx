const STAR = 'M12 2.500l2.940 5.960 6.580.960-4.760 4.640 1.120 6.550L12 17.520l-5.880 3.090 1.120-6.550-4.760-4.640 6.580-.960z'

// Five drawn stars, filled to the nearest half.
export function StarRow({ value, size = 16 }) {
  const rounded = Math.round(value * 2) / 2
  return (
    <span className="star-row" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rounded - i))
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24">
            <path d={STAR} className="star-base" />
            {fill > 0 && <path d={STAR} className={fill < 1 ? 'star-fill is-half' : 'star-fill'} />}
          </svg>
        )
      })}
    </span>
  )
}

// Stars with the average and the number of reviews.
export default function Stars({ average, count }) {
  if (!count) return <span className="stars is-empty">No reviews yet</span>
  return (
    <span className="stars" aria-label={`${average.toFixed(1)} out of 5 from ${count} reviews`}>
      <StarRow value={average} />
      <strong>{average.toFixed(1)}</strong>
      <span className="muted">({count})</span>
    </span>
  )
}
