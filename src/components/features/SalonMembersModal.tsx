"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/features/Avatar";
import { BadgeAbonnement } from "@/components/ui/BadgeAbonnement";
import { createClient } from "@/lib/supabase/client";
import { isJeSorsActive } from "@/lib/utils/je-sors";
import type { JeSors, Profile } from "@/types";

type Member = Pick<
  Profile,
  "id" | "pseudo" | "ville" | "photo_url" | "abonnement"
> & {
  jeSors: boolean;
};

type SalonMembersModalProps = {
  open: boolean;
  onClose: () => void;
  salonId: string;
  onSelect: (profileId: string) => void;
};

export function SalonMembersModal({
  open,
  onClose,
  salonId,
  onSelect,
}: SalonMembersModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");

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
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const supabase = createClient();
    setQuery("");

    async function load() {
      const { data: messageRows } = await supabase
        .from("salon_messages")
        .select("auteur_id, created_at")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: false });

      const orderedIds: string[] = [];

      for (const row of messageRows ?? []) {
        const id = row.auteur_id as string;
        if (!orderedIds.includes(id)) {
          orderedIds.push(id);
        }
      }

      if (orderedIds.length === 0) {
        setMembers([]);
        return;
      }

      const [{ data: profiles }, { data: jeSorsRows }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, pseudo, ville, photo_url, abonnement")
          .in("id", orderedIds),
        supabase
          .from("je_sors")
          .select("user_id, expires_at")
          .in("user_id", orderedIds)
          .gt("expires_at", new Date().toISOString()),
      ]);

      const jeSorsIds = new Set(
        ((jeSorsRows ?? []) as Pick<JeSors, "user_id" | "expires_at">[])
          .filter((row) => isJeSorsActive(row))
          .map((row) => row.user_id),
      );

      const byId = Object.fromEntries(
        (
          (profiles ?? []) as Pick<
            Profile,
            "id" | "pseudo" | "ville" | "photo_url" | "abonnement"
          >[]
        ).map((profile) => [profile.id, profile]),
      );

      setMembers(
        orderedIds.flatMap((id) => {
          const profile = byId[id];
          if (!profile) {
            return [];
          }
          return [{ ...profile, jeSors: jeSorsIds.has(id) }];
        }),
      );
    }

    void load();
  }, [open, salonId]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return members;
    }
    return members.filter((member) =>
      member.pseudo.toLowerCase().includes(needle),
    );
  }, [members, query]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="modal-shell relative flex flex-col rounded-[16px] border border-[#1E1E1E] bg-[#111111]"
      >
        <div className="modal-header flex items-center justify-between bg-[#111111] px-5 py-4">
          <h2 className="text-lg font-bold text-white">Dans ce salon</h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="text-xl text-[#888888] hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="px-5 pb-3">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un pseudo…"
            className="h-[44px] w-full rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 text-sm text-white outline-none placeholder:text-[#555555]"
          />
        </div>
        <ul className="tabs-scroll flex-1 overflow-y-auto pb-3">
          {filtered.length === 0 ? (
            <li className="px-5 py-8 text-center text-sm text-[#888888]">
              Personne pour l&apos;instant.
            </li>
          ) : (
            filtered.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => onSelect(member.id)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[#1E1E1E]"
                >
                  <Avatar
                    pseudo={member.pseudo}
                    photoUrl={member.photo_url}
                    size="member"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">
                      {member.pseudo}
                    </p>
                    <p className="truncate text-sm text-[#888888]">
                      {member.ville || "Lyon Métropole"}
                    </p>
                  </div>
                  {member.jeSors ? (
                    <span className="text-xs font-bold text-[#FF2D87]">🔥</span>
                  ) : null}
                  <BadgeAbonnement abonnement={member.abonnement} />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
