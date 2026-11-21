import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Ban, Flag, Lock, MessageCircle, MoreHorizontal, ShieldCheck } from 'lucide-react'
import { Page } from '../components/Sheet'
import { Portrait } from '../components/Portrait'
import { Certif, Fraise } from '../components/icons'
import { presence, profilById, TYPE_PROFIL_LABEL } from '../data/profiles'
import { compatibilite } from '../lib/compat'
import { termeById } from '../data/lexique'
import { lieuById } from '../data/venues'
import { useApp } from '../store/useApp'

export function ProfilPage({ id }: { id: string }) {
  const p = profilById(id)!
  const { premium, discret, open, bloquer, notify, tarte, tartes, profil } = useApp()
  const pr = presence(p.vu)
  const compat = compatibilite(profil, p)
  const [menu, setMenu] = useState(false)
  const lieu = p.ceSoir ? lieuById(p.ceSoir) : undefined
  const verrou = !premium

  return (
    <Page label={`Profil de ${p.nom}`}>
      <div className="scroll" style={{ paddingBottom: verrou ? 150 : 110 }}>
        <div style={{ position: 'relative', height: 440 }}>
          <Portrait teinte={p.teinte} personnes={p.partenaires.length} flou={verrou || discret} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,7,9,.5) 0%, rgba(11,7,9,0) 25%, rgba(11,7,9,0) 60%, var(--bg) 100%)' }} />
          <div className="row" style={{ position: 'absolute', top: 'calc(var(--safe-t) + 14px)', left: 16, right: 16, justifyContent: 'space-between' }}>
            <button className="icon-btn" aria-label="Retour" onClick={() => history.back()}><ArrowLeft size={20} /></button>
            <button className="icon-btn" aria-label="Signaler ou bloquer" aria-expanded={menu} onClick={() => setMenu(!menu)}><MoreHorizontal size={20} /></button>
          </div>
          {menu && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ position: 'absolute', right: 16, top: 'calc(var(--safe-t) + 66px)', padding: 6, zIndex: 5, minWidth: 210, background: 'var(--surface-2)' }}>
              <button className="row" style={{ width: '100%', padding: '12px 12px', gap: 10, fontWeight: 600 }} onClick={() => { setMenu(false); notify('Signalement envoyé à la modération') }}><Flag size={18} />Signaler ce profil</button>
              <button className="row" style={{ width: '100%', padding: '12px 12px', gap: 10, fontWeight: 600, color: 'var(--rose)' }} onClick={() => { bloquer(p.id); notify(`${p.nom} est bloqué·e`) }}><Ban size={18} />Bloquer</button>
            </motion.div>
          )}
          {verrou && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 170, display: 'grid', justifyItems: 'center', gap: 10 }}>
              <span style={{ width: 58, height: 58, borderRadius: 29, background: 'rgba(11,7,9,.65)', border: '1px solid var(--line-2)', display: 'grid', placeItems: 'center', backdropFilter: 'blur(10px)' }}><Lock size={24} /></span>
              <span style={{ fontWeight: 650, fontSize: 14 }}>{p.photos} photos · {p.privees} privées</span>
            </div>
          )}
        </div>

        <div className="pad" style={{ marginTop: -70, position: 'relative', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <p className="eyebrow">{p.etiquette ?? TYPE_PROFIL_LABEL[p.type]}</p>
            <h1 className="display row" style={{ fontSize: 38, marginTop: 8, gap: 10 }}>{p.nom}{p.certifications > 0 && <Certif width={24} height={24} />}</h1>
            <p className="muted" style={{ marginTop: 8 }}>{p.ville}{p.depuis ? ` · ensemble depuis ${p.depuis}` : ''}</p>
            <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="tag"><span style={{ width: 8, height: 8, borderRadius: 4, background: pr.enLigne ? 'var(--ok)' : 'var(--faint)' }} />{pr.texte}</span>
              <span className="tag">{p.experience}</span>
              {compat !== null && <span className="tag" style={{ background: 'rgba(196,30,58,.18)', color: 'var(--text)' }}>{compat} % compatibles</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${p.partenaires.length}, 1fr)`, gap: 10 }}>
            {p.partenaires.map((x, i) => (
              <div key={i} className="card" style={{ padding: '14px 16px' }}>
                <div className="eyebrow" style={{ color: i === 0 ? 'var(--rose)' : 'var(--champagne)' }}>{x.role}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 6 }}>{x.age} ans · {x.orientation}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{[x.taille, x.mot].filter(Boolean).join(' · ')}</div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 15.5, lineHeight: 1.55, filter: verrou ? 'blur(0)' : undefined }}>{verrou ? p.bio.slice(0, 70) + '…' : p.bio}</p>

          <section>
            <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>Envies et limites</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {p.envies.map((e) => <button key={e} className="tag tag-oui" onClick={() => open({ kind: 'lexique' })}>Oui · {termeById(e)?.mot}</button>)}
              {p.peutEtre.map((e) => <button key={e} className="tag tag-peut" onClick={() => open({ kind: 'lexique' })}>Peut-être · {termeById(e)?.mot}</button>)}
              {p.limites.map((l) => <span key={l} className="tag tag-non">Non · {l}</span>)}
            </div>
          </section>

          <section style={{ display: 'grid', gap: 14 }}>
            {([['Recherchent', p.recherche], ['Disponibles', p.dispo], ['Aiment se retrouver', p.ouRencontrer]] as const).map(([t, xs]) => (
              <div key={t}>
                <h2 className="eyebrow" style={{ color: 'var(--muted)' }}>{t}</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{xs.map((x) => <span key={x} className="tag">{x}</span>)}</div>
              </div>
            ))}
          </section>

          {p.certifications > 0 && (
            <div className="card row" style={{ padding: 16 }}>
              <ShieldCheck size={26} color="var(--champagne)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>Certifié par {p.certifications} membre{p.certifications > 1 ? 's' : ''}</div>
                <div className="muted" style={{ fontSize: 13 }}>Des membres les ont rencontrés en vrai et confirment leur sérieux.</div>
              </div>
            </div>
          )}

          {lieu && (
            <button className="card row" style={{ padding: 16, textAlign: 'left', background: 'rgba(221,187,130,.08)', borderColor: 'rgba(221,187,130,.25)' }} onClick={() => open({ kind: 'lieu', id: lieu.id })}>
              <div style={{ flex: 1 }}>
                <div className="eyebrow">Ce soir</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 4 }}>{lieu.nom}</div>
                <div className="muted" style={{ fontSize: 13 }}>{lieu.ville}</div>
              </div>
              <span style={{ fontWeight: 650, fontSize: 13, color: 'var(--champagne)' }}>Voir le lieu</span>
            </button>
          )}

          <p className="faint" style={{ fontSize: 12.5 }}>Albums privés : vous pouvez demander l'accès, {p.nom} accepte ou refuse. Les captures d'écran sont signalées au membre.</p>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 'calc(var(--safe-b) + 16px)' }}>
        {verrou ? (
          <div className="card" style={{ padding: 18, background: 'linear-gradient(160deg, #2a1419, #160d10)', borderColor: 'rgba(207,29,60,.35)', boxShadow: '0 20px 60px rgba(0,0,0,.6)' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div>
                <div className="h2" style={{ fontSize: 19 }}>Voir {p.nom} en entier</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Photos, albums privés, messages</div>
              </div>
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={() => open({ kind: 'premium' })}>Devenir membre Privé</button>
          </div>
        ) : (
          <div className="row" style={{ gap: 10 }}>
            <button className="btn btn-ghost" aria-label="Envoyer une tarte aux fraises" style={{ width: 54, padding: 0 }} disabled={tartes.includes(p.id)} onClick={() => { tarte(p.id); notify(`Tarte aux fraises envoyée à ${p.nom}`) }}><Fraise width={24} height={24} style={{ color: '#ff5d6c' }} /></button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => open({ kind: 'chat', id: p.id })}><MessageCircle size={19} />Écrire</button>
          </div>
        )}
      </div>
    </Page>
  )
}
