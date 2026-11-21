import { CalendarHeart, Check, Copy, ExternalLink, Flag, MapPin, Navigation } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { Portrait } from '../components/Portrait'
import { lieuById, TYPE_LABEL } from '../data/venues'
import { PROFILS } from '../data/profiles'
import { jourSoiree, soireesDuLieu } from '../data/events'
import { adresseComplete, decrire, itineraires } from '../data/descriptions'
import { useApp } from '../store/useApp'
import { frequentation } from './Lieux'

const AUJOURDHUI = new Date().toISOString().slice(0, 10)

export function LieuSheet({ id }: { id: string }) {
  const l = lieuById(id)!
  const { ceSoir, toggleCeSoir, notify, open, premium, discret } = useApp()
  const j = ceSoir.includes(l.id)
  const boutique = l.type === 'shop'
  const membres = PROFILS.filter((p) => p.ceSoir === l.id)
  const soirees = soireesDuLieu(l.id).filter((s) => s.date >= AUJOURDHUI).slice(0, 6)
  const it = itineraires(l)

  const copierGps = async () => {
    try {
      await navigator.clipboard.writeText(it.gps)
      notify('Coordonnées GPS copiées')
    } catch {
      notify(it.gps)
    }
  }

  return (
    <Sheet onClose={() => history.back()} label={l.nom}>
      <div className="scroll pad" style={{ paddingBottom: 'calc(var(--safe-b) + 24px)' }}>
        <p className="eyebrow">{TYPE_LABEL[l.type]} · {l.ville}</p>
        <h1 className="display" style={{ fontSize: 32, marginTop: 8 }}>{l.nom}</h1>

        <p style={{ marginTop: 14, fontSize: 15.5, lineHeight: 1.6 }}>{decrire(l)}</p>
        {l.accueil && <p className="tag tag-peut" style={{ marginTop: 12 }}>{l.accueil}</p>}

        {l.prix && (
          <section style={{ marginTop: 22 }}>
            <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>Entrée le week-end</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}>
              {([['Couple', l.prix.couple], ['Femme seule', l.prix.femme], ['Homme seul', l.prix.homme]] as const).map(([q, v]) => {
                const refuse = /non/.test(v)
                return (
                  <div key={q} className="card" style={{ padding: '12px 8px', textAlign: 'center' }}>
                    <div className="display" style={{ fontSize: 20, color: refuse ? 'var(--faint)' : 'var(--text)' }}>{v === 'gratuit' ? 'Offert' : refuse ? '—' : v}</div>
                    <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>{refuse ? `${q} : non admis` : q}</div>
                  </div>
                )
              })}
            </div>
            <p className="faint" style={{ fontSize: 11.5, marginTop: 8 }}>Tarifs indicatifs, à confirmer auprès de l'établissement.</p>
          </section>
        )}

        <section style={{ marginTop: 24 }}>
          <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>Y aller</h2>
          <div className="card" style={{ marginTop: 10, padding: 16 }}>
            <p className="row" style={{ gap: 10, alignItems: 'flex-start', fontWeight: 600 }}>
              <MapPin size={18} style={{ flex: 'none', marginTop: 2 }} color="var(--velours-hi)" />
              <span>{adresseComplete(l) || l.ville}</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
              <a className="btn btn-primary" style={{ height: 46, padding: 0, fontSize: 14, textDecoration: 'none' }} href={it.google} target="_blank" rel="noopener noreferrer"><Navigation size={16} />Maps</a>
              <a className="btn btn-ghost" style={{ height: 46, padding: 0, fontSize: 14, textDecoration: 'none' }} href={it.waze} target="_blank" rel="noopener noreferrer">Waze</a>
              <a className="btn btn-ghost" style={{ height: 46, padding: 0, fontSize: 14, textDecoration: 'none' }} href={it.apple} target="_blank" rel="noopener noreferrer">Plans</a>
            </div>
            <button className="row" onClick={copierGps} style={{ width: '100%', justifyContent: 'space-between', marginTop: 12, padding: '10px 12px', borderRadius: 12, background: 'var(--surface-2)', fontSize: 13 }}>
              <span><span className="faint">GPS · </span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{it.gps}</span></span>
              <Copy size={15} color="var(--muted)" />
            </button>
            <p className="faint" style={{ fontSize: 11.5, marginTop: 8 }}>Les itinéraires partent de l'adresse exacte. Le point GPS situe le secteur.</p>
          </div>
        </section>

        {!boutique && (
          <div className="card row" style={{ marginTop: 16, padding: 16 }}>
            <div style={{ flex: 1 }}>
              <div className="display" style={{ fontSize: 28, color: 'var(--rose)' }}>{frequentation(l, j)}</div>
              <div className="muted" style={{ fontSize: 13 }}>membres y vont ce soir</div>
            </div>
            <button className={`btn ${j ? 'btn-light' : 'btn-primary'}`} style={{ height: 46, padding: '0 18px' }} aria-pressed={j} onClick={() => { toggleCeSoir(l.id); notify(j ? 'C’est noté, vous n’y allez plus' : 'C’est noté ! Seuls vos matchs le voient') }}>
              {j && <Check size={17} />}{j ? 'J’y vais' : 'J’y vais ce soir'}
            </button>
          </div>
        )}

        {soirees.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>Prochaines soirées</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {soirees.map((s) => {
                const d = jourSoiree(s.date)
                return (
                  <button key={s.id} className="card row" style={{ padding: 12, textAlign: 'left', gap: 12 }} onClick={() => open({ kind: 'soiree', id: s.id })}>
                    <span style={{ width: 48, flex: 'none', textAlign: 'center' }}>
                      <span className="faint" style={{ display: 'block', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>{d.jour}</span>
                      <span className="display" style={{ display: 'block', fontSize: 20 }}>{d.num}</span>
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 700 }}>{s.titre}</span>
                      <span className="muted" style={{ fontSize: 12.5 }}>{d.mois}{s.heure ? ` · ${s.heure}` : ''}{s.pour ? ` · ${s.pour}` : ''}</span>
                    </span>
                    <CalendarHeart size={18} color="var(--rose)" />
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {membres.length > 0 && (
          <section style={{ marginTop: 24 }}>
            <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>Ils y seront</h2>
            <div className="row" style={{ gap: 10, marginTop: 12, overflowX: 'auto' }}>
              {membres.map((p) => (
                <button key={p.id} onClick={() => open({ kind: 'profil', id: p.id })} style={{ flex: 'none', width: 92, textAlign: 'center' }}>
                  <span style={{ position: 'relative', display: 'block', width: 76, height: 76, margin: '0 auto', borderRadius: 38, overflow: 'hidden' }}><Portrait teinte={p.teinte} personnes={p.partenaires.length} flou={!premium || discret} /></span>
                  <span style={{ display: 'block', fontSize: 12.5, fontWeight: 650, marginTop: 6 }}>{p.nom}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="row" style={{ gap: 10, marginTop: 24 }}>
          <a className="btn btn-ghost" style={{ flex: 1, textDecoration: 'none', fontSize: 14 }} href={l.source} target="_blank" rel="noreferrer noopener"><ExternalLink size={16} />Fiche source</a>
          <button className="btn btn-ghost" style={{ flex: 1, fontSize: 14 }} onClick={() => notify('Merci ! On vérifie et on corrige la fiche.')}><Flag size={16} />Signaler une erreur</button>
        </div>
        <p className="faint" style={{ fontSize: 12, marginTop: 12 }}>Horaires et conditions d'entrée à confirmer auprès de l'établissement avant de vous déplacer.</p>
      </div>
    </Sheet>
  )
}
