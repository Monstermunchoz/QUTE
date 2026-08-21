import type { EvenementCategorie } from "@/types";

export const EVENT_CATEGORIES: { id: EvenementCategorie; label: string }[] = [
  { id: "soiree", label: "Soirée" },
  { id: "concert", label: "Concert" },
  { id: "culture", label: "Culture" },
  { id: "sport", label: "Sport" },
  { id: "rencontre", label: "Rencontre" },
  { id: "association", label: "Association" },
  { id: "autre", label: "Autre" },
];

export function eventCategoryLabel(categorie: EvenementCategorie | null) {
  return EVENT_CATEGORIES.find((item) => item.id === categorie)?.label ?? categorie;
}
