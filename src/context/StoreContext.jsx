// One place for all app state. Everything lives in the browser (localStorage)
// so the site works without a server. When you add a backend, each action
// below maps to one API call.
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { seed } from '../data/seed'
import { coordsForZip } from '../lib/geo'
import { buildPricePoints, shortDate } from '../lib/selectors'

// Bump the version when the shape of the data changes, so old saved copies
// in a browser are ignored instead of breaking the page.
const STORAGE_KEY = 'clearcare-demo-v3'
const StoreContext = createContext(null)

export const MAX_COMPARE = 3

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const today = () => new Date().toISOString().slice(0, 10)

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...seed, ...JSON.parse(raw) } : seed
  } catch {
    return seed
  }
}

const mapById = (list, id, fn) => list.map((item) => (item.id === id ? fn(item) : item))
const sameItem = (a, kind, id) => a.type === kind && a.id === id

/* ---------- Notifications ---------- */

const accountForVet = (state, vetId) => state.users.find((u) => u.vetId === vetId)?.id
const accountForClinic = (state, clinicId) => state.users.find((u) => u.clinicId === clinicId)?.id
const adminIds = (state) => state.users.filter((u) => u.role === 'admin').map((u) => u.id)

// Both the vet's own account and their clinic's account hear about things
// that concern the vet (the front desk often handles them).
function accountsForVet(state, vetId) {
  const vet = state.vets.find((v) => v.id === vetId)
  return [accountForVet(state, vetId), vet && accountForClinic(state, vet.clinicId)]
}

// Adds a notification for each account, skipping whoever did the action.
// With a backend this is also where an email or text would be sent.
function notify(state, userIds, text, link = '/profile') {
  const ids = [...new Set([].concat(userIds))].filter(
    (id) => id && id !== state.currentUserId && state.users.some((u) => u.id === id),
  )
  if (!ids.length) return state
  const fresh = ids.map((userId) => ({ id: uid('n'), userId, text, link, date: today(), read: false }))
  return { ...state, notifications: [...fresh, ...state.notifications] }
}

function reducer(state, action) {
  const me = state.currentUserId
  const meUser = state.users.find((u) => u.id === me)
  const patchMe = (fn) => ({ ...state, users: mapById(state.users, me, fn) })
  const patchPet = (petId, fn) => patchMe((u) => ({ ...u, pets: mapById(u.pets, petId, fn) }))
  const nameOf = (kind, id) => (kind === 'vet' ? state.vets : state.clinics).find((x) => x.id === id)?.name

  switch (action.type) {
    /* ---------- Accounts ---------- */
    case 'login':
      return { ...state, currentUserId: action.userId }
    case 'logout':
      return { ...state, currentUserId: null }

    // action.user = { role: 'client' | 'vet' | 'clinic', name, email, ...fields }
    // New veterinarians and clinics start as 'pending' until an admin checks
    // their license.
    case 'signup': {
      const { role = 'client', ...info } = action.user
      const user = { id: uid('u'), role, name: info.name, email: info.email, pets: [], saved: [] }

      if (role === 'vet') {
        const vet = {
          id: uid('v'), clinicId: null, name: info.name, credentials: info.credentials || 'DVM',
          specialties: [], species: [], bio: '', yearsExperience: 0, acceptingNew: true,
          availability: {}, services: [], photo: null, education: '', licenseState: info.state || '',
          licenseNumber: info.licenseNumber || '', verification: info.licenseNumber ? 'pending' : 'unverified',
        }
        const next = { ...state, vets: [...state.vets, vet], users: [...state.users, { ...user, vetId: vet.id }], currentUserId: user.id }
        return info.licenseNumber ? notify(next, adminIds(next), `${vet.name} is waiting for verification.`) : next
      }

      if (role === 'clinic') {
        const clinic = {
          id: uid('c'), name: info.name, featured: false, emergency: false,
          address: info.address || '', city: info.city || '', state: info.state || '', zip: info.zip || '',
          phone: info.phone || '', species: [], hours: '', about: '', amenities: [], languages: ['English'], photos: [],
          coords: coordsForZip(info.zip), openHours: {}, open24: false,
          licenseNumber: info.licenseNumber || '', verification: info.licenseNumber ? 'pending' : 'unverified',
        }
        const next = { ...state, clinics: [...state.clinics, clinic], users: [...state.users, { ...user, clinicId: clinic.id }], currentUserId: user.id }
        return info.licenseNumber ? notify(next, adminIds(next), `${clinic.name} is waiting for verification.`) : next
      }

      return {
        ...state,
        users: [...state.users, { ...user, city: '', state: '', zip: info.zip || '' }],
        currentUserId: user.id,
      }
    }
    case 'updateUser':
      return patchMe((u) => ({ ...u, ...action.patch }))
    // Admin only: a suspended account can't log in.
    case 'setSuspended':
      return { ...state, users: mapById(state.users, action.id, (u) => ({ ...u, suspended: action.suspended })) }

    /* ---------- Verification ---------- */
    // A vet or clinic sends (or re-sends) their license for checking.
    case 'requestVerification': {
      const patch = { licenseNumber: action.licenseNumber, verification: 'pending' }
      const next = action.kind === 'vet'
        ? { ...state, vets: mapById(state.vets, action.id, (v) => ({ ...v, ...patch, licenseState: action.licenseState || v.licenseState })) }
        : { ...state, clinics: mapById(state.clinics, action.id, (c) => ({ ...c, ...patch })) }
      return notify(next, adminIds(next), `${nameOf(action.kind, action.id)} is waiting for verification.`)
    }
    // Admin only. action.status is 'verified' or 'rejected'.
    case 'verify': {
      const patch = { verification: action.status }
      const next = action.kind === 'vet'
        ? { ...state, vets: mapById(state.vets, action.id, (v) => ({ ...v, ...patch })) }
        : { ...state, clinics: mapById(state.clinics, action.id, (c) => ({ ...c, ...patch })) }
      const owner = action.kind === 'vet' ? accountForVet(state, action.id) : accountForClinic(state, action.id)
      return notify(
        next, owner,
        action.status === 'verified'
          ? 'Your license was verified. Your profile now shows the Verified badge.'
          : 'We could not verify your license. Check the number and send it again.',
      )
    }

    /* ---------- Owners: animals, health records, saved, compare ---------- */
    case 'addPet':
      return patchMe((u) => ({ ...u, pets: [...u.pets, { id: uid('p'), records: [], ...action.pet }] }))
    case 'updatePet':
      return patchPet(action.pet.id, () => action.pet)
    case 'removePet':
      return patchMe((u) => ({ ...u, pets: u.pets.filter((p) => p.id !== action.id) }))
    case 'addRecord':
      return patchPet(action.petId, (p) => ({ ...p, records: [{ id: uid('h'), ...action.record }, ...(p.records || [])] }))
    case 'removeRecord':
      return patchPet(action.petId, (p) => ({ ...p, records: (p.records || []).filter((r) => r.id !== action.id) }))

    case 'toggleSaved':
      return patchMe((u) => {
        const has = u.saved.some((s) => sameItem(s, action.kind, action.id))
        return {
          ...u,
          saved: has
            ? u.saved.filter((s) => !sameItem(s, action.kind, action.id))
            : [...u.saved, { type: action.kind, id: action.id }],
        }
      })

    case 'toggleCompare': {
      const has = state.compare.some((c) => sameItem(c, action.kind, action.id))
      if (has) return { ...state, compare: state.compare.filter((c) => !sameItem(c, action.kind, action.id)) }
      if (state.compare.length >= MAX_COMPARE) return state
      return { ...state, compare: [...state.compare, { type: action.kind, id: action.id }] }
    }
    case 'clearCompare':
      return { ...state, compare: [] }

    /* ---------- Reviews ---------- */
    // A review with an invoice attached (proofFile) waits for an admin to
    // check it before it gets the "Verified visit" badge.
    case 'addReview': {
      const review = { id: uid('r'), date: today(), reply: null, proof: action.review.proofFile ? 'pending' : null, ...action.review }
      const next = { ...state, reviews: [review, ...state.reviews] }
      const owner = review.targetType === 'vet' ? accountsForVet(state, review.targetId) : accountForClinic(state, review.targetId)
      const told = notify(next, owner, `${review.authorName} posted a ${review.rating}-star review.`, `/${review.targetType}s/${review.targetId}`)
      return review.proofFile ? notify(told, adminIds(told), 'A review has an invoice waiting to be checked.') : told
    }
    case 'updateReview':
      return { ...state, reviews: mapById(state.reviews, action.id, (r) => ({ ...r, ...action.patch, edited: true })) }
    case 'deleteReview':
      return {
        ...state,
        reviews: state.reviews.filter((r) => r.id !== action.id),
        reports: state.reports.filter((rp) => rp.reviewId !== action.id),
      }
    // An empty text removes the reply.
    case 'replyReview': {
      const review = state.reviews.find((r) => r.id === action.id)
      const next = {
        ...state,
        reviews: mapById(state.reviews, action.id, (r) => ({
          ...r,
          reply: action.text ? { text: action.text, authorName: action.authorName, date: today() } : null,
        })),
      }
      return action.text && review
        ? notify(next, review.authorId, `${action.authorName} replied to your review.`, `/${review.targetType}s/${review.targetId}`)
        : next
    }

    // Anyone logged in can report a review. It stays visible until an admin decides.
    case 'reportReview': {
      const report = {
        id: uid('rp'), reviewId: action.reviewId, reporterId: me, reporterName: meUser?.name,
        reason: action.reason, note: action.note || '', date: today(), status: 'open',
      }
      const next = { ...state, reports: [report, ...state.reports] }
      return notify(next, adminIds(next), 'A review was reported and needs a decision.')
    }
    // Admin only. action.remove: true deletes the review, false keeps it.
    case 'resolveReport': {
      const review = state.reviews.find((r) => r.id === action.reviewId)
      const reporters = state.reports.filter((rp) => rp.reviewId === action.reviewId).map((rp) => rp.reporterId)
      let next = {
        ...state,
        reports: state.reports.map((rp) =>
          rp.reviewId === action.reviewId ? { ...rp, status: action.remove ? 'removed' : 'kept' } : rp,
        ),
        reviews: action.remove ? state.reviews.filter((r) => r.id !== action.reviewId) : state.reviews,
      }
      if (action.remove && review) {
        next = notify(next, review.authorId, `Your review of ${nameOf(review.targetType, review.targetId)} was removed for breaking the review policy.`, '/legal/reviews')
      }
      return notify(next, reporters, action.remove ? 'A review you reported was removed.' : 'We looked at a review you reported and it stays up.', '/legal/reviews')
    }

    /* ---------- Quick price reports ---------- */
    case 'addPriceReport': {
      const report = {
        id: uid('pr'), authorId: me, authorName: meUser?.name, date: today(),
        proof: action.report.proofFile ? 'pending' : null, ...action.report,
      }
      const next = { ...state, priceReports: [report, ...state.priceReports] }
      return report.proofFile ? notify(next, adminIds(next), 'A price report has an invoice waiting to be checked.') : next
    }
    case 'deletePriceReport':
      return { ...state, priceReports: state.priceReports.filter((p) => p.id !== action.id) }

    // Admin only: the result of checking an invoice.
    // action.kind is 'review' or 'priceReport', action.status 'verified' or 'rejected'.
    case 'setProof': {
      const key = action.kind === 'review' ? 'reviews' : 'priceReports'
      const item = state[key].find((x) => x.id === action.id)
      const next = { ...state, [key]: mapById(state[key], action.id, (x) => ({ ...x, proof: action.status })) }
      return notify(
        next, item?.authorId,
        action.status === 'verified'
          ? 'Your invoice was checked. Your report now shows as a verified visit.'
          : 'We could not match your invoice to the visit, so it is not marked as verified.',
      )
    }

    /* ---------- Veterinarians and clinics ---------- */
    case 'updateVet':
      return { ...state, vets: mapById(state.vets, action.id, (v) => ({ ...v, ...action.patch })) }
    case 'addVet':
      return {
        ...state,
        vets: [...state.vets, { id: uid('v'), photo: null, education: '', licenseState: '', licenseNumber: '', verification: 'unverified', ...action.vet }],
      }
    // A vet with their own account keeps their profile and just leaves the
    // clinic. A profile the clinic created (no account) is deleted.
    case 'removeVet': {
      const hasAccount = state.users.some((u) => u.vetId === action.id)
      return hasAccount
        ? { ...state, vets: mapById(state.vets, action.id, (v) => ({ ...v, clinicId: null })) }
        : { ...state, vets: state.vets.filter((v) => v.id !== action.id) }
    }
    case 'updateClinic':
      return {
        ...state,
        clinics: mapById(state.clinics, action.id, (c) => {
          const next = { ...c, ...action.patch }
          // Keep the map pin in step with the ZIP code.
          return next.zip !== c.zip ? { ...next, coords: coordsForZip(next.zip) || c.coords } : next
        }),
      }

    /* ---------- Invites: a clinic asks a vet (by email) to join ---------- */
    case 'sendInvite': {
      const email = action.email.trim().toLowerCase()
      const next = {
        ...state,
        invites: [{ id: uid('i'), clinicId: action.clinicId, email, name: action.name, status: 'pending', date: today() }, ...state.invites],
      }
      const invited = state.users.find((u) => u.role === 'vet' && u.email.toLowerCase() === email)
      return notify(next, invited?.id, `${nameOf('clinic', action.clinicId)} invited you to join their team.`)
    }
    case 'cancelInvite':
      return { ...state, invites: state.invites.filter((i) => i.id !== action.id) }
    // action.accept: true joins the clinic, false declines.
    case 'respondInvite': {
      const invite = state.invites.find((i) => i.id === action.id)
      if (!invite) return state
      const next = {
        ...state,
        invites: mapById(state.invites, invite.id, (i) => ({ ...i, status: action.accept ? 'accepted' : 'declined' })),
        vets: action.accept
          ? mapById(state.vets, action.vetId, (v) => ({ ...v, clinicId: invite.clinicId }))
          : state.vets,
      }
      return notify(next, accountForClinic(state, invite.clinicId), `${nameOf('vet', action.vetId)} ${action.accept ? 'accepted' : 'declined'} your invite.`)
    }

    /* ---------- Messages ---------- */
    case 'sendMessage': {
      const message = { from: action.from, text: action.text, date: today() }
      if (action.threadId) {
        const thread = state.threads.find((t) => t.id === action.threadId)
        const next = {
          ...state,
          threads: mapById(state.threads, action.threadId, (t) => ({ ...t, messages: [...t.messages, message] })),
        }
        return action.from === 'client'
          ? notify(next, accountForVet(state, thread.vetId), `${thread.clientName} sent you a message.`)
          : notify(next, thread.clientId, `${nameOf('vet', thread.vetId)} replied to your message.`)
      }
      const thread = {
        id: uid('t'), vetId: action.vetId, clientId: action.clientId,
        clientName: action.clientName, subject: action.subject, messages: [message],
      }
      return notify({ ...state, threads: [thread, ...state.threads] }, accountForVet(state, action.vetId), `${action.clientName} sent you a message.`)
    }

    /* ---------- Appointment requests ---------- */
    // An owner asks for a day. The vet or clinic confirms, declines or
    // suggests another time. Nothing is booked in a real calendar.
    case 'requestAppointment': {
      const appointment = {
        id: uid('a'), clientId: me, clientName: meUser?.name, status: 'requested', created: today(), ...action.appointment,
      }
      const next = { ...state, appointments: [appointment, ...state.appointments] }
      return notify(next, accountsForVet(state, appointment.vetId), `${appointment.clientName} asked for an appointment on ${shortDate(appointment.date)}.`)
    }
    // action.patch can set status ('confirmed' | 'declined' | 'proposed' |
    // 'cancelled'), and for 'proposed' a proposedDate, proposedTime and reply.
    case 'updateAppointment': {
      const before = state.appointments.find((a) => a.id === action.id)
      if (!before) return state
      const after = { ...before, ...action.patch }
      const next = { ...state, appointments: mapById(state.appointments, action.id, () => after) }
      const vetName = nameOf('vet', after.vetId)
      const fromOwner = me === after.clientId
      const text = {
        confirmed: fromOwner
          ? `${after.clientName} accepted the new time, ${shortDate(after.date)}.`
          : `${vetName} confirmed your appointment on ${shortDate(after.date)}.`,
        declined: `${vetName} could not take your appointment request.`,
        proposed: `${vetName} suggested a different time: ${shortDate(after.proposedDate || after.date)}.`,
        cancelled: `${after.clientName} cancelled their appointment request.`,
      }[after.status]
      if (!text) return next
      return notify(next, fromOwner ? accountsForVet(state, after.vetId) : after.clientId, text)
    }

    /* ---------- Notifications ---------- */
    case 'markRead':
      return { ...state, notifications: mapById(state.notifications, action.id, (n) => ({ ...n, read: true })) }
    case 'markAllRead':
      return { ...state, notifications: state.notifications.map((n) => (n.userId === me ? { ...n, read: true } : n)) }

    /* ---------- Stats ---------- */
    // action.key is "vet:<id>" or "clinic:<id>".
    case 'recordView':
      return { ...state, stats: { ...state.stats, [action.key]: (state.stats[action.key] || 0) + 1 } }

    case 'reset':
      return seed
    default:
      return state
  }
}

// Sample data is ready at once. Adding ?delay=1500 to the address pretends
// it takes that many milliseconds, so the loading screen can be previewed.
// With a backend, `ready` becomes "the first requests have come back".
const fakeDelay = () => Math.min(Number(new URLSearchParams(window.location.search).get('delay')) || 0, 10000)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  const [ready, setReady] = useState(() => fakeDelay() === 0)

  useEffect(() => {
    if (ready) return
    const timer = setTimeout(() => setReady(true), fakeDelay())
    return () => clearTimeout(timer)
  }, [ready])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full or unavailable: the app still works for this visit */
    }
  }, [state])

  const pricePoints = useMemo(() => buildPricePoints(state.reviews, state.priceReports), [state.reviews, state.priceReports])

  const value = useMemo(() => {
    const user = state.users.find((u) => u.id === state.currentUserId) || null
    return { ...state, user, pricePoints, ready, dispatch }
  }, [state, pricePoints, ready])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
