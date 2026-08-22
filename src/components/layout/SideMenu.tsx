"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@/components/features/Avatar";
import { BadgeAbonnement } from "@/components/ui/BadgeAbonnement";
import { ShopModal } from "@/components/ui/ShopModal";
import { estClub, estPremium } from "@/lib/subscription";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

type SideMenuProps = {
  open: boolean;
  onClose: () => void;
  profile: Pick<
    Profile,
    "id" | "pseudo" | "ville" | "photo_url" | "abonnement" | "abonnement_statut"
  > | null;
};

type MenuItem = {
  href: string;
  label: string;
  icon: ReactNode;
  plusBadge?: boolean;
};

const NAV: MenuItem[] = [
  { href: "/explorer", label: "Profils", icon: <PeopleIcon /> },
  { href: "/accueil", label: "Ce soir", icon: <MoonIcon /> },
  { href: "/explorer?tab=salons", label: "Salons", icon: <ChatIcon /> },
  { href: "/explorer?tab=groupes", label: "Groupes", icon: <GroupIcon /> },
  { href: "/explorer?tab=lieux", label: "Lieux et carte", icon: <PinIcon /> },
  { href: "/explorer?tab=evenements", label: "Événements", icon: <CalendarIcon /> },
  { href: "/creer", label: "Créer un événement", icon: <PlusIcon />, plusBadge: true },
  { href: "/qute?tab=qrush", label: "QRUSH reçus", icon: <BoltIcon /> },
  { href: "/qute", label: "Messages", icon: <BubbleIcon /> },
  { href: "/amis", label: "Mes amis", icon: <FriendsIcon /> },
];

const ACCOUNT: MenuItem[] = [
  { href: "/moi", label: "Mon profil", icon: <UserIcon /> },
  { href: "/abonnement", label: "Mon abonnement", icon: <StarIcon /> },
  { href: "/parametres", label: "Paramètres", icon: <GearIcon /> },
  { href: "/securite", label: "Sécurité et confidentialité", icon: <LockIcon /> },
];

const OTHER: MenuItem[] = [
  { href: "/aide", label: "Aide et contact", icon: <HelpIcon /> },
  { href: "/cgu", label: "CGU", icon: <DocIcon /> },
];

function isMenuActive(href: string, pathname: string) {
  if (href === "/explorer") {
    return pathname === "/explorer" || pathname.startsWith("/explorer/");
  }

  if (href.startsWith("/explorer?tab=salons")) {
    return pathname.startsWith("/salons");
  }

  if (href.startsWith("/explorer?tab=groupes")) {
    return pathname.startsWith("/groupes");
  }

  if (href.startsWith("/explorer?tab=lieux")) {
    return pathname.startsWith("/lieux");
  }

  if (href.startsWith("/explorer?tab=evenements")) {
    return pathname.startsWith("/evenements");
  }

  if (href === "/qute") {
    return pathname === "/qute" || pathname.startsWith("/qute/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuLink({
  href,
  label,
  icon,
  plusBadge,
  onClose,
  active,
  showPlus,
}: MenuItem & { onClose: () => void; active: boolean; showPlus?: boolean }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`menu-item ${active ? "menu-item-active" : ""}`}
    >
      <span className="menu-item-icon">{icon}</span>
      <span className="flex-1">{label}</span>
      {plusBadge && showPlus ? (
        <span className="text-[11px] font-bold text-[#FF2D87]">QUTE+</span>
      ) : null}
    </Link>
  );
}

export function SideMenu({ open, onClose, profile }: SideMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const plus = estPremium(profile);
  const club = estClub(profile);
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {open ? (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer le menu"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col overflow-y-auto border-r border-white/10 bg-[#0D0D0D]">
        <div className="flex items-start justify-between bg-white/[0.04] px-5 py-5">
          <div className="flex flex-col items-start gap-2">
            <Avatar
              pseudo={profile?.pseudo ?? "QUTE"}
              photoUrl={profile?.photo_url}
              size="drawer"
            />
            <p className="text-lg font-bold text-white">
              {profile?.pseudo ?? "QUTE"}
            </p>
            <p className="text-sm text-[#888888]">
              {profile?.ville || "Lyon Métropole"}
            </p>
            <BadgeAbonnement abonnement={profile?.abonnement} />
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="text-xl text-[#888888] hover:text-white"
          >
            ✕
          </button>
        </div>

        <p className="menu-section">Navigation</p>
        <nav>
          {NAV.map((item) => (
            <MenuLink
              key={item.href}
              {...item}
              onClose={onClose}
              active={isMenuActive(item.href, pathname)}
              showPlus={!plus}
            />
          ))}
        </nav>

        <p className="menu-section">Mon compte</p>
        <nav>
          {ACCOUNT.map((item) => (
            <MenuLink
              key={item.href}
              {...item}
              onClose={onClose}
              active={isMenuActive(item.href, pathname)}
            />
          ))}
        </nav>

        <p className="menu-section">Autres</p>
        <nav>
          <button
            type="button"
            onClick={() => {
              onClose();
              setShopOpen(true);
            }}
            className="menu-item"
          >
            <span className="menu-item-icon">
              <ShopIcon />
            </span>
            <span className="flex-1">QUTE Shop</span>
            <span className="rounded-[8px] bg-[#1E1E1E] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#FF2D87]">
              BIENTÔT
            </span>
          </button>
          {OTHER.map((item) => (
            <MenuLink
              key={item.href}
              {...item}
              onClose={onClose}
              active={isMenuActive(item.href, pathname)}
            />
          ))}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => void signOut()}
              className="menu-item text-[#FF4444]"
            >
              <LogoutIcon />
              Déconnexion
            </button>
          </div>
        </nav>
      </aside>
    </div>
      ) : null}
      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} club={club} />
    </>
  );
}

function FriendsIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="8.5" cy="8" r="2.4" />
      <path d="M4 18c.4-2.6 2-4 4.5-4s4.1 1.4 4.5 4" />
      <path d="M16.5 7.5 19 10l3-3.5" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="url(#shop-icon-grad)" strokeWidth="1.8" aria-hidden>
      <defs>
        <linearGradient id="shop-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF2D87" />
          <stop offset="100%" stopColor="#7B2FFF" />
        </linearGradient>
      </defs>
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="8.5" cy="8" r="2.4" />
      <path d="M4 18c.4-2.6 2-4 4.5-4s4.1 1.4 4.5 4" />
      <circle cx="15.5" cy="8.2" r="2.1" />
      <path d="M12.2 18c.3-2 1.6-3.2 3.3-3.2 1.7 0 3 1.2 3.5 3.2" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M14.5 4.2A6.2 6.2 0 1 0 19 14.8 5.4 5.4 0 0 1 14.5 4.2z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 7h8v7H8l-3 2.5V7z" />
      <path d="M11 10h8v7h-3l-3 2.5V10z" />
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="2.3" />
      <path d="M7 18c.4-2.4 2.2-3.8 5-3.8s4.6 1.4 5 3.8" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z" />
      <circle cx="12" cy="11" r="1.8" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M13 3 5 14h7l-1 7 8-11h-7l1-7z" />
    </svg>
  );
}

function BubbleIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 6h14v10H8l-3 3V6z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 19c.8-3.2 3.2-5 7-5s6.2 1.8 7 5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 4 14.2 9.2 20 10l-4 3.8.9 5.7L12 16.8 7.1 19.5 8 13.8 4 10l5.8-.8z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M17.6 6.4l-1.4 1.4M7.8 16.2 6.4 17.6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="6" y="11" width="12" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.8.4-1.4 1-1.4 1.7V14" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M7 4h7l4 4v12H7V4z" />
      <path d="M14 4v4h4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="icon" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M10 7V5h9v14h-9v-2" />
      <path d="M4 12h10M11 9l3 3-3 3" />
    </svg>
  );
}
