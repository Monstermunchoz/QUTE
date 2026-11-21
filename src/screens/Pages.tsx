import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { ArrowLeft, Check, Search, X } from 'lucide-react'
import { Page } from '../components/Sheet'
import { Logo } from '../components/Logo'
import { Fraise } from '../components/icons'
import { LEXIQUE, type Terme } from '../data/lexique'
import { useApp } from '../store/useApp'

function Entete({ titre, sur }: { titre: string; sur?: string }) {
  return (
    <header className="pad" style={{ paddingTop: 'calc(var(--safe-t) + 14px)' }}>
      <button className="icon-btn" aria-label="Retour" onClick={() => history.back()}><ArrowLeft size={20} /></button>
      {sur && <p className="eyebrow" style={{ marginTop: 18 }}>{sur}</p>}
      <h1 className="h1" style={{ marginTop: sur ? 6 : 18 }}>{titre}</h1>
    </header>
  )
}

/* ——— Abonnement ——— */
const FORMULES = [
  { id: '1m', duree: '1 mois', prix: '[PRIX]', detail: 'Sans engagement' },
  { id: '3m', duree: '3 mois', prix: '[PRIX]', detail: 'Facturé [TOTAL] tous les 3 mois', populaire: true },
  { id: '12m', duree: '12 mois', prix: '[PRIX]', detail: 'Facturé [TOTAL] par an' },
]

export function Premium() {
  const { setPremium, notify } = useApp()
  const [f, setF] = useState('3m')
  return (
    <Page label="QUTE Privé">
      <div className="scroll" style={{ paddingBottom: 30 }}>
        <div style={{ position: 'relative', padding: 'calc(var(--safe-t) + 14px) 20px 28px', background: 'radial-gradient(120% 90% at 80% 0%, #6d0d20 0%, #2a0b12 45%, var(--bg) 100%)', color: '#f6ede8' }}>
          <button className="icon-btn" aria-label="Fermer" onClick={() => history.back()}><X size={20} /></button>
          <div style={{ marginTop: 26 }}><Logo size={13} color="#f6ede8" /></div>
          <h1 className="display" style={{ fontSize: 40, marginTop: 14 }}>Voyez tout.<br />Osez tout.</h1>
          <p style={{ marginTop: 12, opacity: 0.8, fontSize: 15 }}>L'accès complet au réseau libertin, en toute discrétion.</p>
        </div>
        <ul className="pad" style={{ listStyle: 'none', margin: '8px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {['Profils et photos en clair', 'Messages illimités et albums privés', 'Qui sera au club ce soir', 'Tartes aux fraises illimitées', 'Compte couple partagé, validation à deux', 'Mode fantôme : n’apparaissez qu’à vos matchs'].map((t) => (
            <li key={t} className="row" style={{ gap: 12, fontWeight: 550 }}><span style={{ width: 24, height: 24, borderRadius: 12, background: 'rgba(196,30,58,.18)', display: 'grid', placeItems: 'center', flex: 'none' }}><Check size={14} color="var(--velours-hi)" /></span>{t}</li>
          ))}
        </ul>
        <div role="radiogroup" aria-label="Formule" className="pad" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}>
          {FORMULES.map((x) => {
            const on = f === x.id
            return (
              <button key={x.id} role="radio" aria-checked={on} onClick={() => setF(x.id)} className="card row" style={{ position: 'relative', padding: '16px 18px', textAlign: 'left', borderColor: on ? 'var(--velours-hi)' : undefined, borderWidth: on ? 1.5 : 1, background: on ? 'rgba(196,30,58,.1)' : undefined, transition: 'all .2s' }}>
                <span style={{ flex: 1 }}><span style={{ display: 'block', fontWeight: 700, fontSize: 16 }}>{x.duree}</span><span className="muted" style={{ fontSize: 13 }}>{x.detail}</span></span>
                <span style={{ fontWeight: 700 }}>{x.prix}<span className="muted" style={{ fontWeight: 500, fontSize: 12 }}> /mois</span></span>
                {x.populaire && <span style={{ position: 'absolute', top: -11, right: 16, height: 22, padding: '0 10px', borderRadius: 11, background: 'var(--velours)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center' }}>Le plus choisi</span>}
              </button>
            )
          })}
        </div>
        <div className="pad" style={{ marginTop: 22 }}>
          <button className="btn btn-primary btn-block" onClick={() => { setPremium(true); notify('Bienvenue chez les membres Privé'); history.back() }}>Continuer</button>
          <p className="faint" style={{ fontSize: 12, textAlign: 'center', marginTop: 12 }}>Démo : aucun paiement n'est effectué. En production, libellé neutre sur le relevé, résiliable à tout moment.</p>
        </div>
      </div>
    </Page>
  )
}

/* ——— Lexique ——— */
const FAMILLES: (Terme['famille'] | 'Tout')[] = ['Tout', 'Pratiques', 'Profils', 'Codes & culture', 'Consentement']

export function Lexique() {
  const [fam, setFam] = useState<(typeof FAMILLES)[number]>('Tout')
  const [q, setQ] = useState('')
  const liste = useMemo(() => {
    const s = q.trim().toLowerCase()
    return LEXIQUE.filter((t) => (fam === 'Tout' || t.famille === fam) && (!s || `${t.mot} ${t.definition}`.toLowerCase().includes(s)))
  }, [fam, q])
  return (
    <Page label="Le lexique libertin">
      <Entete titre="Le lexique" sur="Dictionnaire communautaire" />
      <div className="pad" style={{ marginTop: 14 }}>
        <label className="row" style={{ height: 50, padding: '0 16px', borderRadius: 25, background: 'var(--surface)', border: '1px solid var(--line-2)', gap: 10 }}>
          <Search size={18} color="var(--muted)" />
          <span className="sr">Rechercher un mot</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Candaulisme, licorne, soft…" style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 'none' }} />
        </label>
      </div>
      <div className="chips" role="tablist" style={{ marginTop: 12 }}>
        {FAMILLES.map((f) => <button key={f} role="tab" aria-selected={fam === f} className="chip" aria-pressed={fam === f} onClick={() => setFam(f)}>{f}</button>)}
      </div>
      <ul className="scroll pad" style={{ listStyle: 'none', margin: '14px 0 0', paddingBottom: 30, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {liste.map((t) => (
          <motion.li key={t.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '16px 18px' }}>
            <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
              <h2 style={{ fontWeight: 700, fontSize: 17 }} className="row">{t.id === 'tarte' && <Fraise width={20} height={20} style={{ color: '#ff5d6c', marginRight: 6 }} />}{t.mot}</h2>
              <span className="faint" style={{ fontSize: 11.5, fontWeight: 600 }}>{t.famille}</span>
            </div>
            <p className="muted" style={{ marginTop: 6, fontSize: 14.5, lineHeight: 1.5 }}>{t.definition}</p>
          </motion.li>
        ))}
      </ul>
    </Page>
  )
}

/* ——— Charte ——— */
const REGLES = [
  ['Non, c’est non', 'Un refus n’a pas à être justifié. Dans l’appli comme en club, on n’insiste jamais.'],
  ['Le consentement se donne à chaque fois', 'Dire oui à un verre n’est pas dire oui à la suite. Chaque étape se demande et peut s’arrêter à tout moment.'],
  ['À deux, c’est à deux', 'Dans un couple, chaque partenaire valide. Un oui de l’un ne vaut pas pour l’autre.'],
  ['Pas de photo intime sans accord', 'On demande avant d’envoyer. Les photos reçues restent floutées tant que vous ne choisissez pas de les voir.'],
  ['Rien ne sort de QUTE', 'Capture, enregistrement ou partage d’une photo ou d’une conversation : exclusion immédiate, et c’est puni par la loi.'],
  ['Discrétion absolue', 'Ce qui se vit entre libertins reste entre libertins. On ne révèle jamais l’identité de quelqu’un, même croisé dans la vraie vie.'],
  ['Respect de tous les profils', 'Couples, célibertins, trans, gays, lesbiennes, débutants : aucun mépris, aucune fétichisation.'],
  ['Majeurs uniquement', 'QUTE est strictement réservé aux personnes de 18 ans et plus. Tout doute est signalé et vérifié.'],
]

export function Charte() {
  return (
    <Page label="Charte du consentement">
      <Entete titre="Charte du consentement" sur="Nos règles" />
      <ol className="scroll pad" style={{ listStyle: 'none', margin: '18px 0 0', paddingBottom: 30, display: 'flex', flexDirection: 'column', gap: 10, counterReset: 'r' }}>
        {REGLES.map(([t, d], i) => (
          <li key={t} className="card row" style={{ padding: '16px 18px', alignItems: 'flex-start', gap: 14 }}>
            <span className="display" style={{ fontSize: 22, color: 'var(--velours-hi)', width: 26, flex: 'none' }}>{i + 1}</span>
            <span><span style={{ display: 'block', fontWeight: 700, fontSize: 16 }}>{t}</span><span className="muted" style={{ display: 'block', marginTop: 4, fontSize: 14, lineHeight: 1.5 }}>{d}</span></span>
          </li>
        ))}
      </ol>
    </Page>
  )
}

/* ——— Confidentialité ——— */
export function Confidentialite() {
  const { consentements, notify } = useApp()
  const items = [
    ['Majeur·e (18 ans et plus)', consentements.majeur],
    ['Traitement des données sur la vie sexuelle', consentements.donneesSensibles],
    ['Charte du consentement', consentements.charte],
    ['Conditions d’utilisation', consentements.cgu],
  ] as const
  return (
    <Page label="Confidentialité">
      <Entete titre="Vos données, vos règles" sur="Confidentialité" />
      <div className="scroll pad" style={{ paddingBottom: 30, marginTop: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {items.map(([l, v]) => (
            <div key={l} className="row" style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 650, color: v ? 'var(--ok)' : 'var(--faint)' }}>{v ? 'Accordé' : 'Non accordé'}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-block" onClick={() => notify('Accord retiré : vos envies sont masquées')}>Retirer mon accord sur les données sensibles</button>
        {[
          ['Ce que nous gardons', 'Votre profil, vos envies, vos messages et vos photos, uniquement pour faire fonctionner QUTE. Rien n’est vendu, rien ne sert à la publicité.'],
          ['Ce que nous ne faisons jamais', 'Partager vos données avec un tiers à des fins commerciales, vous localiser au mètre près, ou montrer votre profil à vos contacts téléphoniques.'],
          ['Vos droits (RGPD)', 'Accès, rectification, export et suppression à tout moment depuis l’onglet Moi. Un compte supprimé est effacé, photos et messages compris.'],
          ['Sécurité', 'Connexions chiffrées, photos privées sur demande uniquement, captures d’écran signalées, modération humaine des signalements.'],
        ].map(([t, d]) => (
          <section key={t}><h2 style={{ fontWeight: 700, fontSize: 16 }}>{t}</h2><p className="muted" style={{ marginTop: 6, fontSize: 14, lineHeight: 1.55 }}>{d}</p></section>
        ))}
      </div>
    </Page>
  )
}

/* ——— Écran « quitter vite » ——— */
export function Panique() {
  const setPanique = useApp((s) => s.setPanique)
  const [n, setN] = useState(0)
  return (
    <div className="screen" style={{ background: '#fbfaf8', color: '#222', zIndex: 100, padding: 'calc(var(--safe-t) + 30px) 24px' }} onClick={() => (n >= 2 ? setPanique(false) : setN(n + 1))}>
      <h1 style={{ fontSize: 30, fontWeight: 700, fontFamily: 'system-ui' }}>Liste de courses</h1>
      <ul style={{ marginTop: 20, lineHeight: 2.1, fontFamily: 'system-ui', fontSize: 17, paddingLeft: 20 }}>
        <li>Pain</li><li>Tomates</li><li>Lait</li><li>Café</li><li>Fraises</li>
      </ul>
      <p style={{ position: 'absolute', bottom: 'calc(var(--safe-b) + 20px)', left: 0, right: 0, textAlign: 'center', fontSize: 11, color: '#bbb' }}>Touchez trois fois pour revenir</p>
    </div>
  )
}
