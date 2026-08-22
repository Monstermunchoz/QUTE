# QUTE — migrations SQL

Ce document décrit l’état **local du repo** (`supabase/migrations/`). Il ne dit pas ce qui est déjà appliqué en production.

## Deux natures de fichiers

| Fichier | Rôle |
|---|---|
| `001_…sql` … `029_…sql` | Historique. Chaque fichier est un delta. **Ne pas les supprimer.** |
| `schema_complet.sql` | Schéma **courant fusionné**, idempotent. Sert à reconstruire une base vide. **Ce n’est pas une migration numérotée** : ne pas l’attendre du runner `supabase migration up`. |

Les numéros ne sont pas une chronologie parfaite : certains numéros sont doublés, un numéro est sauté, et le nom demandé pour un fichier ne correspond pas toujours au fichier présent.

## Particularités de numérotation

- **014 deux fois**
  - `014_discovery_visible.sql` — visibilité discovery + trigger d’inscription
  - `014_album.sql` — table `photos`
- **016** = copie de `014_album.sql` (même `create table if not exists public.photos`).
- **017** n’existe pas.
- Un fichier **025_bannissement** a été évoqué : **il n’est pas dans le repo**. Dans le dépôt actuel :
  - `024_emails_bannis.sql` = emails bannis + trigger d’inscription
  - `025_notifications_delete.sql` = policy DELETE sur `notifications`
  - `026_blocages_bidirectionnel.sql` = lecture des blocages par les deux côtés
  - `027_likes_lieux.sql` = likes de lieux
  - `028_photos_pending.sql` = photos en `pending`, plus d’auto-approve
  - `029_audit_log.sql` = RLS profils (connexion + photo approved) + journal d’audit admin

## Ordre d’application des fichiers numérotés

Ordre lexicographique des noms sur disque (celui qu’un runner du type `NNN_nom.sql` suivrait) :

1. `001_auth_profiles.sql`
2. `002_discovery.sql`
3. `003_qrush.sql`
4. `004_chat.sql`
5. `005_salons_groupes.sql`
6. `006_chat_libre.sql`
7. `007_evenements.sql`
8. `008_ce_soir.sql`
9. `009_moderation.sql`
10. `010_admin_role_read.sql`
11. `011_drop_role_trigger.sql`
12. `012_notifications.sql`
13. `013_rls_anon_lockdown.sql`
14. `014_album.sql` *(avant `014_discovery_visible` : « album » < « discovery »)*
15. `014_discovery_visible.sql`
16. `015_register_trigger.sql`
17. `016_album.sql` *(no-op si `photos` existe déjà)*
18. `018_je_sors_lieu.sql`
19. `019_salons_createur.sql`
20. `020_amis.sql`
21. `021_profils_complets.sql`
22. `022_evenements_premium.sql`
23. `023_stripe.sql`
24. `024_emails_bannis.sql`
25. `025_notifications_delete.sql`
26. `026_blocages_bidirectionnel.sql`
27. `027_likes_lieux.sql`
28. `028_photos_pending.sql`
29. `029_audit_log.sql`

`schema_complet.sql` n’entre pas dans cette liste.

## Appliqué vs à passer (repo local uniquement)

On ne connaît pas l’état d’une instance distante à partir de ce dépôt.

| Fichiers | Lecture locale |
|---|---|
| `001` → `023` | Historique long du schéma dans le repo. Sur une instance déjà utilisée, ils ont en général déjà été passés (SQL Editor ou runner). |
| `024` → `027` | Présents dans le repo. **Peuvent devoir être exécutés à la main** dans l’éditeur SQL Supabase s’ils n’ont pas encore été appliqués sur l’instance. |
| `028` | **Nouveau** dans le repo (`photos.statut` default `pending`, drop auto-approve, policies staff). À passer si l’instance a encore le default `approved`. |
| `029` | **Nouveau** : RLS profils (plus de lecture anonyme / pending public) + table `audit_log`. À passer dans l’éditeur SQL. |

Pour savoir ce qui manque sur une instance : comparer les objets (tables `emails_bannis`, `likes_lieux`, default de `photos.statut`, policy `supprime ses notifications`, policy `voit les blocages me concernant`).

## Utiliser `schema_complet.sql` sur une base vide

1. Créer un projet Supabase neuf (Auth + Postgres).
2. Ouvrir l’éditeur SQL.
3. Coller **tout** `supabase/migrations/schema_complet.sql` et l’exécuter une fois.
4. Vérifier : tables listées ci-dessous, RLS activé, bucket `avatars`, publication realtime (`messages`, `salon_messages`, `notifications`).

Le fichier est idempotent (`create table if not exists`, `add column if not exists`, `drop policy` puis `create policy`, `drop trigger` puis `create trigger`). On peut le relancer pour rattraper une base incomplète. Il n’écrase pas les lignes métier déjà présentes (les seeds salons / lieux s’insèrent seulement si le nom n’existe pas).

**Ne pas** enchaîner ensuite les fichiers `001`–`029` sur la même base : ce serait rejouer l’historique par-dessus un schéma déjà fusionné. Les numérotés restent pour l’historique git et pour les instances qui ont déjà suivi cet ordre.

Hors schéma (volontairement absent de `schema_complet.sql`) :

- événements de test datés `now() + interval` (`007`)
- promotions admin `MonsterP` / UUID (`009`, `010`, `011`)

## Tables du schéma courant

| Table | Origine principale |
|---|---|
| `profiles` | 001 + colonnes 002, 009, 019, 021, 023, 024 |
| `blocages` | 002 + lecture bidirectionnelle 026 |
| `qrushs` | 003 |
| `matchs` | 003 |
| `conversations` | 004 + chat libre 006 |
| `messages` | 004 + policies 006 |
| `salons` | 005 + `createur_id` 019 |
| `salon_messages` | 005 |
| `groupes` | 005 |
| `groupe_membres` | 005 |
| `lieux` | 006 |
| `evenements` | 007 + création premium 022/023 |
| `participations` | 007 |
| `je_sors` | 008 + `lieu_libre` 018 |
| `signalements` | 009 |
| `notifications` | 012 + DELETE 025 |
| `photos` | 014_album / 016 + default `pending` 028 |
| `amis` | 020 |
| `paiements` | 023 |
| `emails_bannis` | 024 |
| `likes_lieux` | 027 |
| `audit_log` | 029 |

Storage : bucket privé `avatars` (012) + policies 013 (pas de lecture anon ; `pending.jpg` réservé à soi + staff).

Realtime (uniquement ce que les numérotés ajoutent) : `messages`, `salon_messages`, `notifications`. `je_sors` n’est **pas** dans une publication des fichiers 001–028.

## Contradictions tranchées (la règle finale gagne)

| Sujet | Ancien | Courant |
|---|---|---|
| `profiles.photo_status` | default `pending` dès 001 | **inchangé** : `pending` |
| `photos.statut` | default `approved` (014_album / 016) | **`pending`** (028) |
| Auto-approve photo | évoqué / droppé en 028 | **pas** de trigger `on_photo_upload` ni de fonction `auto_approve_photo` |
| `handle_new_user` | 001 → 013 → 014_discovery → **015** | version **015** (ne bloque jamais `auth.users`) |
| Ban email | — | trigger **`prevent_banned_signup`** (024), séparé de `handle_new_user` |
| Lecture profils | 001 public → 013 masque `pending` → 014 pending listable | **029** : `auth.uid()` obligatoire ; seuls `photo_status = 'approved'`, le propriétaire et le staff voient le profil. Pas de lecture anonyme. |
| Création salon / événement | ouverte (007) puis premium (019/022) | **023** : `qute_plus` / `qute_club` **et** `abonnement_statut` in (`essai`,`actif`,`annule`) |
| Blocages | FOR ALL côté bloqueur (002) | 002 **plus** SELECT si `bloque_id` = moi (026) |
| RLS anon | policies `using (true)` | **013** : `auth.uid() is not null` partout côté métier |
| Policy admin profils | FOR ALL (009) | UPDATE + DELETE séparés (010), plus de SELECT staff via FOR ALL |
| Trigger `protect_profile_moderation` | présent un temps | **supprimé** (011) |

RLS est activé sur **toutes** les tables `public` listées ci-dessus.
