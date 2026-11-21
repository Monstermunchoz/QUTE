import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Check, LocateFixed, MapPin, Search, X } from 'lucide-react'
import { LIEUX } from '../data/venues'
import { useApp } from '../store/useApp'
import { Sheet } from './Sheet'

/** Villes connues de l'annuaire, avec leur nombre de lieux. Caluire est rattachée à Lyon. */
const alias = (v: string) => (v === 'Caluire-et-Cuire' ? 'Lyon' : v)
export const VILLES = Object.entries(
  LIEUX.reduce<Record<string, number>>((m, l) => ((m[alias(l.ville)] = (m[alias(l.ville)] ?? 0) + 1), m), {}),
)
  .map(([nom, n]) => ({ nom, n }))
  .sort((a, b) => b.n - a.n || a.nom.localeCompare(b.nom))

export const dansVille = (lieuVille: string, ville: string | null) => !ville || alias(lieuVille) === ville

/** Pastille de sélection de ville + panneau de recherche. */
export function CityPicker() {
  const { ville, setVille, notify } = useApp()
  const [ouvert, setOuvert] = useState(false)
  const [q, setQ] = useState('')
  const liste = useMemo(() => VILLES.filter((v) => v.nom.toLowerCase().includes(q.trim().toLowerCase())), [q])

  const choisir = (v: string | null) => {
    setVille(v)
    setOuvert(false)
    setQ('')
  }

  return (
    <>
      <div className="row" style={{ gap: 8 }}>
        <motion.button layout whileTap={{ scale: 0.96 }} onClick={() => setOuvert(true)} aria-haspopup="dialog"
          style={{ height: 40, padding: '0 16px 0 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, background: ville ? 'var(--velours)' : 'var(--surface-2)', color: ville ? '#fff' : 'var(--text)', border: ville ? '1px solid transparent' : '1px solid var(--line-2)', fontWeight: 650, fontSize: 14 }}>
          <MapPin size={16} />
          {ville ?? 'Toute la France'}
        </motion.button>
        <AnimatePresence>
          {ville && (
            <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} aria-label="Effacer la ville" onClick={() => setVille(null)}
              style={{ width: 32, height: 32, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--line-2)' }}>
              <X size={15} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {ouvert && (
          <Sheet label="Choisir une ville" onClose={() => setOuvert(false)}>
            <div className="pad" style={{ paddingBottom: 12 }}>
              <h2 className="h2">Où sortez-vous ?</h2>
              <label className="row" style={{ marginTop: 14, height: 50, padding: '0 16px', borderRadius: 25, background: 'var(--surface)', border: '1px solid var(--line-2)', gap: 10 }}>
                <Search size={18} color="var(--muted)" />
                <span className="sr">Rechercher une ville</span>
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une ville" style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 'none' }} />
              </label>
              <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button className="chip" aria-pressed={!ville} onClick={() => choisir(null)}>Toute la France</button>
                <button className="chip row" style={{ gap: 6, display: 'inline-flex', alignItems: 'center' }} onClick={() => { choisir('Lyon'); notify('Position approximative : Lyon') }}><LocateFixed size={15} />Autour de moi</button>
              </div>
            </div>
            <ul className="scroll" style={{ listStyle: 'none', margin: 0, padding: '0 0 calc(var(--safe-b) + 20px)', maxHeight: '52vh' }}>
              {liste.map((v) => (
                <li key={v.nom}>
                  <button className="row" onClick={() => choisir(v.nom)} style={{ width: '100%', padding: '14px 20px', textAlign: 'left' }}>
                    <span style={{ flex: 1, fontWeight: 650, fontSize: 16 }}>{v.nom}</span>
                    <span className="faint" style={{ fontSize: 13 }}>{v.n} lieu{v.n > 1 ? 'x' : ''}</span>
                    <span style={{ width: 24, display: 'grid', placeItems: 'center' }}>{ville === v.nom && <Check size={18} color="var(--velours-hi)" />}</span>
                  </button>
                </li>
              ))}
              {liste.length === 0 && <li className="muted pad" style={{ padding: '18px 20px' }}>Pas encore de lieu dans cette ville. Proposez-en un depuis l'onglet Lieux.</li>}
            </ul>
          </Sheet>
        )}
      </AnimatePresence>
    </>
  )
}
