import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description:
    "Les conditions générales d'utilisation de QUTE, réseau social communautaire LGBTQIA+.",
  robots: { index: true, follow: false },
};

export default function CguPage() {
  return (
    <main className="min-h-screen bg-[#000000] px-4 py-8 text-white">
      <div className="relative mx-auto w-full max-w-lg">
        <Link
          href="/register"
          aria-label="Retour"
          className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center text-white"
        >
          ←
        </Link>
        <div className="flex justify-center pt-1">
          <Logo />
        </div>

        <h1 className="mt-8 text-center text-2xl font-bold">
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="mt-2 text-center text-sm text-[#888888]">
          Version 1.0 — Août 2026
        </p>

        <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-white">
          <section>
            <h2 className="mb-3 font-bold">ARTICLE 1 — PRÉSENTATION</h2>
            <p>
              QUTE est une plateforme web communautaire réservée aux adultes,
              dédiée à la communauté LGBTQIA+ et à ses alliés. Elle permet la
              rencontre, la discussion, la découverte de lieux et d&apos;événements
              locaux.
            </p>
            <p className="mt-3">Éditeur : [À compléter]</p>
            <p>Contact : [À compléter]</p>
            <p>Hébergement : Supabase, Vercel</p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 2 — ÂGE MINIMUM</h2>
            <p>
              QUTE est strictement interdit aux personnes de moins de 18 ans.
            </p>
            <p className="mt-3">
              En créant un compte, l&apos;utilisateur certifie sur l&apos;honneur
              avoir 18 ans ou plus. Toute fausse déclaration engage la
              responsabilité exclusive de l&apos;utilisateur.
            </p>
            <p className="mt-3">
              QUTE se réserve le droit de suspendre ou supprimer tout compte dont
              le titulaire s&apos;avèrerait être mineur, sans préavis.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 3 — INSCRIPTION ET COMPTE</h2>
            <p>
              L&apos;inscription est gratuite. L&apos;utilisateur doit fournir une
              adresse email valide, un mot de passe (minimum 8 caractères), un
              pseudonyme et sa date de naissance.
            </p>
            <p className="mt-3">
              L&apos;utilisateur est responsable de la confidentialité de ses
              identifiants. Tout accès depuis son compte est présumé effectué par
              lui.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">
              ARTICLE 4 — DONNÉES PERSONNELLES ET RGPD
            </h2>
            <p>
              QUTE collecte et traite : email, date de naissance, pseudonyme,
              photo, bio, ville, et optionnellement identité de genre et
              orientation sexuelle.
            </p>
            <p className="mt-3">
              Base légale : consentement de l&apos;utilisateur (art. 6.1.a RGPD).
            </p>
            <p className="mt-3">
              L&apos;identité de genre et l&apos;orientation sexuelle sont des
              données sensibles au sens du RGPD (art. 9). Leur saisie est
              entièrement facultative. L&apos;utilisateur contrôle leur visibilité.
            </p>
            <p className="mt-3">
              Droits de l&apos;utilisateur : accès, rectification, effacement,
              portabilité, opposition.
              <br />
              Pour exercer ces droits : [ton email]
            </p>
            <p className="mt-3">Aucune donnée n&apos;est vendue à des tiers.</p>
            <p className="mt-3">
              Les données sont conservées tant que le compte est actif. Après
              suppression, elles sont effacées sous 30 jours.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 5 — CONTENU INTERDIT</h2>
            <p>Il est strictement interdit de publier sur QUTE :</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                Tout contenu impliquant des mineurs de quelque nature que ce soit
              </li>
              <li>
                Tout contenu incitant à la haine, à la discrimination ou à la
                violence
              </li>
              <li>
                Tout contenu raciste, homophobe, transphobe ou sexiste
              </li>
              <li>Toute usurpation d&apos;identité</li>
              <li>
                Tout spam ou contenu visant à escroquer d&apos;autres utilisateurs
              </li>
              <li>Tout contenu illégal au regard de la loi française</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 6 — CONTENU ADULTE</h2>
            <p>
              QUTE est une plateforme pour adultes. Certains contenus à caractère
              explicite peuvent être autorisés dans des espaces dédiés, uniquement
              entre adultes consentants et dans le respect des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 7 — MODÉRATION</h2>
            <p>
              QUTE dispose d&apos;une équipe de modération. Les utilisateurs
              peuvent signaler tout contenu ou comportement inapproprié.
            </p>
            <p className="mt-3">
              QUTE se réserve le droit de supprimer tout contenu en violation des
              CGU et de suspendre tout compte sans préavis en cas de violation
              grave. QUTE peut transmettre des informations aux autorités en cas
              d&apos;infraction pénale.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 8 — SÉCURITÉ DES RENCONTRES</h2>
            <p>QUTE recommande à ses utilisateurs de :</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Effectuer les premiers rendez-vous dans des lieux publics</li>
              <li>Informer un proche de leurs déplacements</li>
              <li>Faire confiance à leur instinct</li>
            </ul>
            <p className="mt-3">
              QUTE ne peut être tenu responsable des rencontres organisées en
              dehors de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 9 — LOCALISATION</h2>
            <p>
              QUTE n&apos;affiche jamais la position GPS précise d&apos;un
              utilisateur. Seule une zone géographique approximative peut être
              affichée, avec le consentement de l&apos;utilisateur.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 10 — PROPRIÉTÉ INTELLECTUELLE</h2>
            <p>
              Le nom QUTE, le logo et l&apos;ensemble des éléments graphiques sont
              la propriété exclusive de l&apos;éditeur. Toute reproduction sans
              autorisation est interdite.
            </p>
            <p className="mt-3">
              Les contenus publiés par les utilisateurs restent leur propriété. En
              les publiant sur QUTE, ils accordent à QUTE une licence non exclusive
              d&apos;affichage sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 11 — RESPONSABILITÉ</h2>
            <p>
              QUTE est une plateforme d&apos;intermédiation. L&apos;éditeur ne
              peut être tenu responsable des contenus publiés par les utilisateurs
              ni des comportements entre utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 12 — MODIFICATION DES CGU</h2>
            <p>
              QUTE se réserve le droit de modifier les présentes CGU. Les
              utilisateurs seront informés par email de toute modification
              substantielle.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 13 — DROIT APPLICABLE</h2>
            <p>
              Les présentes CGU sont soumises au droit français. En cas de
              litige, les tribunaux français sont compétents.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-bold">ARTICLE 14 — CONTACT</h2>
            <p>[ton email]</p>
          </section>
        </div>
      </div>
    </main>
  );
}
