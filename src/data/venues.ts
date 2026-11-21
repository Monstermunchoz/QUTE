/**
 * Annuaire des lieux libertins.
 * Première base, établie à partir de sources publiques (lien `source`).
 * `verifie: false` : horaires, ouverture et coordonnées exactes restent à confirmer
 * auprès de chaque établissement avant la mise en ligne.
 * Les coordonnées GPS sont approximatives (niveau rue) et doivent être géocodées.
 */
export type TypeLieu = 'club' | 'sauna' | 'bar'

export type Lieu = {
  id: string
  nom: string
  type: TypeLieu
  adresse?: string
  ville: string
  cp?: string
  region: string // code région INSEE
  lat: number
  lng: number
  ambiance: string
  accueil?: string
  source: string
  verifie: boolean
}

export const TYPE_LABEL: Record<TypeLieu, string> = {
  club: 'Club libertin',
  sauna: 'Sauna libertin',
  bar: 'Bar libertin',
}

export const LIEUX: Lieu[] = [
  // Île-de-France
  { id: 'chandelles', nom: 'Les Chandelles', type: 'club', adresse: '1 rue Thérèse', cp: '75001', ville: 'Paris', region: '11', lat: 48.8655, lng: 2.3355, ambiance: 'Le plus select de Paris. Dîner dès 21h30, l’ambiance monte après minuit.', accueil: 'Sélection stricte à l’entrée le week-end', source: 'https://www.pariszigzag.fr/top-redac/clubs-libertins-paris/', verifie: false },
  { id: 'mask', nom: 'Le Mask', type: 'club', adresse: '18 rue Feydeau', cp: '75002', ville: 'Paris', region: '11', lat: 48.8705, lng: 2.3405, ambiance: 'Chic mais détendu. Banquettes tamisées au rez-de-chaussée, salons collectifs au sous-sol.', source: 'https://www.pariszigzag.fr/top-redac/clubs-libertins-paris/', verifie: false },
  { id: 'overside', nom: 'L’Overside', type: 'club', adresse: '92 rue du Cherche-Midi', cp: '75006', ville: 'Paris', region: '11', lat: 48.8475, lng: 2.3215, ambiance: 'Festif, DJ et piste sur plusieurs niveaux. Apprécié des jeunes couples.', accueil: 'Femmes seules non admises', source: 'https://www.pariszigzag.fr/top-redac/clubs-libertins-paris/', verifie: false },
  { id: 'taken', nom: 'Le Taken', type: 'club', adresse: '8 rue Le Regrattier', cp: '75004', ville: 'Paris', region: '11', lat: 48.852, lng: 2.354, ambiance: 'Cave voûtée d’inspiration XVIIIe sur l’île Saint-Louis. Salle des miroirs, grand lit, alcôve SM.', source: 'https://www.pariszigzag.fr/top-redac/clubs-libertins-paris/', verifie: false },
  { id: 'mooncity', nom: 'Moon City', type: 'sauna', adresse: '34 boulevard de Clichy', cp: '75018', ville: 'Paris', region: '11', lat: 48.8825, lng: 2.3375, ambiance: 'Sauna-hammam naturiste à Pigalle, décor asiatique, jacuzzi et « village coquin » d’une dizaine d’alcôves.', source: 'https://www.pariszigzag.fr/top-redac/clubs-libertins-paris/', verifie: false },
  { id: 'atlantide', nom: 'Atlantide', type: 'sauna', adresse: '13 rue Parrot', cp: '75012', ville: 'Paris', region: '11', lat: 48.846, lng: 2.374, ambiance: 'Sauna libertin ouvert à toutes les tendances depuis 1999 : couples, femmes, bi, gays, trans. Après-midis à thème.', source: 'https://outxout.com/venue/atlantidesaunaparisparis', verifie: false },

  // Auvergne-Rhône-Alpes
  { id: 'quai45', nom: 'Le Quai 45', type: 'club', adresse: '45 quai Clemenceau', cp: '69300', ville: 'Caluire-et-Cuire', region: '84', lat: 45.7955, lng: 4.835, ambiance: 'Sur les quais du Rhône, près de l’île Barbe. L’adresse lyonnaise recommandée par le Petit Futé.', source: 'https://www.petitfute.com/v36003-caluire-et-cuire-69300/c1172-pense-fute-services/c1043-celibataires-club-de-rencontres', verifie: false },
  { id: 'badabar', nom: 'Bada Bar', type: 'bar', adresse: '44 quai du Dr Gailleton', cp: '69002', ville: 'Lyon', region: '84', lat: 45.755, lng: 4.838, ambiance: 'Bar lounge à rencontres libertin, dress code soigné, soirées à thème du mardi au samedi. Idéal pour un premier verre.', source: 'https://www.privateaser.com/lieu/65317-club-libertin-lyon-bada-bar', verifie: false },
  { id: 'sunlyon', nom: 'Le Sun', type: 'sauna', adresse: '3 rue Sainte-Marie-des-Terreaux', cp: '69001', ville: 'Lyon', region: '84', lat: 45.768, lng: 4.833, ambiance: 'Très grand sauna. Soirées gays du dimanche au mardi, club libertin mixte du mercredi au samedi.', source: 'https://www.gayout.com/en/europe/france/lyon/saunas/le-sun-lyon', verifie: false },
  { id: 'oasislyon', nom: 'Oasis Club', type: 'sauna', adresse: '2 rue Coustou', cp: '69001', ville: 'Lyon', region: '84', lat: 45.769, lng: 4.83, ambiance: 'Sauna libertin ouvert à tous, personnes LGBT et trans comprises. Réservé aux hommes trois jours par semaine.', source: 'https://www.misterbandb.com/fr/guide-gay/france/58-saunas-et-cruising', verifie: false },

  // Provence-Alpes-Côte d'Azur
  { id: 'vahine', nom: 'Club Le Vahiné', type: 'club', adresse: '254 chemin de l’Armée d’Afrique', ville: 'Marseille', region: '93', lat: 43.295, lng: 5.41, ambiance: 'Club libertin et échangiste marseillais.', source: 'https://www.petitfute.com/z230-route-de-la-soie/c9998-coquin/c1044-s-amuser-sortir', verifie: false },
  { id: 'saunaclubmrs', nom: 'Sauna Club', type: 'sauna', adresse: '117 La Canebière', ville: 'Marseille', region: '93', lat: 43.299, lng: 5.388, ambiance: 'Sauna coquin en plein centre, sur la Canebière.', source: 'https://www.petitfute.com/z230-route-de-la-soie/c9998-coquin/c1044-s-amuser-sortir', verifie: false },

  // Occitanie
  { id: 'club72', nom: 'Club 72', type: 'sauna', adresse: '72 allée de Barcelone', cp: '31000', ville: 'Toulouse', region: '76', lat: 43.605, lng: 1.43, ambiance: 'Sauna, balnéo et espace libertin : piste de danse, bar, soirées couples.', source: 'https://www.pagesjaunes.fr/pros/08043944', verifie: false },
  { id: 'libertix', nom: 'Libertix', type: 'club', adresse: '42 rue du Midi', cp: '34500', ville: 'Béziers', region: '76', lat: 43.342, lng: 3.215, ambiance: 'Club libertin biterrois, à deux pas du Cap d’Agde.', source: 'https://trouver-ouvert.fr/le-plus-proche/club-priv%C3%A9', verifie: false },

  // Grand Est
  { id: 'aphrodite', nom: 'Le Château d’Aphrodite', type: 'club', ville: 'Haraucourt', cp: '54110', region: '44', lat: 48.66, lng: 6.36, ambiance: 'Un vrai château décoré avec goût, atmosphère chic et discrète. Pensé pour les couples.', source: 'https://www.pariszigzag.fr/top-redac/les-lieux-libertins-preferes-des-francais/', verifie: false },

  // Bourgogne-Franche-Comté
  { id: 'bossuet', nom: 'Le Bossuet', type: 'sauna', ville: 'Dijon', region: '27', lat: 47.3215, lng: 5.041, ambiance: 'Sauna-club gay et libertin de plus de 1 000 m² sur trois étages, l’un des plus anciens de France.', source: 'https://www.misterbandb.com/fr/guide-gay/france/58-saunas-et-cruising', verifie: false },
]

export const lieuById = (id: string) => LIEUX.find((l) => l.id === id)
