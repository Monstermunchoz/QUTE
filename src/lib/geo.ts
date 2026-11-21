import { MAP_H, MAP_W } from '../data/regions'

const LAT0 = 46.5
const K = Math.cos((LAT0 * Math.PI) / 180)
const MINX = -5.3 * K
const MAXX = 9.7 * K
const MINY = 41.2
const MAXY = 51.2

/** Projette lon/lat sur le même repère que les contours des régions. */
export function project(lng: number, lat: number) {
  return {
    x: ((lng * K - MINX) / (MAXX - MINX)) * MAP_W,
    y: ((MAXY - lat) / (MAXY - MINY)) * MAP_H,
  }
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}
