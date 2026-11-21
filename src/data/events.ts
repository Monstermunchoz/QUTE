/** Soirées de démonstration : à remplacer par l'agenda transmis par les établissements partenaires. */
export type Soiree = {
  id: string
  titre: string
  lieuId: string
  quand: string
  heure: string
  theme: string
  pour: string
  participants: number
}

export const SOIREES: Soiree[] = [
  { id: 's1', titre: 'Soirée couples', lieuId: 'quai45', quand: 'Sam. 22 nov.', heure: '22h', theme: 'Dress code noir & rouge', pour: 'Couples et femmes seules', participants: 23 },
  { id: 's2', titre: 'Afterwork libertin', lieuId: 'badabar', quand: 'Jeu. 27 nov.', heure: '19h', theme: 'Un premier verre pour se découvrir', pour: 'Tous profils', participants: 14 },
  { id: 's3', titre: 'Nuit masquée', lieuId: 'mask', quand: 'Ven. 28 nov.', heure: '23h', theme: 'Masque obligatoire, fourni à l’entrée', pour: 'Couples, femmes seules', participants: 41 },
  { id: 's4', titre: 'Soirée licornes', lieuId: 'chandelles', quand: 'Sam. 29 nov.', heure: '21h30', theme: 'Dîner puis club', pour: 'Couples et licornes', participants: 36 },
  { id: 's5', titre: 'Après-midi toutes tendances', lieuId: 'atlantide', quand: 'Dim. 30 nov.', heure: '14h', theme: 'Ouvert à tous les genres et orientations', pour: 'Tous profils', participants: 18 },
  { id: 's6', titre: 'Spéciale débutants', lieuId: 'club72', quand: 'Ven. 5 déc.', heure: '21h', theme: 'Visite guidée et apéro d’accueil', pour: 'Couples débutants', participants: 12 },
]
