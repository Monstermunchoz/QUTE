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
    certifications: 14, verifie: true, enLigne: true, ceSoir: 'quai45', photos: 12, privees: 3, teinte: 350,
  },
  {
    id: 'sofia', nom: 'Sofia', type: 'femme', etiquette: 'Licorne',
    partenaires: [{ role: 'Elle', age: 31, orientation: 'bi', taille: '1m65', mot: 'solaire' }],
    ville: 'Lyon 6e', lat: 45.77, lng: 4.85,
    bio: 'Licorne assumée. J’aime les couples complices, l’humour et les soirées qui commencent par un vrai échange.',
    envies: ['triolisme', 'soft', 'exhib'], peutEtre: ['full'], limites: ['Hommes seuls', 'Photos de visage'],
    certifications: 6, verifie: true, enLigne: true, photos: 8, privees: 4, teinte: 18,
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
    certifications: 21, verifie: true, enLigne: false, ceSoir: 'chandelles', photos: 15, privees: 6, teinte: 330,
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
    certifications: 5, verifie: true, enLigne: true, ceSoir: 'taken', photos: 10, privees: 2, teinte: 300,
  },
  {
    id: 'karim', nom: 'Karim', type: 'homme', etiquette: 'Célibertin',
    partenaires: [{ role: 'Lui', age: 38, orientation: 'hétéro', taille: '1m85', mot: 'discret' }],
    ville: 'Marseille 8e', lat: 43.27, lng: 5.39,
    bio: 'Célibertin certifié par des couples. Discret, élégant, à l’écoute. Je ne viens jamais sans y être invité.',
    envies: ['triolisme', 'candaulisme', 'full'], peutEtre: ['gangbang'], limites: ['Sans protection'],
    certifications: 9, verifie: true, enLigne: true, photos: 6, privees: 2, teinte: 25,
  },
  {
    id: 'alex', nom: 'Alex', type: 'trans', etiquette: 'Femme trans',
    partenaires: [{ role: 'Elle', age: 27, orientation: 'pansexuelle', mot: 'lumineuse' }],
    ville: 'Paris 12e', lat: 48.84, lng: 2.39,
    bio: 'Femme trans, libertine et fière. Je cherche des personnes et des couples bienveillants, sans fétichisation.',
    envies: ['soft', 'exhib', 'voyeur'], peutEtre: ['triolisme'], limites: ['Questions sur ma transition'],
    certifications: 4, verifie: true, enLigne: false, ceSoir: 'atlantide', photos: 9, privees: 3, teinte: 280,
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
    certifications: 11, verifie: true, enLigne: true, ceSoir: 'sunlyon', photos: 11, privees: 5, teinte: 210,
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
    certifications: 0, verifie: true, enLigne: true, ceSoir: 'club72', photos: 5, privees: 1, teinte: 10,
  },
  {
    id: 'victoire', nom: 'Victoire', type: 'femme', etiquette: 'Célibertine',
    partenaires: [{ role: 'Elle', age: 47, orientation: 'hétéro', mot: 'raffinée' }],
    ville: 'Nancy', lat: 48.69, lng: 6.18,
    bio: 'Célibertine épicurienne. Les châteaux, le champagne, les gens bien élevés. Exhibitionniste à mes heures.',
    envies: ['exhib', 'triolisme', 'candaulisme'], peutEtre: ['gangbang'], limites: ['Hommes de moins de 35 ans'],
    certifications: 17, verifie: true, enLigne: false, ceSoir: 'aphrodite', photos: 7, privees: 4, teinte: 0,
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
    certifications: 32, verifie: true, enLigne: true, ceSoir: 'libertix', photos: 14, privees: 8, teinte: 340,
  },
]

export const profilById = (id: string) => PROFILS.find((p) => p.id === id)
