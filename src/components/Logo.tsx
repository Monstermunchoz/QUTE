/**
 * Logo QUTE : symbole des deux cœurs entrelacés (trait épais) + nom en Syncopate.
 * Par défaut : symbole rouge (var(--brand)) et texte crème. Passer `color` seul
 * colore le symbole ET le texte de la même couleur (ex. version claire sur fond rouge).
 */
import { SYMBOLE_D, SYMBOLE_VB } from '../brand'

const [, , VB_W, VB_H] = SYMBOLE_VB.split(' ').map(Number)

export function Symbole({ size = 32, color = 'var(--brand)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={(size * VB_H) / VB_W} viewBox={SYMBOLE_VB} aria-hidden="true">
      <path fill={color} fillRule="evenodd" d={SYMBOLE_D} />
    </svg>
  )
}

export function Logo({
  size = 15,
  color,
  textColor,
  symbole = true,
}: {
  size?: number
  color?: string
  textColor?: string
  symbole?: boolean
}) {
  const symColor = color ?? 'var(--brand)'
  const txtColor = textColor ?? color ?? '#f6ede8'
  const symHeight = size * 1.27
  return (
    <span role="img" aria-label="QUTE" style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.35 }}>
      {symbole && <Symbole size={(symHeight * VB_W) / VB_H} color={symColor} />}
      <span style={{ color: txtColor, fontFamily: 'Syncopate, var(--font)', fontWeight: 700, fontSize: size, letterSpacing: '0.22em', marginRight: '-0.22em', lineHeight: 1 }}>QUTE</span>
    </span>
  )
}
