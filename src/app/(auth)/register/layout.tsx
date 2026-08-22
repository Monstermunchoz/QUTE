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
  return children;
}
