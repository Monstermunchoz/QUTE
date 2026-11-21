/**
 * Curseur double sur une seule barre (minimum et maximum).
 * Deux <input type="range"> superposés : accessibles au clavier et au lecteur d'écran.
 */
export function RangeDouble({ min, max, bas, haut, onChange, label }: { min: number; max: number; bas: number; haut: number; onChange: (bas: number, haut: number) => void; label: string }) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100
  return (
    <div className="range2" style={{ ['--a' as string]: `${pct(bas)}%`, ['--b' as string]: `${pct(haut)}%` }}>
      <div className="range2-piste" aria-hidden="true"><div className="range2-plage" /></div>
      <input type="range" min={min} max={max} value={bas} aria-label={`${label} minimum`} onChange={(e) => onChange(Math.min(+e.target.value, haut - 1), haut)} />
      <input type="range" min={min} max={max} value={haut} aria-label={`${label} maximum`} onChange={(e) => onChange(bas, Math.max(+e.target.value, bas + 1))} />
    </div>
  )
}

/** Curseur simple, même style que le double. */
export function RangeSimple({ min, max, step = 1, valeur, onChange, label }: { min: number; max: number; step?: number; valeur: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="range2" style={{ ['--a' as string]: '0%', ['--b' as string]: `${((valeur - min) / (max - min)) * 100}%` }}>
      <div className="range2-piste" aria-hidden="true"><div className="range2-plage" /></div>
      <input type="range" min={min} max={max} step={step} value={valeur} aria-label={label} onChange={(e) => onChange(+e.target.value)} />
    </div>
  )
}
