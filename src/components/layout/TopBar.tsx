"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { SideMenu } from "@/components/layout/SideMenu";
import { Avatar } from "@/components/features/Avatar";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

type MiniProfile = Pick<
  Profile,
  "id" | "pseudo" | "ville" | "photo_url" | "abonnement"
>;

export function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState<MiniProfile | null>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, pseudo, ville, photo_url, abonnement")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setProfile(data as MiniProfile);
        return;
      }

      const fallback = await supabase
        .from("profiles")
        .select("id, pseudo, ville, photo_url")
        .eq("id", user.id)
        .maybeSingle();

      if (fallback.data) {
        setProfile({
          ...(fallback.data as Omit<MiniProfile, "abonnement">),
          abonnement: "gratuit",
        });
      }
    }

    void load();
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-[#1E1E1E] bg-[#000000]">
        <div className="mx-auto grid h-full w-full max-w-lg grid-cols-[1fr_auto_1fr] items-center px-4">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen(true)}
            className="justify-self-start text-white"
          >
            <svg
              className="menu-icon"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.png"
              alt=""
              height={26}
              className="logo-icon-nav"
            />
            <p className="font-bold tracking-[0.15em] text-white">QUTE</p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <NotificationBell />
            <Link href="/moi" aria-label="Mon profil">
              <Avatar
                pseudo={profile?.pseudo ?? "QUTE"}
                photoUrl={profile?.photo_url}
                size="xs"
              />
            </Link>
          </div>
        </div>
      </header>
      <SideMenu open={menuOpen} onClose={closeMenu} profile={profile} />
    </>
  );
}
