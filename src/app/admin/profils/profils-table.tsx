"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

type ProfilsTableProps = {
  profiles: Pick<
    Profile,
    "id" | "pseudo" | "ville" | "role" | "compte_verifie" | "photo_status"
  >[];
  currentUserId: string;
};

type PendingAction = {
  type: "supprimer" | "bannir";
  profileId: string;
  pseudo: string;
};

export function ProfilsTable({ profiles, currentUserId }: ProfilsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return profiles;
    }

    return profiles.filter((profile) =>
      profile.pseudo.toLowerCase().includes(needle),
    );
  }, [profiles, query]);

  useEffect(() => {
    if (!pending) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPending(null);
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [pending]);

  async function makeModerator(profileId: string) {
    setLoading(profileId);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "moderateur" })
      .eq("id", profileId);

    setLoading(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  async function confirmAction() {
    if (!pending) {
      return;
    }

    const { type, profileId } = pending;
    const route = type === "bannir" ? "/api/admin/bannir" : "/api/admin/supprimer";
    setError(null);
    setLoading(`${profileId}-${type}`);

    try {
      const response = await fetch(route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profileId }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        console.error(`[admin/${type}]`, response.status, payload);
        setError(payload?.error ?? "Action impossible.");
        setLoading(null);
        return;
      }

      setPending(null);
      setLoading(null);
      router.refresh();
    } catch (err) {
      console.error(`[admin/${type}]`, err);
      setError("Action impossible.");
      setLoading(null);
    }
  }

  const confirmBusy = pending
    ? loading === `${pending.profileId}-${pending.type}`
    : false;

  return (
    <div className="flex flex-col gap-4">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Recherche par pseudo"
        className="h-[52px] w-full max-w-md rounded-[12px] border border-[#333333] bg-[#1E1E1E] px-4 text-[16px] text-white outline-none placeholder:text-[#555555] focus:border-[#FF2D87]"
      />
      {error ? <p className="text-sm text-[#FF4444]">{error}</p> : null}
      {filtered.length === 0 ? (
        <p className="text-sm text-[#888888]">Aucun profil.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((profile) => (
            <li
              key={profile.id}
              className="flex flex-col gap-3 break-words rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5"
            >
              <div>
                <p className="text-[17px] font-bold text-white">
                  {profile.pseudo}
                </p>
                <p className="mt-1 text-[15px] text-[#888888]">
                  {profile.ville || "Lyon"} · {profile.role}
                  {profile.compte_verifie ? " · vérifié" : ""}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  href={`/explorer/${profile.id}`}
                  className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#1E1E1E] px-4 text-[15px] font-bold text-white sm:w-auto"
                >
                  Voir profil
                </Link>
                {profile.id !== currentUserId ? (
                  <>
                    <button
                      type="button"
                      disabled={loading !== null}
                      onClick={() => void makeModerator(profile.id)}
                      className="h-11 w-full rounded-[12px] bg-[#22C55E] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
                    >
                      Passer moderateur
                    </button>
                    <button
                      type="button"
                      disabled={loading !== null}
                      onClick={() =>
                        setPending({
                          type: "supprimer",
                          profileId: profile.id,
                          pseudo: profile.pseudo,
                        })
                      }
                      className="h-11 w-full rounded-[12px] bg-[#333333] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
                    >
                      Supprimer
                    </button>
                    <button
                      type="button"
                      disabled={loading !== null}
                      onClick={() =>
                        setPending({
                          type: "bannir",
                          profileId: profile.id,
                          pseudo: profile.pseudo,
                        })
                      }
                      className="h-11 w-full rounded-[12px] bg-[#FF4444] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
                    >
                      Bannir + Supprimer
                    </button>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pending ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <button
            type="button"
            aria-label="Annuler"
            className="absolute inset-0 bg-black/70"
            onClick={() => setPending(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            className="relative z-10 w-[calc(100%-40px)] max-w-[420px] rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5"
          >
            <h2
              id="admin-confirm-title"
              className="text-[17px] font-bold text-white"
            >
              {pending.type === "bannir"
                ? "Bannir et supprimer ?"
                : "Supprimer ce compte ?"}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#CCCCCC]">
              {pending.type === "bannir"
                ? "Bannir et supprimer ce compte ? L'adresse email sera définitivement bloquée. Action irréversible."
                : "Supprimer ce compte ? L'utilisateur pourra se réinscrire."}
            </p>
            <p className="mt-2 text-sm text-[#888888]">{pending.pseudo}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => void confirmAction()}
                className="flex h-11 w-full items-center justify-center rounded-[12px] bg-[#FF4444] text-[15px] font-bold text-white disabled:opacity-50"
              >
                {confirmBusy ? "En cours…" : "Confirmer"}
              </button>
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => setPending(null)}
                className="flex h-11 w-full items-center justify-center rounded-[12px] border border-[#1E1E1E] text-[15px] font-bold text-white disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
