import { AnimatePresence, animate, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react'
import { memo, useMemo, useState } from 'react'
import { BookOpen, EyeOff, Heart, LogOut, RotateCcw, X } from 'lucide-react'
import { Logo } from '../components/Logo'
import { Portrait } from '../components/Portrait'
import { Certif, Fraise } from '../components/icons'
import { FILTRES, PROFILS, presence, TYPE_PROFIL_LABEL, type Filtre, type Profil } from '../data/profiles'
import { compatibilite, RECHERCHE_TYPES } from '../lib/compat'
import { termeById } from '../data/lexique'
import { lieuById } from '../data/venues'
import { distanceKm } from '../lib/geo'
import { useApp } from '../store/useApp'

export const MOI = { lat: 45.76, lng: 4.835 } // position de démo : Lyon

type Dir = 'gauche' | 'droite' | 'haut'

const ages = (p: Profil) => p.partenaires.map((x) => `${x.role} ${x.age}`).join(' · ')

const SwipeCard = memo(function SwipeCard({ p, top, onDecide, flou }: { p: Profil; top: boolean; onDecide: (d: Dir) => void; flou: boolean }) {
  const open = useApp((s) => s.open)
  const monProfil = useApp((s) => s.profil)
  const pr = presence(p.vu)
  const compat = compatibilite(monProfil, p)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-14, 14])
  const likeO = useTransform(x, [30, 130], [0, 1])
  const nopeO = useTransform(x, [-130, -30], [1, 0])
  const tarteO = useTransform(y, [-130, -40], [1, 0])

  const onDragEnd = (_: unknown, i: PanInfo) => {
    if (i.offset.y < -120 || i.velocity.y < -700) return onDecide('haut')
    if (i.offset.x > 120 || i.velocity.x > 650) return onDecide('droite')
    if (i.offset.x < -120 || i.velocity.x < -650) return onDecide('gauche')
    animate(x, 0, { type: 'spring', stiffness: 500, damping: 32 })
    animate(y, 0, { type: 'spring', stiffness: 500, damping: 32 })
  }

  const km = Math.max(1, Math.round(distanceKm(MOI, p)))
  const lieu = p.ceSoir ? lieuById(p.ceSoir) : undefined

  return (
    <motion.article
      aria-label={p.nom}
      className="on-dark"
      style={{ x, y, rotate, position: 'absolute', inset: 0, borderRadius: 'var(--r-xl)', overflow: 'hidden', background: 'var(--surface)', boxShadow: top ? '0 24px 60px rgba(0,0,0,.5)' : 'none', touchAction: 'none', cursor: top ? 'grab' : 'default', willChange: 'transform' }}
      initial={{ scale: 0.94, y: 14, opacity: 0.6 }}
      animate={{ scale: top ? 1 : 0.94, y: top ? 0 : 14, opacity: 1 }}
      exit={'sortie'}
      variants={{
        sortie: (d: Dir) => ({
          x: d === 'droite' ? 520 : d === 'gauche' ? -520 : 0,
          y: d === 'haut' ? -760 : 40,
          rotate: d === 'droite' ? 18 : d === 'gauche' ? -18 : 0,
          transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
        }),
      }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      drag={top}
      dragElastic={0.9}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={onDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <Portrait teinte={p.teinte} personnes={p.partenaires.length} flou={flou} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,7,9,.35) 0%, rgba(11,7,9,0) 22%, rgba(11,7,9,0) 42%, rgba(11,7,9,.96) 100%)' }} />

      <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', gap: 4 }} aria-hidden="true">
        {Array.from({ length: Math.min(p.photos, 5) }).map((_, i) => <span key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i === 0 ? 'var(--text)' : 'rgba(246,237,232,.28)' }} />)}
      </div>
      <div style={{ position: 'absolute', top: 30, left: 14, display: 'flex', gap: 6 }}>
        <span className="tag" style={{ background: 'rgba(11,7,9,.6)', backdropFilter: 'blur(10px)' }}><span style={{ width: 7, height: 7, borderRadius: 4, background: pr.enLigne ? 'var(--ok)' : 'var(--faint)' }} />{pr.texte}</span>
        {compat !== null && <span className="tag" style={{ background: 'rgba(196,30,58,.75)', color: '#fff' }}>{compat} %</span>}
        {flou && <span className="tag" style={{ background: 'rgba(11,7,9,.6)', backdropFilter: 'blur(10px)' }}><EyeOff size={13} />Photos floutées</span>}
      </div>

      {/* Tampons de geste */}
      <motion.span style={{ opacity: likeO, position: 'absolute', top: 70, left: 22, rotate: -12, padding: '6px 14px', border: '2.5px solid var(--ok)', color: 'var(--ok)', borderRadius: 12, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 26 }}>ENVIE</motion.span>
      <motion.span style={{ opacity: nopeO, position: 'absolute', top: 70, right: 22, rotate: 12, padding: '6px 14px', border: '2.5px solid var(--rose)', color: 'var(--rose)', borderRadius: 12, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 26 }}>NON MERCI</motion.span>
      <motion.span style={{ opacity: tarteO, position: 'absolute', top: '36%', left: 0, right: 0, margin: '0 auto', width: 'max-content', padding: '8px 16px', borderRadius: 999, background: 'var(--velours)', color: '#fff', fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}><Fraise width={22} height={22} style={{ color: '#ff5d6c' }} />Tarte aux fraises</motion.span>

      <button onClick={() => top && open({ kind: 'profil', id: p.id })} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 20px 22px', textAlign: 'left' }} aria-label={`Voir le profil de ${p.nom}`}>
        <span className="eyebrow" style={{ display: 'block' }}>{p.etiquette ?? TYPE_PROFIL_LABEL[p.type]}</span>
        <span className="row" style={{ gap: 8, marginTop: 8 }}>
          <span className="display" style={{ fontSize: 34 }}>{p.nom}</span>
          {p.certifications > 0 && <Certif width={22} height={22} />}
        </span>
        <span className="muted" style={{ display: 'block', marginTop: 6, fontSize: 14 }}>{ages(p)} · {p.ville} · {km} km</span>
        {lieu && <span style={{ display: 'inline-flex', marginTop: 10, gap: 6, alignItems: 'center', fontSize: 13, fontWeight: 650, color: 'var(--champagne)' }}><span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--champagne)' }} />Ce soir : {lieu.nom}</span>}
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {p.envies.slice(0, 3).map((e) => <span key={e} className="tag tag-oui">{termeById(e)?.mot}</span>)}
          {p.limites[0] && <span className="tag tag-non">Non : {p.limites[0]}</span>}
        </span>
      </button>
    </motion.article>
  )
})

export function Decouvrir() {
  const { likes, passes, bloques, premium, floutage, discret, like, pass, tarte, undo, notify, setDiscret, setPanique, open } = useApp()
  const recherche = useApp((s) => s.profil.recherche)
  const [filtre, setFiltre] = useState<Filtre | 'pourvous'>(recherche.length ? 'pourvous' : 'tous')
  const [ceSoir, setCeSoir] = useState(false)
  const [dir, setDir] = useState<Dir>('droite')

  const pile = useMemo(() => {
    const types = filtre === 'pourvous' ? recherche.flatMap((r) => RECHERCHE_TYPES[r] ?? []) : FILTRES.find((f) => f.id === filtre)!.match
    return PROFILS.filter((p) => types.includes(p.type) && !likes.includes(p.id) && !passes.includes(p.id) && !bloques.includes(p.id) && (!ceSoir || p.ceSoir))
  }, [filtre, ceSoir, likes, passes, bloques, recherche])

  const decide = (d: Dir) => {
    const p = pile[0]
    if (!p) return
    setDir(d)
    if ('vibrate' in navigator) navigator.vibrate?.(8)
    if (d === 'droite') like(p.id)
    else if (d === 'gauche') pass(p.id)
    else { tarte(p.id); notify(`Tarte aux fraises envoyée à ${p.nom}`) }
  }

  const flou = floutage && !premium

  return (
    <div className="screen" style={{ paddingTop: 'calc(var(--safe-t) + 10px)' }}>
      <header className="pad row" style={{ justifyContent: 'space-between', height: 56 }}>
        <Logo />
        <div className="row" style={{ gap: 8 }}>
          <button className="icon-btn" aria-label={discret ? 'Désactiver le mode discret' : 'Activer le mode discret'} aria-pressed={discret} onClick={() => { setDiscret(!discret); notify(discret ? 'Mode discret désactivé' : 'Mode discret : tout est flouté') }} style={discret ? { background: 'var(--text)', color: 'var(--on-light)' } : undefined}><EyeOff size={19} /></button>
          <button className="icon-btn" aria-label="Le lexique libertin" onClick={() => open({ kind: "lexique" })}><BookOpen size={19} /></button>
          <button className="icon-btn" aria-label="Quitter vite" onClick={() => setPanique(true)}><LogOut size={19} /></button>
        </div>
      </header>

      <div className="chips" role="group" aria-label="Je cherche" style={{ marginTop: 6 }}>
        {recherche.length > 0 && <button className="chip" aria-pressed={filtre === 'pourvous'} onClick={() => setFiltre('pourvous')}>Pour vous</button>}
        {FILTRES.map((f) => <button key={f.id} className="chip" aria-pressed={filtre === f.id} onClick={() => setFiltre(f.id)}>{f.label}</button>)}
        <button className="chip" aria-pressed={ceSoir} onClick={() => setCeSoir(!ceSoir)}>Dispo ce soir</button>
      </div>

      <div style={{ position: 'relative', flex: 1, margin: '14px 14px 0' }}>
        <AnimatePresence custom={dir}>
          {pile.slice(0, 2).reverse().map((p, i, arr) => (
            <SwipeCard key={p.id} p={p} top={i === arr.length - 1} onDecide={decide} flou={flou || discret} />
          ))}
        </AnimatePresence>
        {pile.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 30 }}>
            <div>
              <p className="h2">Plus personne dans les parages… pour l'instant</p>
              <p className="muted" style={{ marginTop: 8 }}>Élargissez vos critères, ou jetez un œil aux soirées de ce week-end.</p>
              <button className="btn btn-ghost" style={{ marginTop: 18 }} onClick={() => { setFiltre('tous'); setCeSoir(false); undo() }}>Revoir le dernier profil</button>
            </div>
          </div>
        )}
      </div>

      <div className="row" style={{ justifyContent: 'center', gap: 16, padding: '18px 0 calc(var(--safe-b) + 96px)' }}>
        <ActionBtn label="Revenir" size={50} onClick={undo}><RotateCcw size={20} /></ActionBtn>
        <ActionBtn label="Non merci" size={62} onClick={() => decide('gauche')}><X size={28} /></ActionBtn>
        <ActionBtn label="Envoyer une tarte aux fraises" size={54} onClick={() => decide('haut')} tone="fraise"><Fraise width={26} height={26} style={{ color: '#ff5d6c' }} /></ActionBtn>
        <ActionBtn label="J'ai envie" size={72} onClick={() => decide('droite')} tone="velours"><Heart size={30} fill="currentColor" /></ActionBtn>
      </div>
    </div>
  )
}

function ActionBtn({ children, label, size, onClick, tone }: { children: React.ReactNode; label: string; size: number; onClick: () => void; tone?: 'velours' | 'fraise' }) {
  const style: React.CSSProperties =
    tone === 'velours'
      ? { background: 'linear-gradient(180deg, var(--velours-hi), var(--velours))', color: '#fff', boxShadow: '0 12px 30px rgba(179,18,46,.45)' }
      : tone === 'fraise'
        ? { background: 'var(--surface-2)', border: '1px solid rgba(255,93,108,.4)' }
        : { background: 'var(--surface-2)', border: '1px solid var(--line-2)', color: 'var(--text)' }
  return (
    <motion.button aria-label={label} onClick={onClick} whileTap={{ scale: 0.88 }} transition={{ type: 'spring', stiffness: 600, damping: 20 }} style={{ width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', ...style }}>
      {children}
    </motion.button>
  )
}
