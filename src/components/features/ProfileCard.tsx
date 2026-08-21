import Link from "next/link";
import { Avatar } from "@/components/features/Avatar";
import { jeSorsLabel } from "@/lib/utils/je-sors";
import type { JeSorsStatut, Profile } from "@/types";

type ProfileCardProps = {
  profile: Pick<Profile, "id" | "pseudo" | "ville" | "photo_url">;
  jeSors?: { statut: JeSorsStatut; zone: string | null } | null;
};

export function ProfileCard({ profile, jeSors }: ProfileCardProps) {
  return (
    <Link
      href={`/explorer/${profile.id}`}
      className="block rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-4"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <Avatar pseudo={profile.pseudo} photoUrl={profile.photo_url} size="md" />
        <div className="min-w-0">
          <p className="truncate font-bold text-white">{profile.pseudo}</p>
          {jeSors ? (
            <>
              <span className="mt-1 inline-block rounded-[8px] bg-[#FF2D87] px-2 py-1 text-xs font-bold text-white">
                🔥 Sort ce soir
              </span>
              <p className="mt-1 truncate text-[14px] text-[#888888]">
                {jeSorsLabel(jeSors.statut)}
                {jeSors.zone ? ` · ${jeSors.zone}` : ""}
              </p>
            </>
          ) : (
            <p className="truncate text-[14px] text-[#888888]">
              {profile.ville || "Lyon"}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
