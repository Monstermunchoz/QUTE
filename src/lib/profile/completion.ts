import type { Profile } from "@/types";

export function profileCompletion(profile: Profile) {
  const checks = [
    Boolean(profile.photo_url),
    Boolean(profile.bio?.trim()),
    (profile.identites ?? []).length > 0,
    (profile.orientations ?? []).length > 0,
    (profile.recherche ?? []).length > 0 || Boolean(profile.ce_que_je_cherche?.trim()),
    (profile.interets ?? []).length > 0,
    Boolean(profile.ville?.trim()),
    Boolean(profile.zone?.trim()),
    Boolean(profile.pronoms?.trim()),
    (profile.langues ?? []).length > 0,
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}
