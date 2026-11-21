import { motion } from 'motion/react'
import { useState } from 'react'
import { BookOpen, ChevronRight, Crown, Download, Globe, EyeOff, FileText, HeartHandshake, LogOut, Moon, ShieldCheck, Sun, SunMoon, Trash2 } from 'lucide-react'
import { Logo } from '../components/Logo'
import { Portrait } from '../components/Portrait'
import { termeById } from '../data/lexique'
import { completion } from './MonProfil'
import { estInstallee } from '../lib/pwa'
import { useApp } from '../store/useApp'

const LIBELLE = { couple: 'Couple', femme: 'Femme', homme: 'Homme', trans: 'Trans' } as const

export function Moi() {
  const s = useApp()
  const exporter = () => {
    const { pseudo, compte, envies, consentements, likes, passes, tartes, ceSoir, bloques, validations } = useApp.getState()
    const blob = new Blob([JSON.stringify({ pseudo, compte, envies, consentements, likes, passes, tartes, ceSoir, bloques, validations, exportéLe: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'mes-donnees-qute.json'
    a.click()
    URL.revokeObjectURL(a.href)
    s.notify('Vos données ont été exportées')
  }
  const [confirmer, setConfirmer] = useState(false)
  const supprimer = () => {
    if (!confirmer) { setConfirmer(true); s.notify('Touchez à nouveau pour supprimer définitivement'); return }
    s.reset()
  }

  return (
    <div className="screen" style={{ paddingTop: 'calc(var(--safe-t) + 16px)' }}>
      <div className="scroll" style={{ paddingBottom: 'calc(var(--safe-b) + 110px)' }}>
        <header className="pad row" style={{ justifyContent: 'space-between' }}>
          <Logo size={13} />
          {s.premium && <span className="tag" style={{ background: 'var(--velours)', color: '#fff' }}><Crown size={13} />Privé</span>}
        </header>

        <div className="pad row" style={{ marginTop: 22, gap: 16 }}>
          <span style={{ position: 'relative', width: 84, height: 84, borderRadius: 42, overflow: 'hidden', flex: 'none' }}><Portrait teinte={350} personnes={s.compte === 'couple' ? 2 : 1} /></span>
          <div>
            <h1 className="h1" style={{ fontSize: 26 }}>{s.pseudo || 'Mon profil'}</h1>
            <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>{s.compte ? LIBELLE[s.compte] : ''} · profil vérifié bientôt</p>
          </div>
        </div>

        {Object.keys(s.profil.envies).length > 0 && (
          <div className="pad" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
            {Object.entries(s.profil.envies).map(([e, a]) => <span key={e} className={`tag ${a === 'oui' ? 'tag-oui' : a === 'peut' ? 'tag-peut' : 'tag-non'}`}>{a === 'non' ? 'Non · ' : a === 'peut' ? 'Peut-être · ' : ''}{termeById(e)?.mot}</span>)}
          </div>
        )}

        <button className="card" onClick={() => s.open({ kind: 'monprofil' })} style={{ display: 'block', width: 'calc(100% - 28px)', margin: '18px 14px 0', padding: 18, textAlign: 'left' }}>
          <span className="row" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{completion(s.profil) < 100 ? 'Complétez votre profil' : 'Modifier mon profil'}</span>
            <span className="display" style={{ fontSize: 20, color: 'var(--velours-hi)' }}>{completion(s.profil)} %</span>
          </span>
          <span style={{ display: 'block', height: 6, borderRadius: 3, background: 'var(--line)', marginTop: 12, overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${completion(s.profil)}%`, background: 'var(--velours-hi)', borderRadius: 3 }} /></span>
          <span className="muted" style={{ display: 'block', fontSize: 13, marginTop: 10 }}>{completion(s.profil) < 100 ? 'Envies, règles, disponibilités, ce que vous cherchez : un profil complet inspire confiance et reçoit plus de réponses.' : 'Votre profil est complet. Gardez-le à jour, vos envies évoluent aussi.'}</span>
        </button>

        {!s.premium && (
          <button onClick={() => s.open({ kind: 'premium' })} className="card" style={{ display: 'block', width: 'calc(100% - 28px)', margin: '22px 14px 0', padding: 20, textAlign: 'left', background: 'linear-gradient(150deg, #5a0b1a 0%, #2a0b12 60%, #160a0d 100%)', borderColor: 'rgba(217,41,74,.4)', color: '#f6ede8' }}>
            <span className="row" style={{ gap: 8, fontWeight: 700 }}><Crown size={18} />QUTE Privé</span>
            <span className="display" style={{ display: 'block', fontSize: 24, marginTop: 10 }}>Voyez tout. Osez tout.</span>
            <span style={{ display: 'block', fontSize: 13.5, marginTop: 6, opacity: 0.8 }}>Profils en clair, messages, albums privés, qui sort ce soir.</span>
          </button>
        )}

        <Section titre="Discrétion">
          <Toggle Icon={EyeOff} label="Mode discret" sous="Floute toutes les photos dans l'appli" on={s.discret} set={s.setDiscret} />
          <Toggle Icon={ShieldCheck} label="Flouter les photos sensibles" sous="Vous choisissez quand les afficher" on={s.floutage} set={s.setFloutage} />
        </Section>

        <Section titre="Apparence">
          <div role="radiogroup" aria-label="Thème" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 6 }}>
            {([['nuit', 'Sombre', Moon], ['ivoire', 'Clair', Sun], ['auto', 'Auto', SunMoon]] as const).map(([id, label, Icon]) => (
              <button key={id} role="radio" aria-checked={s.theme === id} onClick={() => s.setTheme(id)} style={{ position: 'relative', height: 64, borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 13, fontWeight: 650, color: s.theme === id ? 'var(--text)' : 'var(--muted)' }}>
                {s.theme === id && <motion.span layoutId="theme-pill" style={{ position: 'absolute', inset: 0, borderRadius: 14, background: 'var(--surface-2)', zIndex: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                <Icon size={19} style={{ position: 'relative' }} /><span style={{ position: 'relative' }}>{label}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section titre="QUTE">
          <Lien Icon={Globe} label="Le site QUTE" onClick={() => (location.href = '/')} />
          <Lien Icon={Crown} label="Tarifs et abonnement" onClick={() => s.open({ kind: 'premium' })} />
          {!estInstallee() && <Lien Icon={Download} label="Installer l'appli sur mon téléphone" onClick={() => (location.href = '/')} />}
        </Section>

        <Section titre="Communauté">
          <Lien Icon={BookOpen} label="Le lexique libertin" onClick={() => s.open({ kind: 'lexique' })} />
          <Lien Icon={HeartHandshake} label="Charte du consentement" onClick={() => s.open({ kind: 'charte' })} />
        </Section>

        <Section titre="Mon compte">
          <Lien Icon={FileText} label="Confidentialité et consentements" onClick={() => s.open({ kind: 'confidentialite' })} />
          <Lien Icon={Download} label="Exporter mes données" onClick={exporter} />
          <Lien Icon={LogOut} label="Se déconnecter" onClick={() => { useApp.setState({ onboarded: false, overlays: [], tab: 'decouvrir' }); s.notify('Vous êtes déconnecté·e. À très vite.') }} />
          <Lien Icon={Trash2} label={confirmer ? 'Confirmer la suppression définitive' : 'Supprimer mon compte'} onClick={supprimer} danger />
        </Section>

        <p className="faint pad" style={{ fontSize: 12, marginTop: 22, textAlign: 'center' }}>Version de démonstration. Profils et soirées fictifs, aucun paiement réel.</p>
        <p className="faint pad" style={{ fontSize: 12, marginTop: 6, textAlign: 'center' }}>Appli créée par <a href="https://404agency.fr" target="_blank" rel="noopener" style={{ color: 'var(--text)', fontWeight: 650 }}>404 Agency</a></p>
      </div>
    </div>
  )
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 26 }}>
      <h2 className="eyebrow pad" style={{ color: 'var(--muted)' }}>{titre}</h2>
      <div className="card" style={{ margin: '10px 14px 0', overflow: 'hidden' }}>{children}</div>
    </section>
  )
}

function Toggle({ Icon, label, sous, on, set }: { Icon: typeof EyeOff; label: string; sous: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => set(!on)} className="row" style={{ width: '100%', padding: '14px 16px', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
      <Icon size={20} color="var(--muted)" />
      <span style={{ flex: 1 }}><span style={{ display: 'block', fontWeight: 650 }}>{label}</span><span className="muted" style={{ fontSize: 12.5 }}>{sous}</span></span>
      <span className="switch" aria-checked={on} aria-hidden="true" />
    </button>
  )
}

function Lien({ Icon, label, onClick, danger }: { Icon: typeof EyeOff; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className="row" style={{ width: '100%', padding: '15px 16px', textAlign: 'left', borderBottom: '1px solid var(--line)', color: danger ? 'var(--velours-hi)' : undefined }}>
      <Icon size={20} color={danger ? 'var(--velours-hi)' : 'var(--muted)'} />
      <span style={{ flex: 1, fontWeight: 650 }}>{label}</span>
      <ChevronRight size={18} color="var(--faint)" />
    </button>
  )
}
