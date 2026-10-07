import { useState } from 'react'
import { currentTheme, setTheme } from '../lib/theme'

export default function ThemeToggle() {
  const [theme, setCurrent] = useState(currentTheme)
  const next = theme === 'dark' ? 'light' : 'dark'
  const toggle = () => {
    setTheme(next)
    setCurrent(next)
  }

  return (
    <button className="icon-button theme-toggle" onClick={toggle} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        {theme === 'dark' ? (
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800" />
          </g>
        ) : (
          <path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z" fill="currentColor" />
        )}
      </svg>
    </button>
  )
}
