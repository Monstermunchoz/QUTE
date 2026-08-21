# QUTE — Architecture technique V1

**Statut :** proposition à valider — aucune implémentation  
**Date :** 21 août 2026  
**Périmètre :** application web communautaire queer, locale, sociale et nightlife  
**Pilote :** Lyon / Rhône  
**Positionnement :** *QUTE = les rencontres + la communauté + la ville + ce soir.*

Ce document est le livrable unique de l’étape d’initialisation. Il ne constitue pas une spécification produit de remplacement : il traduit le cahier des charges en architecture technique, en distinguant explicitement **MVP**, **phases ultérieures** et **hors périmètre immédiat**.

> **Note de source.** Au moment de la rédaction, le dépôt GitHub `QUTE` est vide (aucune branche, aucun commit) et aucun fichier de cahier des charges n’est présent dans le workspace. L’architecture ci-dessous s’appuie sur le brief d’initialisation V1 et sur la liste d’entités fournie. Toute divergence avec le CDC papier / Figma devra être tranchée avant le sprint 1.

---

## 1. Vision technique

QUTE n’est pas un clone de dating app. Le système doit rester utile **sans** intention de rencontre : communauté locale, lieux, événements, salons, et surtout **CE SOIR**.

Les contraintes structurantes :

| Principe | Implication technique |
|---|---|
| Mobile-first, web | Next.js App Router, UI pensé pouce / une main, PWA éventuellement plus tard |
| Confiance avant croissance | RLS, modération, blocage, signalement dès le MVP |
| Localisation sensible | Hiérarchie Région → Département → Ville → Zone. Jamais de GPS utilisateur public |
| JE SORS est temporaire | Expiration **côté base**, jamais uniquement frontend |
| CE SOIR est une vue, pas un silo | Agrégation d’événements, lieux, disponibilités, salons |
| Données queer = données sensibles | Minimisation, classification, audit, pas de fuite par API « publique » |
| Un seul produit, un seul repo | Ce repository est exclusivement QUTE |
| Développement par lots | Aucune fonctionnalité majeure sans validation explicite |

**Stack cible (figée pour V1) :**

- Next.js + TypeScript (strict)
- Tailwind CSS + design system propriétaire QUTE
- Supabase : PostgreSQL, Auth, Storage, Realtime
- Vercel (hébergement + preview)
- GitHub (source of truth)
- Leaflet (cartes **lieux** uniquement)
- Resend (e-mails transactionnels)
- Sentry (erreurs)
- Stripe : **plus tard**
- Analytics privacy-first : **plus tard**

Cursor est l’environnement principal. Le rythme est : analyser → proposer → **attendre validation** → implémenter → tester → corriger → vérifier TS / lint / sécurité → résumer.

---

## 2. Architecture générale

### 2.1 Style

Application **monolithe web modulaire** (un seul app Next.js), pas un monorepo multi-apps pour le MVP.

```
[Navigateur]
    │  HTTPS
    ▼
[Vercel — Next.js]
    │  App Router : RSC par défaut, Client Components ciblés
    │  Middleware : session Supabase, headers sécurité, rate limit basique
    │  Route Handlers : webhooks, jobs internes, proxy tokens
    ▼
[Supabase]
    ├── Auth (session cookie httpOnly via @supabase/ssr)
    ├── PostgreSQL + RLS (source de vérité métier)
    ├── Storage (photos, preuves signalement)
    ├── Realtime (messages, JE SORS, notifications)
    └── Edge Functions / pg_cron (expiration, e-mails, nettoyage)
         │
         ├── Leaflet (lieux, jamais pin utilisateur)
         ├── Resend
         └── Sentry
```

### 2.2 Règle de circulation des données

1. Le **client ne parle jamais à la base avec une clé service**.
2. Les lectures / écritures utilisateur passent par le client Supabase **session utilisateur** → RLS.
3. Les opérations admin, webhooks, cron et stripping EXIF passent par le **serveur Next.js** ou une **Edge Function**, clé service, avec un second contrôle d’autorisation applicatif.
4. Toute mutation métier est validée par **Zod** (ou équivalent) **avant** l’écriture.
5. Aucune logique métier importante dans les composants UI.

### 2.3 Découpage logique (domaines)

| Domaine | Responsabilité MVP |
|---|---|
| `auth` | Inscription, connexion, majorité, session, récupération |
| `profiles` | Profil, photos, identités / orientations / pronoms / intérêts facultatifs, visibilité |
| `geo` | Région, département, ville, zone |
| `discovery` | Feed profils, filtres, en ligne, zone approx., exclusions blocage |
| `matching` | Like (KLIK), match, favoris |
| `messaging` | Conversations, messages, non lus, blocage |
| `community` | Salons, groupes, membres, règles |
| `places` | Lieux, catégories, horaires, favoris, retours |
| `events` | Événements, participants, favoris, rappels, discussion |
| `availability` | JE SORS (objet temporaire) |
| `tonight` | CE SOIR (composition, pas table maître) |
| `notifications` | In-app + e-mail transactionnel |
| `moderation` | Signalement, file, actions, historique |
| `admin` | Back-office interne |

Hors MVP (schéma réservé, pas d’implémentation) : Premium, Shop, QUTE Box, espace pro complet, paiements, marketplace, plans de sécurité avancés, vérification d’identité lourde.

---

## 3. Architecture frontend

### 3.1 Next.js App Router

- **React Server Components** par défaut (listes, fiches, SEO pages publiques limitées).
- **Client Components** uniquement pour : formulaires, chat, toggles JE SORS, cartes Leaflet, sheets, likes.
- **Server Actions** pour mutations simples authentifiées (profil, like, favori).
- **Route Handlers** (`app/api/...`) pour : webhooks Resend/Sentry, cron internes, uploads sensibles.
- **Middleware** : rafraîchissement session, protection des routes `(app)` et `(admin)`, headers CSP / HSTS.

Pas de pages marketing massives au sprint 1. Un socle `(public)` minimal (landing, mentions, âge) suffit.

### 3.2 Organisation orientée features

Pas un dump `components/`. Chaque domaine possède ses UI, hooks, schémas, services.

```
src/features/<domaine>/
  components/      # UI du domaine
  hooks/           # hooks client du domaine
  services/        # règles métier pures (testables)
  repositories/    # accès Supabase (requêtes)
  schemas/         # Zod
  types.ts
  index.ts         # façade publique du domaine
```

Un composant de `features/discovery` n’importe pas l’implémentation interne de `features/messaging`. Il passe par `index.ts`.

### 3.3 Couche UI partagée

`src/components/ui` = primitives du design system QUTE (bouton, input, card, sheet…).  
`src/components/layout` = chrome : bottom nav, top bar, shells.

Les primitives n’embarquent **aucune** règle métier (pas de « BoutonLike » générique qui écrit en base). Les actions métier vivent dans les features.

### 3.4 Navigation mobile-first

Barre inférieure fixe, 5 destinations :

| Tab | Intention | Contenu principal |
|---|---|---|
| **ACCUEIL** | Pouls local | Actu ville : JE SORS proches (zone), events du jour, salons chauds |
| **EXPLORER** | Découverte | Profils / lieux / événements, filtres |
| **CRÉER** | Composition | Action sheet : JE SORS, événement (si droit), éventuellement salon |
| **QUTE** | Signature | **CE SOIR** (hub) |
| **MOI** | Compte | Profil, réglages, sécurité, aide, mes convos / matchs |

Actions globales (top bar ou menu MOI) :

- Recherche
- Notifications
- Localisation / territoire (ville + zone affichée, pas de GPS)
- Sécurité
- Aide

**Décision à valider :** l’onglet **QUTE** = hub CE SOIR (recommandé, car c’est la signature produit). Messages / matchs accessibles depuis ACCUEIL et MOI, pas un 6e tab.

### 3.5 États UI obligatoires du design system

Chaque écran métier doit réutiliser : loading, empty, error, success. Pas d’états ad hoc non tokenisés.

### 3.6 Accessibilité

- Contraste WCAG AA minimum sur fond dark
- Focus visible
- Labels, `aria-*` sur nav et sheets
- Cibles tactiles ≥ 44px
- Réduction des animations si `prefers-reduced-motion`
- Textes FR d’abord (i18n plus tard)

---

## 4. Architecture backend

Le « backend » MVP est **Postgres + RLS + un mince serveur Next**.

### 4.1 Trois couches serveur

| Couche | Où | Rôle |
|---|---|---|
| **Validation** | `schemas/` + Server Actions / Route Handlers | Forme, tailles, enums, ownership déclaré |
| **Domaine** | `features/*/services/` | Match, expiration JE SORS, droits salon, CE SOIR scoring |
| **Persistance** | `features/*/repositories/` + SQL | Requêtes paramétrées, pas de SQL dans les composants |

### 4.2 Ce qui ne vit pas dans Next.js

- Expiration JE SORS, rappels events, purge soft-delete → **pg_cron** ou Edge Function planifiée
- Envoi e-mail fiable → Resend depuis Edge Function / Route Handler, pas depuis le navigateur
- Modération admin lourde → mêmes tables, rôle `admin` / `moderator`, UI `(admin)`

### 4.3 Matching (KLIK)

Règle proposée (à valider) :

1. A like B → ligne `likes` unique `(from_profile_id, to_profile_id)`
2. Si B a déjà liké A → création atomique d’un `matches` + conversation de type `match`
3. Un unlike avant match retire le like ; après match, règles à valider (unmatch)
4. **Favoris** : signet silencieux, **sans** notification, distinct du like

Le match ne se calcule **jamais** seulement dans React. Fonction SQL `create_like()` en transaction.

### 4.4 Non-lus messaging

Pas de table `unread_count` comme source de vérité.  
`conversation_participants.last_read_at` vs `messages.created_at`.  
Un compteur dénormalisé est optionnel (phase 1.1) s’il est mis à jour par trigger.

### 4.5 CE SOIR

Pas de table `tonight`. C’est un **service de composition** :

- événements dont `starts_at` ∈ [début soirée locale, fin de nuit]
- lieux ouverts ce créneau **ou** liés à un event ce soir
- `availability_statuses` actifs (`expires_at > now()`)
- salons avec activité récente
- scoring simple : même zone > même ville > intérêts communs > event commun

Filtres d’activité : type (event / lieu / personne / salon), zone, horaire, catégorie lieu.

---

## 5. Architecture Supabase

### 5.1 Projets

| Environnement | Usage |
|---|---|
| `qute-dev` | Développement local + preview |
| `qute-staging` | Recette pilote interne |
| `qute-prod` | Lyon pilote |

Un projet Supabase ≠ un environnement mélangé. Les clés prod ne quittent pas Vercel.

### 5.2 Auth

- E-mail + mot de passe en MVP
- Magic link / OAuth : plus tard (décision §20)
- Session cookie via `@supabase/ssr` (pas de token dans `localStorage`)
- Confirmation e-mail via Resend (template QUTE)
- Récupération de compte : reset password standard Auth
- **Majorité :** case obligatoire + `date_of_birth` stockée côté **compte privé** + `majority_attested_at`
- Compte `pending` tant que e-mail non confirmé **ou** majorité non attestée

### 5.3 PostgreSQL

- Extensions prévues : `pgcrypto`, `pg_trgm` (recherche), `citext` (pseudo), `pg_cron` si dispo
- Soft delete sur profils / messages / lieux (`deleted_at`)
- `updated_at` par trigger
- UUID `gen_random_uuid()` partout

### 5.4 Storage

Voir §9.

### 5.5 Realtime

Voir §10. Realtime **n’est pas** un bus métier pour les règles d’expiration.

### 5.6 Migrations

- Uniquement via `supabase/migrations/` versionnées
- Jamais de changement de schéma « à la main » en prod
- RLS activé **dans la même migration** que `create table` (jamais une table sans RLS, même 5 minutes)

---

## 6. Modèle de données MVP

### 6.1 Classification des entités du CDC

| Entité CDC | Décision V1 |
|---|---|
| User / Profile / ProfilePhoto | **MVP** (`accounts`, `profiles`, `profile_photos`) |
| IdentityOption, OrientationOption, PronounOption, Interest | **MVP** (catalogues + tables de liaison) |
| Like, Match | **MVP** |
| Conversation, Message | **MVP** |
| Room, RoomMember, Group, GroupMember | **MVP** (périmètre fonctionnel réduit) |
| Place, PlaceCategory, PlaceFavorite, PlaceReview | **MVP** |
| Event, EventParticipant, EventReminder | **MVP** |
| AvailabilityStatus | **MVP** (JE SORS) |
| Notification, Report, Block | **MVP** |
| AuditLog | **MVP** (écritures serveur) |
| Verification | **Plus tard** (au-delà de l’attestation majorité) |
| SafetyPlan, SafetyCheckIn | **Plus tard** (prioritaire post-MVP, pas sprint 1) |
| ProfessionalAccount | **Plus tard** |
| Product, ProductCategory, Cart, Order, OrderItem | **Ne pas créer** |
| Subscription, SubscriptionPlan | **Ne pas créer** |
| Partner, Promotion | **Plus tard** |
| QuteBox, QuteBoxSubscription | **Ne pas créer** |

Favoris profils : table `profile_favorites` (CDC « favoris » dans KLIK), **MVP**.  
Réactions messages : **phase 1.1**, pas bloquant MVP.  
Horaires lieux : `place_hours`, **MVP**.  
Rôles : `account_roles`, **MVP** (user / moderator / admin).

### 6.2 Enums proposés

```text
account_status        : pending | active | suspended | banned | deleted
profile_visibility    : city | members | hidden
photo_moderation      : pending | approved | rejected
like_kind             : klik          -- réserve d’évolution
conversation_type     : match | room | group | event | direct
message_status        : visible | deleted | moderated
member_role           : member | moderator | owner
place_status          : draft | published | hidden
event_status          : draft | published | cancelled | ended
availability_visibility : city | matches | hidden
report_target_type    : profile | photo | message | room | group | place | event | availability
report_status         : open | reviewing | resolved | dismissed
moderation_action_type: warn | hide | suspend | ban | restore | delete_content
notification_type     : match | message | event | reminder | moderation | system
geo_level             : region | department | city | zone
```

### 6.3 Géographie

```text
regions            id PK, name, country_code
departments        id PK, region_id FK, name, code (ex. 69)
cities             id PK, department_id FK, name, slug, bbox optionnelle
zones              id PK, city_id FK, name, slug
                   -- polygone interne optionnel (jamais exposé comme adresse user)
```

Pilote : une région, un département (Rhône), Lyon + communes limitrophes si besoin, zones d’arrondissement / quartiers.

**Index :** `cities.slug UNIQUE`, `zones (city_id, slug) UNIQUE`.

### 6.4 Comptes et profils

**`accounts`** — **privé / sensible** (jamais listé en discovery)

| Colonne | Notes |
|---|---|
| `id` PK UUID = `auth.users.id` | 1:1 |
| `email` | copie non autoritative, Auth reste maître |
| `status` | enum `account_status` |
| `date_of_birth` | **sensible**, jamais envoyé aux autres clients |
| `majority_attested_at` | preuve d’attestation |
| `last_seen_at` | présence approx. |
| `locale` | `fr` |
| `created_at` / `updated_at` / `deleted_at` | |

**`account_roles`**

| Colonne | Notes |
|---|---|
| `account_id` FK | |
| `role` | `user` \| `moderator` \| `admin` |
| PK `(account_id, role)` | |

**`profiles`** — **public conditionnel**

| Colonne | Notes |
|---|---|
| `id` PK UUID | peut = `accounts.id` (1:1 recommandé) |
| `account_id` FK UNIQUE | |
| `display_name` | pseudo / nom d’affichage |
| `slug` | unique, citext |
| `bio` | texte court |
| `city_id` FK | obligatoire MVP |
| `zone_id` FK nullable | zone approx. |
| `visibility` | enum |
| `show_online` | bool |
| `is_complete` | gate discovery |
| timestamps / `deleted_at` | |

Pas de `lat`, `lng`, `geohash` utilisateur.

**Catalogues + liaisons (facultatif profil) :**

```text
identity_options, orientation_options, pronoun_options, interests
profile_identities     (profile_id, option_id) PK
profile_orientations   (profile_id, option_id) PK
profile_pronouns       (profile_id, option_id) PK
profile_interests      (profile_id, interest_id) PK
```

**`profile_preferences`** — **privé** (filtres discovery de *mon* côté : âges, zones, identités recherchées). Jamais lisible par autrui.

**`profile_photos`**

| Colonne | Notes |
|---|---|
| `id` PK | |
| `profile_id` FK | |
| `storage_path` | |
| `sort_order` | |
| `is_primary` | |
| `moderation_status` | pending → pas dans discovery |
| `created_at` | |

Index : `(profile_id, sort_order)`, unique partiel une photo primary par profil.

### 6.5 KLIK

**`likes`**

- PK `id`
- `from_profile_id` FK, `to_profile_id` FK
- UNIQUE `(from_profile_id, to_profile_id)`
- CHECK `from_profile_id <> to_profile_id`
- Index `(to_profile_id, created_at desc)`

**`matches`**

- `profile_a_id`, `profile_b_id` avec CHECK `profile_a_id < profile_b_id` (canonicalisation)
- UNIQUE `(profile_a_id, profile_b_id)`
- `conversation_id` FK
- `unmatched_at` nullable

**`profile_favorites`**

- UNIQUE `(profile_id, target_profile_id)`
- CHECK différents
- Pas de notification

### 6.6 Messaging

**`conversations`** : `id`, `type`, `created_at`, `last_message_at`

**`conversation_participants`** : `(conversation_id, profile_id)` PK, `last_read_at`, `muted_at`, `left_at`

**`messages`** : `id`, `conversation_id` FK, `sender_profile_id` FK, `body`, `status`, `created_at`, `deleted_at`

Index : `(conversation_id, created_at desc)`

**Hors MVP immédiat :** `message_reactions`, pièces jointes riches.

### 6.7 Community

**`rooms`** : salon thématique / ville. `city_id`, `name`, `slug`, `description`, `rules`, `is_public`, `created_by`

**`room_members`** : `(room_id, profile_id)`, `role`, `joined_at`

Un salon public peut avoir une `conversation` de type `room` (1:1 room ↔ conversation).

**`groups`** : plus fermé (join sur demande / invitation). Champs proches.

**`group_members`** : idem.

MVP : CRUD réduit, une conversation par salon/groupe, règles texte, pas de forum imbriqué.

### 6.8 Places & events

**`place_categories`** : catalogue (bar, club, asso, café, lieu culturel…)

**`places`** : `name`, `slug`, `category_id`, `city_id`, `zone_id`, `address` (adresse du **lieu**, publique), `lat`/`lng` (lieu uniquement), `description`, `status`, `created_by`

**`place_hours`** : `place_id`, `weekday`, `opens_at`, `closes_at`, `is_closed`

**`place_favorites`**, **`place_reviews`** : auteur, note/texte, `moderation_status`

**`events`** : `title`, `slug`, `place_id` nullable, `city_id`, `starts_at`, `ends_at`, `timezone` (`Europe/Paris`), `organizer_profile_id`, `status`, `cover_path`

**`event_participants`** : statut `going` \| `interested`

**`event_reminders`** : `profile_id`, `event_id`, `remind_at`, `sent_at`

Discussion event = `conversations.type = event`.

### 6.9 JE SORS — `availability_statuses`

Objet temporaire, pas un flag booléen sur `profiles`.

| Colonne | Règle |
|---|---|
| `id` PK | |
| `profile_id` FK | un **actif** max (unique partiel `WHERE expires_at > now() AND cancelled_at IS NULL`) |
| `status` | `out` (extensible plus tard) |
| `starts_at` | serveur |
| `expires_at` | **obligatoire**, serveur |
| `visibility` | enum |
| `event_id` FK nullable | |
| `place_id` FK nullable | |
| `note` | court, optionnel, modéré |
| `cancelled_at` | |

**Actif si et seulement si :**

```sql
cancelled_at IS NULL
AND starts_at <= now()
AND expires_at > now()
AND profiles/accounts non bannis
```

Le frontend peut afficher un countdown. Il **ne décide pas** de l’expiration.

Job : toutes les minutes, optionnellement passer un `status_expired` pour Realtime ; les lectures **filtrent toujours** `expires_at > now()`.

### 6.10 Modération, blocage, notifs, audit

**`blocks`** : `blocker_profile_id`, `blocked_profile_id`, UNIQUE, CHECK différents.  
Effet : exclusion discovery, messaging, JE SORS, participants visibles.

**`reports`** : `reporter_id`, `target_type`, `target_id`, `reason`, `details`, `status`, `assigned_to`

**`moderation_actions`** : `report_id` nullable, `actor_id`, `action`, `target_type`, `target_id`, `payload jsonb`

**`notifications`** : `profile_id`, `type`, `payload`, `read_at`

**`audit_logs`** — **admin only** : `actor_id`, `action`, `entity`, `entity_id`, `metadata`, `created_at`  
Pas d’IP/user-agent nominatifs dans les logs client Sentry si évitables ; côté audit serveur, minimiser.

### 6.11 Données publiques / privées / sensibles

| Classe | Exemples | Accès |
|---|---|---|
| Publique produit | lieux publiés, events publiés, catalogues | Lecture authentifiée MVP (pas d’API anonyme de profils) |
| Publique conditionnelle | profil (selon visibilité + non-blocage + photo approved) | RLS |
| Privée user | messages, likes envoyés, préférences, favoris, last_read | owner / participants |
| Sensible | DOB, e-mail, preuves report, audit, rôles | owner restreint ou staff |
| Interdite | GPS utilisateur, adresse personnelle | **ne pas stocker** |

### 6.12 Index MVP supplémentaires

- `profiles (city_id)` WHERE `deleted_at IS NULL`
- `profiles (zone_id)`
- `availability_statuses (expires_at)` WHERE `cancelled_at IS NULL`
- `availability_statuses (profile_id, expires_at desc)`
- `events (city_id, starts_at)` WHERE `status = 'published'`
- `reports (status, created_at)`
- `notifications (profile_id, created_at desc)`
- `blocks (blocked_profile_id)`

---

## 7. Modèle de permissions

### 7.1 Rôles

| Rôle | Pouvoir |
|---|---|
| `anonymous` | Landing, mentions. **Pas** de listing profils |
| `user` | CRUD de son compte/profil, like, chat post-match, JE SORS, participation events, signalement |
| `moderator` | File signalements, hide contenu, suspendre temporairement |
| `admin` | Tout moderator + lieux/events/salons globaux, rôles, bans, audit |

Pas de rôle `professional` en MVP.

### 7.2 Ownership

- Un profil n’est mutable que par son `account_id`
- Photos : owner + staff
- Messages : sender peut soft-delete **son** message ; pas d’édition libre MVP (à valider)
- Lieux / events créés par user : owner jusqu’à reprise staff
- Actions de modération : staff uniquement, toujours auditées

### 7.3 Gates produit

1. Auth + e-mail confirmé + majorité attestée + `status = active`
2. Profil « complet » (photo approuvée, display_name, ville) pour **discovery / KLIK / JE SORS public**
3. Match pour conversation `type = match`
4. Membre pour écrire dans salon/groupe
5. Non-blocage mutuel partout

---

## 8. Stratégie RLS

Principe : **deny by default**. `ENABLE ROW LEVEL SECURITY` + aucune policy `anon` sur les tables personnes.

Patron récurrent :

```sql
-- helper SECURITY DEFINER (strict, search_path fixe)
is_staff()
is_not_blocked(a, b)
profile_visible_to(viewer, owner)
```

Exemples de policies (intention, pas encore de migration) :

| Table | SELECT | INSERT/UPDATE/DELETE |
|---|---|---|
| `accounts` | soi \| staff | soi (champs limités) \| staff |
| `profiles` | visible ∧ ¬blocked ∧ actif | owner \| staff |
| `profile_preferences` | owner \| staff | owner |
| `profile_photos` | photo approved ∧ profil visible ; owner voit pending | owner insert ; update moderation = staff |
| `likes` | from = moi OU to = moi | insert from = moi ; delete from = moi |
| `matches` | je suis a ou b | insert via fonction SQL only (`REVOKE` client) |
| `messages` | participant | insert si participant ∧ ¬left ; pas d’update client |
| `availability_statuses` | actif ∧ visibility ∧ ¬blocked ∧ profil visible ; owner voit les siens | owner insert/cancel |
| `places` / `events` | published \| owner \| staff | owner limité \| staff |
| `reports` | reporter voit les siens ; staff voit tout | insert reporter = moi |
| `audit_logs` | staff | insert service_role only |
| `blocks` | blocker = moi (pas la liste globale) | blocker = moi |

**Realtime** : les policies SELECT s’appliquent aux changements. Un user ne doit pas recevoir les JE SORS des comptes bloqués.

**Fonctions `SECURITY DEFINER`** : liste courte, `GRANT` minimal, `SET search_path = public`. Utilisées pour like/match atomique et quelques vues staff.

**Tests RLS** obligatoires avant ouverture : user A ne lit pas DOB de B, messages d’autrui, reports d’autrui, JE SORS `hidden`, profils `hidden`.

---

## 9. Gestion des fichiers

### 9.1 Buckets

| Bucket | Visibilité | Contenu |
|---|---|---|
| `profile-photos` | privé + chemins signés / policy lecture si photo approved | avatars |
| `place-photos` | lecture authentifiée si lieu published | |
| `event-covers` | idem | |
| `report-evidence` | staff only | |

Pas de bucket public anonyme en MVP (anti-scraping).

### 9.2 Upload

- Client : upload vers chemin `/{account_id}/...` uniquement
- MIME allowlist : `image/jpeg`, `image/png`, `image/webp`
- Taille max (proposition) : 5 Mo photo profil, 8 Mo cover
- Dimensions min pour photo profil
- **Strip EXIF / GPS** côté serveur (Edge Function) avant publication
- Virus/malware : plus tard si volume
- `moderation_status = pending` jusqu’à review manuelle MVP (file admin). Auto-modération ML : plus tard

### 9.3 Lecture

URLs signées courte durée **ou** policy Storage alignée RLS. Pas d’URL éternelle devinable.

---

## 10. Stratégie temps réel

| Canal | Usage MVP | Priorité |
|---|---|---|
| Messages d’une conversation | append live | haute |
| Notifications perso | badge | haute |
| JE SORS / présence CE SOIR | invalidation liste ville | moyenne |
| Salon | messages | moyenne |
| Typing / presence fine | | plus tard |

Règles :

- S’abonner **par conversation**, pas à `messages` global
- Presence « en ligne » = `last_seen_at` heartbeat 60s, affiché seulement si `show_online`
- Expiration JE SORS : le client **requête** `expires_at > now()` ; Realtime est un confort
- Backoff + fallback polling léger si Realtime down

---

## 11. Stratégie localisation

```
Région → Département → Ville → Zone
```

| Entité | Précision |
|---|---|
| Utilisateur | ville obligatoire, zone optionnelle, **jamais lat/lng** |
| JE SORS | hérite ville/zone du profil + lieu/event optionnels |
| Lieu | adresse + lat/lng **du POI** |
| Event | lieu ou ville |
| Carte Leaflet | pins **lieux** (et events géolocalisés via lieu). **Zéro pin personne** |

Anti-inférence :

- Pas de heatmap de users
- Pas de « distance en mètres »
- Zone assez large (quartier / arrondissement, pas immeuble)

Changement de territoire : action explicite dans l’UI globale, persistée sur `profiles.city_id` / `zone_id`.

---

## 12. Stratégie sécurité

Sécurité **avant** les features.

1. **Secrets** : Vercel env, jamais Git. `.env.example` sans valeurs au scaffolding.
2. **RLS** partout (§8).
3. **Validation** Zod isomorphe (client UX + serveur vérité).
4. **CSP**, `X-Frame-Options`, `Referrer-Policy`, cookies `Secure` `HttpOnly` `SameSite=Lax`.
5. **Rate limiting** : middleware (IP + `account_id`) sur auth, like, messages, reports, search. Compteur Postgres ou service edge ; Redis/Upstash seulement si le basique saturé.
6. **Anti-bot** : captcha (Turnstile) sur signup / reset ; throttling Auth.
7. **Anti-scraping** : auth obligatoire pour profils, pagination cursor, pas de dump, pas de sitemap profils, photos non publiques devinables.
8. **Blocage / signalement** dès le premier écran social.
9. **Staff** : 2FA plus tard ; en MVP accès admin restreint par rôle + allowlist e-mail interne.
10. **Sentry** : scrub e-mail, DOB, tokens, corps de messages.
11. **Dépendances** : lockfile, pas d’install « au cas où ».
12. **Droit à l’oubli** : `deleted_at` + job d’anonymisation (phase proche post-MVP, à cadrer légalement).

Le système ne doit jamais permettre à un user d’obtenir une ligne RLS-interdite, y compris via Realtime, Storage, RPC ou IDOR (`/profiles/[id]`).

---

## 13. Stratégie modération

### 13.1 Utilisateur

- Signaler : profil, photo, message, salon, groupe, lieu, event, JE SORS
- Bloquer : coupure discovery + chat + visibilité JE SORS
- Règles de salon visibles

### 13.2 Staff

File unique `reports` + filtres. Actions : hide contenu, reject photo, warn, suspend, ban, restore. Chaque action → `moderation_actions` + `audit_logs` + notif cible si pertinent.

### 13.3 Automatique MVP

- Photo `pending` invisible en discovery
- Compte `banned` / `suspended` : session invalidable (middleware lit `accounts.status`)
- Rate limit reports (anti-abus)

### 13.4 Plus tard

ML image, verification ID, Safety Plan / Check-in, trusts circles.

---

## 14. Design system prévu

À construire **avant** le développement massif des écrans. Branding dark / premium / techno / nightlife / queer : magenta, violet, rose, typo forte, animations légères.

Les tokens ci-dessous sont des **placeholders** (aucun fichier brand dans le repo). À recaler sur la charte officielle avant implémentation UI.

### 14.1 Tokens

```text
color.bg.canvas          #0B0612
color.bg.surface         #16101F
color.bg.surfaceElevated #1F172C
color.border.subtle      #2A2238
color.text.primary       #F7F2FA
color.text.muted         #A89BB8
color.accent.magenta     #E11D8F
color.accent.violet      #7C3AED
color.accent.pink        #F472B6
color.danger             #F43F5E
color.success            #34D399
color.warning            #FBBF24

font.display             (forte, à valider — ex. Syne / Clash Grotesk)
font.body                (lisible — ex. Satoshi / Inter)

space     4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
radius    sm 8 / md 14 / lg 22 / full pill
shadow    glow magenta très léger, pas de drop-shadow dirty
motion    150–250ms, easing standard, respect reduced-motion
```

### 14.2 Composants à produire en premier (pas les pages)

Buttons, IconButtons, Inputs, Textareas, Selects, Toggles  
Cards, Badges, Avatars, Chips (identité / intérêt)  
Navigation (bottom tabs, top bar)  
Modals, Sheets (CRÉER, filtres)  
Toasts / notifications  
Skeletons, Empty, Error, Success  
Map container (lieux only)

Pas de kit générique visible (Material, shadcn « tel quel »). Si un primitive headless est utilisé en interne, il est **recouvert** par les tokens QUTE.

---

## 15. Structure des dossiers

Proposition (à créer seulement après validation de ce document) :

```text
/
  docs/
    ARCHITECTURE.md          ← ce fichier
  src/
    app/
      (public)/              # landing, légal, âge
      (auth)/                # login, signup, reset
      (app)/                 # ACCUEIL EXPLORER CRÉER QUTE MOI
        accueil/
        explorer/
        creer/
        qute/                # CE SOIR
        moi/
        messages/            # sous-route, pas un tab
        profiles/[id]/
        places/[id]/
        events/[id]/
        rooms/[id]/
      (admin)/
      api/
      layout.tsx
    components/
      ui/
      layout/
    features/
      auth/
      profiles/
      geo/
      discovery/
      matching/
      messaging/
      community/
      places/
      events/
      availability/
      tonight/
      notifications/
      moderation/
      admin/
    lib/
      supabase/              # browser, server, middleware, admin
      security/
      validation/
      realtime/
      utils/
    types/
    hooks/                   # hooks vraiment transverses
    config/                  # nav, constantes, feature flags
  supabase/
    migrations/
    functions/
  public/
  .env.example               # plus tard, sans secrets
```

TypeScript strict, path aliases `@/`, pas d’imports circulaires features.

---

## 16. Roadmap technique

Ordre volontaire : **socle → confiance → cœur social → ville → signature**.

| Lot | Contenu | Code ? |
|---|---|---|
| **0** | Scaffold Next + Tailwind + tokens + Supabase local + env + Sentry + CI lint/TS | après validation §20 |
| **1** | Auth, majorité, session, récupération, `accounts` / rôles | oui, lot dédié |
| **2** | Design system primitives + chrome nav | oui |
| **3** | Profil, photos, catalogues, geo Lyon, visibilité | oui |
| **4** | Discovery + blocage + signalement (socle) | oui |
| **5** | KLIK + match | oui |
| **6** | Messaging + non lus + Realtime | oui |
| **7** | Places + events (CRUD réduit, favoris, rappels) | oui |
| **8** | JE SORS (expiration SQL) | oui |
| **9** | CE SOIR (composition + filtres) | oui |
| **10** | Salons / groupes MVP | oui |
| **11** | Admin + file modération + audit | oui |
| **12** | Durcissement : rate limit, captcha, tests RLS, strip EXIF | oui |

**Ensuite seulement :** Safety Plan, verification, pro, Stripe, Shop, QUTE Box, analytics, i18n, PWA, réactions messages.

Chaque lot : plan → **validation humaine** → implémentation → tests → TS/lint/sécu → résumé.

---

## 17. Dépendances externes

| Service | Rôle MVP | Notes |
|---|---|---|
| GitHub | source | remote déjà `origin`, branche `main` |
| Vercel | host / preview | lier après premier commit autorisé |
| Supabase | BaaS | 3 env |
| Leaflet | cartes lieux | tuiles CartoDB, pas de token |
| Resend | e-mails | domaine à configurer |
| Sentry | erreurs | PII scrub |
| Turnstile (proposé) | anti-bot | à valider |
| Stripe | paiements | **plus tard** |
| Analytics | produit | **plus tard**, privacy-first |

Packages npm : n’installer **que** ce qu’un lot validé exige. Pas de lib dating, pas de store générique, pas de Stripe SDK maintenant.

---

## 18. Variables d’environnement prévues

Aucune valeur secrète dans Git. Noms proposés :

```text
# App
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_DEFAULT_CITY_SLUG=lyon

# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          # serveur only

# Resend
RESEND_API_KEY
RESEND_FROM_EMAIL

# Sentry
SENTRY_DSN
SENTRY_AUTH_TOKEN                  # CI

# Captcha (si validé)
TURNSTILE_SECRET_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY
```

Plus tard : `STRIPE_*`, analytics.

Documenter dans `.env.example` au lot 0. **Ne pas créer ce fichier tant que le scaffolding n’est pas validé.**

---

## 19. Risques techniques

| Risque | Impact | Mitigation |
|---|---|---|
| Densité faible à Lyon au lancement | Discovery vide, CE SOIR pauvre | Seed lieux/events, salons ville, JE SORS même sans match |
| RLS incomplet | Fuite profils / messages / DOB | Tests RLS, pas de table sans policy, revue sécu chaque lot |
| Inférence de position | Sécurité physique | Pas de GPS user, zones larges, carte lieux only |
| Scraping de profils queer | Doxxing | Auth wall, rate limit, photos non publiques, pas d’API liste anonyme |
| Expiration JE SORS côté client | Faux « encore dehors » | Filtre SQL + cron |
| Photos + EXIF GPS | Fuite domicile | Strip serveur, pending moderation |
| Realtime coûteux / leaky | Facture + IDOR live | Canaux étroits, policies SELECT |
| Modération 24/7 nightlife | Contenu toxique la nuit | Pending photos, report rapide, staff rota (process, pas code) |
| Majorité / CNIL | Légal | DOB privé, minimisation, attestation horodatée, DPO process |
| Scope creep Shop / Box / Pro | Retard cœur produit | Refus d’implémenter hors roadmap |
| Un seul admin sans audit | Abus interne | `audit_logs` dès lot 11, idéalement plus tôt sur actions staff |

---

## 20. Décisions à valider avant le premier sprint

1. **Onglet QUTE** = hub CE SOIR (recommandé) ?
2. **Auth** : e-mail/mot de passe seulement, ou magic link dès le MVP ?
3. **Captcha Turnstile** dès le signup ?
4. **Pseudo unique** (`slug`) vs display_name libre non unique ?
5. **Âge affiché** : jamais / tranche / âge exact (recommandé : jamais l’âge exact public) ?
6. **Photos** : revue manuelle obligatoire avant discovery (recommandé MVP) ?
7. **Like** : notification au like, ou seulement au match ?
8. **Unmatch** : comportement messages (geler / cacher / supprimer) ?
9. **CRÉER événement** : tous les users ou staff + organisateurs validés ?
10. **Salons** : pré-créés par QUTE vs création user ?
11. **Périmètre geo pilote** : Lyon intra-muros seulement, ou Métropole ?
12. **Zones** : liste officielle des quartiers/arrondissements ?
13. **Durées JE SORS** : 1h / 2h / 4h / jusqu’à 4h du matin ? max ?
14. **Présence en ligne** : opt-in par défaut ou opt-out ?
15. **Messages** : édition autorisée ou soft-delete only ?
16. **Landing publique** : minimale vs marketing complet avant prod ?
17. **Design** : fournir tokens / fonts / logo officiels avant lot 2 ?
18. **Admin** : URL séparée `admin.qute…` ou route `(admin)` protégées ?
19. **Tests** : Vitest + tests RLS SQL dès le lot 1 (recommandé) ?
20. **PWA / notifications push** : hors MVP (recommandé) ?

Tant que ces points ne sont pas tranchés, **ne pas scaffolder** au-delà de ce document.

---

## Annexes

### A. Ce que cette étape n’a pas fait

- Aucun autre fichier que `docs/ARCHITECTURE.md`
- Aucune migration
- Aucun package
- Aucune page, aucun composant
- Aucun commit / push dans le cadre de cette rédaction (hors instruction git séparée)

### B. Principe de travail Cursor (rappel)

1. Analyser  
2. Proposer un plan  
3. **Attendre validation**  
4. Implémenter  
5. Tester  
6. Corriger  
7. Vérifier TypeScript  
8. Vérifier lint  
9. Vérifier sécurité  
10. Résumer les changements  

Ne jamais enchaîner une fonctionnalité majeure sans validation.
