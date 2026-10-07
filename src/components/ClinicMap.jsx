import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// The logo mark as a map pin. Colours are fixed so pins read on the map
// tiles in light and dark mode.
const PIN_HTML = `
  <svg viewBox="2 10 60 44" width="26" height="19" aria-hidden="true">
    <circle cx="24" cy="32" r="20" fill="#3e5c3a"/>
    <circle cx="40" cy="32" r="20" fill="#e5a62e"/>
    <path d="M32 13.670a20 20 0 0 1 0 36.660a20 20 0 0 1 0-36.660z" fill="#fffdf8"/>
    <path d="M30 25h4v5h5v4h-5v5h-4v-5h-5v-4h5z" fill="#3e5c3a"/>
  </svg>`

// A map with one pin per clinic, drawn with Leaflet and OpenStreetMap tiles.
// points:   [{ id, name, coords: [lat, lng], href, detail }]
// origin:   [lat, lng] of the search centre, shown as a dot (optional)
// activeId: the clinic to highlight, e.g. the result under the pointer
//
// OpenStreetMap's free tiles are fine while developing. A live site with
// real traffic needs its own tile provider (MapTiler, Stadia, Mapbox...).
export default function ClinicMap({ points, origin = null, activeId = null, height = 320 }) {
  const el = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)
  const markers = useRef({})
  const navigate = useNavigate()

  // Create the map once.
  useEffect(() => {
    map.current = L.map(el.current, { scrollWheelZoom: false })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => map.current.remove()
  }, [])

  // Redraw the pins whenever the results change.
  useEffect(() => {
    layer.current.clearLayers()
    markers.current = {}
    const placed = points.filter((p) => p.coords)

    for (const p of placed) {
      const popup = document.createElement('div')
      const link = document.createElement('a')
      link.href = p.href
      link.textContent = p.name
      link.addEventListener('click', (e) => { e.preventDefault(); navigate(p.href) })
      popup.append(link)
      if (p.detail) {
        const detail = document.createElement('span')
        detail.textContent = p.detail
        popup.append(detail)
      }
      const icon = L.divIcon({ className: 'map-pin', html: PIN_HTML, iconSize: [40, 40], iconAnchor: [20, 46], popupAnchor: [0, -44] })
      markers.current[p.id] = L.marker(p.coords, { icon, title: p.name }).bindPopup(popup).addTo(layer.current)
    }

    if (origin) {
      L.circleMarker(origin, { radius: 7, color: '#fffdf8', weight: 3, fillColor: '#8f3550', fillOpacity: 1 })
        .bindTooltip('Search centre')
        .addTo(layer.current)
    }

    const all = [...placed.map((p) => p.coords), ...(origin ? [origin] : [])]
    if (all.length === 1) map.current.setView(all[0], 12)
    else if (all.length > 1) map.current.fitBounds(all, { padding: [48, 48], maxZoom: 13 })
    else map.current.setView([39.77, -86.16], 6)
  }, [points, origin, navigate])

  // Highlight one pin without redrawing the rest.
  useEffect(() => {
    for (const [id, marker] of Object.entries(markers.current)) {
      const active = id === activeId
      marker.getElement()?.classList.toggle('is-active', active)
      marker.setZIndexOffset(active ? 1000 : 0)
    }
  }, [activeId, points])

  return <div ref={el} className="map" style={{ height }} role="region" aria-label="Map of clinics" />
}
