import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Rejoins QUTE, le réseau social queer de Lyon. Inscription gratuite, réservée aux 18 ans et plus.",
};

export default function RegisterLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim()) {
    console.warn(
      "[turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY vide — captcha désactivé, inscription non bloquée.",
    );
  }

  return children;
}
