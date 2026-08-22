"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/ui/BackButton";
import { ShopModal } from "@/components/ui/ShopModal";
import type { Abonnement } from "@/lib/abonnement";
import { PLANS } from "@/lib/plans";
import { PLANS as STRIPE_PLANS } from "@/lib/stripe/config";
import { estClub, estPremium, joursRestants } from "@/lib/subscription";
import type { AbonnementStatut } from "@/lib/subscription";

const gradient = { background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" };

type Paiement = {
  id: string;
  montant: number;
  devise: string;
  statut: string;
  plan: string | null;
  facture_url: string | null;
  created_at: string;
};

type PriceIds = {
  qute_plus: { mensuel: string; annuel: string };
  qute_club: { mensuel: string; annuel: string };
};

type AbonnementViewProps = {
  current: Abonnement;
  statut: AbonnementStatut;
  fin: string | null;
  essaiUtilise: boolean;
  hasCustomer: boolean;
  paiements: Paiement[];
  priceIds: PriceIds;
  banner: "success" | "annule" | null;
};

function formatDate(iso: string | null) {
  if (!iso) {
    return null;
  }

  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatMontant(cents: number, devise: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: devise.toUpperCase(),
  }).format(cents / 100);
}

export function AbonnementView({
  current,
  statut,
  fin,
  essaiUtilise,
  hasCustomer,
  paiements,
  priceIds,
  banner,
}: AbonnementViewProps) {
  const router = useRouter();
  const [shopOpen, setShopOpen] = useState(false);
  const [periode, setPeriode] = useState<"mensuel" | "annuel">("mensuel");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<"success" | "annule" | null>(banner);
  const premium = estPremium({ abonnement: current, abonnement_statut: statut });
  const club = estClub({ abonnement: current, abonnement_statut: statut });
  const jours = joursRestants(fin);
  const finLabel = formatDate(fin);
  const gratuit = PLANS.find((plan) => plan.id === "gratuit");
  const paidPlans = PLANS.filter((plan) => plan.id !== "gratuit");

  useEffect(() => {
    if (!banner) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setNotice(null);
      router.replace("/abonnement", { scroll: false });
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [banner, router]);

  async function goCheckout(priceId: string, key: string) {
    setError(null);
    setLoading(key);

    if (!priceId) {
      console.error("[checkout] priceId manquant", { key, periode, priceIds });
      setError("Tarif introuvable. Vérifie les clés Stripe.");
      setLoading(null);
      return;
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const payload = (await response.json().catch((parseError) => {
        console.error("[checkout] réponse illisible", parseError);
        return null;
      })) as { url?: string; error?: string } | null;

      if (!response.ok || !payload?.url) {
        console.error("[checkout]", {
          status: response.status,
          priceId,
          key,
          payload,
        });
        setError(payload?.error ?? `Impossible de lancer le paiement (${response.status}).`);
        setLoading(null);
        return;
      }

      window.location.href = payload.url;
    } catch (err) {
      console.error("[checkout]", err);
      setError("Impossible de lancer le paiement.");
      setLoading(null);
    }
  }

  async function goPortal() {
    setError(null);
    setLoading("portal");

    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as {
        url?: string;
        error?: string;
        redirect?: string;
      } | null;

      if (!response.ok || !payload?.url) {
        console.error("[portal]", response.status, payload);
        setLoading(null);
        setError(payload?.error ?? "Aucun abonnement actif via Stripe.");
        router.replace(payload?.redirect ?? "/abonnement");
        return;
      }

      window.location.href = payload.url;
    } catch (err) {
      console.error("[portal]", err);
      setLoading(null);
      setError("Aucun abonnement actif via Stripe.");
      router.replace("/abonnement");
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <PageTitle title="Mon abonnement" />

      {notice === "success" ? (
        <p className="rounded-[12px] bg-[#22C55E]/15 px-4 py-3 text-center text-sm font-bold text-[#22C55E]">
          Bienvenue dans QUTE+ 🎉
        </p>
      ) : null}
      {notice === "annule" ? (
        <p className="rounded-[12px] bg-[#1E1E1E] px-4 py-3 text-center text-sm text-[#888888]">
          Paiement annulé
        </p>
      ) : null}

      {current === "gratuit" ? (
        <article className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5">
          <h2 className="text-lg font-bold text-white">
            Tu es sur l&apos;offre Gratuit
          </h2>
          <p className="mt-2 text-sm text-[#888888]">
            Découvre QUTE+ : qui t&apos;a QRUSHé, salons, événements et filtres
            avancés — 7 jours offerts.
          </p>
        </article>
      ) : (
        <article className="rounded-[16px] p-[2px]" style={gradient}>
          <div className="rounded-[14px] bg-[#111111] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                {current === "qute_club" ? "QUTE Club" : "QUTE+"}
              </h2>
              {statut === "essai" ? (
                <span className="text-sm font-bold text-[#FF2D87]">
                  Essai gratuit — {jours} jour{jours === 1 ? "" : "s"} restant
                  {jours === 1 ? "" : "s"}
                </span>
              ) : null}
              {statut === "actif" ? (
                <span className="text-sm font-bold text-[#22C55E]">Actif</span>
              ) : null}
              {statut === "annule" ? (
                <span className="text-sm font-bold text-[#888888]">
                  Actif jusqu&apos;au {finLabel ?? "…"}
                </span>
              ) : null}
              {statut === "impaye" ? (
                <span className="text-sm font-bold text-[#FF4444]">
                  Paiement en échec
                </span>
              ) : null}
            </div>
            {finLabel && statut !== "annule" ? (
              <p className="mt-2 text-sm text-[#888888]">
                {statut === "essai"
                  ? `Fin de l'essai le ${finLabel}`
                  : `Prochain prélèvement le ${finLabel}`}
              </p>
            ) : null}
            {hasCustomer ? (
              <button
                type="button"
                onClick={() => void goPortal()}
                disabled={loading !== null}
                className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[12px] border border-[#1E1E1E] text-sm font-bold text-white disabled:opacity-50"
              >
                {loading === "portal"
                  ? "Ouverture…"
                  : statut === "impaye"
                    ? "Mettre à jour"
                    : "Gérer mon abonnement"}
              </button>
            ) : (
              <a
                href="mailto:bonjour@qute.app"
                className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[12px] border border-[#1E1E1E] text-sm font-bold text-white"
              >
                Contacter le support
              </a>
            )}
          </div>
        </article>
      )}

      {gratuit ? (
        <article className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5">
          {current === "gratuit" ? (
            <p className="mb-3 w-fit rounded-[8px] bg-[#FF2D87] px-2 py-1 text-[10px] font-bold text-white">
              Ton plan
            </p>
          ) : null}
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-white">{gratuit.name}</h2>
            <p className="text-sm text-[#888888]">
              <span className="font-bold text-white">0€</span>/mois
            </p>
          </div>
          <p className="mt-1 text-[13px] italic text-[#888888]">
            {gratuit.tagline}
          </p>
          <ul className="mt-3">
            {gratuit.items.map((item, index) => (
              <li
                key={item}
                className={`py-2.5 text-sm text-[#CCCCCC] ${
                  index < gratuit.items.length - 1
                    ? "border-b border-[#1E1E1E]"
                    : ""
                }`}
              >
                {item}
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      <div className="flex rounded-[12px] bg-[#111111] p-1">
        <button
          type="button"
          onClick={() => setPeriode("mensuel")}
          className={`flex-1 rounded-[10px] py-2.5 text-sm font-bold ${
            periode === "mensuel" ? "text-white" : "text-[#888888]"
          }`}
          style={periode === "mensuel" ? gradient : undefined}
        >
          Mensuel
        </button>
        <button
          type="button"
          onClick={() => setPeriode("annuel")}
          className={`relative flex flex-1 items-center justify-center gap-2 rounded-[10px] py-2.5 text-sm font-bold ${
            periode === "annuel" ? "text-white" : "text-[#888888]"
          }`}
          style={periode === "annuel" ? gradient : undefined}
        >
          Annuel
          <span className="rounded-[6px] bg-white/15 px-1.5 py-0.5 text-[10px] font-bold text-white">
            2 mois offerts
          </span>
        </button>
      </div>

      {paidPlans.map((plan) => {
        const isCurrent = plan.id === current;
        const stripePlan =
          plan.id === "qute_plus" ? STRIPE_PLANS.qute_plus : STRIPE_PLANS.qute_club;
        const ids = plan.id === "qute_plus" ? priceIds.qute_plus : priceIds.qute_club;
        const annuel = periode === "annuel";
        const price = annuel ? stripePlan.annuel.montant : stripePlan.mensuel.montant;
        const priceId = annuel ? ids.annuel : ids.mensuel;
        const ctaKey = `${plan.id}-${periode}`;
        const busy = loading === ctaKey;
        let cta = "Choisir";

        if (!essaiUtilise && !premium) {
          cta = "Essayer 7 jours gratuitement";
        } else if (essaiUtilise && !premium) {
          cta = "S'abonner";
        } else if (premium && !isCurrent) {
          cta = "Passer à ce plan";
        }

        return (
          <article
            key={plan.id}
            className={`relative rounded-[16px] bg-[#111111] p-5 ${
              plan.featured
                ? "border-2 border-[#FF2D87]"
                : "border border-[#1E1E1E]"
            }`}
          >
            {isCurrent ? (
              <p className="mb-3 w-fit rounded-[8px] bg-[#FF2D87] px-2 py-1 text-[10px] font-bold text-white">
                Ton plan
              </p>
            ) : plan.badge ? (
              <p
                className="mb-3 w-fit rounded-[8px] px-2 py-1 text-[10px] font-bold text-white"
                style={plan.badgeGradient ? gradient : { background: "#FF2D87" }}
              >
                {plan.badge}
              </p>
            ) : null}
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-white">{plan.name}</h2>
              <div className="text-right">
                <p className="text-sm text-[#888888]">
                  <span className="font-bold text-white">{price}</span>
                  {annuel ? "/an" : "/mois"}
                </p>
                {annuel ? (
                  <p className="mt-0.5 text-[12px] text-[#888888]">
                    soit {stripePlan.annuel.soitParMois}/mois
                  </p>
                ) : null}
              </div>
            </div>
            <p className="mt-1 text-[13px] italic text-[#888888]">
              {plan.tagline}
            </p>
            {plan.note ? (
              <p
                className={`mt-1 text-[13px] ${
                  plan.noteAccent ? "text-[#FF2D87]" : "text-[#888888]"
                }`}
              >
                {annuel ? "2 mois offerts" : plan.note}
              </p>
            ) : null}
            <ul className="mt-3">
              {plan.items.map((item, index) => (
                <li
                  key={item}
                  className={`py-2.5 text-sm text-[#CCCCCC] ${
                    index < plan.items.length - 1
                      ? "border-b border-[#1E1E1E]"
                      : ""
                  }`}
                >
                  {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={isCurrent || loading !== null}
              onClick={() => void goCheckout(priceId, ctaKey)}
              className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[12px] text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#1E1E1E] disabled:text-[#888888]"
              style={isCurrent ? undefined : gradient}
            >
              {isCurrent ? "Ton plan" : busy ? "Redirection…" : cta}
            </button>
          </article>
        );
      })}

      {error ? (
        <p className="text-center text-sm text-[#FF4444]">{error}</p>
      ) : null}

      <article className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5">
        <h2 className="text-lg font-bold text-white">QUTE Shop</h2>
        <p className="mt-2 text-sm text-[#888888]">
          Vêtements et accessoires queer.
          {club
            ? " Ta remise Club de 10% s'appliquera dès l'ouverture."
            : " Les membres QUTE Club profitent de 10% de remise permanente."}
        </p>
        <button
          type="button"
          onClick={() => setShopOpen(true)}
          className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[12px] text-sm font-bold text-white"
          style={gradient}
        >
          Accéder au shop
        </button>
      </article>

      {paiements.length > 0 ? (
        <article className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5">
          <h2 className="text-lg font-bold text-white">Historique</h2>
          <ul className="mt-3 flex flex-col">
            {paiements.map((paiement, index) => (
              <li
                key={paiement.id}
                className={`flex items-center justify-between gap-3 py-3 ${
                  index < paiements.length - 1 ? "border-b border-[#1E1E1E]" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">
                    {formatMontant(paiement.montant, paiement.devise)}
                    {paiement.plan ? (
                      <span className="ml-2 font-normal text-[#888888]">
                        {paiement.plan}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-[#888888]">
                    {formatDate(paiement.created_at)}
                  </p>
                </div>
                {paiement.facture_url ? (
                  <a
                    href={paiement.facture_url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs font-bold text-[#FF2D87]"
                  >
                    Facture
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </article>
      ) : null}

      <p className="pb-2 text-center text-[12px] leading-relaxed text-[#888888]">
        Paiement sécurisé par Stripe · Résiliable à tout moment · CB, Apple Pay,
        Google Pay, PayPal
      </p>

      <ShopModal
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        club={club}
      />
    </main>
  );
}
