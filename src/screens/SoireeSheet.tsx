import { CalendarPlus, Check, ChevronRight, Clock, MapPin, Navigation, Share2, Users } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { Portrait } from '../components/Portrait'
import { jourSoiree, serie, SOIREES } from '../data/events'
import { lieuById, TYPE_LABEL } from '../data/venues'
import { itineraires } from '../data/descriptions'
import { PROFILS } from '../data/profiles'
import { useApp } from '../store/useApp'

const AUJOURDHUI = new Date().toISOString().slice(0, 10)

/** Petit fichier agenda (.ics) pour ajouter la soirée au calendrier du téléphone. */
function ajouterAuCalendrier(titre: string, date: string, heure: string | undefined, lieu: string) {
  const h = (heure?.match(/(\d{1,2})h(\d{2})?/) ?? [])
  const debut = `${date.replace(/-/g, '')}T${String(h[1] ?? '21').padStart(2, '0')}${h[2] ?? '00'}00`
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//QUTE//FR', 'BEGIN:VEVENT', `UID:${date}-${Math.random().toString(36).slice(2)}@qute.fr`, `DTSTART:${debut}`, `SUMMARY:${titre}`, `LOCATION:${lieu}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  a.download = 'soiree-qute.ics'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

/** Fiche d'une soirée : tout ce qu'il faut savoir, sans quitter l'appli. */
export function SoireeSheet({ id }: { id: string }) {
  const s = SOIREES.find((x) => x.id === id)!
  const { participe, toggleParticipe, notify, open, premium, discret } = useApp()
  const d = jourSoiree(s.date)
  const lieu = s.lieuId ? lieuById(s.lieuId) : undefined
  const j = participe.includes(s.id)
  const autres = serie(s).filter((x) => x.id !== s.id && x.date >= AUJOURDHUI).slice(0, 6)
  const it = lieu ? itineraires(lieu) : null
  const adresse = s.adresse ?? lieu?.adresse
  const nb = (Number(s.id.replace(/\D/g, '')) % 25) + 6 + (j ? 1 : 0)
  const membres = PROFILS.slice(Number(s.id.replace(/\D/g, '')) % 5).slice(0, 4)

  const partager = async () => {
    const texte = `${s.titre} · ${d.long} · ${s.lieu}, ${s.ville}`
    try {
      if (navigator.share) await navigator.share({ title: s.titre, text: texte })
      else { await navigator.clipboard.writeText(texte); notify('Infos copiées') }
    } catch { /* partage annulé */ }
  }

  return (
    <Sheet onClose={() => history.back()} label={s.titre}>
      <div className="scroll" style={{ paddingBottom: 'calc(var(--safe-b) + 24px)' }}>
        <div className="pad">
          <div className="row" style={{ gap: 14, alignItems: 'center', paddingRight: 48 }}>
            <span style={{ width: 62, height: 68, flex: 'none', borderRadius: 18, background: 'var(--velours)', color: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center', boxShadow: '0 10px 30px rgba(179,18,46,.35)' }}>
              <span>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', opacity: 0.85 }}>{d.mois}</span>
                <span className="display" style={{ display: 'block', fontSize: 27, lineHeight: 1 }}>{d.num}</span>
              </span>
            </span>
            <span style={{ minWidth: 0 }}>
              <span className="eyebrow" style={{ display: 'block' }}>{s.date === AUJOURDHUI ? 'Ce soir' : d.long}</span>
              {s.heure && <span className="muted row" style={{ gap: 6, marginTop: 6, fontSize: 14 }}><Clock size={14} />{s.heure}</span>}
            </span>
          </div>

          <h1 className="display" style={{ fontSize: 29, marginTop: 18, lineHeight: 1.1 }}>{s.titre}</h1>
          {s.pour && <p className="tag tag-peut" style={{ marginTop: 12 }}><Users size={13} />{s.pour}</p>}

          <div className="row" style={{ gap: 10, marginTop: 20 }}>
            <button className={`btn ${j ? 'btn-light' : 'btn-primary'}`} style={{ flex: 1 }} aria-pressed={j} onClick={() => { toggleParticipe(s.id); notify(j ? 'Retiré de vos sorties' : 'Noté ! Vos matchs verront que vous y allez.') }}>
              {j && <Check size={17} />}{j ? 'J’y serai' : 'J’y vais'}
            </button>
            <button className="icon-btn" aria-label="Ajouter à mon agenda" onClick={() => { ajouterAuCalendrier(s.titre, s.date, s.heure, `${s.lieu}, ${adresse ?? s.ville}`); notify('Ajouté à votre agenda') }}><CalendarPlus size={19} /></button>
            <button className="icon-btn" aria-label="Partager" onClick={partager}><Share2 size={18} /></button>
          </div>
        </div>

        <section className="pad" style={{ marginTop: 26 }}>
          <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>Le lieu</h2>
          <button className="card row" disabled={!lieu} onClick={() => lieu && open({ kind: 'lieu', id: lieu.id })} style={{ width: '100%', marginTop: 10, padding: 16, gap: 14, textAlign: 'left' }}>
            <span style={{ width: 44, height: 44, borderRadius: 14, flex: 'none', background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}><MapPin size={20} color="var(--rose)" /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 16 }}>{s.lieu}</span>
              <span className="muted" style={{ display: 'block', fontSize: 13, marginTop: 2 }}>{lieu ? `${TYPE_LABEL[lieu.type]} · ` : ''}{adresse ?? s.ville}</span>
            </span>
            {lieu && <ChevronRight size={18} color="var(--faint)" />}
          </button>
          {it && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 8 }}>
              {([['Maps', it.google], ['Waze', it.waze], ['Plans', it.apple]] as const).map(([n, u]) => (
                <a key={n} className="btn btn-ghost" href={u} target="_blank" rel="noopener noreferrer" style={{ height: 44, fontSize: 14, gap: 6, padding: 0 }}><Navigation size={15} />{n}</a>
              ))}
            </div>
          )}
          {lieu?.prix && (
            <p className="muted" style={{ fontSize: 13.5, marginTop: 12 }}>Entrée indicative : couple {lieu.prix.couple} · femme {lieu.prix.femme === 'gratuit' ? 'offerte' : lieu.prix.femme} · homme {/non/.test(lieu.prix.homme) ? 'non admis' : lieu.prix.homme}</p>
          )}
        </section>

        <section className="pad" style={{ marginTop: 26 }}>
          <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>{nb} membres y vont</h2>
          <div className="row" style={{ gap: 10, marginTop: 12, overflowX: 'auto' }}>
            {membres.map((p) => (
              <button key={p.id} onClick={() => open({ kind: 'profil', id: p.id })} style={{ flex: 'none', width: 80, textAlign: 'center' }}>
                <span style={{ position: 'relative', display: 'block', width: 66, height: 66, margin: '0 auto', borderRadius: 33, overflow: 'hidden' }}><Portrait teinte={p.teinte} personnes={p.partenaires.length} flou={!premium || discret} /></span>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 650, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nom}</span>
              </button>
            ))}
          </div>
        </section>

        {autres.length > 0 && (
          <section className="pad" style={{ marginTop: 26 }}>
            <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>Prochaines dates</h2>
            <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {autres.map((x) => (
                <button key={x.id} className="chip" onClick={() => open({ kind: 'soiree', id: x.id })}>{jourSoiree(x.date).long}</button>
              ))}
            </div>
          </section>
        )}

        <p className="faint pad" style={{ fontSize: 12, marginTop: 26, lineHeight: 1.5 }}>
          Programme relevé sur l'agenda officiel du club. Dress code, horaires et tarifs peuvent changer : {' '}
          <a href={s.lien} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rose)', fontWeight: 650 }}>vérifier sur le site du club</a>.
        </p>
      </div>
    </Sheet>
  )
}
