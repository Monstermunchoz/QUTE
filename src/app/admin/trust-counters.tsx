"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TrustCountersProps = {
  initialVerify: number;
  initialQuarantine: number;
};

export function TrustCounters({
  initialVerify,
  initialQuarantine,
}: TrustCountersProps) {
  const [verify, setVerify] = useState(initialVerify);
  const [quarantine, setQuarantine] = useState(initialQuarantine);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/admin/moderation/counts", {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => null)) as {
          aVerifier?: number;
          quarantaine?: number;
        } | null;

        if (!response.ok || !payload || cancelled) {
          return;
        }

        setVerify(payload.aVerifier ?? 0);
        setQuarantine(payload.quarantaine ?? 0);
      } catch {
        // Conserve le dernier chiffre connu.
      }
    }

    void load();

    function onFocus() {
      void load();
    }

    window.addEventListener("focus", onFocus);
    const timer = window.setInterval(() => void load(), 8000);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      window.clearInterval(timer);
    };
  }, []);

  const cards = [
    {
      href: "/admin/moderation",
      label: "messages à vérifier",
      value: verify,
      color: "#FF8A00",
    },
    {
      href: "/admin/moderation",
      label: "messages en quarantaine",
      value: quarantine,
      color: "#FF4444",
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5"
        >
          <p
            className="text-[32px] font-bold leading-none"
            style={{ color: card.color }}
          >
            {card.value}
          </p>
          <p className="mt-2 text-[15px] text-[#CCCCCC]">{card.label}</p>
        </Link>
      ))}
    </>
  );
}
