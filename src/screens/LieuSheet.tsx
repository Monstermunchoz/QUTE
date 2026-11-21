import { Check, ExternalLink, MapPin, Navigation } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { Portrait } from '../components/Portrait'
import { lieuById, TYPE_LABEL } from '../data/venues'
import { PROFILS } from '../data/profiles'
import { SOIREES } from '../data/events'
import { useApp } from '../store/useApp'
import { frequentation } from './Lieux'

const AMBIANCE = {
  club: 'Club libertin : bar, piste de danse et espaces câlins réservés aux adultes. Ambiance et règles d’entrée propres à chaque soirée.',
  sauna: 'Sauna libertin : hammam, sauna et espaces détente, souvent ouvert l’après-midi. Certains jours peuvent être réservés à un public.',
  bar: 'Bar libertin : l’endroit idéal pour un premier verre et faire connaissance, sans pression.',
} as const

export function LieuSheet({ id }: { id: string }) {
  const l = lieuById(id)!
  const { ceSoir, toggleCeSoir, notify, open, premium, discret } = useApp()
  const j = ceSoir.includes(l.id)
  const membres = PROFILS.filter((p) => p.ceSoir === l.id)
  const soirees = SOIREES.filter((s) => s.lieuId === l.id)
  const adresse = [l.adresse, l.cp, l.ville].filter(Boolean).join(' ')
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.nom} ${adresse}`)}`

  return (
    <Sheet onClose={() => history.back()} label={l.nom}>
      <div className="scroll pad" style={{ paddingBottom: 'calc(var(--safe-b) + 24px)' }}>
        <p className="eyebrow">{TYPE_LABEL[l.type]}</p>
        <h1 className="display" style={{ fontSize: 32, marginTop: 8 }}>{l.nom}</h1>
        <p className="muted row" style={{ gap: 6, marginTop: 8, fontSize: 14 }}><MapPin size={15} />{adresse}</p>

        <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.55 }}>{l.ambiance ?? AMBIANCE[l.type]}</p>
        {l.accueil && <p className="tag tag-peut" style={{ marginTop: 12 }}>{l.accueil}</p>}

        {l.prix && (
          <section style={{ marginTop: 18 }}>
            <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>Entrée le week-end</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 10 }}>
              {([['Couple', l.prix.couple], ['Femme seule', l.prix.femme], ['Homme seul', l.prix.homme]] as const).map(([q, v]) => (
                <div key={q} className="card" style={{ padding: '12px 10px', textAlign: 'center' }}>
                  <div className="display" style={{ fontSize: 20, color: /non/.test(v) ? 'var(--faint)' : 'var(--text)' }}>{v === 'gratuit' ? 'Offert' : /non/.test(v) ? '—' : v}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{q}{/non/.test(v) ? ' : non admis' : ''}</div>
                </div>
              ))}
            </div>
            <p className="faint" style={{ fontSize: 11.5, marginTop: 8 }}>Tarifs indicatifs relevés par Libertination, à confirmer auprès du lieu.</p>
          </section>
        )}

        <div className="card row" style={{ marginTop: 18, padding: 16 }}>
          <div style={{ flex: 1 }}>
            <div className="display" style={{ fontSize: 28, color: 'var(--rose)' }}>{frequentation(l, j)}</div>
            <div className="muted" style={{ fontSize: 13 }}>membres y vont ce soir</div>
          </div>
          <button className={`btn ${j ? 'btn-light' : 'btn-primary'}`} style={{ height: 46, padding: '0 18px' }} aria-pressed={j} onClick={() => { toggleCeSoir(l.id); notify(j ? 'Vous n’y allez plus' : 'Noté ! Seuls vos matchs le voient.') }}>
            {j && <Check size={17} />}{j ? 'J’y vais' : 'J’y vais ce soir'}
          </button>
        </div>

        {membres.length > 0 && (
          <section style={{ marginTop: 22 }}>
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

        {soirees.length > 0 && (
          <section style={{ marginTop: 22 }}>
            <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>Prochaines soirées</h2>
            {soirees.map((s) => (
              <div key={s.id} className="card" style={{ padding: 14, marginTop: 10 }}>
                <div style={{ fontWeight: 700 }}>{s.titre}</div>
                <div className="muted" style={{ fontSize: 13 }}>{s.quand} · {s.heure} · {s.pour}</div>
              </div>
            ))}
          </section>
        )}

        <div className="row" style={{ gap: 10, marginTop: 22 }}>
          <a className="btn btn-ghost" style={{ flex: 1, textDecoration: 'none' }} href={maps} target="_blank" rel="noreferrer noopener"><Navigation size={17} />Itinéraire</a>
          <a className="btn btn-ghost" style={{ flex: 1, textDecoration: 'none' }} href={l.source} target="_blank" rel="noreferrer noopener"><ExternalLink size={17} />Source</a>
        </div>
        {l.verifie !== true && <p className="faint" style={{ fontSize: 12, marginTop: 12 }}>Fiche en cours de vérification. Horaires et conditions d'entrée à confirmer auprès de l'établissement.</p>}
        <button className="faint" style={{ fontSize: 12.5, marginTop: 8, textDecoration: 'underline' }} onClick={() => notify('Merci, nous corrigeons la fiche.')}>Signaler une erreur</button>

      </div>
    </Sheet>
  )
}
