"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";
import { isAdult } from "@/lib/utils/age";
import {
  registerSchema,
  type RegisterValues,
} from "@/lib/validation/auth";

const turnstileSiteKey = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();
const turnstileEnabled = turnstileSiteKey.length > 0;

export default function RegisterPage() {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      certifieMajeur: false,
      accepteCgu: false,
    },
  });

  const certifieMajeur = watch("certifieMajeur");
  const accepteCgu = watch("accepteCgu");
  const canSubmit = Boolean(certifieMajeur && accepteCgu);

  async function onSubmit(values: RegisterValues) {
    setFormError(null);

    if (!values.certifieMajeur || !values.accepteCgu) {
      setFormError("Coche les deux cases pour créer ton compte.");
      return;
    }

    if (!isAdult(values.dateNaissance)) {
      setError("dateNaissance", {
        message: "Tu dois avoir 18 ans ou plus.",
      });
      return;
    }

    if (turnstileEnabled && !turnstileToken) {
      setFormError("Captcha en cours. Réessaie dans une seconde.");
      turnstileRef.current?.execute();
      return;
    }

    const { url, anonKey } = getPublicSupabaseEnv();

    if (!url || !anonKey) {
      console.error("[register] NEXT_PUBLIC_SUPABASE_URL or ANON_KEY missing");
      setFormError("Configuration serveur incomplète. Réessaie plus tard.");
      return;
    }

    const supabase = createClient();
    const email = values.email.trim().toLowerCase();

    try {
      const banResponse = await fetch("/api/auth/email-banni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const banPayload = (await banResponse.json().catch(() => null)) as {
        banni?: boolean;
      } | null;

      if (banPayload?.banni) {
        setFormError("Cette adresse email a été bannie de QUTE.");
        return;
      }
    } catch (banCheckError) {
      console.error("[register] email-banni", banCheckError);
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password: values.password,
      options: {
        data: {
          pseudo: values.pseudo,
          date_naissance: values.dateNaissance,
        },
      },
    });

    if (error) {
      console.error("[register] signUp", error);
      const banned =
        error.message.toLowerCase().includes("bannie") ||
        error.message.toLowerCase().includes("banned");
      setFormError(
        banned
          ? "Cette adresse email a été bannie de QUTE."
          : error.message,
      );
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("[register] getUser", userError);
    }

    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ date_naissance: values.dateNaissance })
        .eq("id", user.id);

      if (profileError) {
        console.error("[register] profile update", profileError);
      }
    } else if (signUpData.user && !signUpData.session) {
      setFormError("Compte créé. Vérifie tes emails pour te connecter.");
      return;
    }

    window.location.assign("/accueil");
  }

  return (
    <form
      method="post"
      action="/register"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void handleSubmit(onSubmit)(event);
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-white">Rejoins QUTE</h1>
        <p className="text-sm text-qute-muted">
          Ton profil est prêt à faire des ravages.
        </p>
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="toi@email.com"
        autoComplete="email"
        error={errors.email?.message}
        register={register("email")}
      />

      <Input
        label="Mot de passe"
        type="password"
        placeholder="8 caractères minimum"
        autoComplete="new-password"
        error={errors.password?.message}
        register={register("password")}
      />

      <Input
        label="Pseudo"
        type="text"
        placeholder="ton pseudo"
        autoComplete="username"
        error={errors.pseudo?.message}
        register={register("pseudo")}
      />

      <Input
        label="Date de naissance"
        type="date"
        error={errors.dateNaissance?.message}
        register={register("dateNaissance")}
      />

      {turnstileEnabled ? (
        <Turnstile
          ref={turnstileRef}
          siteKey={turnstileSiteKey}
          options={{ size: "invisible" }}
          onSuccess={setTurnstileToken}
        />
      ) : null}

      <p className="text-center font-bold text-[#FF4444]">
        INTERDIT AUX MOINS DE 18 ANS
      </p>

      <label className="flex items-start gap-3 text-sm text-white">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0"
          style={{ accentColor: "#FF2D87" }}
          {...register("certifieMajeur")}
        />
        <span>Je certifie sur l&apos;honneur avoir 18 ans ou plus</span>
      </label>
      {errors.certifieMajeur ? (
        <p className="-mt-3 text-sm text-[#FF4444]">
          {errors.certifieMajeur.message}
        </p>
      ) : null}

      <div className="flex items-start gap-3 text-sm text-white">
        <input
          id="accepteCgu"
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0"
          style={{ accentColor: "#FF2D87" }}
          {...register("accepteCgu")}
        />
        <span>
          <label htmlFor="accepteCgu">
            J&apos;ai lu et j&apos;accepte les{" "}
          </label>
          <a
            href="/cgu"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#FF2D87] underline underline-offset-4"
          >
            Conditions Générales d&apos;Utilisation
          </a>
        </span>
      </div>
      {errors.accepteCgu ? (
        <p className="-mt-3 text-sm text-[#FF4444]">
          {errors.accepteCgu.message}
        </p>
      ) : null}

      {formError ? <p className="text-sm text-[#FF4444]">{formError}</p> : null}

      <Button
        type="submit"
        label="Créer mon compte"
        loading={isSubmitting}
        disabled={!canSubmit}
      />
    </form>
  );
}
