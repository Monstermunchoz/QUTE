import { PhotoModerationActions } from "./photo-moderation-actions";
import { createClient } from "@/lib/supabase/server";
import type { AlbumPhoto, Profile } from "@/types";

function formatDate(iso: string | null | undefined) {
  if (!iso) {
    return "Date inconnue";
  }

  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type PendingAvatar = {
  kind: "avatar";
  id: string;
  profileId: string;
  pseudo: string;
  previewUrl: string | null;
  createdAt: string | null;
};

type PendingAlbum = {
  kind: "album";
  id: string;
  profileId: string;
  photoId: string;
  pseudo: string;
  previewUrl: string | null;
  createdAt: string | null;
};

export default async function AdminPhotosPage() {
  const supabase = createClient();

  const [{ data: avatarRows }, { data: albumRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, pseudo, photo_url, photo_status, created_at, updated_at")
      .eq("photo_status", "pending")
      .order("updated_at", { ascending: false }),
    supabase
      .from("photos")
      .select("id, user_id, url, statut, created_at")
      .eq("statut", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const albumPhotos = (albumRows ?? []) as Pick<
    AlbumPhoto,
    "id" | "user_id" | "url" | "statut" | "created_at"
  >[];

  const albumUserIds = Array.from(new Set(albumPhotos.map((row) => row.user_id)));
  let albumProfiles: Record<string, string> = {};

  if (albumUserIds.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, pseudo")
      .in("id", albumUserIds);

    albumProfiles = Object.fromEntries(
      ((profileRows ?? []) as Pick<Profile, "id" | "pseudo">[]).map((row) => [
        row.id,
        row.pseudo,
      ]),
    );
  }

  const avatars: PendingAvatar[] = await Promise.all(
    (
      (avatarRows ?? []) as Pick<
        Profile,
        "id" | "pseudo" | "photo_url" | "photo_status" | "created_at" | "updated_at"
      >[]
    ).map(async (profile) => {
      const { data } = await supabase.storage
        .from("avatars")
        .createSignedUrl(`${profile.id}/pending.jpg`, 3600);

      return {
        kind: "avatar" as const,
        id: `avatar-${profile.id}`,
        profileId: profile.id,
        pseudo: profile.pseudo,
        previewUrl: data?.signedUrl ?? profile.photo_url,
        createdAt: profile.updated_at ?? profile.created_at,
      };
    }),
  );

  const albums: PendingAlbum[] = albumPhotos.map((photo) => ({
    kind: "album",
    id: `album-${photo.id}`,
    profileId: photo.user_id,
    photoId: photo.id,
    pseudo: albumProfiles[photo.user_id] ?? "QUTE",
    previewUrl: photo.url,
    createdAt: photo.created_at,
  }));

  const items = [...avatars, ...albums].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-white md:text-2xl">Photos</h1>
      {items.length === 0 ? (
        <p className="text-[15px] text-[#888888]">Aucune photo pending.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 break-words rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-bold text-white">
                    {item.pseudo}
                  </p>
                  <p className="mt-1 text-sm text-[#888888]">
                    {item.kind === "avatar" ? "Avatar" : "Album"} ·{" "}
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
              {item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt={item.pseudo}
                  className="h-48 w-full rounded-[12px] object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-[12px] bg-[#1E1E1E] text-sm text-[#888888]">
                  Pas de photo
                </div>
              )}
              <PhotoModerationActions
                kind={item.kind}
                profileId={item.profileId}
                photoId={item.kind === "album" ? item.photoId : undefined}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
