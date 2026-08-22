"use client";

import { useMemo, useState } from "react";
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

export function ProfilsTable({ profiles, currentUserId }: ProfilsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) {
      return profiles;
    }

    return profiles.filter((profile) =>
      profile.pseudo.toLowerCase().includes(needle),
    );
  }, [profiles, query]);

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

  async function banUser(profileId: string) {
    setLoading(profileId);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "user", compte_verifie: false })
      .eq("id", profileId);

    setLoading(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    window.alert("Utilisateur banni.");
    router.refresh();
  }

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
                      disabled={loading === profile.id}
                      onClick={() => void makeModerator(profile.id)}
                      className="h-11 w-full rounded-[12px] bg-[#22C55E] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
                    >
                      Passer moderateur
                    </button>
                    <button
                      type="button"
                      disabled={loading === profile.id}
                      onClick={() => void banUser(profile.id)}
                      className="h-11 w-full rounded-[12px] bg-[#FF4444] px-4 text-[15px] font-bold text-white disabled:opacity-50 sm:w-auto"
                    >
                      Bannir
                    </button>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
