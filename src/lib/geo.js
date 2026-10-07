// Distance helpers. The ZIP table is a small sample so "within 25 miles of
// 46220" works without a server. A real version would call a geocoding
// service to turn any ZIP or address into coordinates.

// ZIP code -> approximate [latitude, longitude]
export const zipCoords = {
  46201: [39.774, -86.109], 46204: [39.771, -86.157], 46220: [39.866, -86.118], 46250: [39.906, -86.066],
  46032: [39.971, -86.125], 46038: [39.957, -86.022], 46601: [41.676, -86.25], 46802: [41.07, -85.15],
  46808: [41.098, -85.176], 47305: [40.193, -85.386], 47401: [39.14, -86.51], 47708: [37.974, -87.574],
  47807: [39.467, -87.414], 47901: [40.418, -86.889], 47909: [40.352, -86.887],
  40202: [38.253, -85.752], 40502: [38.014, -84.483], 40510: [38.07, -84.59],
  43215: [39.966, -83.004], 45202: [39.107, -84.502], 48226: [42.331, -83.048], 60601: [41.886, -87.622],
}

export const coordsForZip = (zip) => zipCoords[zip] || null

// Straight-line ("as the crow flies") distance in miles between two points.
export function milesBetween(a, b) {
  if (!a || !b) return null
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2
  return 3958.8 * 2 * Math.asin(Math.sqrt(h))
}

// Where the search is centred: the browser's location if the visitor shared
// it, otherwise the ZIP they typed (when we know where that ZIP is).
export function searchOrigin({ lat, lng, zip }) {
  if (lat && lng) return [Number(lat), Number(lng)]
  return coordsForZip(zip)
}

export const formatMiles = (miles) => (miles < 10 ? `${miles.toFixed(1)} mi` : `${Math.round(miles)} mi`)
