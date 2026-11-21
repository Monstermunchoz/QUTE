import { useMemo } from 'react'
import { CalendarHeart, Check } from 'lucide-react'
import { CityPicker } from '../components/CityPicker'
import { jourSoiree, SOIREES, type Soiree } from '../data/events'
import { useApp } from '../store/useApp'

const AUJOURDHUI = new Date().toISOString().slice(0, 10)

export function Soirees() {
  const { open, ville, participe } = useApp()

  const liste = useMemo(() => SOIREES.filter((s) => s.date >= AUJOURDHUI && (!ville || s.agglo === ville || s.ville === ville)), [ville])
  const parJour = useMemo(() => {
    const m = new Map<string, Soiree[]>()
    liste.forEach((s) => m.set(s.date, [...(m.get(s.date) ?? []), s]))
    return [...m.entries()]
  }, [liste])
  const villes = useMemo(() => new Set(liste.map((s) => s.agglo)).size, [liste])

  return (
    <div className="screen" style={{ paddingTop: 'calc(var(--safe-t) + 16px)' }}>
      <div className="scroll" style={{ paddingBottom: 'calc(var(--safe-b) + 100px)' }}>
        <header className="pad">
          <p className="eyebrow">L'agenda libertin</p>
          <h1 className="h1" style={{ marginTop: 6 }}>Où sortir ?</h1>
          <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>{liste.length} soirée{liste.length > 1 ? 's' : ''} à venir{ville ? ` à ${ville}` : ` dans ${villes} villes`}, vérifiées sur l'agenda officiel des clubs.</p>
          <div style={{ marginTop: 14 }}><CityPicker /></div>
        </header>

        {parJour.length === 0 && (
          <div className="pad" style={{ marginTop: 40, textAlign: 'center' }}>
            <CalendarHeart size={34} color="var(--rose)" />
            <p className="h2" style={{ marginTop: 12 }}>Rien d'annoncé ici pour l'instant</p>
            <p className="muted" style={{ marginTop: 8 }}>Les clubs de cette ville n'ont pas encore publié leurs dates. Essayez une ville voisine ou toute la France.</p>
          </div>
        )}

        {parJour.map(([date, soirees]) => {
          const d = jourSoiree(date)
          return (
            <section key={date} style={{ marginTop: 22 }}>
              <h2 className="pad row" style={{ gap: 10, fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: date === AUJOURDHUI ? 'var(--rose)' : 'var(--muted)' }}>
                {date === AUJOURDHUI ? 'Ce soir' : d.long}
                <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              </h2>
              <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {soirees.map((s) => {
                  const j = participe.includes(s.id)
                  return (
                    <li key={s.id}>
                      <button className="card row" style={{ width: '100%', padding: 14, textAlign: 'left', gap: 14 }} onClick={() => open({ kind: 'soiree', id: s.id })}>
                        <span style={{ width: 50, height: 56, flex: 'none', borderRadius: 14, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                          <span>
                            <span className="faint" style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{d.mois}</span>
                            <span className="display" style={{ display: 'block', fontSize: 21 }}>{d.num}</span>
                          </span>
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: 'block', fontWeight: 700, fontSize: 15.5 }}>{s.titre}</span>
                          <span className="muted" style={{ display: 'block', fontSize: 13, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.lieu} · {s.ville}{s.heure ? ` · ${s.heure}` : ''}</span>
                          {s.pour && <span className="faint" style={{ display: 'block', fontSize: 12, marginTop: 3 }}>{s.pour}</span>}
                        </span>
                        {j && <span className="tag" style={{ background: 'var(--velours)', color: '#fff' }}><Check size={13} />J'y vais</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
        <p className="faint pad" style={{ fontSize: 12, marginTop: 22 }}>Agenda relevé sur les sites officiels des clubs. Un club ou une soirée manque ? Signalez-le depuis l'onglet Lieux.</p>
      </div>
    </div>
  )
}
