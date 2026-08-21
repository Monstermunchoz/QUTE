"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Tab = {
  href: string;
  label: string;
  icon: ReactNode;
};

const iconClassName = "icon";

const tabs: Tab[] = [
  {
    href: "/accueil",
    label: "ACCUEIL",
    icon: (
      <svg className={iconClassName} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4 10.5 12 4l8 6.5V20H4z" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
  },
  {
    href: "/explorer",
    label: "EXPLORER",
    icon: (
      <svg className={iconClassName} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    href: "/creer",
    label: "CRÉER",
    icon: (
      <svg className={iconClassName} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    href: "/qute",
    label: "QUTE",
    icon: (
      <svg className={iconClassName} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M12 3l2.1 6.3H21l-5.4 3.9 2.1 6.3L12 15.6 6.3 19.5l2.1-6.3L3 9.3h6.9z" />
      </svg>
    ),
  },
  {
    href: "/moi",
    label: "MOI",
    icon: (
      <svg className={iconClassName} width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 19c1.5-3.2 4-4.8 7-4.8s5.5 1.6 7 4.8" />
      </svg>
    ),
  },
];

export function BottomBar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1E1E1E] bg-[#0A0A0A] pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid h-16 w-full max-w-lg grid-cols-5">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href} className="h-full">
              <Link
                href={tab.href}
                className={`relative flex h-full flex-col items-center justify-center gap-1 text-[10px] font-semibold tracking-wide ${
                  active ? "text-[#FF2D87]" : "text-[#888888]"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.href === "/qute" && pendingCount > 0 ? (
                  <span className="absolute right-3 top-1 h-2 w-2 rounded-full bg-[#FF4444]" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
