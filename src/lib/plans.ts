import type { Abonnement } from "@/lib/abonnement";

export type PlanId = Abonnement;

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  note: string | null;
  noteAccent: boolean;
  items: string[];
  featured: boolean;
  badge: string | null;
  badgeGradient: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "gratuit",
    name: "Gratuit",
    tagline: "L'essentiel pour faire partie de la communauté",
    price: "0€",
    note: null,
    noteAccent: false,
    items: [
      "Profil complet et album photo",
      "Exploration illimitée des profils",
      "20 QRUSH par jour",
      "Matchs et messages illimités",
      "Accès à tous les salons publics",
      "CE SOIR et JE SORS",
      "Carte des lieux",
      "Agenda des événements",
    ],
    featured: false,
    badge: null,
    badgeGradient: false,
  },
  {
    id: "qute_plus",
    name: "QUTE+",
    tagline: "Pour ceux qui veulent vraiment rencontrer",
    price: "9,99€",
    note: "7 jours offerts · ou 79,99€/an",
    noteAccent: true,
    items: [
      "Tout le gratuit",
      "Vois qui t'a QRUSHé",
      "QRUSH illimités",
      "Crée tes propres salons",
      "Crée tes événements",
      "Filtres avancés — identité, âge, zone",
      "Priorité dans l'exploration",
      "Badge QUTE+ sur ton profil",
      "Mode discret — navigue sans apparaître en ligne",
    ],
    featured: true,
    badge: "LE PLUS POPULAIRE",
    badgeGradient: false,
  },
  {
    id: "qute_club",
    name: "QUTE Club",
    tagline: "L'expérience complète",
    price: "19,99€",
    note: "7 jours offerts · ou 159,99€/an",
    noteAccent: false,
    items: [
      "Tout QUTE+",
      "Profil boosté — mis en avant chaque semaine",
      "Événements exclusifs QUTE",
      "10% de remise permanente sur le QUTE Shop",
      "Statistiques de profil — vues, QRUSH, matchs",
      "Badge Club",
      "Support prioritaire",
      "Accès anticipé aux nouveautés",
    ],
    featured: false,
    badge: "PREMIUM",
    badgeGradient: true,
  },
];
