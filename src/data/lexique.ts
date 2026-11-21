/**
 * Le dictionnaire communautaire de QUTE.
 * `pratique: true` = la notion peut être choisie comme envie sur un profil.
 */
export type Terme = {
  id: string
  mot: string
  definition: string
  famille: 'Pratiques' | 'Profils' | 'Codes & culture' | 'Consentement'
  pratique?: boolean
}

export const LEXIQUE: Terme[] = [
  // Pratiques
  { id: 'soft', mot: 'Soft', famille: 'Pratiques', pratique: true, definition: "Jeux doux avec d'autres partenaires : caresses, baisers, sans pénétration hors du couple." },
  { id: 'full', mot: 'Full swap', famille: 'Pratiques', pratique: true, definition: 'Échange complet : tout est possible entre partenaires consentants.' },
  { id: 'melangisme', mot: 'Mélangisme', famille: 'Pratiques', pratique: true, definition: 'Plusieurs couples ensemble, mais la pénétration reste réservée au couple légitime.' },
  { id: 'echangisme', mot: 'Échangisme', famille: 'Pratiques', pratique: true, definition: 'Plusieurs couples ensemble, avec échange de partenaires, pénétration comprise.' },
  { id: 'cote', mot: 'Côte-à-côtisme', famille: 'Pratiques', pratique: true, definition: 'Deux couples ou plus font l’amour dans la même pièce, chacun de son côté, sans se toucher.' },
  { id: '2plus2', mot: '2 + 2', famille: 'Pratiques', pratique: true, definition: "Échange où chaque nouveau duo s'isole dans une pièce séparée." },
  { id: 'candaulisme', mot: 'Candaulisme', famille: 'Pratiques', pratique: true, definition: 'Le plaisir de regarder ou d’offrir son ou sa partenaire à une autre personne.' },
  { id: 'cuckolding', mot: 'Cuckolding', famille: 'Pratiques', pratique: true, definition: 'Variante du candaulisme où seule la femme a des rapports avec d’autres partenaires.' },
  { id: 'triolisme', mot: 'Triolisme', famille: 'Pratiques', pratique: true, definition: 'Une rencontre à trois : FHF, HFH ou toute autre combinaison.' },
  { id: 'exhib', mot: 'Exhibitionnisme', famille: 'Pratiques', pratique: true, definition: 'Le plaisir de se montrer, toujours devant des personnes qui ont accepté de regarder.' },
  { id: 'voyeur', mot: 'Voyeurisme', famille: 'Pratiques', pratique: true, definition: 'Le plaisir de regarder les autres, avec leur accord.' },
  { id: 'gangbang', mot: 'Gang bang', famille: 'Pratiques', pratique: true, definition: 'Une personne et plusieurs partenaires, successivement, dans un cadre convenu à l’avance.' },
  { id: 'bdsm', mot: 'BDSM', famille: 'Pratiques', pratique: true, definition: 'Bondage, discipline, domination, soumission, sadisme, masochisme. Se pratique avec règles et mot de sécurité.' },
  { id: 'fetish', mot: 'Fétichisme', famille: 'Pratiques', pratique: true, definition: 'Attirance pour une matière, une tenue, une partie du corps ou une situation.' },
  { id: 'vanille', mot: 'Vanille', famille: 'Pratiques', definition: 'Sexualité conventionnelle, sans jeux particuliers. On dit aussi « vanilla ».' },

  // Profils
  { id: 'couple-legitime', mot: 'Couple légitime', famille: 'Profils', definition: 'Le couple « de la vraie vie », par opposition aux duos d’un soir.' },
  { id: 'couple-certifie', mot: 'Couple certifié', famille: 'Profils', definition: 'Couple dont l’authenticité a été confirmée par d’autres membres rencontrés en vrai.' },
  { id: 'celibertin', mot: 'Célibertin', famille: 'Profils', definition: 'Homme libertin célibataire.' },
  { id: 'celibertine', mot: 'Célibertine', famille: 'Profils', definition: 'Femme libertine célibataire.' },
  { id: 'licorne', mot: 'Licorne', famille: 'Profils', definition: 'Femme hétéro ou bi qui aime partager des moments avec les couples. Très recherchée, d’où le nom.' },
  { id: 'rhino', mot: 'Rhino', famille: 'Profils', definition: 'Homme hétéro ou bi qui aime partager des moments avec les couples.' },
  { id: 'bull', mot: 'Bull', famille: 'Profils', definition: 'Homme invité par un couple pour être avec la femme, souvent dans un cadre candauliste.' },
  { id: 'hotwife', mot: 'Hotwife', famille: 'Profils', definition: 'Femme en couple qui a des aventures avec l’accord, et souvent l’encouragement, de son partenaire.' },
  { id: 'switch', mot: 'Switch', famille: 'Profils', definition: 'Personne qui peut être dominante ou soumise selon le moment.' },
  { id: 'moldu', mot: 'Moldu', famille: 'Profils', definition: 'Personne extérieure au milieu libertin. Clin d’œil à Harry Potter.' },
  { id: 'debutant', mot: 'Débutants', famille: 'Profils', definition: 'Couple ou personne qui découvre. Ici, on prend le temps : un verre d’abord, et rien n’est obligatoire.' },

  // Codes & culture
  { id: 'tarte', mot: 'Tarte aux fraises', famille: 'Codes & culture', definition: 'Légende du milieu : apporter une tarte aux fraises à un dîner chez un couple serait une invitation coquine. Sur QUTE, c’est notre super like.' },
  { id: 'ananas', mot: 'Ananas à l’envers', famille: 'Codes & culture', definition: 'Signe de reconnaissance d’origine américaine, sur un objet, un vêtement ou un bijou. Ne prouve rien : seule une vraie conversation compte.' },
  { id: 'bague-noire', mot: 'Bague noire', famille: 'Codes & culture', definition: 'Bague portée à la main droite, parfois vue comme un signe d’ouverture. Là aussi, ça ne remplace jamais une question.' },
  { id: 'compersion', mot: 'Compersion', famille: 'Codes & culture', definition: 'La joie de voir son ou sa partenaire prendre du plaisir avec quelqu’un d’autre. Le contraire de la jalousie.' },
  { id: 'soiree-couples', mot: 'Soirée couples', famille: 'Codes & culture', definition: 'Soirée de club réservée aux couples, parfois ouverte aux femmes seules.' },
  { id: 'droit-entree', mot: 'Droit d’entrée', famille: 'Codes & culture', definition: 'Prix d’entrée en club. Il est souvent différent pour les couples, les femmes seules et les hommes seuls.' },

  // Consentement
  { id: 'non', mot: 'Non, c’est non', famille: 'Consentement', definition: 'Règle d’or. Un signe de la main, un pas en arrière ou un « non merci » suffit : on n’insiste jamais.' },
  { id: 'safeword', mot: 'Mot de sécurité', famille: 'Consentement', definition: 'Mot convenu à l’avance qui arrête tout, immédiatement et sans discussion.' },
  { id: 'negociation', mot: 'Négociation', famille: 'Consentement', definition: 'Discussion avant la rencontre pour poser envies et limites, en couple puis avec les autres.' },
  { id: 'aftercare', mot: 'Aftercare', famille: 'Consentement', definition: 'Le moment d’attention et de douceur qu’on s’accorde après la rencontre.' },
  { id: 'ssc', mot: 'SSC', famille: 'Consentement', definition: 'Safe, Sane, Consensual : sûr, sain et consenti. Le socle de toutes les pratiques.' },
]

export const PRATIQUES = LEXIQUE.filter((t) => t.pratique)
export const termeById = (id: string) => LEXIQUE.find((t) => t.id === id)
