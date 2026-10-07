import { MAX_COMPARE, useStore } from '../context/StoreContext'

// compact: an icon-only button, used on search results.
export default function CompareButton({ kind, id, compact = false }) {
  const { compare, dispatch } = useStore()
  const selected = compare.some((c) => c.type === kind && c.id === id)
  const full = !selected && compare.length >= MAX_COMPARE
  const hint = full ? `You can compare up to ${MAX_COMPARE} at a time` : selected ? 'Comparing. Remove from comparison' : 'Compare'
  const toggle = () => dispatch({ type: 'toggleCompare', kind, id })

  if (compact) {
    return (
      <button className={`icon-button compare-button${selected ? ' is-selected' : ''}`} onClick={toggle} aria-pressed={selected} disabled={full} aria-label={hint} title={hint}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <rect x="3.500" y="5" width="7" height="14" rx="2" fill={selected ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" />
          <rect x="13.500" y="5" width="7" height="14" rx="2" fill={selected ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    )
  }
  return (
    <button className={`btn btn-outline compare-button${selected ? ' is-selected' : ''}`} onClick={toggle} aria-pressed={selected} disabled={full} title={full ? hint : undefined}>
      {selected ? '✓ Comparing' : 'Compare'}
    </button>
  )
}
