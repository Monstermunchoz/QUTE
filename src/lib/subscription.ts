export type AbonnementStatut =
  | "inactif"
  | "essai"
  | "actif"
  | "annule"
  | "impaye";

export type ProfilAbonnement = {
  abonnement?: string | null;
  abonnement_statut?: string | null;
  abonnement_fin?: string | null;
  essai_utilise?: boolean | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
} | null;

const PLANS_PAYANTS = ["qute_plus", "qute_club"];
const STATUTS_ACTIFS = ["essai", "actif", "annule"];

export function estPremium(profil: ProfilAbonnement): boolean {
  return (
    PLANS_PAYANTS.includes(profil?.abonnement ?? "") &&
    STATUTS_ACTIFS.includes(profil?.abonnement_statut ?? "")
  );
}

export function estClub(profil: ProfilAbonnement): boolean {
  return (
    profil?.abonnement === "qute_club" &&
    STATUTS_ACTIFS.includes(profil?.abonnement_statut ?? "")
  );
}

export function joursRestants(fin: string | null | undefined) {
  if (!fin) {
    return 0;
  }

  const end = new Date(fin).getTime();

  if (Number.isNaN(end)) {
    return 0;
  }

  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}
