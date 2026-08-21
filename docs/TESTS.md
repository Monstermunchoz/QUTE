# QUTE — Tests manuels (lot 12)

Résultats : **code** = vérifié dans le code / RLS.
**UI** = à rejouer dans le navigateur (2 comptes) après `013` SQL.

Photos : `DECISIONS.md` impose **pending** avant discovery, pas d’auto-approve.

## Auth

- [x] Inscription avec email valide — Zod + `signUp` email/password. **UI** : créer un compte réel.
- [x] Inscription mineur bloquée (−18 ans) — message « Tu dois avoir 18 ans ou plus » (Zod + trigger SQL 013).
- [x] Login valide — `signInWithPassword` → `/accueil`.
- [x] Login mauvais mot de passe → « Identifiants incorrects. »
- [x] Accès `/accueil` sans connexion → middleware redirect `/login`.
- [x] Accès `/admin` sans rôle admin → layout redirect `/accueil` (pas de check rôle dans le middleware).

## Profils

- [x] Édition profil sauvegardée — `/moi` update `profiles` (pseudo min 3, bio max 300).
- [x] Upload photo → `photo_status = pending` (pas approved auto, conforme DECISIONS).
- [x] Profil pending invisible en discovery — filtre explorer + RLS 013 + `notFound` sur `/explorer/[id]`.

## QRUSH + Matchs

- [x] QRUSH envoyé — insert `qrushs`, unique (envoyeur, receveur).
- [x] Match créé si QRUSH mutuel — trigger `check_match`.
- [x] Modal match affichée — `MatchModal` si insert match après QRUSH.
- [x] Pas de notif au QRUSH unilatéral — trigger notif uniquement sur `matchs` insert.

## Chat

- [x] Premier message sans match possible — conversation `en_attente`.
- [x] Message en attente visible sur `/qute` — onglet « Messages en attente ».
- [x] Accepter → conversation `acceptee`.
- [x] Ignorer → `ignoree` (chat `notFound`).
- [x] Chat temps réel (2 onglets) — Realtime `postgres_changes` sur `messages`. **UI** : 2 navigateurs.

## JE SORS

- [x] Activation avec durée — 1h / 2h / 3h / nuit / custom.
- [x] Badge visible sur `/accueil` — cartes CE SOIR + `ProfileCard`.
- [x] Expiration auto après durée — RLS `expires_at > now()` + filtre client.
- [x] Désactivation manuelle — delete / upsert via `/moi`.

## Modération

- [x] Signalement envoyé — modal profil, 1–500 caractères.
- [x] Admin voit le signalement — `/admin/signalements`.
- [x] Admin peut publier un événement pending — `/admin/evenements`.
- [x] Blocage fonctionne — insert `blocages`, profil retiré d’explorer.

## Sécurité (lot 12)

- [x] Headers : `X-Frame-Options DENY`, `nosniff`, Referrer-Policy, Permissions-Policy (géoloc/cam/mic off).
- [x] Rewrites vides (anti-scraping placeholder).
- [x] `console.log` debug admin retirés.
- [x] Aucun TODO non résolu dans `src/`.
