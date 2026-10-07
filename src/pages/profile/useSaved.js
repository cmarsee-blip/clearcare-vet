import { useEffect, useState } from 'react'

// Shows a short "Saved" confirmation after a form is submitted.
export default function useSaved() {
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    if (!saved) return
    const timer = setTimeout(() => setSaved(false), 2500)
    return () => clearTimeout(timer)
  }, [saved])
  return [saved, () => setSaved(true)]
}
