export function publicPhotoUrl(
  photoStatus: string | null | undefined,
  photoUrl: string | null | undefined,
) {
  if (photoStatus === "approved") {
    return photoUrl ?? null;
  }

  return null;
}
