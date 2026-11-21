import { motion } from 'motion/react'
import { ShieldCheck } from 'lucide-react'
import { Portrait } from '../components/Portrait'
import { Fraise } from '../components/icons'
import { profilById, type Profil } from '../data/profiles'
import { useApp } from '../store/useApp'

/** Conversations de démonstration. */
export const FILS: Record<string, { de: 'eux' | 'moi'; texte?: string; photo?: boolean; heure: string }[]> = {
  'nina-ines': [
    { de: 'eux', texte: 'Coucou vous deux ! Votre profil nous a beaucoup plu.', heure: '21:30' },
    { de: 'moi', texte: 'Merci, le vôtre aussi ! Vous sortez souvent au Taken ?', heure: '21:35' },
    { de: 'eux', texte: 'Presque tous les samedis. Un verre avant, ça vous dit ?', heure: '21:42' },
  ],
  'claire-hugo': [
    { de: 'eux', photo: true, heure: '20:15' },
    { de: 'eux', texte: 'On a ouvert notre album privé pour vous.', heure: '20:15' },
  ],
  'sam-lou': [
    { de: 'moi', texte: 'Super soirée hier, merci encore !', heure: 'Hier' },
    { de: 'eux', texte: 'Avec plaisir ! On vous certifie, c’était parfait.', heure: 'Hier' },
  ],
}

export const A_VALIDER = ['karim', 'victoire']

export function nonLus() {
  return Object.values(FILS).filter((f) => f[f.length - 1].de === 'eux').length
}

export function Messages() {
  const { open, compte, validations, valider, notify, likes, tartes, bloques, premium, discret } = useApp()
  const fils = Object.keys(FILS).filter((id) => !bloques.includes(id)).map((id) => profilById(id)!)
  const nouveaux = likes.filter((id) => !FILS[id] && !bloques.includes(id)).map((id) => profilById(id)!).filter(Boolean)
  const aValider = compte === 'couple' ? A_VALIDER.filter((id) => !validations[id]).map((id) => profilById(id)!) : []
  const flou = !premium || discret

  return (
    <div className="screen" style={{ paddingTop: 'calc(var(--safe-t) + 16px)' }}>
      <div className="scroll" style={{ paddingBottom: 'calc(var(--safe-b) + 100px)' }}>
        <header className="pad">
          <p className="eyebrow">{compte === 'couple' ? 'Boîte partagée du couple' : 'Vos conversations'}</p>
          <h1 className="h1" style={{ marginTop: 6 }}>Messages</h1>
        </header>

        {aValider.length > 0 && (
          <section aria-label="À valider à deux" style={{ margin: '18px 14px 0' }} className="card">
            <div style={{ padding: '16px 16px 4px' }}>
              <p className="eyebrow">À valider à deux</p>
              <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Votre partenaire a dit oui. Un match n'existe que si vous êtes d'accord tous les deux.</p>
            </div>
            {aValider.map((p) => (
              <motion.div layout key={p.id} className="row" style={{ padding: '12px 16px', gap: 12 }}>
                <Avatar p={p} flou={flou} />
                <button style={{ flex: 1, textAlign: 'left' }} onClick={() => open({ kind: 'profil', id: p.id })}>
                  <span style={{ display: 'block', fontWeight: 700 }}>{p.nom}</span>
                  <span className="muted" style={{ fontSize: 12.5 }}>Votre partenaire : oui · Vous : ?</span>
                </button>
                <button className="btn btn-ghost" style={{ height: 40, padding: '0 14px', fontSize: 13 }} onClick={() => { valider(p.id, 'non'); notify('Refusé, sans notification') }}>Non</button>
                <button className="btn btn-primary" style={{ height: 40, padding: '0 14px', fontSize: 13 }} onClick={() => { valider(p.id, 'oui'); notify(`C’est un match avec ${p.nom}`) }}>Oui</button>
              </motion.div>
            ))}
          </section>
        )}

        {nouveaux.length > 0 && (
          <section style={{ marginTop: 22 }}>
            <p className="eyebrow pad" style={{ color: 'var(--muted)' }}>Vos envies récentes</p>
            <div className="row" style={{ gap: 14, padding: '12px 20px 0', overflowX: 'auto' }}>
              {nouveaux.map((p) => (
                <button key={p.id} onClick={() => open({ kind: 'profil', id: p.id })} style={{ flex: 'none', width: 70, textAlign: 'center', position: 'relative' }}>
                  <span style={{ position: 'relative', display: 'block', width: 66, height: 66, margin: '0 auto', borderRadius: 33, overflow: 'hidden', boxShadow: '0 0 0 2px var(--velours-hi)' }}><Portrait teinte={p.teinte} personnes={p.partenaires.length} flou={flou} /></span>
                  {tartes.includes(p.id) && <Fraise width={20} height={20} style={{ position: 'absolute', top: -2, right: 0, color: '#ff5d6c' }} />}
                  <span style={{ display: 'block', fontSize: 12, fontWeight: 650, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nom}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <ul style={{ listStyle: 'none', margin: '18px 0 0', padding: 0 }}>
          {fils.map((p) => {
            const f = FILS[p.id]
            const dernier = f[f.length - 1]
            const nonLu = dernier.de === 'eux'
            return (
              <li key={p.id}>
                <button className="row" style={{ width: '100%', padding: '13px 20px', textAlign: 'left', gap: 14 }} onClick={() => open({ kind: 'chat', id: p.id })}>
                  <Avatar p={p} flou={flou} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="row" style={{ justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>{p.nom}</span>
                      <span style={{ fontSize: 12, color: nonLu ? 'var(--rose)' : 'var(--faint)', fontWeight: 600 }}>{dernier.heure}</span>
                    </span>
                    <span style={{ display: 'block', fontSize: 14, marginTop: 3, color: nonLu ? 'var(--text)' : 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dernier.de === 'moi' ? 'Vous : ' : ''}{dernier.photo ? 'Photo privée (floutée)' : dernier.texte}
                    </span>
                  </span>
                  {nonLu && <span style={{ width: 9, height: 9, borderRadius: 5, background: 'var(--velours-hi)', flex: 'none' }} />}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="card row" style={{ margin: '16px 14px 0', padding: 14, gap: 12 }}>
          <ShieldCheck size={22} color="var(--champagne)" />
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.45 }}>Photos éphémères, floutées jusqu'à votre accord. Les captures d'écran sont signalées. Signaler ou bloquer en deux gestes.</p>
        </div>
      </div>
    </div>
  )
}

export function Avatar({ p, flou, size = 54 }: { p: Profil; flou: boolean; size?: number }) {
  return (
    <span style={{ position: 'relative', width: size, height: size, borderRadius: size / 2, overflow: 'hidden', flex: 'none', display: 'block' }}>
      <Portrait teinte={p.teinte} personnes={p.partenaires.length} flou={flou} />
    </span>
  )
}
