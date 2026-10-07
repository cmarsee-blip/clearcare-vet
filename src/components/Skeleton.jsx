// Grey placeholder shapes shown while a page's data is loading.
//
// With sample data nothing takes time to load, so you won't normally see
// this. To preview it, add ?delay=1500 to any address (milliseconds).
// Once there is a backend, show it while requests are in flight.
export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div>
        <span className="skeleton" style={{ width: '6rem', height: '1.2rem' }} />
        <span className="skeleton" style={{ width: '60%', height: '1.6rem' }} />
        <span className="skeleton" style={{ width: '40%' }} />
        <span className="skeleton" style={{ width: '8rem' }} />
      </div>
      <div>
        <span className="skeleton" />
        <span className="skeleton" />
        <span className="skeleton" style={{ width: '70%' }} />
      </div>
    </div>
  )
}

export default function PageSkeleton() {
  return (
    <div className="container page-skeleton" aria-busy="true">
      <p className="visually-hidden" role="status">Loading…</p>
      <span className="skeleton" style={{ width: 'min(22rem, 70%)', height: '2.6rem' }} aria-hidden="true" />
      <span className="skeleton" style={{ width: 'min(34rem, 90%)' }} aria-hidden="true" />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  )
}
