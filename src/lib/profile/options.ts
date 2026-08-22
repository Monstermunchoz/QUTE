export const IDENTITES = [
  "Femme",
  "Homme",
  "Femme trans",
  "Homme trans",
  "Non-binaire",
  "Genderfluid",
  "Agenre",
  "Intersexe",
  "Queer",
  "En questionnement",
  "Autre",
] as const;

export const ORIENTATIONS = [
  "Lesbienne",
  "Gay",
  "Bi",
  "Pan",
  "Asexuel·le",
  "Demisexuel·le",
  "Queer",
  "Hétéro",
  "En questionnement",
  "Autre",
] as const;

export const RECHERCHES = [
  "Des amis",
  "Une relation",
  "Du fun",
  "Des sorties",
  "Du réseau",
  "Je verrai bien",
] as const;

export const INTERETS = [
  "Techno",
  "Pop",
  "Rap",
  "Rock",
  "Jazz",
  "Drag",
  "Cinéma",
  "Séries",
  "Lecture",
  "Art",
  "Photo",
  "Sport",
  "Fitness",
  "Randonnée",
  "Cuisine",
  "Voyage",
  "Jeux vidéo",
  "Militantisme",
  "Mode",
  "Tatouage",
  "Nature",
  "Fêtes",
  "Bars",
  "Clubs",
  "Festivals",
] as const;

export const LANGUES = [
  "Français",
  "Anglais",
  "Espagnol",
  "Italien",
  "Allemand",
  "Arabe",
  "Portugais",
  "Autre",
] as const;

export const ZONES_LYON = [
  "Presqu'île",
  "Croix-Rousse",
  "Guillotière",
  "Part-Dieu",
  "Confluence",
  "Vieux Lyon",
  "Villeurbanne",
  "Vaise",
  "Gerland",
  "Autre commune de la Métropole",
] as const;

export const VISIBILITE_OPTIONS = [
  { value: "public", label: "Tout le monde" },
  { value: "matchs", label: "Mes matchs uniquement" },
  { value: "prive", label: "Personne" },
] as const;

export type VisibiliteChamp = "public" | "matchs" | "prive";

export function normalizeVisibilite(
  value: string | null | undefined,
): VisibiliteChamp {
  if (value === "matchs" || value === "prive") {
    return value;
  }

  return "public";
}

export function canSeeChamp(
  visibilite: string | null | undefined,
  isMatch: boolean,
) {
  const value = normalizeVisibilite(visibilite);

  if (value === "prive") {
    return false;
  }

  if (value === "matchs") {
    return isMatch;
  }

  return true;
}
