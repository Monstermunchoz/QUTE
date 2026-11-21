/** Profils de démonstration : aucune vraie personne. */
export type TypeProfil = 'couple-fh' | 'couple-ff' | 'couple-hh' | 'femme' | 'homme' | 'trans'

export const TYPE_PROFIL_LABEL: Record<TypeProfil, string> = {
  'couple-fh': 'Couple F/H',
  'couple-ff': 'Couple F/F',
  'couple-hh': 'Couple H/H',
  femme: 'Femme',
  homme: 'Homme',
  trans: 'Trans',
}

export type Filtre = 'tous' | 'couples' | 'femmes' | 'hommes' | 'trans'

export const FILTRES: { id: Filtre; label: string; match: TypeProfil[] }[] = [
  { id: 'tous', label: 'Tous', match: ['couple-fh', 'couple-ff', 'couple-hh', 'femme', 'homme', 'trans'] },
  { id: 'couples', label: 'Couples', match: ['couple-fh', 'couple-ff', 'couple-hh'] },
  { id: 'femmes', label: 'Femmes', match: ['femme'] },
  { id: 'hommes', label: 'Hommes', match: ['homme'] },
  { id: 'trans', label: 'Trans', match: ['trans'] },
]

export type Partenaire = { role: 'Elle' | 'Lui' | 'Iel'; age: number; orientation: string; taille?: string; mot?: string }

export type Profil = {
  id: string
  nom: string
  type: TypeProfil
  etiquette?: string // licorne, célibertin, hotwife…
  partenaires: Partenaire[]
  ville: string
  lat: number
  lng: number
  bio: string
  envies: string[] // ids du lexique
  peutEtre: string[]
  limites: string[]
  certifications: number
  verifie: boolean
  enLigne: boolean
  ceSoir?: string // id de lieu
  depuis?: string
  photos: number
  privees: number
  teinte: number // teinte du portrait généré
  vu: number // minutes depuis la dernière activité (0 = en ligne)
  recherche: string[] // ids de RECHERCHE
  dispo: string[]
  ouRencontrer: string[]
  experience: 'Débutants' | 'Occasionnels' | 'Confirmés'
}

/** Ce que l'on peut rechercher. */
export const RECHERCHE = ['Couples F/H', 'Couples F/F', 'Couples H/H', 'Femmes', 'Hommes', 'Personnes trans', 'Non-binaires'] as const
export const DISPOS = ['En semaine', 'Le week-end', 'En journée', 'En soirée', 'Ce soir', 'En vacances'] as const
export const OU = ['En club', 'En sauna', 'Chez nous', 'Chez vous', 'À l’hôtel', 'En naturisme', 'Au Cap d’Agde', 'En soirée privée'] as const
export const EXPERIENCES = ['Débutants', 'Occasionnels', 'Confirmés'] as const
export const LIMITES = ['Protection toujours', 'Un verre d’abord', 'Pas d’hommes seuls', 'Pas de photos de visage', 'Pas d’échange de partenaire', 'Même pièce seulement', 'Sans alcool', 'Discrétion absolue'] as const
export const SILHOUETTES = ['Mince', 'Sportive', 'Normale', 'Ronde', 'Pulpeuse', 'Musclée'] as const
export const ORIENTATIONS = ['Hétéro', 'Bi', 'Bi-curieux·se', 'Gay', 'Lesbienne', 'Pansexuel·le', 'Queer'] as const

/** « En ligne », « Actif il y a 2 h »… */
export function presence(vu: number) {
  if (vu <= 0) return { enLigne: true, texte: 'En ligne' }
  if (vu < 60) return { enLigne: false, texte: `Actif il y a ${vu} min` }
  if (vu < 60 * 24) return { enLigne: false, texte: `Actif il y a ${Math.round(vu / 60)} h` }
  return { enLigne: false, texte: `Actif il y a ${Math.round(vu / 1440)} j` }
}

export const PROFILS: Profil[] = [
  {
    id: 'lea-marc', nom: 'Léa & Marc', type: 'couple-fh',
    partenaires: [
      { role: 'Elle', age: 34, orientation: 'bi', taille: '1m68', mot: 'curieuse' },
      { role: 'Lui', age: 37, orientation: 'hétéro', taille: '1m82', mot: 'attentionné' },
    ],
    ville: 'Lyon 2e', lat: 45.757, lng: 4.832, depuis: '9 ans',
    bio: 'Complices depuis 9 ans. On aime les dîners qui finissent tard et prendre le temps de se découvrir autour d’un verre.',
    envies: ['soft', 'cote', 'melangisme'], peutEtre: ['echangisme'], limites: ['Hommes seuls', 'Sans protection'],
    certifications: 14, verifie: true, enLigne: true, ceSoir: 'quai45', photos: 12, privees: 3, teinte: 350, vu: 0, recherche: ['Couples F/H', 'Femmes'], dispo: ['Le week-end', 'Ce soir'], ouRencontrer: ['En club', 'Chez nous'], experience: 'Confirmés',
  },
  {
    id: 'sofia', nom: 'Sofia', type: 'femme', etiquette: 'Licorne',
    partenaires: [{ role: 'Elle', age: 31, orientation: 'bi', taille: '1m65', mot: 'solaire' }],
    ville: 'Lyon 6e', lat: 45.77, lng: 4.85,
    bio: 'Licorne assumée. J’aime les couples complices, l’humour et les soirées qui commencent par un vrai échange.',
    envies: ['triolisme', 'soft', 'exhib'], peutEtre: ['full'], limites: ['Hommes seuls', 'Photos de visage'],
    certifications: 6, verifie: true, enLigne: true, photos: 8, privees: 4, teinte: 18, vu: 0, recherche: ['Couples F/H', 'Couples F/F'], dispo: ['En soirée', 'Le week-end'], ouRencontrer: ['En club', 'Chez vous', 'À l’hôtel'], experience: 'Occasionnels',
  },
  {
    id: 'claire-hugo', nom: 'Claire & Hugo', type: 'couple-fh', etiquette: 'Hotwife',
    partenaires: [
      { role: 'Elle', age: 42, orientation: 'hétéro', mot: 'joueuse' },
      { role: 'Lui', age: 45, orientation: 'hétéro', mot: 'complice' },
    ],
    ville: 'Paris 17e', lat: 48.884, lng: 2.31, depuis: '15 ans',
    bio: 'Candaulistes depuis quelques années. Lui regarde, elle profite. Nous cherchons un homme élégant et respectueux.',
    envies: ['candaulisme', 'cuckolding', 'voyeur'], peutEtre: ['triolisme'], limites: ['Couples', 'Rencontre sans verre avant'],
    certifications: 21, verifie: true, enLigne: false, ceSoir: 'chandelles', photos: 15, privees: 6, teinte: 330, vu: 140, recherche: ['Hommes'], dispo: ['En semaine', 'En soirée'], ouRencontrer: ['À l’hôtel', 'En club'], experience: 'Confirmés',
  },
  {
    id: 'nina-ines', nom: 'Nina & Inès', type: 'couple-ff',
    partenaires: [
      { role: 'Elle', age: 29, orientation: 'lesbienne', mot: 'douce' },
      { role: 'Elle', age: 33, orientation: 'bi', mot: 'audacieuse' },
    ],
    ville: 'Paris 11e', lat: 48.859, lng: 2.38, depuis: '4 ans',
    bio: 'Un couple de femmes qui aime les belles soirées en club et les rencontres avec des femmes ou des couples F/F.',
    envies: ['soft', 'exhib', 'cote'], peutEtre: ['melangisme'], limites: ['Hommes seuls'],
    certifications: 5, verifie: true, enLigne: true, ceSoir: 'taken', photos: 10, privees: 2, teinte: 300, vu: 0, recherche: ['Femmes', 'Couples F/F'], dispo: ['Le week-end'], ouRencontrer: ['En club', 'En soirée privée'], experience: 'Occasionnels',
  },
  {
    id: 'karim', nom: 'Karim', type: 'homme', etiquette: 'Célibertin',
    partenaires: [{ role: 'Lui', age: 38, orientation: 'hétéro', taille: '1m85', mot: 'discret' }],
    ville: 'Marseille 8e', lat: 43.27, lng: 5.39,
    bio: 'Célibertin certifié par des couples. Discret, élégant, à l’écoute. Je ne viens jamais sans y être invité.',
    envies: ['triolisme', 'candaulisme', 'full'], peutEtre: ['gangbang'], limites: ['Sans protection'],
    certifications: 9, verifie: true, enLigne: true, photos: 6, privees: 2, teinte: 25, vu: 0, recherche: ['Couples F/H', 'Femmes'], dispo: ['En semaine', 'En soirée', 'Ce soir'], ouRencontrer: ['Chez vous', 'À l’hôtel', 'En club'], experience: 'Confirmés',
  },
  {
    id: 'alex', nom: 'Alex', type: 'trans', etiquette: 'Femme trans',
    partenaires: [{ role: 'Elle', age: 27, orientation: 'pansexuelle', mot: 'lumineuse' }],
    ville: 'Paris 12e', lat: 48.84, lng: 2.39,
    bio: 'Femme trans, libertine et fière. Je cherche des personnes et des couples bienveillants, sans fétichisation.',
    envies: ['soft', 'exhib', 'voyeur'], peutEtre: ['triolisme'], limites: ['Questions sur ma transition'],
    certifications: 4, verifie: true, enLigne: false, ceSoir: 'atlantide', photos: 9, privees: 3, teinte: 280, vu: 35, recherche: ['Couples F/H', 'Hommes', 'Femmes'], dispo: ['Le week-end', 'En soirée'], ouRencontrer: ['En sauna', 'En club'], experience: 'Occasionnels',
  },
  {
    id: 'thomas-julien', nom: 'Thomas & Julien', type: 'couple-hh',
    partenaires: [
      { role: 'Lui', age: 35, orientation: 'gay', mot: 'sportif' },
      { role: 'Lui', age: 40, orientation: 'gay', mot: 'épicurien' },
    ],
    ville: 'Lyon 1er', lat: 45.768, lng: 4.835, depuis: '7 ans',
    bio: 'Couple gay ouvert. On aime les saunas, les rencontres à trois et les apéros qui débordent.',
    envies: ['triolisme', 'echangisme', 'voyeur'], peutEtre: ['bdsm'], limites: ['Femmes'],
    certifications: 11, verifie: true, enLigne: true, ceSoir: 'sunlyon', photos: 11, privees: 5, teinte: 210, vu: 0, recherche: ['Hommes', 'Couples H/H'], dispo: ['En journée', 'Le week-end'], ouRencontrer: ['En sauna', 'Chez nous'], experience: 'Confirmés',
  },
  {
    id: 'emma-paul', nom: 'Emma & Paul', type: 'couple-fh', etiquette: 'Débutants',
    partenaires: [
      { role: 'Elle', age: 28, orientation: 'bi-curieuse', mot: 'timide' },
      { role: 'Lui', age: 30, orientation: 'hétéro', mot: 'rassurant' },
    ],
    ville: 'Toulouse', lat: 43.6, lng: 1.44, depuis: '5 ans',
    bio: 'On découvre ! Première fois en club bientôt. On cherche un couple expérimenté et patient pour un verre, sans pression.',
    envies: ['cote', 'voyeur'], peutEtre: ['soft'], limites: ['Échange', 'Hommes seuls'],
    certifications: 0, verifie: true, enLigne: true, ceSoir: 'club72', photos: 5, privees: 1, teinte: 10, vu: 0, recherche: ['Couples F/H'], dispo: ['Le week-end'], ouRencontrer: ['En club', 'En soirée privée'], experience: 'Débutants',
  },
  {
    id: 'victoire', nom: 'Victoire', type: 'femme', etiquette: 'Célibertine',
    partenaires: [{ role: 'Elle', age: 47, orientation: 'hétéro', mot: 'raffinée' }],
    ville: 'Nancy', lat: 48.69, lng: 6.18,
    bio: 'Célibertine épicurienne. Les châteaux, le champagne, les gens bien élevés. Exhibitionniste à mes heures.',
    envies: ['exhib', 'triolisme', 'candaulisme'], peutEtre: ['gangbang'], limites: ['Hommes de moins de 35 ans'],
    certifications: 17, verifie: true, enLigne: false, ceSoir: 'aphrodite', photos: 7, privees: 4, teinte: 0, vu: 1500, recherche: ['Hommes', 'Couples F/H'], dispo: ['En semaine', 'En vacances'], ouRencontrer: ['En club', 'Au Cap d’Agde', 'En naturisme'], experience: 'Confirmés',
  },
  {
    id: 'sam-lou', nom: 'Sam & Lou', type: 'couple-fh',
    partenaires: [
      { role: 'Lui', age: 52, orientation: 'bi', mot: 'élégant' },
      { role: 'Elle', age: 49, orientation: 'bi', mot: 'gourmande' },
    ],
    ville: 'Béziers', lat: 43.344, lng: 3.216, depuis: '22 ans',
    bio: 'Habitués du Cap. 22 ans d’amour, 10 ans de libertinage. On aime le 2 + 2 et les dîners qui virent au mélangisme.',
    envies: ['2plus2', 'echangisme', 'full'], peutEtre: ['bdsm'], limites: ['Moins de 30 ans'],
    certifications: 32, verifie: true, enLigne: true, ceSoir: 'libertix', photos: 14, privees: 8, teinte: 340, vu: 0, recherche: ['Couples F/H', 'Femmes'], dispo: ['Le week-end', 'En vacances'], ouRencontrer: ['Au Cap d’Agde', 'En naturisme', 'Chez nous'], experience: 'Confirmés',
  },
]

export const profilById = (id: string) => PROFILS.find((p) => p.id === id)
