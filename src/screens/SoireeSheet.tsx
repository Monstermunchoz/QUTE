import { useState } from 'react'
import { Check, ExternalLink, MapPin, Users } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { jourSoiree, SOIREES } from '../data/events'
import { lieuById } from '../data/venues'
import { useApp } from '../store/useApp'

/**
 * Fiche d'une soirée, avec l'agenda officiel du club affiché dans l'appli.
 * Certains sites refusent d'être affichés dans une autre page : un bouton
 * permet alors de l'ouvrir dans un onglet, sans quitter QUTE.
 */
export function SoireeSheet({ id }: { id: string }) {
  const s = SOIREES.find((x) => x.id === id)!
  const { participe, toggleParticipe, notify, open } = useApp()
  const [charge, setCharge] = useState(false)
  const d = jourSoiree(s.date)
  const lieu = s.lieuId ? lieuById(s.lieuId) : undefined
  const j = participe.includes(s.id)
  const domaine = new URL(s.lien).hostname.replace(/^www\./, '')

  return (
    <Sheet onClose={() => history.back()} label={s.titre}>
      <div className="scroll" style={{ paddingBottom: 'calc(var(--safe-b) + 20px)' }}>
        <div className="pad">
          <p className="eyebrow">{d.long}{s.heure ? ` · ${s.heure}` : ''}</p>
          <h1 className="display" style={{ fontSize: 30, marginTop: 8 }}>{s.titre}</h1>
          <p className="muted row" style={{ gap: 6, marginTop: 10, fontSize: 14.5 }}><MapPin size={15} />{s.lieu} · {s.ville}</p>
          {s.pour && <p className="row" style={{ gap: 6, marginTop: 6, fontSize: 14, fontWeight: 600 }}><Users size={15} color="var(--rose)" />{s.pour}</p>}

          <div className="row" style={{ gap: 10, marginTop: 18 }}>
            <button className={`btn ${j ? 'btn-light' : 'btn-primary'}`} style={{ flex: 1 }} aria-pressed={j} onClick={() => { toggleParticipe(s.id); notify(j ? 'Retiré de vos sorties' : 'Ajouté à vos sorties. Vos matchs le verront.') }}>
              {j && <Check size={17} />}{j ? 'J’y serai' : 'J’y vais'}
            </button>
            {lieu && <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => open({ kind: 'lieu', id: lieu.id })}>Voir le lieu</button>}
          </div>
        </div>

        <section style={{ marginTop: 22 }}>
          <div className="pad row" style={{ justifyContent: 'space-between' }}>
            <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>Agenda officiel · {domaine}</h2>
            <a href={s.lien} target="_blank" rel="noopener noreferrer" className="row" style={{ gap: 6, fontSize: 13, fontWeight: 650, color: 'var(--rose)', textDecoration: 'none' }}><ExternalLink size={14} />Onglet</a>
          </div>
          <div style={{ position: 'relative', margin: '10px 14px 0', height: '58vh', borderRadius: 'var(--r-l)', overflow: 'hidden', border: '1px solid var(--line-2)', background: '#fff' }}>
            {!charge && (
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'var(--surface)', color: 'var(--muted)', fontSize: 14, textAlign: 'center', padding: 30 }}>
                Chargement de l'agenda du club…
              </div>
            )}
            <iframe title={`Agenda officiel de ${s.lieu}`} src={s.lien} onLoad={() => setCharge(true)} referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups" style={{ width: '100%', height: '100%', border: 0, display: 'block' }} />
          </div>
          <p className="faint pad" style={{ fontSize: 12, marginTop: 10 }}>Page vide ? Le site du club ne s'affiche pas ici : touchez « Onglet » pour l'ouvrir à côté, QUTE reste ouvert.</p>
        </section>
      </div>
    </Sheet>
  )
}
