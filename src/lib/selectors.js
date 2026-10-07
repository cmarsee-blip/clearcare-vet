// Small helpers that read from the store's data.
import { procedureById } from '../data/procedures'

export const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export const formatDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const shortDate = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const reviewsFor = (reviews, type, id) =>
  reviews.filter((r) => r.targetType === type && r.targetId === id)

export function ratingSummary(list) {
  if (!list.length) return { average: 0, count: 0 }
  const total = list.reduce((sum, r) => sum + r.rating, 0)
  return { average: total / list.length, count: list.length }
}

export const median = (nums) => {
  if (!nums.length) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

/* ---------- Prices owners reported ---------- */

// Every "an owner paid $X to this vet for this procedure" data point, from
// reviews that include an amount and from quick price reports.
// The store builds this once and exposes it as `pricePoints`.
export function buildPricePoints(reviews, priceReports) {
  const fromReviews = reviews
    .filter((r) => r.targetType === 'vet' && r.procedureId && r.amountPaid)
    .map((r) => ({ vetId: r.targetId, procedureId: r.procedureId, amount: r.amountPaid, verified: r.proof === 'verified' }))
  const fromReports = priceReports.map((p) => ({
    vetId: p.vetId, procedureId: p.procedureId, amount: p.amount, verified: p.proof === 'verified',
  }))
  return [...fromReviews, ...fromReports]
}

// The amounts owners reported paying one vet for one procedure.
export const reportedPrices = (pricePoints, vetId, procedureId) =>
  pricePoints.filter((p) => p.vetId === vetId && p.procedureId === procedureId).map((p) => p.amount)

export const vetsAt = (vets, clinicId) => vets.filter((v) => v.clinicId === clinicId)

// A clinic's price list is the combined list of its veterinarians' services.
export function clinicServices(vets, pricePoints, clinicId) {
  const byProcedure = {}
  for (const vet of vetsAt(vets, clinicId)) {
    for (const s of vet.services) {
      const entry = (byProcedure[s.procedureId] ||= {
        procedureId: s.procedureId, priceLow: s.priceLow, priceHigh: s.priceHigh, reported: [], vets: [],
        includes: s.includes || [],
      })
      entry.priceLow = Math.min(entry.priceLow, s.priceLow)
      entry.priceHigh = Math.max(entry.priceHigh, s.priceHigh)
      // Only promise what every vet at the clinic includes.
      entry.includes = entry.includes.filter((item) => (s.includes || []).includes(item))
      entry.reported.push(...reportedPrices(pricePoints, vet.id, s.procedureId))
      entry.vets.push(vet)
    }
  }
  return Object.values(byProcedure).sort((a, b) =>
    procedureById[a.procedureId].name.localeCompare(procedureById[b.procedureId].name),
  )
}

/* ---------- Typical prices for an area ---------- */

// Everyone who offers a procedure, optionally in one city.
// Returns [{ vet, clinic, service, reported }]
export function offersFor({ vets, clinics, pricePoints }, procedureId, city = '') {
  const clinicById = Object.fromEntries(clinics.map((c) => [c.id, c]))
  return vets
    .filter((v) => v.verification !== 'rejected')
    .map((vet) => ({ vet, clinic: clinicById[vet.clinicId], service: vet.services.find((s) => s.procedureId === procedureId) }))
    .filter((o) => o.service && o.clinic && (!city || o.clinic.city === city))
    .map((o) => ({ ...o, reported: reportedPrices(pricePoints, o.vet.id, procedureId) }))
    .sort((a, b) => a.service.priceLow - b.service.priceLow)
}

// Summary numbers for a list of offers.
export function priceSummary(offers) {
  if (!offers.length) return null
  const reported = offers.flatMap((o) => o.reported)
  return {
    vets: offers.length,
    low: Math.min(...offers.map((o) => o.service.priceLow)),
    high: Math.max(...offers.map((o) => o.service.priceHigh)),
    paid: median(reported),
    reports: reported.length,
  }
}

/* ---------- Who gets notified ---------- */

export const unreadCount = (notifications, userId) =>
  notifications.filter((n) => n.userId === userId && !n.read).length
