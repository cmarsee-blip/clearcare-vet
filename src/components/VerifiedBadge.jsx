// Shows whether an admin has checked this vet's or clinic's license.
export default function VerifiedBadge({ status, quiet = false }) {
  if (status === 'verified') return <span className="badge is-verified" title="License checked by our team">✓ Verified</span>
  if (quiet) return null
  if (status === 'pending') return <span className="badge is-pending">Verification pending</span>
  return <span className="badge is-unverified">Not verified</span>
}
