import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { PROFILS } from '../data/profiles'
import { useApp } from '../store/useApp'

const MOTIFS = [
  ['faux', 'Faux profil ou photos volées', 'Usurpation, photos trouvées sur Internet'],
  ['consentement', 'Non-respect du consentement', 'Insistance après un non, limites ignorées'],
  ['harcelement', 'Harcèlement ou propos déplacés', 'Insultes, messages répétés, menaces'],
  ['photos', 'Photos intimes non sollicitées', 'Envoyées sans votre accord'],
  ['argent', 'Arnaque ou prestation payante', 'Demande d’argent, escort, lien suspect'],
  ['mineur', 'Personne possiblement mineure', 'Traité en priorité absolue'],
  ['autre', 'Autre chose', 'Expliquez-nous en quelques mots'],
] as const

/** Signaler un membre : motif, précisions, blocage. Le membre n'est jamais prévenu. */
export function SignalerSheet({ id }: { id: string }) {
  const p = PROFILS.find((x) => x.id === id)!
  const { bloquer, notify } = useApp()
  const [motif, setMotif] = useState<string | null>(null)
  const [texte, setTexte] = useState('')
  const [bloc, setBloc] = useState(true)
  const [envoye, setEnvoye] = useState(false)

  const fermer = () => {
    if (envoye && bloc) { bloquer(p.id); notify(`${p.nom} est bloqué·e et ne vous verra plus`) }
    else history.back()
  }

  return (
    <Sheet onClose={fermer} label={`Signaler ${p.nom}`}>
      <div className="scroll pad" style={{ paddingBottom: 'calc(var(--safe-b) + 24px)' }}>
        {!envoye ? (
          <form onSubmit={(e) => { e.preventDefault(); if (motif) setEnvoye(true) }}>
            <p className="eyebrow">Signaler un membre</p>
            <h1 className="h2" style={{ marginTop: 8, paddingRight: 48 }}>Que s’est-il passé avec {p.nom} ?</h1>
            <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>Votre signalement est anonyme : {p.nom} ne saura pas qu’il vient de vous.</p>
            <div role="radiogroup" aria-label="Motif" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              {MOTIFS.map(([k, t, d]) => (
                <button key={k} type="button" role="radio" aria-checked={motif === k} onClick={() => setMotif(k)} className="card row"
                  style={{ padding: '13px 14px', gap: 12, textAlign: 'left', borderColor: motif === k ? 'var(--velours-hi)' : undefined, background: motif === k ? 'rgba(179,18,46,.14)' : undefined }}>
                  <span style={{ width: 20, height: 20, flex: 'none', borderRadius: 10, border: `2px solid ${motif === k ? 'var(--velours-hi)' : 'var(--line-2)'}`, display: 'grid', placeItems: 'center' }}>
                    {motif === k && <span style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--velours-hi)' }} />}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 650, fontSize: 15 }}>{t}</span>
                    <span className="muted" style={{ display: 'block', fontSize: 12.5, marginTop: 2 }}>{d}</span>
                  </span>
                </button>
              ))}
            </div>
            <label className="sr" htmlFor="sig-texte">Précisions</label>
            <textarea id="sig-texte" className="input" value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Précisions (facultatif)" rows={3} style={{ marginTop: 14, height: 'auto', padding: 14, resize: 'none' }} />
            <div className="row" style={{ marginTop: 14, gap: 12, justifyContent: 'space-between' }}>
              <span id="sig-bloc" style={{ fontWeight: 600, fontSize: 15 }}>Bloquer {p.nom} aussi</span>
              <button type="button" className="switch" role="switch" aria-checked={bloc} aria-labelledby="sig-bloc" onClick={() => setBloc(!bloc)} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={!motif} style={{ marginTop: 20 }}>Envoyer le signalement</button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 4px 8px' }}>
            <span style={{ width: 64, height: 64, borderRadius: 32, margin: '0 auto', display: 'grid', placeItems: 'center', background: 'rgba(111,211,160,.14)' }}><ShieldCheck size={30} color="var(--ok)" /></span>
            <h1 className="h2" style={{ marginTop: 16 }}>Merci, c’est transmis</h1>
            <p className="muted" style={{ marginTop: 8, fontSize: 14.5, lineHeight: 1.5 }}>Notre équipe de modération examine chaque signalement sous 24 h, en priorité absolue s’il s’agit d’un mineur ou d’un non-respect du consentement.{bloc ? ` ${p.nom} ne pourra plus vous voir ni vous écrire.` : ''}</p>
            <button className="btn btn-light btn-block" style={{ marginTop: 22 }} onClick={fermer}>Fermer</button>
          </div>
        )}
      </div>
    </Sheet>
  )
}
