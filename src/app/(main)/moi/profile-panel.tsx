"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ChipSelect } from "@/components/ui/ChipSelect";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import {
  IDENTITES,
  INTERETS,
  LANGUES,
  ORIENTATIONS,
  RECHERCHES,
  VISIBILITE_OPTIONS,
  ZONES_LYON,
  type VisibiliteChamp,
} from "@/lib/profile/options";
import { profileCompletion } from "@/lib/profile/completion";
import { formatBirthDate } from "@/lib/utils/age";
import { createClient } from "@/lib/supabase/client";
import { AvatarUpload } from "./avatar-upload";
import { PhotoAlbum } from "./photo-album";
import { JeSorsBlock } from "./je-sors-block";
import type { AlbumPhoto, JeSors, Profile } from "@/types";

type ProfilePanelProps = {
  profile: Profile;
  qrushCount: number;
  matchCount: number;
  jeSors: JeSors | null;
  photos: AlbumPhoto[];
};

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-[16px] bg-[var(--surface)] p-6">
      <h2 className="text-base font-bold text-[var(--text)]">{title}</h2>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[14px] text-[var(--text-muted)]">{children}</p>
  );
}

export function ProfilePanel({
  profile,
  qrushCount,
  matchCount,
  jeSors,
  photos,
}: ProfilePanelProps) {
  const router = useRouter();
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [pseudo, setPseudo] = useState(profile.pseudo ?? "");
  const [pronoms, setPronoms] = useState(profile.pronoms ?? "");
  const [ageVisible, setAgeVisible] = useState(Boolean(profile.age_visible));
  const [identites, setIdentites] = useState(profile.identites ?? []);
  const [orientations, setOrientations] = useState(profile.orientations ?? []);
  const [visibiliteIdentites, setVisibiliteIdentites] =
    useState<VisibiliteChamp>(profile.visibilite_identites ?? "public");
  const [visibiliteOrientations, setVisibiliteOrientations] =
    useState<VisibiliteChamp>(profile.visibilite_orientations ?? "public");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [recherche, setRecherche] = useState(profile.recherche ?? []);
  const [precisions, setPrecisions] = useState(profile.ce_que_je_cherche ?? "");
  const [interets, setInterets] = useState(profile.interets ?? []);
  const [langues, setLangues] = useState(profile.langues ?? []);
  const [ville, setVille] = useState(profile.ville ?? "");
  const [zone, setZone] = useState(profile.zone ?? "");
  const [instagram, setInstagram] = useState(
    (profile.instagram ?? "").replace(/^@/, ""),
  );

  const draft: Profile = useMemo(
    () => ({
      ...profile,
      photo_url: profile.photo_url,
      bio,
      identites,
      orientations,
      recherche,
      ce_que_je_cherche: precisions,
      interets,
      ville,
      zone,
      pronoms,
      langues,
    }),
    [
      profile,
      bio,
      identites,
      orientations,
      recherche,
      precisions,
      interets,
      ville,
      zone,
      pronoms,
      langues,
    ],
  );

  const completion = profileCompletion(draft);
  const birthLabel = formatBirthDate(profile.date_naissance);
  const location = [profile.ville, profile.zone].filter(Boolean).join(" · ");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);

    const trimmedPseudo = pseudo.trim();

    if (trimmedPseudo.length < 3 || trimmedPseudo.length > 20) {
      setFormError("Pseudo : 3 à 20 caractères.");
      return;
    }

    if (bio.length > 500) {
      setFormError("Bio : 500 caractères maximum.");
      return;
    }

    if (precisions.length > 150) {
      setFormError("Précisions : 150 caractères maximum.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        pseudo: trimmedPseudo,
        pronoms: pronoms.trim() || null,
        age_visible: ageVisible,
        identites,
        orientations,
        visibilite_identites: visibiliteIdentites,
        visibilite_orientations: visibiliteOrientations,
        bio: bio.trim() || null,
        recherche,
        ce_que_je_cherche: precisions.trim() || null,
        interets,
        langues,
        ville: ville.trim() || null,
        zone: zone || null,
        instagram: instagram.trim().replace(/^@/, "") || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setSuccess("Profil enregistré. T'es prêt·e à faire des ravages.");
    router.refresh();
  }

  return (
    <main className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <AvatarUpload
          userId={profile.id}
          pseudo={profile.pseudo}
          photoUrl={profile.photo_url}
          photoStatus={profile.photo_status}
        />
        <h1 className="text-2xl font-bold text-[var(--text)]">{profile.pseudo}</h1>
        <p className="text-[var(--text-muted)]">
          {location || "Lyon Métropole"}
        </p>
        <p className="text-sm text-[var(--text-muted)]">
          {qrushCount} QRUSH{qrushCount === 1 ? "" : "s"} reçu
          {qrushCount === 1 ? "" : "s"} · {matchCount} match
          {matchCount === 1 ? "" : "s"}
        </p>
      </div>

      <PhotoAlbum userId={profile.id} photos={photos} />
      <JeSorsBlock current={jeSors} />

      <div className="rounded-[16px] bg-[var(--surface)] p-6">
        <p className="text-sm font-bold text-[var(--text)]">
          Ton profil est complété à {completion}%
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--chip)]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${completion}%`,
              background: "linear-gradient(135deg, #FF2D87, #7B2FFF)",
            }}
          />
        </div>
        {completion < 100 ? (
          <p className="mt-2 text-[13px] text-[var(--text-muted)]">
            Plus ton profil est complet, plus tu te fais remarquer.
          </p>
        ) : null}
      </div>

      <form
        method="post"
        noValidate
        onSubmit={onSubmit}
        className="flex flex-col gap-4 pb-20"
      >
        <Section title="Identité">
          <Input
            label="Pseudo"
            value={pseudo}
            onChange={(event) => setPseudo(event.target.value.slice(0, 20))}
            required
          />
          <Input
            label="Pronoms"
            placeholder="il/lui, elle/elle, iel/ellui…"
            value={pronoms}
            onChange={(event) => setPronoms(event.target.value)}
          />
          <div className="flex flex-col gap-2">
            <FieldLabel>Date de naissance</FieldLabel>
            <p className="rounded-[12px] border border-[var(--border)] bg-[var(--chip)] px-4 py-3 text-sm text-[var(--text-muted)]">
              {birthLabel ?? "Non renseignée"} · non modifiable
            </p>
          </div>
          <Switch
            label="Afficher mon âge"
            checked={ageVisible}
            onToggle={() => setAgeVisible((value) => !value)}
          />
        </Section>

        <Section title="Qui je suis">
          <div className="flex flex-col gap-2">
            <FieldLabel>Identité de genre</FieldLabel>
            <ChipSelect
              options={IDENTITES}
              value={identites}
              onChange={setIdentites}
            />
            <label className="mt-1 text-[14px] text-[var(--text-muted)]">
              Qui peut voir ?
              <select
                value={visibiliteIdentites}
                onChange={(event) =>
                  setVisibiliteIdentites(event.target.value as VisibiliteChamp)
                }
                className="mt-2 h-[52px] w-full rounded-[12px] border border-[var(--border)] bg-[var(--chip)] px-4 text-[var(--text)] outline-none"
              >
                {VISIBILITE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel>Orientation</FieldLabel>
            <ChipSelect
              options={ORIENTATIONS}
              value={orientations}
              onChange={setOrientations}
            />
            <label className="mt-1 text-[14px] text-[var(--text-muted)]">
              Qui peut voir ?
              <select
                value={visibiliteOrientations}
                onChange={(event) =>
                  setVisibiliteOrientations(
                    event.target.value as VisibiliteChamp,
                  )
                }
                className="mt-2 h-[52px] w-full rounded-[12px] border border-[var(--border)] bg-[var(--chip)] px-4 text-[var(--text)] outline-none"
              >
                {VISIBILITE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-[13px] text-[var(--text-muted)]">
            Ces informations sont facultatives. Tu peux les garder privées ou ne
            rien renseigner — ton profil restera complet.
          </p>
        </Section>

        <Section title="Ma bio">
          <div className="flex flex-col gap-2">
            <FieldLabel>Bio</FieldLabel>
            <textarea
              maxLength={500}
              rows={5}
              value={bio}
              onChange={(event) => setBio(event.target.value.slice(0, 500))}
              placeholder="Parle un peu de toi… ce qui te fait vibrer, ce que tu écoutes, où on te croise le samedi soir."
              className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--chip)] px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus:border-[#FF2D87]"
            />
            <p className="text-right text-xs text-[var(--text-muted)]">
              {bio.length}/500
            </p>
          </div>
        </Section>

        <Section title="Ce que je cherche">
          <div className="flex flex-col gap-2">
            <FieldLabel>Je cherche</FieldLabel>
            <ChipSelect
              options={RECHERCHES}
              value={recherche}
              onChange={setRecherche}
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Précisions</FieldLabel>
            <textarea
              maxLength={150}
              rows={3}
              value={precisions}
              onChange={(event) =>
                setPrecisions(event.target.value.slice(0, 150))
              }
              placeholder="Optionnel"
              className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--chip)] px-4 py-3 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus:border-[#FF2D87]"
            />
            <p className="text-right text-xs text-[var(--text-muted)]">
              {precisions.length}/150
            </p>
          </div>
        </Section>

        <Section title="Mes intérêts">
          <div className="flex flex-col gap-2">
            <FieldLabel>Centres d&apos;intérêt (max 8)</FieldLabel>
            <ChipSelect
              options={INTERETS}
              value={interets}
              onChange={setInterets}
              max={8}
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel>Langues parlées</FieldLabel>
            <ChipSelect
              options={LANGUES}
              value={langues}
              onChange={setLangues}
            />
          </div>
        </Section>

        <Section title="Localisation">
          <Input
            label="Ville"
            value={ville}
            onChange={(event) => setVille(event.target.value)}
          />
          <div className="flex flex-col gap-2">
            <FieldLabel>Zone</FieldLabel>
            <select
              value={zone}
              onChange={(event) => setZone(event.target.value)}
              className="h-[52px] w-full rounded-[12px] border border-[var(--border)] bg-[var(--chip)] px-4 text-[var(--text)] outline-none"
            >
              <option value="">Choisir une zone</option>
              {ZONES_LYON.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </Section>

        <Section title="Réseaux">
          <Input
            label="Instagram"
            placeholder="toncompte"
            value={instagram}
            onChange={(event) =>
              setInstagram(event.target.value.replace(/^@/, ""))
            }
          />
        </Section>

        {formError ? (
          <p className="text-sm text-[#FF4444]">{formError}</p>
        ) : null}
        {success ? (
          <p className="text-center text-sm text-[#FF2D87]">{success}</p>
        ) : null}

        <div className="fixed inset-x-0 bottom-16 z-30 mx-auto w-full max-w-lg px-5 md:px-8">
          <Button type="submit" label="Enregistrer" loading={saving} />
        </div>
      </form>
    </main>
  );
}
