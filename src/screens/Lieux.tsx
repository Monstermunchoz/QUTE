import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { ChevronRight, Plus, RotateCcw, Search } from 'lucide-react'
import { MAP_H, MAP_W, REGIONS } from '../data/regions'
import { LIEUX, TYPE_LABEL, type Lieu, type TypeLieu } from '../data/venues'
import { project } from '../lib/geo'
import { CityPicker, dansVille } from '../components/CityPicker'
import { useApp } from '../store/useApp'

const BBOX = Object.fromEntries(
  REGIONS.map((r) => {
    const n = r.d.match(/-?\d+(\.\d+)?/g)!.map(Number)
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (let i = 0; i < n.length; i += 2) {
      x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1])
    }
    return [r.code, { x0, y0, x1, y1 }]
  }),
)

const COULEUR: Record<TypeLieu, string> = { club: '#d9294a', sauna: '#f1e6dc', bar: '#eba3ae', shop: '#a98bff' }
const FILTRE_LABEL: Record<TypeLieu | 'tout', string> = { tout: 'Tout', club: 'Clubs', sauna: 'Saunas', bar: 'Bars', shop: 'Sex-shops' }

/** Fréquentation de démonstration, stable par lieu. */
export const frequentation = (l: Lieu, moi: boolean) => ([...l.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 30) + 4 + (moi ? 1 : 0)

export function Lieux() {
  const { open, ceSoir, ville } = useApp()
  const [region, setRegion] = useState<string | null>(null)
  const [type, setType] = useState<TypeLieu | 'tout'>('tout')
  const [q, setQ] = useState('')

  const liste = useMemo(() => {
    const s = q.trim().toLowerCase()
    return LIEUX.filter((l) => (type === 'tout' || l.type === type) && (!region || l.region === region) && dansVille(l.ville, ville) && (!s || `${l.nom} ${l.ville}`.toLowerCase().includes(s)))
  }, [type, region, q, ville])

  const vue = useMemo(() => {
    if (ville) {
      const pts = LIEUX.filter((l) => dansVille(l.ville, ville)).map((l) => project(l.lng, l.lat))
      const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y)
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2
      const cy = (Math.min(...ys) + Math.max(...ys)) / 2
      const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 4)
      const s = Math.min(90, MAP_W / (span * 2.2))
      return { s, vb: `${cx - MAP_W / s / 2} ${cy - MAP_H / s / 2} ${MAP_W / s} ${MAP_H / s}` }
    }
    if (!region) return { s: 1, vb: `0 0 ${MAP_W} ${MAP_H}` }
    const b = BBOX[region]
    const w = b.x1 - b.x0, h = b.y1 - b.y0
    const s = Math.min(MAP_W / w, MAP_H / h) * 0.82
    const vw = MAP_W / s, vh = MAP_H / s
    return { s, vb: `${b.x0 + w / 2 - vw / 2} ${b.y0 + h / 2 - vh / 2} ${vw} ${vh}` }
  }, [region, ville])

  const parRegion = useMemo(() => {
    const m: Record<string, number> = {}
    LIEUX.forEach((l) => (m[l.region] = (m[l.region] ?? 0) + 1))
    return m
  }, [])

  const nomRegion = ville ?? (region ? REGIONS.find((r) => r.code === region)?.nom : 'Toute la France')

  return (
    <div className="screen" style={{ paddingTop: 'calc(var(--safe-t) + 10px)' }}>
      <header className="pad" style={{ paddingTop: 6 }}>
        <p className="eyebrow">Clubs · saunas · bars · sex-shops</p>
        <div className="row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
          <h1 className="h1">{nomRegion}</h1>
          {(region || ville) && <button className="icon-btn" aria-label="Revenir à la France entière" onClick={() => { setRegion(null); useApp.getState().setVille(null) }}><RotateCcw size={18} /></button>}
        </div>
        <div style={{ marginTop: 12 }}><CityPicker /></div>
        <label className="row" style={{ marginTop: 12, height: 50, padding: '0 16px', borderRadius: 25, background: 'var(--surface)', border: '1px solid var(--line-2)', gap: 10 }}>
          <Search size={18} color="var(--muted)" />
          <span className="sr">Rechercher un lieu</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Un club, un sauna, une ville…" style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 'none' }} />
        </label>
      </header>

      <div className="chips" role="group" aria-label="Type de lieu" style={{ marginTop: 12 }}>
        {(['tout', 'club', 'sauna', 'bar', 'shop'] as const).map((t) => (
          <button key={t} className="chip" aria-pressed={type === t} onClick={() => setType(t)}>{FILTRE_LABEL[t]}</button>
        ))}
      </div>

      <div className="scroll" style={{ paddingBottom: 'calc(var(--safe-b) + 100px)' }}>
        <div style={{ margin: '14px 14px 0', borderRadius: 'var(--r-l)', background: 'radial-gradient(90% 70% at 50% 30%, #1c1114, #0f090b)', border: '1px solid var(--line)', overflow: 'hidden', aspectRatio: `${MAP_W} / ${MAP_H}` }}>
          <motion.svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} animate={{ viewBox: vue.vb }} transition={{ type: 'spring', stiffness: 110, damping: 22 }} style={{ width: '100%', height: '100%', display: 'block' }} role="img" aria-label="Carte des régions de France">
            <g>
              {REGIONS.map((r) => {
                const actif = region === r.code
                const n = parRegion[r.code] ?? 0
                return (
                  <path key={r.code} d={r.d} onClick={() => { useApp.getState().setVille(null); setRegion(actif ? null : r.code) }}
                    fill={actif ? 'rgba(179,18,46,.28)' : n ? 'rgba(246,233,226,.075)' : 'rgba(246,233,226,.035)'}
                    stroke={actif ? 'var(--velours-hi)' : 'rgba(246,233,226,.22)'} strokeWidth={1.4 / vue.s}
                    style={{ cursor: 'pointer', transition: 'fill .25s' }}>
                    <title>{r.nom}</title>
                  </path>
                )
              })}
              {liste.map((l) => {
                const { x, y } = project(l.lng, l.lat)
                return (
                  <g key={l.id} transform={`translate(${x} ${y})`} onClick={() => open({ kind: 'lieu', id: l.id })} style={{ cursor: 'pointer' }}>
                    <circle r={22 / vue.s} fill={COULEUR[l.type]} opacity={0.18} />
                    <circle r={11 / vue.s} fill={COULEUR[l.type]} stroke="var(--bg)" strokeWidth={3 / vue.s} />
                    {vue.s > 4 && <text x={26 / vue.s} y={10 / vue.s} fontSize={32 / vue.s} fontWeight={650} fill="var(--text)" style={{ pointerEvents: 'none' }}>{l.nom}</text>}
                    <title>{l.nom}</title>
                  </g>
                )
              })}
            </g>
          </motion.svg>
        </div>
        <div className="pad row" style={{ gap: 14, marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
          {(Object.keys(COULEUR) as TypeLieu[]).map((t) => <span key={t} className="row" style={{ gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: COULEUR[t] }} />{FILTRE_LABEL[t]}</span>)}
          
        </div>

        <div className="pad" style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 className="h2">{liste.length} lieu{liste.length > 1 ? 'x' : ''}</h2>
        </div>
        <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
          {liste.map((l) => (
            <li key={l.id} style={{ contentVisibility: 'auto', containIntrinsicSize: '78px' }}>
              <button className="row pad" onClick={() => open({ kind: 'lieu', id: l.id })} style={{ width: '100%', padding: '14px 20px', textAlign: 'left' }}>
                <span style={{ width: 50, height: 50, borderRadius: 16, flex: 'none', background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 6, background: COULEUR[l.type], boxShadow: `0 0 18px ${COULEUR[l.type]}` }} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: 16 }}>{l.nom}</span>
                  <span className="muted" style={{ display: 'block', fontSize: 13, marginTop: 2 }}>{TYPE_LABEL[l.type]} · {l.ville}</span>
                </span>
                {l.type !== 'shop' && (
                  <span style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: 800, color: 'var(--rose)' }}>{frequentation(l, ceSoir.includes(l.id))}</span>
                    <span className="faint" style={{ fontSize: 11 }}>y vont</span>
                  </span>
                )}
                <ChevronRight size={18} color="var(--faint)" />
              </button>
            </li>
          ))}
        </ul>
        <div className="pad" style={{ marginTop: 18 }}>
          <button className="btn btn-ghost btn-block" onClick={() => useApp.getState().notify('Merci ! La modération vérifie chaque lieu proposé.')}><Plus size={18} />Proposer un lieu</button>
          <p className="faint" style={{ fontSize: 12, marginTop: 10, textAlign: 'center' }}>Annuaire en cours de vérification : confirmez horaires et conditions auprès de chaque établissement.</p>
        </div>
      </div>
    </div>
  )
}
