"use client";

import Link from "next/link";
import { useEffect, type CSSProperties } from "react";

const features = [
  {
    icon: "👥",
    title: "Qui",
    text: "Découvre des profils, envoie un QRUSH, matche et discute avec la communauté queer de Lyon.",
  },
  {
    icon: "📍",
    title: "Où",
    text: "Explore les bars, clubs, associations et lieux queer-friendly sur une carte interactive.",
  },
  {
    icon: "🌙",
    title: "Ce soir",
    text: "Active JE SORS, suis les événements et découvre ce qui se passe ce soir dans ta ville.",
  },
];

const strengths = [
  {
    icon: "🔒",
    title: "Sécurité",
    text: "Blocage, signalement, modération active",
  },
  {
    icon: "🏳️‍🌈",
    title: "Inclusivité",
    text: "Toutes les identités et orientations bienvenues",
  },
  {
    icon: "📍",
    title: "Local",
    text: "Conçu pour Lyon et sa communauté",
  },
];

const freeFeatures = [
  "Profil + photos",
  "Exploration illimitée",
  "20 QRUSH par jour",
  "Matchs + chat",
  "Salons publics",
  "CE SOIR + JE SORS",
  "Carte et lieux",
  "Événements",
];

const plusFeatures = [
  "Tout le gratuit",
  "Voir qui t'a QRUSHé",
  "QRUSH illimités",
  "Badge QUTE+ sur le profil",
  "Filtres avancés",
  "Priorité dans l'exploration",
];

const clubFeatures = [
  "Tout QUTE+",
  "Profil mis en avant",
  "Événements exclusifs QUTE",
  "Badge Club doré ✦",
  "Support prioritaire",
];

const gradient = { background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" };

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
};

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mb-8 mt-6 flex w-full flex-1 flex-col items-center gap-2 text-center text-sm text-[#888888]">
      {items.map((item) => (
        <li
          key={item}
          className="flex w-full items-center justify-center gap-2 text-center"
        >
          <span className="font-bold text-white" aria-hidden>
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LandingPage() {
  useEffect(() => {
    const sections = document.querySelectorAll("[data-fade]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-center text-white">
      <section
        data-fade
        className="landing-section px-4 pb-16 pt-12 md:pt-20"
        style={sectionStyle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-full.jpg"
          alt="QUTE"
          className="logo-full"
          style={{ height: 160, margin: "0 auto" }}
        />
        <h1 className="mt-8 text-center text-[36px] font-bold leading-tight text-white md:text-[48px]">
          Rencontres. Sorties. Communauté.
        </h1>
        <p className="mt-4 text-center text-[18px] text-[#888888]">
          Le premier réseau social queer de Lyon.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="flex h-[52px] min-w-[160px] items-center justify-center rounded-[12px] px-6 text-sm font-bold"
            style={gradient}
          >
            Rejoindre QUTE
          </Link>
          <Link
            href="/login"
            className="flex h-[52px] min-w-[160px] items-center justify-center rounded-[12px] border border-[#FF2D87] px-6 text-sm font-bold text-white"
          >
            Se connecter
          </Link>
        </div>
        <p className="mt-6 text-center text-[13px] text-[#555555]">
          Plateforme réservée aux adultes +18 • LGBTQIA+ & alliés
        </p>
      </section>

      <section
        data-fade
        className="landing-section bg-[#0A0A0A] px-4 py-16"
        style={sectionStyle}
      >
        <div className="landing-inner mx-auto w-full max-w-5xl">
          <h2 className="text-center text-[32px] font-bold text-white">
            Tout ce dont tu as besoin
          </h2>
          <div className="mx-auto mt-8 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="flex flex-col items-center rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-8 text-center"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-[12px] text-[28px]"
                  style={gradient}
                  aria-hidden
                >
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-center text-xl font-bold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-center text-sm leading-relaxed text-[#888888]">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-fade
        className="landing-section bg-[#111111] px-4"
        style={{ ...sectionStyle, paddingTop: 64, paddingBottom: 64 }}
      >
        <div className="landing-inner mx-auto w-full max-w-[600px]">
          <h2 className="text-center text-[32px] font-bold text-white">
            Ce soir à Lyon 🌙
          </h2>
          <p className="mt-4 text-center text-[18px] leading-relaxed text-[#888888]">
            QUTE rassemble tout ce qui se passe ce soir : événements, lieux
            actifs, personnes qui sortent. En temps réel, pour ta communauté.
          </p>
          <Link
            href="/register"
            className="mx-auto mt-8 flex h-[52px] w-full max-w-sm items-center justify-center rounded-[12px] text-sm font-bold"
            style={gradient}
          >
            Voir ce soir
          </Link>
        </div>
      </section>

      <section
        data-fade
        className="landing-section bg-[#0A0A0A] px-4"
        style={{ ...sectionStyle, paddingTop: 64, paddingBottom: 64 }}
      >
        <div className="landing-inner mx-auto w-full max-w-5xl">
          <h2 className="text-center text-[32px] font-bold text-white">
            Une communauté, un espace
          </h2>
          <p className="mx-auto mt-4 max-w-[600px] text-center text-[#888888]">
            QUTE n&apos;est pas juste un site de rencontres. C&apos;est un
            espace numérique local où discuter, rejoindre des salons, trouver
            des événements — en sécurité, entre nous.
          </p>
          <ul className="mx-auto mt-10 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            {strengths.map((item) => (
              <li
                key={item.title}
                className="flex flex-col items-center text-center"
              >
                <p className="text-2xl" aria-hidden>
                  {item.icon}
                </p>
                <p className="mt-3 font-bold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-[#888888]">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        data-fade
        className="landing-section bg-[#0A0A0A] px-4"
        style={{ ...sectionStyle, paddingTop: 64, paddingBottom: 64 }}
      >
        <div className="landing-inner mx-auto w-full max-w-5xl">
          <h2 className="text-center text-[32px] font-bold text-white">
            Choisis ton QUTE
          </h2>
          <p className="mt-3 text-center text-[#888888]">
            Commence gratuitement. Évolue quand tu veux.
          </p>
          <div className="mx-auto mt-10 grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-3">
            <article className="flex flex-col items-center rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-8 text-center">
              <h3 className="text-[24px] font-bold text-white">Gratuit</h3>
              <p className="mt-3 text-center">
                <span className="text-[40px] font-bold text-white">0€</span>
                <span className="text-[#888888]">/mois</span>
              </p>
              <FeatureList items={freeFeatures} />
              <Link
                href="/register"
                className="mt-auto flex h-[52px] w-full items-center justify-center rounded-[12px] border border-[#1E1E1E] text-sm font-bold text-white"
              >
                Commencer
              </Link>
            </article>

            <article className="relative flex flex-col items-center rounded-[16px] border-2 border-[#FF2D87] bg-[#111111] p-8 text-center">
              <p className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-[8px] bg-[#FF2D87] px-3 py-1 text-[11px] font-bold tracking-wide text-white">
                LE PLUS POPULAIRE
              </p>
              <h3 className="mt-4 text-[24px] font-bold text-white">QUTE+</h3>
              <p className="mt-3 text-center">
                <span className="text-[40px] font-bold text-white">4,99€</span>
                <span className="text-[#888888]">/mois</span>
              </p>
              <p className="mt-1 text-center text-[13px] text-[#FF2D87]">
                7 jours gratuits • 39,99€/an
              </p>
              <FeatureList items={plusFeatures} />
              <Link
                href="/register"
                className="mt-auto flex h-[52px] w-full items-center justify-center rounded-[12px] px-3 text-center text-sm font-bold"
                style={gradient}
              >
                Essayer 7 jours gratuits
              </Link>
            </article>

            <article className="flex flex-col items-center rounded-[16px] border border-[#1E1E1E] bg-[#111111] p-8 text-center">
              <p
                className="mx-auto w-fit rounded-[8px] px-3 py-1 text-[11px] font-bold tracking-wide text-white"
                style={gradient}
              >
                PREMIUM
              </p>
              <h3 className="mt-4 text-[24px] font-bold text-white">
                QUTE Club
              </h3>
              <p className="mt-3 text-center">
                <span className="text-[40px] font-bold text-white">12,99€</span>
                <span className="text-[#888888]">/mois</span>
              </p>
              <p className="mt-1 text-center text-[13px] text-[#888888]">
                7 jours gratuits • 99,99€/an
              </p>
              <FeatureList items={clubFeatures} />
              <Link
                href="/register"
                className="mt-auto flex h-[52px] w-full items-center justify-center rounded-[12px] px-3 text-center text-sm font-bold"
                style={gradient}
              >
                Essayer 7 jours gratuits
              </Link>
            </article>
          </div>
          <p className="mt-8 text-center text-[13px] text-[#555555]">
            Les abonnements sont gérés via Stripe. Résiliation possible à tout
            moment.
          </p>
        </div>
      </section>

      <section
        data-fade
        className="landing-section px-4"
        style={{
          ...sectionStyle,
          background: "linear-gradient(135deg, #FF2D87, #7B2FFF)",
          paddingTop: 80,
          paddingBottom: 80,
        }}
      >
        <div className="landing-inner mx-auto flex w-full max-w-[600px] flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-icon.png"
            alt=""
            height={80}
            className="logo-icon-cta"
            style={{ margin: "0 auto" }}
          />
          <h2 className="mt-6 text-center text-[40px] font-bold leading-tight text-white">
            Prêt·e à QUTEr ?
          </h2>
          <p className="mt-3 text-center text-[18px] text-white">
            Rejoins la communauté queer de Lyon. Gratuit.
          </p>
          <Link
            href="/register"
            className="mx-auto mt-8 flex h-[52px] w-full max-w-sm items-center justify-center rounded-[12px] bg-white text-sm font-bold text-[#FF2D87]"
          >
            Créer mon compte
          </Link>
          <p className="mt-4 text-center text-[13px] text-white/60">
            Interdit aux moins de 18 ans
          </p>
        </div>
      </section>

      <footer
        className="landing-section border-t border-[#1E1E1E] bg-[#0A0A0A] px-4 py-8"
        style={sectionStyle}
      >
        <div className="landing-inner mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.png"
              alt=""
              height={24}
              className="logo-icon-footer"
            />
            <p className="font-bold text-white">QUTE</p>
          </div>
          <p className="text-center text-sm text-[#555555]">
            Qui • Où • Ce soir
          </p>
          <p className="text-center text-sm text-[#888888]">
            <Link href="/cgu" className="hover:text-[#FF2D87]">
              CGU
            </Link>
            {" | "}
            <a href="#contact" className="hover:text-[#FF2D87]">
              Contact
            </a>
            {" | "}
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF2D87]"
            >
              Instagram
            </a>
          </p>
          <p className="text-center text-[13px] text-[#555555]">
            © 2026 QUTE — Plateforme réservée aux adultes +18 • LGBTQIA+ &
            alliés
          </p>
        </div>
      </footer>
    </div>
  );
}
