import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, EyeOff, Lock, SendHorizontal, Timer } from 'lucide-react'
import { Page } from '../components/Sheet'
import { profilById } from '../data/profiles'
import { useApp } from '../store/useApp'
import { Avatar, FILS } from './Messages'

type Msg = { de: 'eux' | 'moi'; texte?: string; photo?: boolean; heure: string; vue?: boolean }

const maintenant = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

export function Chat({ id }: { id: string }) {
  const p = profilById(id)!
  const { premium, discret, open, notify } = useApp()
  const [msgs, setMsgs] = useState<Msg[]>(() => FILS[id] ?? [{ de: 'eux', texte: `Match ! Vous et ${p.nom} avez envie l’un de l’autre.`, heure: maintenant() }])
  const [texte, setTexte] = useState('')
  const fin = useRef<HTMLDivElement>(null)

  useEffect(() => { fin.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length])

  const envoyer = () => {
    const t = texte.trim()
    if (!t) return
    setMsgs((m) => [...m, { de: 'moi', texte: t, heure: maintenant() }])
    setTexte('')
  }

  const reveler = (i: number) => setMsgs((m) => m.map((x, j) => (j === i ? { ...x, vue: true } : x)))

  return (
    <Page label={`Conversation avec ${p.nom}`}>
      <header className="row" style={{ padding: 'calc(var(--safe-t) + 12px) 16px 12px', gap: 12, borderBottom: '1px solid var(--line)' }}>
        <button className="icon-btn" aria-label="Retour" onClick={() => history.back()}><ArrowLeft size={20} /></button>
        <button className="row" style={{ gap: 12, flex: 1, textAlign: 'left' }} onClick={() => open({ kind: 'profil', id })}>
          <Avatar p={p} flou={!premium || discret} size={40} />
          <span>
            <span style={{ display: 'block', fontWeight: 700 }}>{p.nom}</span>
            <span style={{ fontSize: 12, color: p.enLigne ? 'var(--ok)' : 'var(--faint)' }}>{p.enLigne ? 'En ligne' : 'Hors ligne'}</span>
          </span>
        </button>
      </header>

      <div className="scroll" style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p className="faint" style={{ textAlign: 'center', fontSize: 12, margin: '4px 20px 10px' }}>Conversation chiffrée. Rien ne s'envoie sans votre accord : photos floutées, éphémères, captures signalées.</p>
        <AnimatePresence initial={false}>
          {msgs.map((m, i) => (
            <motion.div key={i} layout initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} style={{ alignSelf: m.de === 'moi' ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
              {m.photo ? (
                <button onClick={() => (premium ? reveler(i) : open({ kind: 'premium' }))} style={{ position: 'relative', width: 200, height: 250, borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(160deg, #4a2129, #1d0f12)', display: 'grid', placeItems: 'center' }} aria-label={m.vue ? 'Photo affichée' : 'Afficher la photo privée'}>
                  {!m.vue ? (
                    <span style={{ display: 'grid', justifyItems: 'center', gap: 8, padding: 16, textAlign: 'center' }}>
                      {premium ? <EyeOff size={24} /> : <Lock size={24} />}
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Photo privée</span>
                      <span className="muted" style={{ fontSize: 12 }}>{premium ? 'Toucher pour afficher. Disparaît après 10 s.' : 'Réservé aux membres Privé'}</span>
                    </span>
                  ) : (
                    <span className="row" style={{ gap: 6, fontSize: 12, fontWeight: 650 }}><Timer size={15} />Photo vue, elle va disparaître</span>
                  )}
                </button>
              ) : (
                <div style={{ padding: '10px 14px', borderRadius: 20, borderBottomRightRadius: m.de === 'moi' ? 6 : 20, borderBottomLeftRadius: m.de === 'eux' ? 6 : 20, background: m.de === 'moi' ? 'var(--velours)' : 'var(--surface-2)', color: m.de === 'moi' ? '#fff' : 'var(--text)', fontSize: 15 }}>{m.texte}</div>
              )}
              <div className="faint" style={{ fontSize: 11, marginTop: 4, textAlign: m.de === 'moi' ? 'right' : 'left' }}>{m.heure}</div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={fin} />
      </div>

      <div style={{ padding: '10px 12px calc(var(--safe-b) + 12px)', borderTop: '1px solid var(--line)', background: 'var(--bg-2)' }}>
        {premium ? (
          <form className="row" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); envoyer() }}>
            <button type="button" className="icon-btn" aria-label="Proposer une photo éphémère" onClick={() => notify(`${p.nom} doit accepter avant de recevoir une photo`)}><Camera size={19} /></button>
            <label className="sr" htmlFor="msg">Votre message</label>
            <input id="msg" className="input" style={{ flex: 1, height: 46, borderRadius: 23 }} placeholder="Un mot sincère, ça marche toujours…" value={texte} onChange={(e) => setTexte(e.target.value)} autoComplete="off" />
            <button type="submit" className="icon-btn" aria-label="Envoyer" style={{ background: 'var(--velours)', borderColor: 'transparent' }} disabled={!texte.trim()}><SendHorizontal size={19} /></button>
          </form>
        ) : (
          <button className="btn btn-primary btn-block" onClick={() => open({ kind: 'premium' })}>Devenir membre Privé pour répondre</button>
        )}
      </div>
    </Page>
  )
}
