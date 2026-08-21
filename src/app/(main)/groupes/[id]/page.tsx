import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Avatar } from "@/components/features/Avatar";
import { JoinLeaveButton } from "./join-leave-button";
import { createClient } from "@/lib/supabase/server";
import type { Groupe, GroupeMembre, Profile } from "@/types";

type GroupePageProps = {
  params: { id: string };
};

export default async function GroupePage({ params }: GroupePageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: groupeRow } = await supabase
    .from("groupes")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!groupeRow) {
    notFound();
  }

  const groupe = groupeRow as Groupe;

  const { data: memberRows } = await supabase
    .from("groupe_membres")
    .select("*")
    .eq("groupe_id", groupe.id)
    .order("joined_at", { ascending: true });

  const members = (memberRows ?? []) as GroupeMembre[];
  const memberIds = members.map((member) => member.user_id);
  const isMember = members.some((member) => member.user_id === user.id);

  let profilesById: Record<string, Pick<Profile, "id" | "pseudo" | "photo_url">> =
    {};

  if (memberIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, pseudo, photo_url")
      .in("id", memberIds);

    profilesById = Object.fromEntries(
      (
        (profiles ?? []) as Pick<Profile, "id" | "pseudo" | "photo_url">[]
      ).map((profile) => [profile.id, profile]),
    );
  }

  return (
    <main className="flex flex-col gap-4 pb-4">
      <header className="flex items-center gap-3">
        <Link
          href="/explorer"
          aria-label="Retour"
          className="flex h-10 w-10 items-center justify-center text-white"
        >
          <svg
            className="icon"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M15 6 9 12l6 6" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-white">{groupe.nom}</h1>
          <p className="text-sm text-[#888888]">
            {members.length} membre{members.length === 1 ? "" : "s"}
          </p>
        </div>
      </header>

      {groupe.description ? (
        <p className="text-sm text-[#888888]">{groupe.description}</p>
      ) : null}

      <JoinLeaveButton groupeId={groupe.id} isMember={isMember} />

      <Link
        href="/groupes/creer"
        className="flex h-[52px] items-center justify-center rounded-[12px] border border-[#1E1E1E] text-sm font-bold text-white"
      >
        Créer un groupe
      </Link>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-[#888888]">Membres</h2>
        {members.length === 0 ? (
          <p className="text-sm text-[#888888]">Personne pour l&apos;instant.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {members.map((member) => {
              const profile = profilesById[member.user_id];
              const pseudo = profile?.pseudo ?? "QUTE";

              return (
                <li
                  key={member.id}
                  className="flex items-center gap-3 rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-3"
                >
                  <Avatar
                    pseudo={pseudo}
                    photoUrl={profile?.photo_url}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-white">{pseudo}</p>
                    <p className="text-xs text-[#888888]">{member.role}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
