import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0A0A0A] px-4 text-center">
      <h1 className="text-2xl font-bold text-white">Page introuvable</h1>
      <p className="text-sm text-[#888888]">Ce n&apos;est pas ici que ça se passe.</p>
      <Link href="/accueil" className="font-bold text-[#FF2D87]">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
