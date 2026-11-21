# QUTE — le réseau libertin

Application web installable (PWA) de rencontres libertines : couples, célibertins, licornes,
personnes trans, gays et lesbiennes. Swipe, profils couple, validation à deux, carte des clubs
et saunas par région et par ville, agenda des soirées, lexique communautaire.

## Pages

- `/` : la page d'accueil (présentation, installation de l'appli, QR code)
- `/app/` : l'appli elle-même (installable sur l'écran d'accueil)

## Lancer

```bash
npm install
npm run dev          # développement
npm run build        # PWA installable (dossier dist/)
npm run build:single # un seul fichier HTML (dossier dist-single/), pratique pour une démo
```

## Pile technique

- React 19 + TypeScript + Vite
- Motion pour les gestes et animations (swipe, feuilles, transitions)
- Zustand (état persistant en local)
- vite-plugin-pwa (installation sur l'écran d'accueil, hors-ligne)
- Polices auto-hébergées (Syncopate pour le logo, Syne, Plus Jakarta Sans)

## Structure

```
src/
  landing/             page d'accueil (HTML léger, sans React)
  brand.ts             le symbole du logo, partagé par l'accueil et l'appli
  App.tsx              coque, onglets, fenêtres, thème clair/sombre/auto
  components/          Logo, CityPicker, Sheet, TabBar, Portrait, icônes
  screens/             Onboarding, Découvrir, Profil, Lieux, Soirées, Messages, Chat, Moi, pages
  data/                lieux, régions, lexique, profils et soirées de démonstration
  store/useApp.ts      état de l'appli
  styles/global.css    jetons de couleurs, thèmes, composants
```

## Règles et conformité intégrées

- Accès réservé aux 18 ans et plus, accord explicite pour les données sur la vie sexuelle (RGPD, art. 9)
- Charte du consentement, signalement et blocage, validation à deux pour les couples
- Photos privées floutées jusqu'à accord, mode discret, écran « quitter vite », flou dans le multitâche
- Export et suppression des données depuis l'onglet Moi

## À brancher avant la mise en ligne

- **Backend** : comptes, profils, messages, photos, modération (l'ancienne version du dépôt
  utilisait Supabase : voir la branche `ancienne-version`).
- **Vérification d'âge** par un prestataire conforme.
- **Paiement** par un prestataire qui accepte les services adultes (prix laissés en `[PRIX]`).
- **Annuaire** : les fiches de `src/data/venues.ts` sont à vérifier une par une ; les coordonnées
  sont approximatives. Les profils et soirées sont fictifs.
- **Logo** : symbole vectorisé depuis l'image fournie, à remplacer par le SVG du graphiste
  (`src/components/Logo.tsx`).
