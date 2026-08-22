"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/features/Avatar";
import { createClient } from "@/lib/supabase/client";

type BlockedProfile = {
  id: string;
  pseudo: string;
  photo_url: string | null;
};

type BlockedListProps = {
  profiles: BlockedProfile[];
};

export function BlockedList({ profiles }: BlockedListProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function unblock(profileId: string) {
    setError(null);
    setPendingId(profileId);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: deleteError } = await supabase
      .from("blocages")
      .delete()
      .eq("bloqueur_id", user.id)
      .eq("bloque_id", profileId);

    setPendingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.refresh();
  }

  if (profiles.length === 0) {
    return (
      <p className="px-4 py-4 text-sm text-[#888888]">
        Aucun profil bloqué pour le moment.
      </p>
    );
  }

  return (
    <ul>
      {profiles.map((profile) => (
        <li
          key={profile.id}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <Avatar
              pseudo={profile.pseudo}
              photoUrl={profile.photo_url}
              size="xs"
            />
            <p className="font-bold text-white">{profile.pseudo}</p>
          </div>
          <button
            type="button"
            disabled={pendingId === profile.id}
            onClick={() => void unblock(profile.id)}
            className="text-sm font-bold text-[#FF2D87] disabled:opacity-50"
          >
            Débloquer
          </button>
        </li>
      ))}
      {error ? (
        <li className="px-4 pb-3 text-sm text-[#FF4444]">{error}</li>
      ) : null}
    </ul>
  );
}
