import type { Profil, TypeProfil } from '../data/profiles'
import type { MonProfil } from '../store/useApp'

/** Ce que je recherche → types de profils correspondants. */
export const RECHERCHE_TYPES: Record<string, TypeProfil[]> = {
  'Couples F/H': ['couple-fh'],
  'Couples F/F': ['couple-ff'],
  'Couples H/H': ['couple-hh'],
  Femmes: ['femme'],
  Hommes: ['homme'],
  'Personnes trans': ['trans'],
  'Non-binaires': ['trans'],
}

/**
 * Compatibilité (0 à 100) entre mon profil et un autre :
 * envies partagées, aucune envie de l'un dans les « non » de l'autre, lieux et disponibilités communs.
 */
export function compatibilite(moi: MonProfil, p: Profil) {
  const mesOui = Object.entries(moi.envies).filter(([, a]) => a !== 'non').map(([k]) => k)
  const mesNon = Object.entries(moi.envies).filter(([, a]) => a === 'non').map(([k]) => k)
  if (!mesOui.length) return null
  const sesEnvies = [...p.envies, ...p.peutEtre]
  const communes = sesEnvies.filter((e) => mesOui.includes(e)).length
  const conflits = p.envies.filter((e) => mesNon.includes(e)).length
  const base = (communes / Math.max(3, Math.min(sesEnvies.length, mesOui.length))) * 70
  const bonus = (p.ouRencontrer.some((o) => moi.ou.includes(o)) ? 15 : 0) + (p.dispo.some((d) => moi.dispo.includes(d)) ? 15 : 0)
  return Math.max(5, Math.min(99, Math.round(base + bonus - conflits * 20)))
}
