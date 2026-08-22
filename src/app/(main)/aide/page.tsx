import { PageTitle } from "@/components/ui/BackButton";

const FAQ = [
  {
    q: "QUTE, c'est quoi ?",
    a: "Une appli queer locale pour se rencontrer, discuter et sortir — à Lyon Métropole pour commencer.",
  },
  {
    q: "Comment ça marche, le QRUSH ?",
    a: "Tu envoies un QRUSH. S'il est renvoyé, c'est un match et vous pouvez discuter.",
  },
  {
    q: "Je peux envoyer un message sans match ?",
    a: "Oui, un premier message. L'autre personne accepte ou ignore.",
  },
  {
    q: "Ma photo n'apparaît pas ?",
    a: "Les photos de profil passent par une validation. Ton album, lui, est visible tout de suite.",
  },
];

export default function AidePage() {
  return (
    <main className="flex flex-col gap-6">
      <PageTitle
        title="Aide"
        subtitle="Les réponses rapides, sans prise de tête."
      />

      {FAQ.map((item) => (
        <article
          key={item.q}
          className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <h2 className="font-bold text-[var(--text)]">{item.q}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            {item.a}
          </p>
        </article>
      ))}

      <section className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="font-bold text-[var(--text)]">Contact</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Une question, un souci, une idée ? Écris-nous à{" "}
          <a href="mailto:bonjour@qute.app" className="text-[#FF2D87]">
            bonjour@qute.app
          </a>
          .
        </p>
      </section>
    </main>
  );
}
