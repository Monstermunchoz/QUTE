import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, MapPin, Plus, RotateCcw, Search, X } from 'lucide-react'
import { LIEUX, TYPE_LABEL, type Lieu, type TypeLieu } from '../data/venues'
import { CityPicker, VILLES, dansVille } from '../components/CityPicker'
import { Carte, COULEUR } from '../components/Carte'
import { useApp } from '../store/useApp'

const FILTRE_LABEL: Record<TypeLieu | 'tout', string> = { tout: 'Tout', club: 'Clubs', sauna: 'Saunas', bar: 'Bars', shop: 'Sex-shops' }
const sansAccent = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Fréquentation de démonstration, stable par lieu. */
export const frequentation = (l: Lieu, moi: boolean) => ([...l.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 30) + 4 + (moi ? 1 : 0)

function useClair() {
  const [clair, setClair] = useState(() => document.documentElement.dataset.theme === 'ivoire')
  useEffect(() => {
    const o = new MutationObserver(() => setClair(document.documentElement.dataset.theme === 'ivoire'))
    o.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => o.disconnect()
  }, [])
  return clair
}

export function Lieux() {
  const { open, ceSoir, ville, setVille } = useApp()
  const [type, setType] = useState<TypeLieu | 'tout'>('tout')
  const [q, setQ] = useState('')
  const clair = useClair()
  const s = sansAccent(q.trim())

  // Une recherche porte sur toute la France ; sans recherche, on reste dans la ville choisie.
  const liste = useMemo(
    () => LIEUX.filter((l) => (type === 'tout' || l.type === type) && (s ? sansAccent(`${l.nom} ${l.ville} ${l.adresse ?? ''}`).includes(s) : dansVille(l.ville, ville))),
    [type, s, ville],
  )
  const villesTrouvees = useMemo(() => (s.length < 2 ? [] : VILLES.filter((v) => v.n && sansAccent(v.nom).includes(s)).slice(0, 4)), [s])

  const allerA = (v: string) => { setVille(v); setQ('') }
  const titre = s ? 'Recherche' : ville ?? 'Toute la France'

  return (
    <div className="screen" style={{ paddingTop: 'calc(var(--safe-t) + 10px)' }}>
      <div className="scroll" style={{ paddingBottom: 'calc(var(--safe-b) + 110px)' }}>
        <header className="pad" style={{ paddingTop: 6 }}>
          <p className="eyebrow">Clubs · saunas · bars · sex-shops</p>
          <div className="row" style={{ justifyContent: 'space-between', marginTop: 6, gap: 12 }}>
            <h1 className="h1" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titre}</h1>
            {(ville || s) && <button className="icon-btn" aria-label="Revenir à la France entière" onClick={() => { setVille(null); setQ('') }}><RotateCcw size={18} /></button>}
          </div>
          <div style={{ marginTop: 12 }}><CityPicker /></div>
          <form className="row" onSubmit={(e) => { e.preventDefault(); if (villesTrouvees[0] && !liste.length) allerA(villesTrouvees[0].nom); (document.activeElement as HTMLElement | null)?.blur() }}
            style={{ marginTop: 12, height: 50, padding: '0 8px 0 16px', borderRadius: 25, background: 'var(--surface)', border: '1px solid var(--line-2)', gap: 10 }}>
            <Search size={18} color="var(--muted)" />
            <label className="sr" htmlFor="q-lieu">Rechercher un lieu ou une ville</label>
            <input id="q-lieu" type="search" enterKeyHint="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Un club, un sauna, une ville…" style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 'none' }} />
            {q && <button type="button" aria-label="Effacer" onClick={() => setQ('')} style={{ width: 34, height: 34, borderRadius: 17, display: 'grid', placeItems: 'center', background: 'var(--surface-2)' }}><X size={16} /></button>}
          </form>
          {villesTrouvees.length > 0 && (
            <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {villesTrouvees.map((v) => (
                <button key={v.nom} className="chip" onClick={() => allerA(v.nom)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} />{v.nom} · {v.n}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="chips" role="group" aria-label="Type de lieu" style={{ marginTop: 12 }}>
          {(['tout', 'club', 'sauna', 'bar', 'shop'] as const).map((t) => (
            <button key={t} className="chip" aria-pressed={type === t} onClick={() => setType(t)}>{FILTRE_LABEL[t]}</button>
          ))}
        </div>

        <div style={{ margin: '14px 14px 0', height: 'min(54vh, 420px)', borderRadius: 'var(--r-l)', border: '1px solid var(--line)', overflow: 'hidden', position: 'relative', isolation: 'isolate' }}>
          <Carte lieux={liste} clair={clair} onChoisir={(id) => open({ kind: 'lieu', id })} />
        </div>
        <div className="pad row" style={{ gap: 14, marginTop: 10, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
          {(Object.keys(COULEUR) as TypeLieu[]).map((t) => <span key={t} className="row" style={{ gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: COULEUR[t] }} />{FILTRE_LABEL[t]}</span>)}
        </div>

        <div className="pad" style={{ marginTop: 22 }}>
          <h2 className="h2">{liste.length ? `${liste.length} lieu${liste.length > 1 ? 'x' : ''}` : 'Aucun lieu'}</h2>
          {!liste.length && <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>{villesTrouvees.length ? 'Touchez une ville ci-dessus pour y aller.' : 'Essayez un autre nom, ou revenez à toute la France.'}</p>}
        </div>
        <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
          {liste.map((l) => (
            <li key={l.id} style={{ contentVisibility: 'auto', containIntrinsicSize: '78px' }}>
              <button className="row pad" onClick={() => open({ kind: 'lieu', id: l.id })} style={{ width: '100%', padding: '14px 20px', textAlign: 'left' }}>
                <span style={{ width: 50, height: 50, borderRadius: 16, flex: 'none', background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 6, background: COULEUR[l.type], boxShadow: `0 0 18px ${COULEUR[l.type]}` }} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: 16 }}>{l.nom}</span>
                  <span className="muted" style={{ display: 'block', fontSize: 13, marginTop: 2 }}>{TYPE_LABEL[l.type]} · {l.ville}</span>
                </span>
                {l.type !== 'shop' && (
                  <span style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: 800, color: 'var(--rose)' }}>{frequentation(l, ceSoir.includes(l.id))}</span>
                    <span className="faint" style={{ fontSize: 11 }}>y vont</span>
                  </span>
                )}
                <ChevronRight size={18} color="var(--faint)" />
              </button>
            </li>
          ))}
        </ul>
        <div className="pad" style={{ marginTop: 18 }}>
          <button className="btn btn-ghost btn-block" onClick={() => useApp.getState().notify('Merci ! La modération vérifie chaque lieu proposé.')}><Plus size={18} />Proposer un lieu</button>
          <p className="faint" style={{ fontSize: 12, marginTop: 10, textAlign: 'center' }}>Annuaire en cours de vérification : confirmez horaires et conditions auprès de chaque établissement.</p>
        </div>
      </div>
    </div>
  )
}
