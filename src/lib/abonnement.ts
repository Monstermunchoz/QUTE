export type Abonnement = "gratuit" | "qute_plus" | "qute_club";

export function normalizeAbonnement(value: string | null | undefined): Abonnement {
  if (value === "qute_plus" || value === "qute_club") {
    return value;
  }

  return "gratuit";
}

export function isQutePlus(value: string | null | undefined) {
  const plan = normalizeAbonnement(value);
  return plan === "qute_plus" || plan === "qute_club";
}

export function abonnementLabel(value: string | null | undefined) {
  const plan = normalizeAbonnement(value);

  if (plan === "qute_plus") {
    return "QUTE+";
  }

  if (plan === "qute_club") {
    return "Club";
  }

  return "Gratuit";
}
