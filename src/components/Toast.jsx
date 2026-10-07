import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

// A short confirmation that slides in at the bottom of the window after an
// action ("Review posted"), with an optional link to the next step.
//
//   const toast = useToast()
//   toast({ title: 'Review posted', text: 'Thanks for sharing.', action: { label: 'See my reviews', to: '/profile?tab=reviews' } })
const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const show = useCallback((next) => setToast({ ...next, key: Date.now() }), [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 6000)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.key}>
            <span className="toast-tick" aria-hidden="true">✓</span>
            <div>
              <strong>{toast.title}</strong>
              {toast.text && <p>{toast.text}</p>}
              {toast.action && <Link to={toast.action.to} onClick={() => setToast(null)}>{toast.action.label}</Link>}
            </div>
            <button aria-label="Dismiss" onClick={() => setToast(null)}>×</button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
