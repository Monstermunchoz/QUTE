import type { ReactNode } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { Page } from '../components/Sheet'
import { PRATIQUES } from '../data/lexique'
import { DISPOS, EXPERIENCES, LIMITES, ORIENTATIONS, OU, RECHERCHE, SILHOUETTES } from '../data/profiles'
import { useApp, type Avis, type MonProfil } from '../store/useApp'
import { RangeDouble, RangeSimple } from '../components/RangeDouble'

/** Pourcentage de profil rempli : sert à motiver sans culpabiliser. */
export function completion(p: MonProfil) {
  const pts = [
    p.partenaires.every((x) => x.age && x.orientation),
    p.partenaires.every((x) => x.silhouette),
    p.bio.trim().length >= 40,
    p.recherche.length > 0,
    Object.keys(p.envies).length >= 3,
    p.limites.length > 0,
    p.dispo.length > 0,
    p.ou.length > 0,
    !!p.experience,
  ]
  return Math.round((pts.filter(Boolean).length / pts.length) * 100)
}

const CYCLE: (Avis | undefined)[] = [undefined, 'oui', 'peut', 'non']
const AVIS_LABEL: Record<Avis, string> = { oui: 'Oui', peut: 'Peut-être', non: 'Non' }

function Bloc({ titre, sous, children }: { titre: string; sous?: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 30 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700 }}>{titre}</h2>
      {sous && <p className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>{sous}</p>}
      <div style={{ marginTop: 14 }}>{children}</div>
    </section>
  )
}

function Multi({ options, valeurs, set }: { options: readonly string[]; valeurs: string[]; set: (v: string[]) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const on = valeurs.includes(o)
        return <button key={o} className="chip" aria-pressed={on} onClick={() => set(on ? valeurs.filter((v) => v !== o) : [...valeurs, o])}>{o}</button>
      })}
    </div>
  )
}

function Un({ options, valeur, set }: { options: readonly string[]; valeur: string; set: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="radiogroup">
      {options.map((o) => <button key={o} role="radio" aria-checked={valeur === o} className="chip" aria-pressed={valeur === o} onClick={() => set(valeur === o ? '' : o)}>{o}</button>)}
    </div>
  )
}

export function MonProfilPage() {
  const { profil: p, setProfil, pseudo, compte, notify } = useApp()
  const pc = completion(p)
  const setPart = (i: number, champ: string, v: string | number) =>
    setProfil({ partenaires: p.partenaires.map((x, j) => (j === i ? { ...x, [champ]: v } : x)) })

  return (
    <Page label="Mon profil">
      <header className="row" style={{ padding: 'calc(var(--safe-t) + 12px) 16px 12px', gap: 12, borderBottom: '1px solid var(--line)' }}>
        <button className="icon-btn" aria-label="Retour" onClick={() => history.back()}><ArrowLeft size={20} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>{pseudo || 'Mon profil'}</div>
          <div className="faint" style={{ fontSize: 12.5 }}>Profil complété à {pc} %</div>
        </div>
        <button className="btn btn-primary" style={{ height: 40, padding: '0 16px', fontSize: 14 }} onClick={() => { notify('Profil enregistré'); history.back() }}><Check size={16} />OK</button>
      </header>
      <div style={{ height: 3, background: 'var(--line)' }}><div style={{ height: '100%', width: `${pc}%`, background: 'var(--velours-hi)', transition: 'width .4s var(--ease)' }} /></div>

      <div className="scroll pad" style={{ paddingBottom: 'calc(var(--safe-b) + 40px)' }}>
        <p className="muted" style={{ marginTop: 18, fontSize: 14 }}>Un profil complet reçoit bien plus de réponses. Rien n'est obligatoire, et tout se modifie à tout moment.</p>

        <Bloc titre={compte === 'couple' ? 'Qui êtes-vous, tous les deux ?' : 'Qui êtes-vous ?'}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {p.partenaires.map((x, i) => (
              <div key={i} className="card" style={{ padding: 16 }}>
                <div className="eyebrow" style={{ color: i === 0 ? 'var(--rose)' : 'var(--champagne)' }}>{x.role}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                  <label className="field"><span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)' }}>Âge</span>
                    <input className="input" type="number" inputMode="numeric" min={18} max={99} value={x.age} placeholder="18+" onChange={(e) => setPart(i, 'age', e.target.value ? Math.max(18, +e.target.value) : '')} style={{ height: 48 }} /></label>
                  <label className="field"><span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)' }}>Taille</span>
                    <input className="input" value={x.taille} placeholder="1m70" onChange={(e) => setPart(i, 'taille', e.target.value)} style={{ height: 48 }} /></label>
                </div>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginTop: 14 }}>Orientation</p>
                <div style={{ marginTop: 8 }}><Un options={ORIENTATIONS} valeur={x.orientation} set={(v) => setPart(i, 'orientation', v)} /></div>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginTop: 14 }}>Silhouette</p>
                <div style={{ marginTop: 8 }}><Un options={SILHOUETTES} valeur={x.silhouette} set={(v) => setPart(i, 'silhouette', v)} /></div>
              </div>
            ))}
          </div>
        </Bloc>

        <Bloc titre="En quelques mots" sous="Ce qui vous fait vibrer, ce que vous aimez dans une première rencontre.">
          <textarea className="input" value={p.bio} maxLength={500} rows={5} placeholder="Complices depuis 9 ans, on aime les dîners qui finissent tard et prendre le temps de se découvrir…" onChange={(e) => setProfil({ bio: e.target.value })} style={{ width: '100%', height: 'auto', padding: 16, resize: 'none', lineHeight: 1.5 }} />
          <p className="faint" style={{ fontSize: 12, textAlign: 'right', marginTop: 4 }}>{p.bio.length}/500</p>
        </Bloc>

        <Bloc titre="Vous voulez rencontrer" sous="Seuls ces profils vous seront proposés.">
          <Multi options={RECHERCHE} valeurs={p.recherche} set={(v) => setProfil({ recherche: v })} />
        </Bloc>

        <Bloc titre="Vos envies" sous="Touchez une fois pour Oui, deux fois pour Peut-être, trois fois pour Non.">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRATIQUES.map((t) => {
              const a = p.envies[t.id]
              const suivant = () => {
                const n = CYCLE[(CYCLE.indexOf(a) + 1) % CYCLE.length]
                const e = { ...p.envies }
                if (n) e[t.id] = n
                else delete e[t.id]
                setProfil({ envies: e })
              }
              return (
                <button key={t.id} onClick={suivant} className={`tag ${a === 'oui' ? 'tag-oui' : a === 'peut' ? 'tag-peut' : a === 'non' ? 'tag-non' : ''}`} style={{ height: 38, padding: '0 14px', fontSize: 13.5, border: a ? undefined : '1px solid var(--line-2)', background: a ? undefined : 'transparent' }} aria-label={`${t.mot} : ${a ? AVIS_LABEL[a] : 'non renseigné'}`}>
                  {a && <span style={{ fontWeight: 800 }}>{AVIS_LABEL[a]} ·</span>}{t.mot}
                </button>
              )
            })}
          </div>
        </Bloc>

        <Bloc titre="Vos règles" sous="Elles s'affichent clairement : personne ne pourra dire qu'il ne savait pas.">
          <Multi options={LIMITES} valeurs={p.limites} set={(v) => setProfil({ limites: v })} />
        </Bloc>

        <Bloc titre="Quand êtes-vous disponibles ?">
          <Multi options={DISPOS} valeurs={p.dispo} set={(v) => setProfil({ dispo: v })} />
        </Bloc>

        <Bloc titre="Où aimez-vous vous retrouver ?">
          <Multi options={OU} valeurs={p.ou} set={(v) => setProfil({ ou: v })} />
        </Bloc>

        <Bloc titre="Votre expérience">
          <Un options={EXPERIENCES} valeur={p.experience} set={(v) => setProfil({ experience: v })} />
        </Bloc>

        <Bloc titre="Vos critères de recherche">
          <div className="card" style={{ padding: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}><span style={{ fontWeight: 600 }}>Âge</span><span className="muted">{p.ageMin} – {p.ageMax >= 80 ? '80 ans et +' : `${p.ageMax} ans`}</span></div>
            <RangeDouble label="Âge" min={18} max={80} bas={p.ageMin} haut={p.ageMax} onChange={(a, b) => setProfil({ ageMin: a, ageMax: b })} />
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 16 }}><span style={{ fontWeight: 600 }}>Distance maximale</span><span className="muted">{p.distance >= 300 ? 'Toute la France' : `${p.distance} km`}</span></div>
            <RangeSimple label="Distance maximale" min={5} max={300} step={5} valeur={p.distance} onChange={(v) => setProfil({ distance: v })} />
          </div>
        </Bloc>

        <Bloc titre="Visibilité">
          <div className="card" style={{ overflow: 'hidden' }}>
            {([
              ['afficherEnLigne', 'Montrer quand je suis en ligne', 'Sinon, les autres voient seulement « actif récemment ».'],
              ['fantome', 'Mode fantôme', 'Votre profil n’apparaît qu’aux personnes que vous avez likées.'],
            ] as const).map(([k, t, d]) => (
              <button key={k} role="switch" aria-checked={p[k]} onClick={() => setProfil({ [k]: !p[k] })} className="row" style={{ width: '100%', padding: '14px 16px', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                <span style={{ flex: 1 }}><span style={{ display: 'block', fontWeight: 650 }}>{t}</span><span className="muted" style={{ fontSize: 12.5 }}>{d}</span></span>
                <span className="switch" aria-checked={p[k]} aria-hidden="true" />
              </button>
            ))}
          </div>
        </Bloc>
      </div>
    </Page>
  )
}
