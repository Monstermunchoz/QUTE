import { REGIONS } from './regions'
import type { Lieu } from './venues'

/** Petit hash stable, pour varier les textes d'une fiche à l'autre. */
const h = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
const pick = <T,>(l: Lieu, xs: T[]) => xs[h(l.id) % xs.length]

const region = (l: Lieu) => REGIONS.find((r) => r.code === l.region)?.nom ?? ''
const cap = (l: Lieu) => l.ville === "Cap d'Agde"

/**
 * Description d'un lieu. Les fiches rédigées à la main (champ `ambiance`) priment ;
 * sinon on compose un texte à partir de ce que l'on sait du lieu.
 */
export function decrire(l: Lieu): string {
  if (l.ambiance) return l.ambiance
  const ou = cap(l) ? 'au cœur du quartier naturiste du Cap d’Agde' : `à ${l.ville}`

  if (l.type === 'shop') {
    return pick(l, [
      `Boutique coquine ${ou} : lingerie, accessoires et jeux pour préparer vos soirées. Idéal pour trouver une tenue avant le club.`,
      `Love store ${ou}. Lingerie, sextoys et petits plaisirs à offrir ou à s’offrir, avec des conseils discrets.`,
      `Sex-shop ${ou} : de quoi pimenter une soirée à deux ou à plusieurs, de la lingerie aux accessoires.`,
    ])
  }
  if (l.type === 'bar') {
    return `Bar libertin ${ou}. L’endroit idéal pour un premier verre : on fait connaissance, on discute de ses envies, sans aucune obligation.`
  }
  if (l.type === 'sauna') {
    return pick(l, [
      `Sauna libertin ${ou} : hammam, sauna et espaces détente pour se découvrir en douceur, souvent dès l’après-midi. Certains jours peuvent être réservés à un public, vérifiez le programme.`,
      `Sauna ${ou} pour des après-midis et soirées détente : chaleur, jacuzzi et coins câlins. Une alternative plus douce au club, appréciée des débutants.`,
      `Espace bien-être libertin ${ou}. On s’y retrouve autour du hammam et du jacuzzi avant de rejoindre les espaces plus intimes.`,
    ])
  }
  return pick(l, [
    `Club libertin ${ou}${region(l) ? `, en ${region(l)}` : ''}. Bar, piste de danse et espaces câlins : une adresse pour sortir en couple et rencontrer d’autres libertins.`,
    `Club échangiste ${ou}. On commence au bar, on se laisse porter par la piste, et les plus curieux rejoignent les salons. Soirées à thème selon les dates.`,
    `Établissement libertin ${ou} : ambiance soirée, espaces privatifs et règles claires. Pensez à consulter l’agenda : certaines soirées sont réservées aux couples.`,
  ])
}

/** Adresse complète pour les applis de navigation. */
export const adresseComplete = (l: Lieu) => [l.adresse, [l.cp, cap(l) ? 'Agde' : l.ville].filter(Boolean).join(' ')].filter(Boolean).join(', ')

/** Liens d'itinéraire : on passe l'adresse, plus précise que la position de la carte. */
export function itineraires(l: Lieu) {
  const q = encodeURIComponent(`${l.nom}, ${adresseComplete(l)}`)
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
    waze: `https://waze.com/ul?q=${q}&navigate=yes`,
    apple: `https://maps.apple.com/?daddr=${q}`,
    gps: `${l.lat.toFixed(5)}, ${l.lng.toFixed(5)}`,
  }
}
