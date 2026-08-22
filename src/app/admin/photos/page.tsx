import { PhotoModerationActions } from "./photo-moderation-actions";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export default async function AdminPhotosPage() {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("profiles")
    .select("id, pseudo, photo_url, photo_status")
    .eq("photo_status", "pending")
    .order("created_at", { ascending: false });

  const profiles = (rows ?? []) as Pick<
    Profile,
    "id" | "pseudo" | "photo_url" | "photo_status"
  >[];

  const withPreview = await Promise.all(
    profiles.map(async (profile) => {
      const { data } = await supabase.storage
        .from("avatars")
        .createSignedUrl(`${profile.id}/pending.jpg`, 3600);

      return {
        ...profile,
        previewUrl: data?.signedUrl ?? profile.photo_url,
      };
    }),
  );

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-white md:text-2xl">Photos</h1>
      {withPreview.length === 0 ? (
        <p className="text-[15px] text-[#888888]">Aucune photo pending.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {withPreview.map((profile) => (
            <li
              key={profile.id}
              className="flex flex-col gap-3 break-words rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5"
            >
              <p className="text-[17px] font-bold text-white">{profile.pseudo}</p>
              {profile.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.previewUrl}
                  alt={profile.pseudo}
                  className="h-48 w-full rounded-[12px] object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-[12px] bg-[#1E1E1E] text-sm text-[#888888]">
                  Pas de photo
                </div>
              )}
              <PhotoModerationActions profileId={profile.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
