/**
 * Logo QUTE : symbole des deux losanges entrelacés + nom en Syncopate.
 * Tout est dans une seule couleur (var(--brand) par défaut).
 * Le symbole a été vectorisé depuis l'image fournie : faire redessiner un SVG propre
 * par le graphiste pour la version définitive, puis remplacer SYMBOLE_D.
 */
import { SYMBOLE_D, SYMBOLE_VB } from '../brand'

export function Symbole({ size = 32, color = 'var(--brand)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={(size * 258) / 374} viewBox={SYMBOLE_VB} aria-hidden="true">
      <path fill={color} fillRule="evenodd" d={SYMBOLE_D} />
    </svg>
  )
}

export function Logo({ size = 15, color = 'var(--brand)', symbole = true }: { size?: number; color?: string; symbole?: boolean }) {
  return (
    <span role="img" aria-label="QUTE" style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.7, color }}>
      {symbole && <Symbole size={size * 2.2} color={color} />}
      <span style={{ fontFamily: 'Syncopate, var(--font)', fontWeight: 700, fontSize: size, letterSpacing: '0.22em', marginRight: '-0.22em', lineHeight: 1 }}>QUTE</span>
    </span>
  )
}
