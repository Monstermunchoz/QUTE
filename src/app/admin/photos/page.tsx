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
      <h1 className="text-2xl font-bold text-white">Photos</h1>
      {withPreview.length === 0 ? (
        <p className="text-sm text-[#888888]">Aucune photo pending.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {withPreview.map((profile) => (
            <li
              key={profile.id}
              className="flex flex-col gap-3 rounded-[12px] border border-[#1E1E1E] bg-[#111111] p-4"
            >
              <p className="font-bold text-white">{profile.pseudo}</p>
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
