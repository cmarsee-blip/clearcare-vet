import { procedureById, states } from '../data/procedures'
import { milesBetween, searchOrigin } from './geo'
import { isOpenNow } from './hours'
import { clinicServices, ratingSummary, reviewsFor } from './selectors'

// Turns one free-text "where" box into city / state / zip filters.
export function parseWhere(input) {
  const text = input.trim()
  if (!text) return {}
  if (/^\d{3,5}$/.test(text)) return { zip: text }
  if (states.includes(text.toUpperCase())) return { state: text.toUpperCase() }
  const cityState = text.match(/^(.+?),\s*([A-Za-z]{2})$/)
  if (cityState) return { city: cityState[1].trim(), state: cityState[2].toUpperCase() }
  return { city: text }
}

const includesAll = (haystack, tokens) => tokens.every((t) => haystack.includes(t))

function pickServices(services, tokens) {
  if (!tokens.length) return services.slice(0, 3)
  const hits = services.filter((s) => {
    const p = procedureById[s.procedureId]
    return tokens.some((t) => `${p.name} ${p.category}`.toLowerCase().includes(t))
  })
  return hits.length ? hits : services.slice(0, 3)
}

// filters: { q, type, city, state, zip, within, lat, lng, species, open, emergency, sort }
export function search({ clinics, vets, reviews, pricePoints }, filters) {
  const { q = '', type = 'all', species = '', sort = 'rating' } = filters
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean)
  const clinicById = Object.fromEntries(clinics.map((c) => [c.id, c]))
  const procedureText = (services) =>
    services.map((s) => `${procedureById[s.procedureId].name} ${procedureById[s.procedureId].category}`).join(' ')

  const origin = searchOrigin(filters)
  const within = Number(filters.within) || 0
  const now = new Date()

  // Works out whether a clinic passes the location filters, and how far away it is.
  function locate(clinic) {
    if (clinic.verification === 'rejected') return null
    if (filters.state && clinic.state !== filters.state) return null
    if (filters.city && !clinic.city.toLowerCase().includes(filters.city.toLowerCase())) return null
    if (filters.emergency && !clinic.emergency) return null
    if (filters.open && !isOpenNow(clinic, now)) return null

    const distance = milesBetween(origin, clinic.coords)
    if (within && origin) {
      if (distance == null || distance > within) return null
    } else if (filters.zip && !origin && !clinic.zip.startsWith(filters.zip.slice(0, 3))) {
      // We don't know where this ZIP is, so fall back to "same first three digits".
      return null
    } else if (filters.zip && origin && !within && distance != null && distance > 50) {
      // A ZIP with no distance chosen means "around here": 50 miles.
      return null
    }
    return { distance }
  }

  const results = []

  if (type !== 'clinics') {
    for (const vet of vets) {
      if (vet.verification === 'rejected') continue
      const clinic = clinicById[vet.clinicId]
      const place = clinic && locate(clinic)
      if (!place) continue
      if (species && !vet.species.includes(species)) continue
      const haystack = `${vet.name} ${vet.credentials} ${vet.specialties.join(' ')} ${clinic.name} ${procedureText(vet.services)}`.toLowerCase()
      if (!includesAll(haystack, tokens)) continue
      results.push({
        kind: 'vet', id: vet.id, item: vet, clinic, distance: place.distance, openNow: isOpenNow(clinic, now),
        services: pickServices(vet.services, tokens),
        ...ratingSummary(reviewsFor(reviews, 'vet', vet.id)),
      })
    }
  }

  if (type !== 'vets') {
    for (const clinic of clinics) {
      const place = locate(clinic)
      if (!place) continue
      if (species && !clinic.species.includes(species)) continue
      const services = clinicServices(vets, pricePoints, clinic.id)
      const haystack = `${clinic.name} ${clinic.about} ${procedureText(services)}`.toLowerCase()
      if (!includesAll(haystack, tokens)) continue
      results.push({
        kind: 'clinic', id: clinic.id, item: clinic, clinic, distance: place.distance, openNow: isOpenNow(clinic, now),
        services: pickServices(services, tokens),
        ...ratingSummary(reviewsFor(reviews, 'clinic', clinic.id)),
      })
    }
  }

  const lowest = (r) => Math.min(...r.services.map((s) => s.priceLow), Infinity)
  const far = (r) => (r.distance == null ? Infinity : r.distance)
  const sorters = {
    rating: (a, b) => b.average - a.average || b.count - a.count,
    reviews: (a, b) => b.count - a.count,
    price: (a, b) => lowest(a) - lowest(b),
    distance: (a, b) => far(a) - far(b),
    name: (a, b) => a.item.name.localeCompare(b.item.name),
  }
  return results.sort(sorters[sort] || sorters.rating)
}
