"use client";

import Link from "next/link";
import { useEffect, type CSSProperties, type ReactNode } from "react";

const gradient = { background: "linear-gradient(135deg, #FF2D87, #7B2FFF)" };

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
};

const features = [
  {
    title: "Qui",
    text: "Des profils réels, une communauté locale. QRUSH, matche, discute — sans algorithme opaque ni faux comptes.",
    icon: "qui" as const,
  },
  {
    title: "Où",
    text: "Bars, clubs, saunas, assos. La carte complète des lieux queer-friendly de Lyon, mise à jour par la communauté.",
    icon: "ou" as const,
  },
  {
    title: "Ce soir",
    text: "Active JE SORS et vois qui bouge en temps réel. Les événements, les lieux actifs, les gens dispo — maintenant.",
    icon: "soir" as const,
  },
];

const strengths = [
  {
    title: "Sécurité",
    text: "Blocage, signalement, modération humaine et active.",
    icon: "securite" as const,
  },
  {
    title: "Inclusivité",
    text: "Toutes les identités de genre et orientations. Sans exception.",
    icon: "inclusivite" as const,
  },
  {
    title: "Local",
    text: "Conçu pour Lyon Métropole et sa communauté.",
    icon: "local" as const,
  },
];

const freeFeatures = [
  "Profil et photos",
  "Exploration illimitée",
  "20 QRUSH par jour",
  "Matchs et messages",
  "Salons et groupes",
  "CE SOIR et JE SORS",
  "Carte des lieux",
  "Agenda des événements",
];

const plusFeatures = [
  "Tout le gratuit",
  "Voir qui t'a QRUSHé",
  "QRUSH illimités",
  "Badge QUTE+ sur ton profil",
  "Filtres avancés",
  "Priorité dans l'exploration",
];

const clubFeatures = [
  "Tout QUTE+",
  "Profil mis en avant",
  "Événements exclusifs QUTE",
  "Badge Club",
  "Support prioritaire",
];

function GradientDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <linearGradient id="qute-icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF2D87" />
          <stop offset="100%" stopColor="#7B2FFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#qute-icon-grad)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function FeatureIcon({ name }: { name: (typeof features)[number]["icon"] }) {
  if (name === "qui") {
    return (
      <IconFrame>
        <circle cx="8" cy="8" r="2.4" />
        <path d="M3.6 18c.4-2.6 2.2-4 4.4-4s4 1.4 4.4 4" />
        <circle cx="16" cy="8.2" r="2.2" />
        <path d="M12.8 18c.3-2.1 1.7-3.3 3.2-3.3 1.6 0 3 1.2 3.4 3.3" />
      </IconFrame>
    );
  }

  if (name === "ou") {
    return (
      <IconFrame>
        <path d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.6 12 21 12 21z" />
        <circle cx="12" cy="10.6" r="2" />
      </IconFrame>
    );
  }

  return (
    <IconFrame>
      <path d="M14.5 4.2A6.2 6.2 0 1 0 19 14.8 5.4 5.4 0 0 1 14.5 4.2z" />
      <path d="M17.4 5.2l.5 1.3 1.3.4-1.3.4-.5 1.3-.5-1.3-1.3-.4 1.3-.4z" />
    </IconFrame>
  );
}

function StrengthIcon({ name }: { name: (typeof strengths)[number]["icon"] }) {
  if (name === "securite") {
    return (
      <IconFrame>
        <path d="M12 3.4 5.5 6v5.6c0 4 2.8 7.2 6.5 8.6 3.7-1.4 6.5-4.6 6.5-8.6V6L12 3.4z" />
        <path d="M9.4 12.1 11.2 14l3.6-3.8" />
      </IconFrame>
    );
  }

  if (name === "inclusivite") {
    return (
      <IconFrame>
        <circle cx="9" cy="12" r="4.2" />
        <circle cx="15" cy="12" r="4.2" />
      </IconFrame>
    );
  }

  return (
    <IconFrame>
      <path d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.6 12 21 12 21z" />
      <circle cx="12" cy="10.6" r="2" />
    </IconFrame>
  );
}

function PriceList({ items }: { items: string[] }) {
  return (
    <ul className="landing-price-list mb-8 mt-6 w-full flex-1">
      {items.map((item) => (
        <li key={item}>{item}</li>
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
      <GradientDefs />

      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-[#1E1E1E] bg-[#0A0A0A]">
        <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.png"
              alt=""
              height={28}
              className="logo-icon-bar"
            />
            <p className="font-bold tracking-[0.15em] text-white">QUTE</p>
          </div>
          <Link
            href="/login"
            className="text-sm text-[#888888] transition-colors hover:text-[#FF2D87]"
          >
            Se connecter
          </Link>
        </div>
      </header>

      <section
        data-fade
        className="landing-section px-4 pt-28"
        style={sectionStyle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-icon.png"
          alt="QUTE"
          className="logo-icon-hero"
          style={{ height: 180, margin: "0 auto 32px" }}
        />
        <h1 className="landing-title text-center text-[36px] leading-tight text-white md:text-[48px]">
          Ta communauté. Ta ville. Ce soir.
        </h1>
        <p className="landing-copy mt-4 max-w-[560px] text-center text-[18px] text-[#888888]">
          Le réseau social queer de Lyon. Rencontres, lieux, sorties — un seul
          endroit, fait pour nous.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="landing-btn flex h-[52px] min-w-[160px] items-center justify-center rounded-[12px] px-6 text-sm font-bold"
            style={gradient}
          >
            Rejoindre QUTE
          </Link>
          <Link
            href="/login"
            className="landing-btn flex h-[52px] min-w-[160px] items-center justify-center rounded-[12px] border border-[#FF2D87] px-6 text-sm font-bold text-white"
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
        className="landing-section bg-[#0A0A0A] px-4"
        style={sectionStyle}
      >
        <div className="landing-inner mx-auto w-full max-w-5xl">
          <h2 className="landing-title text-center text-[32px] text-white">
            Tout ce dont tu as besoin
          </h2>
          <div className="mx-auto mt-10 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="landing-card flex flex-col items-center rounded-[16px] bg-[#111111] p-8 text-center"
              >
                <FeatureIcon name={feature.icon} />
                <h3 className="landing-title mt-4 text-center text-xl">
                  {feature.title}
                </h3>
                <p className="landing-copy mt-3 text-center text-sm text-[#888888]">
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
        style={sectionStyle}
      >
        <div className="landing-inner mx-auto w-full max-w-[600px]">
          <h2 className="landing-title text-center text-[32px] text-white">
            Ce soir à Lyon
          </h2>
          <p className="landing-copy mt-4 text-center text-[18px] text-[#888888]">
            Pendant que tu lis ça, quelqu&apos;un cherche avec qui sortir. QUTE
            agrège en temps réel les événements, les lieux actifs et les
            personnes qui sortent. Plus besoin de scroller cinq apps.
          </p>
          <Link
            href="/register"
            className="landing-btn mx-auto mt-8 flex h-[52px] w-full max-w-sm items-center justify-center rounded-[12px] text-sm font-bold"
            style={gradient}
          >
            Voir ce soir
          </Link>
        </div>
      </section>

      <section
        data-fade
        className="landing-section bg-[#0A0A0A] px-4"
        style={sectionStyle}
      >
        <div className="landing-inner mx-auto w-full max-w-5xl">
          <h2 className="landing-title text-center text-[32px] text-white">
            Pensé pour nous, par nous
          </h2>
          <p className="landing-copy mx-auto mt-4 max-w-[600px] text-center text-[#888888]">
            QUTE n&apos;est pas une app de rencontres de plus. C&apos;est un
            espace communautaire local — pour discuter dans des salons, trouver
            un event, savoir où sortir, rencontrer des gens. En sécurité, entre
            nous.
          </p>
          <ul className="mx-auto mt-10 grid w-full grid-cols-1 gap-8 md:grid-cols-3">
            {strengths.map((item) => (
              <li
                key={item.title}
                className="flex flex-col items-center text-center"
              >
                <StrengthIcon name={item.icon} />
                <p className="landing-title mt-3 text-white">{item.title}</p>
                <p className="landing-copy mt-1 text-sm text-[#888888]">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        data-fade
        className="landing-section bg-[#0A0A0A] px-4"
        style={sectionStyle}
      >
        <div className="landing-inner mx-auto w-full max-w-5xl">
          <h2 className="landing-title text-center text-[32px] text-white">
            Choisis ton QUTE
          </h2>
          <p className="landing-copy mt-3 text-center text-[#888888]">
            Commence gratuitement. Passe au niveau supérieur quand tu veux.
          </p>
          <div className="mx-auto mt-10 grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-3">
            <article className="landing-card flex flex-col items-center rounded-[16px] bg-[#111111] p-8 text-center">
              <h3 className="landing-title text-[24px] text-white">Gratuit</h3>
              <p className="mt-3 text-center">
                <span className="text-[40px] font-bold text-white">0€</span>
                <span className="text-[#888888]">/mois</span>
              </p>
              <PriceList items={freeFeatures} />
              <Link
                href="/register"
                className="landing-btn mt-auto flex h-[52px] w-full items-center justify-center rounded-[12px] border border-[#1E1E1E] text-sm font-bold text-white"
              >
                Créer mon compte
              </Link>
            </article>

            <article className="landing-card-featured relative flex flex-col items-center rounded-[16px] bg-[#111111] p-8 text-center">
              <p className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-[8px] bg-[#FF2D87] px-3 py-1 text-[11px] font-bold tracking-wide text-white">
                LE PLUS POPULAIRE
              </p>
              <h3 className="landing-title mt-4 text-[24px] text-white">
                QUTE+
              </h3>
              <p className="mt-3 text-center">
                <span className="text-[40px] font-bold text-white">4,99€</span>
                <span className="text-[#888888]">/mois</span>
              </p>
              <p className="mt-1 text-center text-[13px] text-[#FF2D87]">
                7 jours offerts · ou 39,99€/an
              </p>
              <PriceList items={plusFeatures} />
              <Link
                href="/register"
                className="landing-btn mt-auto flex h-[52px] w-full items-center justify-center rounded-[12px] px-3 text-center text-sm font-bold"
                style={gradient}
              >
                Essayer gratuitement
              </Link>
            </article>

            <article className="landing-card flex flex-col items-center rounded-[16px] bg-[#111111] p-8 text-center">
              <p
                className="mx-auto w-fit rounded-[8px] px-3 py-1 text-[11px] font-bold tracking-wide text-white"
                style={gradient}
              >
                PREMIUM
              </p>
              <h3 className="landing-title mt-4 text-[24px] text-white">
                QUTE Club
              </h3>
              <p className="mt-3 text-center">
                <span className="text-[40px] font-bold text-white">12,99€</span>
                <span className="text-[#888888]">/mois</span>
              </p>
              <p className="mt-1 text-center text-[13px] text-[#888888]">
                7 jours offerts · ou 99,99€/an
              </p>
              <PriceList items={clubFeatures} />
              <Link
                href="/register"
                className="landing-btn mt-auto flex h-[52px] w-full items-center justify-center rounded-[12px] px-3 text-center text-sm font-bold"
                style={gradient}
              >
                Essayer gratuitement
              </Link>
            </article>
          </div>
          <p className="mt-8 text-center text-[13px] text-[#555555]">
            Paiement sécurisé via Stripe. Sans engagement, résiliable à tout
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
          <h2 className="landing-title mt-6 text-center text-[40px] leading-tight text-white">
            On t&apos;attend.
          </h2>
          <p className="landing-copy mt-3 text-center text-[18px] text-white">
            Rejoins la communauté queer de Lyon. C&apos;est gratuit.
          </p>
          <Link
            href="/register"
            className="landing-btn mx-auto mt-8 flex h-[52px] w-full max-w-sm items-center justify-center rounded-[12px] bg-white text-sm font-bold text-[#FF2D87]"
          >
            Créer mon compte
          </Link>
          <p className="mt-4 text-center text-[13px] text-white/60">
            Réservé aux 18 ans et plus
          </p>
        </div>
      </section>

      <footer
        className="landing-section border-t border-[#1E1E1E] bg-[#0A0A0A] px-4 !py-8"
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
            <p className="font-bold tracking-[0.15em] text-white">QUTE</p>
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
