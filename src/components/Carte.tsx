import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import type { Lieu, TypeLieu } from '../data/venues'

export const COULEUR: Record<TypeLieu, string> = { club: '#d9294a', sauna: '#f1e6dc', bar: '#eba3ae', shop: '#a98bff' }

const FRANCE = L.latLngBounds([41.3, -5.2], [51.1, 9.6])

const tuiles = (clair: boolean) =>
  `https://{s}.basemaps.cartocdn.com/${clair ? 'light_all' : 'dark_all'}/{z}/{x}/{y}{r}.png`

const pastille = (l: Lieu) =>
  L.divIcon({
    className: 'qpin',
    html: `<span style="--c:${COULEUR[l.type]}"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })

/** Vraie carte (OpenStreetMap / CARTO), points regroupés, recadrée sur la sélection. */
export function Carte({ lieux, clair, onChoisir }: { lieux: Lieu[]; clair: boolean; onChoisir: (id: string) => void }) {
  const boite = useRef<HTMLDivElement>(null)
  const carte = useRef<L.Map | null>(null)
  const couche = useRef<L.TileLayer | null>(null)
  const groupe = useRef<L.MarkerClusterGroup | null>(null)
  const choisir = useRef(onChoisir)
  choisir.current = onChoisir

  useEffect(() => {
    if (!boite.current) return
    const m = L.map(boite.current, { zoomControl: false, attributionControl: true, minZoom: 5, maxZoom: 18, zoomSnap: 0.25 })
    m.attributionControl.setPrefix('')
    m.fitBounds(FRANCE)
    L.control.zoom({ position: 'bottomright' }).addTo(m)
    groupe.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 46,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (c) => {
        const n = c.getChildCount()
        const t = n < 10 ? 36 : n < 50 ? 42 : 50
        return L.divIcon({ className: 'qcluster', html: `<span>${n}</span>`, iconSize: [t, t] })
      },
    }).addTo(m)
    carte.current = m
    const ro = new ResizeObserver(() => m.invalidateSize())
    ro.observe(boite.current)
    return () => { ro.disconnect(); m.remove(); carte.current = null }
  }, [])

  useEffect(() => {
    const m = carte.current
    if (!m) return
    couche.current?.remove()
    couche.current = L.tileLayer(tuiles(clair), {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OSM</a> · © <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>',
    }).addTo(m)
  }, [clair])

  useEffect(() => {
    const m = carte.current, g = groupe.current
    if (!m || !g) return
    g.clearLayers()
    const pts = lieux.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng))
    g.addLayers(
      pts.map((l) =>
        L.marker([l.lat, l.lng], { icon: pastille(l), title: l.nom, keyboard: true })
          .bindTooltip(l.nom, { direction: 'top', offset: [0, -12], className: 'qtip' })
          .on('click', () => choisir.current(l.id)),
      ),
    )
    if (!pts.length) m.flyToBounds(FRANCE, { duration: 0.6 })
    else if (pts.length === 1) m.flyTo([pts[0].lat, pts[0].lng], 14, { duration: 0.8 })
    else m.flyToBounds(L.latLngBounds(pts.map((l) => [l.lat, l.lng])), { padding: [36, 36], maxZoom: 14, duration: 0.8 })
  }, [lieux])

  return <div ref={boite} className="qmap" role="region" aria-label="Carte des lieux" />
}
