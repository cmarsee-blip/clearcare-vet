import { useEffect, useRef } from 'react'
import { useStore } from '../context/StoreContext'

// Counts one profile view per visit. Views by the profile's own account
// are not counted. The ref stops React's development double-run from
// counting twice.
export default function useRecordView(kind, id, isOwner) {
  const { dispatch } = useStore()
  const counted = useRef(null)
  useEffect(() => {
    if (!id || isOwner || counted.current === id) return
    counted.current = id
    dispatch({ type: 'recordView', key: `${kind}:${id}` })
  }, [kind, id, isOwner, dispatch])
}
