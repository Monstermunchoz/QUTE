"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { ShopModal } from "@/components/ui/ShopModal";
import { PLANS } from "@/lib/plans";

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
  const [shopOpen, setShopOpen] = useState(false);
  const [hintHidden, setHintHidden] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [ctaInView, setCtaInView] = useState(false);

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
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setHintHidden(y > 100);
      setPastHero(y > window.innerHeight * 0.75);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const cta = document.getElementById("landing-cta");
    if (!cta) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setCtaInView(entries.some((entry) => entry.isIntersecting));
      },
      { threshold: 0.2 },
    );

    observer.observe(cta);
    return () => observer.disconnect();
  }, []);

  function scrollToFeatures() {
    document.getElementById("landing-features")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  const showSticky = pastHero && !ctaInView;

  return (
    <div className="min-h-screen bg-[#000000] text-center text-white">
      <GradientDefs />

      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-[#1E1E1E] bg-[#000000]">
        <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.png"
              alt="Logo QUTE"
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

      <main>
      <section
        data-fade
        className="landing-section landing-hero px-4 pt-28"
        style={sectionStyle}
        aria-label="Présentation QUTE"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-icon.png"
          alt="Logo QUTE, lettre Q rose"
          className="logo-icon-hero"
          style={{ height: 180, margin: "0 auto 32px" }}
        />
        <h1 className="landing-title text-center text-[36px] text-white md:text-[48px]">
          Ta communauté. Ta ville. Ce soir.
        </h1>
        <p className="landing-copy mx-auto mt-4 text-center text-[18px] text-[#888888]">
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
        <button
          type="button"
          aria-label="Voir la suite"
          onClick={scrollToFeatures}
          className={`scroll-hint absolute bottom-8 z-10 text-[#888888] ${
            hintHidden ? "scroll-hint-hidden" : ""
          }`}
        >
          <svg
            width={28}
            height={28}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div className="landing-hero-fade" />
      </section>

      <section
        id="landing-features"
        data-fade
        className="landing-section bg-[#000000] px-4"
        style={sectionStyle}
        aria-label="Tout ce dont tu as besoin"
      >
        <div className="landing-inner mx-auto w-full max-w-5xl">
          <h2 className="landing-title text-center text-[32px] text-white">
            Tout ce dont tu as besoin
          </h2>
          <div className="mx-auto mt-10 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="landing-card flex flex-col items-center rounded-[16px] bg-[#111111] p-8 text-center"
              >
                <FeatureIcon name={feature.icon} />
                <h3 className="landing-title mt-4 text-center text-xl">
                  {feature.title}
                </h3>
                <p className="landing-copy mx-auto mt-3 text-center text-sm text-[#888888]">
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
        aria-label="Ce soir à Lyon"
      >
        <div className="landing-inner mx-auto w-full max-w-[620px]">
          <h2 className="landing-title text-center text-[32px] text-white">
            Ce soir à Lyon
          </h2>
          <p className="landing-copy mx-auto mt-4 text-center text-[18px] text-[#888888]">
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
        className="landing-section landing-shop px-4"
        style={sectionStyle}
        aria-label="QUTE Shop"
      >
        <div className="landing-inner relative z-10 mx-auto flex w-full max-w-[560px] flex-col items-center">
          <span className="rounded-[20px] bg-[#1E1E1E] px-4 py-1.5 text-[11px] font-bold tracking-[0.12em] text-[#FF2D87]">
            BIENTÔT
          </span>
          <h2 className="landing-title mt-4 text-center text-[36px] text-white">
            QUTE Shop
          </h2>
          <p className="landing-copy mx-auto mt-4 text-center text-[18px] text-[#888888]">
            Vêtements et accessoires queer, pensés pour la communauté. Des
            pièces qui te ressemblent, sans compromis.
          </p>
          <button
            type="button"
            onClick={() => setShopOpen(true)}
            className="landing-btn mx-auto mt-8 flex h-[52px] w-full max-w-sm items-center justify-center rounded-[12px] text-sm font-bold"
            style={gradient}
          >
            Accéder au shop
          </button>
          <p className="mt-4 text-center text-[13px] text-[#555555]">
            Les membres QUTE Club bénéficient de 10% de remise permanente.
          </p>
        </div>
      </section>

      <section
        data-fade
        className="landing-section bg-[#000000] px-4"
        style={sectionStyle}
        aria-label="Pensé pour nous, par nous"
      >
        <div className="landing-inner mx-auto w-full max-w-5xl">
          <h2 className="landing-title text-center text-[32px] text-white">
            Pensé pour nous, par nous
          </h2>
          <p className="landing-copy mx-auto mt-4 text-center text-[#888888]">
            QUTE n&apos;est pas une app de rencontres de plus. C&apos;est un
            espace communautaire local — pour discuter dans des salons, trouver
            un event, savoir où sortir, rencontrer des gens. En sécurité, entre
            nous.
          </p>
          <ul className="mx-auto mt-10 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            {strengths.map((item) => (
              <li
                key={item.title}
                className="flex flex-col items-center text-center"
              >
                <StrengthIcon name={item.icon} />
                <h3 className="landing-title mt-3 text-white">{item.title}</h3>
                <p className="landing-copy mx-auto mt-1 text-sm text-[#888888]">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        data-fade
        className="landing-section bg-[#000000] px-4"
        style={sectionStyle}
        aria-label="Choisis ton QUTE"
      >
        <div className="landing-inner mx-auto w-full max-w-5xl">
          <h2 className="landing-title text-center text-[32px] text-white">
            Choisis ton QUTE
          </h2>
          <p className="landing-copy mx-auto mt-3 text-center text-[#888888]">
            Commence gratuitement. Passe au niveau supérieur quand tu veux.
          </p>
          <div className="mx-auto mt-10 grid w-full grid-cols-1 items-stretch gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex flex-col items-center rounded-[16px] bg-[#111111] p-8 text-center ${
                  plan.featured ? "landing-card-featured" : "landing-card"
                }`}
              >
                {plan.badge && !plan.badgeGradient ? (
                  <p className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-[8px] bg-[#FF2D87] px-3 py-1 text-[11px] font-bold tracking-wide text-white">
                    {plan.badge}
                  </p>
                ) : null}
                {plan.badge && plan.badgeGradient ? (
                  <p
                    className="mx-auto w-fit rounded-[8px] px-3 py-1 text-[11px] font-bold tracking-wide text-white"
                    style={gradient}
                  >
                    {plan.badge}
                  </p>
                ) : null}
                <h3
                  className={`landing-title text-[24px] text-white ${
                    plan.featured || plan.badgeGradient ? "mt-4" : ""
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="mt-2 text-center text-[13px] italic text-[#888888]">
                  {plan.tagline}
                </p>
                <p className="mt-3 text-center">
                  <span className="text-[40px] font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-[#888888]">/mois</span>
                </p>
                {plan.note ? (
                  <p
                    className={`mt-1 text-center text-[13px] ${
                      plan.noteAccent ? "text-[#FF2D87]" : "text-[#888888]"
                    }`}
                  >
                    {plan.note}
                  </p>
                ) : null}
                <PriceList items={plan.items} />
                <Link
                  href="/register"
                  className={`landing-btn mt-auto flex h-[52px] w-full items-center justify-center rounded-[12px] px-3 text-center text-sm font-bold ${
                    plan.id === "gratuit"
                      ? "border border-[#1E1E1E] text-white"
                      : "text-white"
                  }`}
                  style={plan.id === "gratuit" ? undefined : gradient}
                >
                  {plan.id === "gratuit"
                    ? "Créer mon compte"
                    : "Essayer gratuitement"}
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-8 text-center text-[13px] text-[#555555]">
            Paiement sécurisé via Stripe. Sans engagement, résiliable à tout
            moment.
          </p>
        </div>
      </section>

      <section
        id="landing-cta"
        data-fade
        className="landing-section px-4"
        aria-label="Rejoindre QUTE"
        style={{
          ...sectionStyle,
          background: "linear-gradient(135deg, #FF2D87, #7B2FFF)",
        }}
      >
        <div className="landing-inner mx-auto flex w-full max-w-[620px] flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-icon.png"
            alt="Logo QUTE"
            height={80}
            className="logo-icon-cta"
            style={{ margin: "0 auto" }}
          />
          <h2 className="landing-title mt-6 text-center text-[40px] text-white">
            On t&apos;attend.
          </h2>
          <p className="landing-copy mx-auto mt-3 text-center text-[18px] text-white">
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
      </main>

      <footer
        className="landing-section border-t border-[#1E1E1E] bg-[#000000] px-4 !py-8"
        style={sectionStyle}
      >
        <div className="landing-inner mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-icon.png"
              alt="Logo QUTE"
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

      <div
        className={`fixed inset-x-0 bottom-0 z-30 h-[68px] border-t border-[#1E1E1E] bg-black/95 px-4 backdrop-blur-[12px] md:hidden ${
          showSticky
            ? "landing-sticky-cta landing-sticky-cta-visible"
            : "landing-sticky-cta"
        }`}
      >
        <Link
          href="/register"
          className="mt-2 flex h-[52px] w-full items-center justify-center rounded-[12px] text-sm font-bold"
          style={gradient}
        >
          Rejoindre QUTE
        </Link>
      </div>

      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} />
    </div>
  );
}
