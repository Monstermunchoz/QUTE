import { CalendarHeart, Users } from 'lucide-react'
import { Portrait } from '../components/Portrait'
import { SOIREES } from '../data/events'
import { lieuById } from '../data/venues'
import { useApp } from '../store/useApp'
import { CityPicker, dansVille } from '../components/CityPicker'

export function Soirees() {
  const open = useApp((s) => s.open)
  const ville = useApp((s) => s.ville)
  const liste = SOIREES.filter((s) => dansVille(lieuById(s.lieuId)!.ville, ville))
  const [une, ...autres] = liste
  const lieuUne = une ? lieuById(une.lieuId)! : undefined
  return (
    <div className="screen" style={{ paddingTop: 'calc(var(--safe-t) + 16px)' }}>
      <div className="scroll" style={{ paddingBottom: 'calc(var(--safe-b) + 100px)' }}>
        <header className="pad">
          <p className="eyebrow">L'agenda libertin</p>
          <h1 className="h1" style={{ marginTop: 6 }}>Soirées</h1>
          <div style={{ marginTop: 14 }}><CityPicker /></div>
        </header>

        {!une && <p className="muted pad" style={{ marginTop: 30 }}>Pas encore de soirée annoncée dans cette ville. Les clubs partenaires publient leur agenda ici.</p>}
        {une && lieuUne && (
        <button className="on-dark" onClick={() => open({ kind: 'lieu', id: une.lieuId })} style={{ position: 'relative', display: 'block', width: 'calc(100% - 28px)', margin: '18px 14px 0', height: 300, borderRadius: 'var(--r-xl)', overflow: 'hidden', textAlign: 'left' }}>
          <Portrait teinte={352} personnes={2} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,7,9,.1), rgba(11,7,9,.92))' }} />
          <div style={{ position: 'absolute', left: 20, right: 20, bottom: 20 }}>
            <span className="tag" style={{ background: 'var(--velours)', color: '#fff' }}>À la une · {une.quand}</span>
            <div className="display" style={{ fontSize: 30, marginTop: 12 }}>{une.titre}</div>
            <div className="muted" style={{ marginTop: 6 }}>{lieuUne.nom} · {lieuUne.ville} · {une.heure}</div>
            <div className="row" style={{ gap: 6, marginTop: 10, fontSize: 13, fontWeight: 650, color: 'var(--champagne)' }}><Users size={15} />{une.participants} membres inscrits</div>
          </div>
        </button>
        )}

        <ul style={{ listStyle: 'none', margin: '20px 0 0', padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {autres.map((s) => {
            const l = lieuById(s.lieuId)!
            return (
              <li key={s.id}>
                <button className="card row" style={{ width: '100%', padding: 14, textAlign: 'left' }} onClick={() => open({ kind: 'lieu', id: s.lieuId })}>
                  <span style={{ width: 58, height: 64, flex: 'none', borderRadius: 16, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                    <span>
                      <span className="faint" style={{ display: 'block', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em' }}>{s.quand.split(' ')[0]}</span>
                      <span className="display" style={{ display: 'block', fontSize: 22 }}>{s.quand.split(' ')[1]}</span>
                    </span>
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 16 }}>{s.titre}</span>
                    <span className="muted" style={{ display: 'block', fontSize: 13, marginTop: 2 }}>{l.nom} · {l.ville} · {s.heure}</span>
                    <span className="faint" style={{ display: 'block', fontSize: 12.5, marginTop: 4 }}>{s.theme}</span>
                  </span>
                  <span style={{ textAlign: 'right' }}><span style={{ display: 'block', fontWeight: 800, color: 'var(--rose)' }}>{s.participants}</span><span className="faint" style={{ fontSize: 11 }}>inscrits</span></span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="faint pad row" style={{ fontSize: 12, marginTop: 16, gap: 6 }}><CalendarHeart size={14} />Agenda de démonstration. Les clubs partenaires publieront leurs soirées ici.</p>
      </div>
    </div>
  )
}
