"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ShopModal } from "@/components/ui/ShopModal";
import { createClient } from "@/lib/supabase/client";

type SideTab = {
  href: string;
  label: string;
  match: "accueil" | "salons" | "messages";
  icon: ReactNode;
};

const sideTabs: SideTab[] = [
  {
    href: "/accueil",
    label: "CE SOIR",
    match: "accueil",
    icon: (
      <svg className="tab-icon" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M14.5 4.2A6.2 6.2 0 1 0 19 14.8 5.4 5.4 0 0 1 14.5 4.2z" />
      </svg>
    ),
  },
  {
    href: "/explorer?tab=salons",
    label: "SALONS",
    match: "salons",
    icon: (
      <svg className="tab-icon" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M5 7h8v7H8l-3 2.5V7z" />
        <path d="M11 10h8v7h-3l-3 2.5V10z" />
      </svg>
    ),
  },
  {
    href: "/qute",
    label: "MESSAGES",
    match: "messages",
    icon: (
      <svg className="tab-icon" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M5 6h14v10H8l-3 3V6z" />
      </svg>
    ),
  },
];

export function BottomBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const explorerTab = searchParams.get("tab");
  const [pendingCount, setPendingCount] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadPending() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPendingCount(0);
        return;
      }

      const { count } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("destinataire_id", user.id)
        .eq("statut", "en_attente");

      setPendingCount(count ?? 0);
    }

    void loadPending();
  }, [pathname]);

  function isActive(match: SideTab["match"]) {
    if (match === "accueil") {
      return pathname === "/accueil";
    }

    if (match === "salons") {
      return (
        (pathname === "/explorer" && explorerTab === "salons") ||
        pathname.startsWith("/salons/")
      );
    }

    return pathname === "/qute" || pathname.startsWith("/qute/");
  }

  const profilsActive =
    (pathname === "/explorer" && (!explorerTab || explorerTab === "personnes")) ||
    pathname.startsWith("/explorer/");

  return (
    <>
      <nav className="bottom-bar fixed inset-x-0 bottom-0 z-40 overflow-visible border-t border-[var(--border)] bg-[var(--bg)]">
        <ul className="mx-auto grid h-16 w-full max-w-[900px] grid-cols-5 overflow-visible">
          <SideLink tab={sideTabs[0]} active={isActive("accueil")} />
          <SideLink tab={sideTabs[1]} active={isActive("salons")} />
          <li className="relative flex h-16 items-center justify-center overflow-visible">
            <Link
              href="/explorer"
              aria-label="Profils"
              className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-[var(--bg)] text-white ${
                profilsActive ? "opacity-100" : "opacity-95"
              }`}
              style={{
                transform: "translateY(-20px)",
                background: "linear-gradient(135deg, #FF2D87, #7B2FFF)",
                boxShadow: "0 4px 20px rgba(255, 45, 135, 0.4)",
              }}
            >
              <svg
                className="fab-icon"
                width={28}
                height={28}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden
              >
                <circle cx="8.5" cy="8" r="2.4" />
                <path d="M4 18c.4-2.6 2-4 4.5-4s4.1 1.4 4.5 4" />
                <circle cx="15.5" cy="8.2" r="2.1" />
                <path d="M12.2 18c.3-2 1.6-3.2 3.3-3.2 1.7 0 3 1.2 3.5 3.2" />
              </svg>
            </Link>
          </li>
          <SideLink
            tab={sideTabs[2]}
            active={isActive("messages")}
            badge={pendingCount > 0}
          />
          <li className="h-full">
            <button
              type="button"
              onClick={() => setShopOpen(true)}
              className="relative flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-wide text-[var(--text-muted)]"
            >
              <svg className="tab-icon" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M6 8h12l-1 12H7L6 8z" />
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
              </svg>
              SHOP
            </button>
          </li>
        </ul>
      </nav>
      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} />
    </>
  );
}

function SideLink({
  tab,
  active,
  badge = false,
}: {
  tab: SideTab;
  active: boolean;
  badge?: boolean;
}) {
  return (
    <li className="h-full">
      <Link
        href={tab.href}
        className={`relative flex h-full flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-wide ${
          active ? "text-[#FF2D87]" : "text-[var(--text-muted)]"
        }`}
      >
        {tab.icon}
        {tab.label}
        {badge ? (
          <span className="absolute right-3 top-1 h-2 w-2 rounded-full bg-[#FF4444]" />
        ) : null}
      </Link>
    </li>
  );
}
