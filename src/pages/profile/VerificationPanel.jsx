import { useState } from 'react'
import { useStore } from '../../context/StoreContext'

// Shown at the top of a veterinarian's or clinic's dashboard until an admin
// has verified their license.
// kind: 'vet' | 'clinic', entity: the vet or clinic record
export default function VerificationPanel({ kind, entity }) {
  const { dispatch } = useStore()
  const [licenseNumber, setLicenseNumber] = useState(entity.licenseNumber || '')
  const [licenseState, setLicenseState] = useState(entity.licenseState || entity.state || '')
  const status = entity.verification

  if (status === 'verified') return null
  if (status === 'pending') {
    return (
      <p className="callout">
        <strong>Verification pending.</strong> We are checking license {entity.licenseNumber}. Your profile is visible, and the Verified badge appears once it is approved.
      </p>
    )
  }

  const submit = (e) => {
    e.preventDefault()
    dispatch({ type: 'requestVerification', kind, id: entity.id, licenseNumber: licenseNumber.trim(), licenseState: licenseState.toUpperCase() })
  }

  return (
    <form className="form callout verify-form" onSubmit={submit}>
      <p>
        <strong>{status === 'rejected' ? 'We could not verify your license.' : 'Get your Verified badge.'}</strong>{' '}
        {status === 'rejected'
          ? 'Your profile is hidden from search until this is sorted out. Check the number and send it again.'
          : 'Owners trust verified profiles more. Send your license number and we will check it.'}
      </p>
      <div className="form-grid">
        <label>{kind === 'vet' ? 'Veterinary license number' : 'Clinic or premises license number'}
          <input required value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
        </label>
        {kind === 'vet' && (
          <label>State
            <input required maxLength="2" value={licenseState} onChange={(e) => setLicenseState(e.target.value)} />
          </label>
        )}
      </div>
      <button className="btn btn-primary" type="submit">Send for verification</button>
    </form>
  )
}
