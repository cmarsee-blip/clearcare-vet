// Opening hours. A clinic stores them as
//   openHours: { Mon: { open: '08:00', close: '17:30' }, ..., Sun: null }
// plus open24: true for clinics that never close.
const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const pad = (n) => String(n).padStart(2, '0')

export const hasHours = (clinic) => !!clinic.open24 || Object.values(clinic.openHours || {}).some(Boolean)

// Uses the visitor's own clock. A real version should use the clinic's time zone.
export function isOpenNow(clinic, now = new Date()) {
  if (clinic.open24) return true
  const today = clinic.openHours?.[dayKeys[now.getDay()]]
  if (!today?.open || !today?.close) return false
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  return time >= today.open && time < today.close
}

// '17:30' -> '5:30 pm'
export function formatTime(time) {
  const [h, m] = time.split(':').map(Number)
  const hour = h % 12 || 12
  return `${hour}${m ? `:${pad(m)}` : ''} ${h < 12 ? 'am' : 'pm'}`
}

export const formatSpan = (day) => (day?.open && day?.close ? `${formatTime(day.open)} to ${formatTime(day.close)}` : 'Closed')
