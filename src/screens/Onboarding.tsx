import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { Logo } from '../components/Logo'
import { estInstallee } from '../lib/pwa'
import { Portrait } from '../components/Portrait'
import { PRATIQUES } from '../data/lexique'
import { useApp, type Compte } from '../store/useApp'

const COMPTES: { id: Compte; titre: string; sous: string }[] = [
  { id: 'couple', titre: 'Nous sommes un couple', sous: 'F/H, F/F ou H/H. Un compte partagé, et chaque match se valide à deux.' },
  { id: 'femme', titre: 'Je suis une femme', sous: 'Célibertine, licorne, hotwife…' },
  { id: 'homme', titre: 'Je suis un homme', sous: 'Célibertin, rhino, bull…' },
  { id: 'trans', titre: 'Je suis une personne trans', sous: 'Femme trans, homme trans ou non-binaire.' },
]

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
}

export function Onboarding() {
  const finish = useApp((s) => s.finishOnboarding)
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [compte, setCompte] = useState<Compte | null>(null)
  const [pseudo, setPseudo] = useState('')
  const [envies, setEnvies] = useState<string[]>([])
  const [c, setC] = useState({ majeur: false, donneesSensibles: false, charte: false, cgu: false })

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n) }
  const toggle = (id: string) => setEnvies((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]))
  const tousConsentis = c.majeur && c.donneesSensibles && c.charte && c.cgu

  return (
    <div className="screen" style={{ paddingTop: 'calc(var(--safe-t) + 16px)' }}>
      {step > 0 && (
        <div className="pad row" style={{ justifyContent: 'space-between', height: 52 }}>
          <button className="icon-btn" aria-label="Étape précédente" onClick={() => go(step - 1)}><ArrowLeft size={20} /></button>
          <div className="row" style={{ gap: 6 }} aria-label={`Étape ${step} sur 3`}>
            {[1, 2, 3].map((i) => <span key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 4, background: i <= step ? 'var(--velours-hi)' : 'var(--line-2)', transition: 'width .3s var(--ease)' }} />)}
          </div>
          <span style={{ width: 44 }} />
        </div>
      )}

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {step === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', flex: 1, margin: '0 14px', borderRadius: 'var(--r-xl)', overflow: 'hidden' }}>
                <Portrait teinte={348} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,7,9,0) 35%, rgba(11,7,9,.95) 100%)' }} />
                <div style={{ position: "absolute", top: 24, left: 22 }}><Logo size={14} /></div>
                {!estInstallee() && <a href="/" style={{ position: 'absolute', top: 14, right: 14, height: 40, padding: '0 14px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(11,7,9,.55)', border: '1px solid var(--line-2)', backdropFilter: 'blur(12px)', fontSize: 13, fontWeight: 650, textDecoration: 'none', color: '#f6ede8' }}>← Le site</a>}
                <div style={{ position: 'absolute', left: 24, right: 24, bottom: 26 }}>
                  <p className="eyebrow">Le réseau libertin</p>
                  <h1 className="display" style={{ fontSize: 44, marginTop: 10 }}>Osez.<br />En toute<br />confiance.</h1>
                </div>
              </div>
              <div className="pad" style={{ padding: '22px 20px calc(var(--safe-b) + 24px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p className="muted" style={{ fontSize: 14 }}>Le réseau des libertins qui ont du goût. Rencontres, clubs, saunas et soirées partout en France, entre adultes qui savent ce qu'ils veulent.</p>
                <button className="btn btn-primary btn-block" onClick={() => go(1)}>J'ai 18 ans ou plus, entrer</button>
                <a href="https://www.google.fr" className="btn btn-ghost btn-block" style={{ textDecoration: 'none' }}>J'ai moins de 18 ans</a>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="scroll pad" style={{ paddingTop: 18, paddingBottom: 30 }}>
              <h1 className="h1">Faisons connaissance</h1>
              <p className="muted" style={{ marginTop: 8 }}>En couple, en solo, trans, gay ou lesbienne : chacun a sa place ici.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }} role="radiogroup" aria-label="Type de compte">
                {COMPTES.map((o) => {
                  const on = compte === o.id
                  return (
                    <button key={o.id} role="radio" aria-checked={on} onClick={() => setCompte(o.id)} className="card" style={{ textAlign: 'left', padding: '18px 18px', display: 'flex', gap: 14, alignItems: 'center', borderColor: on ? 'var(--velours-hi)' : undefined, background: on ? 'rgba(179,18,46,.12)' : undefined, transition: 'all .2s' }}>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: 'block', fontWeight: 700, fontSize: 16 }}>{o.titre}</span>
                        <span className="muted" style={{ display: 'block', fontSize: 13.5, marginTop: 3 }}>{o.sous}</span>
                      </span>
                      <span style={{ width: 26, height: 26, borderRadius: 13, border: `1.5px solid ${on ? 'var(--velours-hi)' : 'var(--line-2)'}`, background: on ? 'var(--velours-hi)' : 'transparent', display: 'grid', placeItems: 'center' }}>{on && <Check size={15} color="#fff" />}</span>
                    </button>
                  )
                })}
              </div>
              <button className="btn btn-primary btn-block" style={{ marginTop: 26 }} disabled={!compte} onClick={() => go(2)}>Continuer</button>
            </div>
          )}

          {step === 2 && (
            <div className="scroll pad" style={{ paddingTop: 18, paddingBottom: 30 }}>
              <h1 className="h1">Qu'est-ce qui vous attire ?</h1>
              <p className="muted" style={{ marginTop: 8 }}>Vos envies s'affichent sur votre profil. Ce n'est jamais un engagement : ici, on peut toujours dire non.</p>
              <div className="field" style={{ marginTop: 22 }}>
                <label htmlFor="pseudo">{compte === 'couple' ? 'Votre nom de couple' : 'Votre pseudo'}</label>
                <input id="pseudo" className="input" placeholder={compte === 'couple' ? 'Ex. : Léa & Marc' : 'Ex. : Sofia'} value={pseudo} onChange={(e) => setPseudo(e.target.value)} autoComplete="off" maxLength={30} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 22 }}>
                {PRATIQUES.map((p) => (
                  <button key={p.id} className="chip" aria-pressed={envies.includes(p.id)} onClick={() => toggle(p.id)}>{p.mot}</button>
                ))}
              </div>
              <button className="btn btn-primary btn-block" style={{ marginTop: 26 }} disabled={pseudo.trim().length < 2} onClick={() => go(3)}>Continuer</button>
            </div>
          )}

          {step === 3 && (
            <div className="scroll pad" style={{ paddingTop: 18, paddingBottom: 30 }}>
              <h1 className="h1">Votre accord</h1>
              <p className="muted" style={{ marginTop: 8 }}>Vos envies révèlent votre vie intime. La loi (RGPD) nous impose votre accord explicite, et nous y tenons aussi.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
                <label className="check"><input type="checkbox" checked={c.majeur} onChange={(e) => setC({ ...c, majeur: e.target.checked })} /><span><strong>Je certifie avoir 18 ans ou plus</strong>{compte === 'couple' ? ', ainsi que mon ou ma partenaire.' : '.'} Une vérification d'âge sera demandée avant d'accéder aux photos.</span></label>
                <label className="check"><input type="checkbox" checked={c.donneesSensibles} onChange={(e) => setC({ ...c, donneesSensibles: e.target.checked })} /><span><strong>J'accepte que QUTE traite mes données sur ma vie sexuelle</strong> (envies, orientation) pour me proposer des rencontres. Elles ne sont jamais vendues ni utilisées pour de la publicité. Je peux retirer mon accord à tout moment.</span></label>
                <label className="check"><input type="checkbox" checked={c.charte} onChange={(e) => setC({ ...c, charte: e.target.checked })} /><span><strong>Je m'engage à respecter la charte du consentement</strong> : non, c'est non ; pas de photo intime sans accord ; pas de capture ni de partage hors de l'appli.</span></label>
                <label className="check"><input type="checkbox" checked={c.cgu} onChange={(e) => setC({ ...c, cgu: e.target.checked })} /><span><strong>J'accepte les conditions d'utilisation</strong> et la politique de confidentialité.</span></label>
              </div>
              <button className="btn btn-primary btn-block" style={{ marginTop: 26 }} disabled={!tousConsentis} onClick={() => compte && finish({ compte, pseudo: pseudo.trim(), envies, consentements: c })}>Entrer dans QUTE</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
