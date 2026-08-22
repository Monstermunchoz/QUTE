"use client";

import { useState } from "react";
import { ShopModal } from "@/components/ui/ShopModal";
import type { Abonnement } from "@/lib/abonnement";
import { PLANS } from "@/lib/plans";

const gradient = { background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" };

type AbonnementViewProps = {
  current: Abonnement;
};

export function AbonnementView({ current }: AbonnementViewProps) {
  const [shopOpen, setShopOpen] = useState(false);

  return (
    <main className="flex flex-col gap-6 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white">Mon abonnement</h1>
      </header>

      {PLANS.map((plan) => {
        const isCurrent = plan.id === current;

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
                Ton plan actuel
              </p>
            ) : plan.badge ? (
              <p
                className="mb-3 w-fit rounded-[8px] px-2 py-1 text-[10px] font-bold text-white"
                style={plan.badgeGradient ? gradient : { background: "#FF2D87" }}
              >
                {plan.badge}
              </p>
            ) : null}
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold text-white">{plan.name}</h2>
              <p className="text-sm text-[#888888]">
                <span className="font-bold text-white">{plan.price}</span>/mois
              </p>
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
                {plan.note}
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
            {!isCurrent && plan.id !== "gratuit" ? (
              <button
                type="button"
                disabled
                className="mt-4 flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#1E1E1E] text-sm font-bold text-[#888888]"
              >
                Passer à {plan.name}
              </button>
            ) : null}
          </article>
        );
      })}

      <article className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5">
        <h2 className="text-lg font-bold text-white">QUTE Shop</h2>
        <p className="mt-2 text-sm text-[#888888]">
          Vêtements et accessoires queer. Les membres QUTE Club profitent de 10%
          de remise permanente.
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

      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} />
    </main>
  );
}
