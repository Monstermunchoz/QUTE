export const PLANS = {
  qute_plus: {
    nom: "QUTE+",
    mensuel: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS_MENSUEL ?? "",
      montant: "9,99 €",
    },
    annuel: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS_ANNUEL ?? "",
      montant: "79,99 €",
    },
  },
  qute_club: {
    nom: "QUTE Club",
    mensuel: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLUB_MENSUEL ?? "",
      montant: "19,99 €",
    },
    annuel: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CLUB_ANNUEL ?? "",
      montant: "159,99 €",
    },
  },
} as const;

export type PaidPlanId = keyof typeof PLANS;
export type BillingInterval = "mensuel" | "annuel";

export function getSiteUrl() {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3001";
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://qute.fr";
}

export function allowedPriceIds() {
  return new Set(
    [
      PLANS.qute_plus.mensuel.priceId,
      PLANS.qute_plus.annuel.priceId,
      PLANS.qute_club.mensuel.priceId,
      PLANS.qute_club.annuel.priceId,
    ].filter(Boolean),
  );
}

export function isAllowedPriceId(priceId: string) {
  return allowedPriceIds().has(priceId);
}

export function planFromPriceId(priceId: string | null | undefined): PaidPlanId | null {
  if (!priceId) {
    return null;
  }

  if (
    priceId === PLANS.qute_plus.mensuel.priceId ||
    priceId === PLANS.qute_plus.annuel.priceId
  ) {
    return "qute_plus";
  }

  if (
    priceId === PLANS.qute_club.mensuel.priceId ||
    priceId === PLANS.qute_club.annuel.priceId
  ) {
    return "qute_club";
  }

  return null;
}

export function planLabel(plan: string | null | undefined) {
  if (plan === "qute_plus") {
    return "QUTE+";
  }

  if (plan === "qute_club") {
    return "QUTE Club";
  }

  return "Gratuit";
}
