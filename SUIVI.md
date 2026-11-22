# SUIVI — Purity Test

## 🧭 Ligne directrice
*(maj 2026-11-22)* — **v1 EN LIGNE** : https://floran-grmxx.github.io/purity-test/
(repo public `Floran-grmxx/purity-test`, déploiement auto à chaque push sur `main`).
**Nouveau (pushé le 2026-11-22)** : **prérequis logiques** `onlyIf` — une réponse
« jamais » masque les questions qui n'ont plus de sens (jamais bu → plus de questions
alcool, aucune drogue → plus de questions d'usage, pas de rapport → plus de questions
sur les rapports) + correction des tranches de réponses. **54/54 tests verts**, build
propre. **Prochaine priorité** : vérif visuelle sur téléphone, choix du nom.

## ✅ Fait
- [x] Cadrage (QCM pondéré, 5 catégories, ton sérieux + questions trash)
- [x] Architecture (100 % local, PWA, React + Vite + Tailwind, score /500)
- [x] Spec de design (`docs/2026-06-16-purity-test-design.md`)
- [x] Scaffold Vite + React + TS + Tailwind v4 + PWA
- [x] `lib/scoring.ts` + tests (7)
- [x] `lib/storage.ts` (localStorage tolérant aux erreurs)
- [x] `lib/share.ts` (encode/décode URL) + tests (4)
- [x] 100 questions (20 × 5, générées par 5 sous-agents) + test d'intégrité (16)
- [x] Écrans : Accueil, Hub, Quiz, Résultat catégorie, Résultat global, Partage
- [x] Composants UI (ProgressBar, ScoreRing, CategoryBar, CategoryCard, Button)
- [x] Titres de profil (9 paliers /500)
- [x] Gate 18+ / avertissement
- [x] Icônes + manifest PWA
- [x] Smoke test de rendu (monte l'app sur toutes les routes) (4)
- [x] Build + typecheck propres
- [x] Moteur de **questions conditionnelles** : type `requires`, visibilité
  dynamique (`lib/questions.ts`), Quiz qui révèle les suivis inline, complétion
  sur les questions visibles, score **cumulatif** (max = banque complète)
- [x] **Échelles de réponses variables** (4–6 options, quantitatives) sur les 5 catégories
- [x] Contenu réécrit par 5 sous-agents + tests de branchement (`lib/questions.test.ts`, 8) → **45 tests**

- [x] Audit logique de tout le test + **prérequis `onlyIf`** (OU entre plusieurs
  déclencheurs) sur sexe/drogue/alcool, tranches corrigées, choix contradictoires retirés → **54 tests**

- [x] Doublons tranchés : `drogue-04` (ivresse, doublon alcool) → `drogue-26` drogues de
  synthèse ; `drogue-08` (recoupait `drogue-16`) → `drogue-27` plus grosse conso en une soirée ;
  `drogue-02` barème 0→5 (mois ≠ semaine)

## ⏳ Reste à faire
- [x] Pusher l'audit logique (captures inchangées : pas de changement visuel)
- [x] Déploiement statique → GitHub Pages (Actions, repo public)
- [ ] Vérification visuelle réelle sur téléphone + install PWA
- [x] Relecture/édition fine des questions (revue par 5 sous-agents + corrections appliquées)
- [ ] Choisir le nom définitif (actuel : « Purity Test »)
- [ ] (Option) Générer des icônes PNG en plus du SVG pour l'installabilité

## 📋 Notes / gotchas
- Sens du score : **haut = expérimenté**, bas = innocent.
- Score global = **somme** des 5 catégories (/100 chacune) → **/500**.
- Spec à plat dans `docs/` (préférence utilisateur).
- Aucun backend : partage = état encodé base64 dans l'URL (`/#/partage?d=...`).
- **Config tests séparée** : `vitest.config.ts` distinct de `vite.config.ts`
  pour éviter le conflit de double version de Vite (vitest embarque la sienne) —
  le champ `test` dans `vite.config.ts` cassait le typecheck.
- `HashRouter` choisi pour un déploiement statique sans réécriture serveur.
- **Questions conditionnelles** : `requires: { question, minAnswerIndex }` sur la
  question de suivi ; elle doit être déclarée **après** sa déclencheuse (pas de
  cycle). Suivi visible si l'index de réponse choisi à la déclencheuse ≥ seuil.
- **Score cumulatif** : le dénominateur = **toute** la banque (base + conditionnelles).
  Ne pas débloquer un sujet = 0 point dessus = score bas. La complétion, elle, ne
  porte que sur les questions **visibles**. Les réponses à une question re-verrouillée
  sont ignorées dans le score.
- **Gotcha test d'intégrité** : la règle « une option à 0 point » ne s'applique qu'aux
  questions de **base** ; une conditionnelle (déjà derrière une réponse expérimentée)
  peut démarrer > 0.
- **Deux types de condition** : `requires` = question de **suivi** (débloque un
  approfondissement) ; `onlyIf` = **prérequis logique** sur une question normale (la
  masque si elle n'a pas de sens), liste = **OU** (ex. « au moins une drogue essayée »).
  Une question `onlyIf` peut retirer son option « jamais » contradictoire (ex. nb de
  partenaires après « déjà eu un rapport ») : le test de l'option à 0 pt ne s'y applique pas.
- Conditions **intra-catégorie uniquement** → `hygiene-21` (se laver après un rapport)
  a une option « Pas concerné·e » ajoutée **en dernier** (ne pas décaler les index déjà stockés).
- **Gotcha shell** : `npx vitest run | grep …` a bloqué ; rediriger la sortie vers un fichier.
- **Remplacer une question = nouvel id** (jamais réutiliser un id avec un autre sens) : les
  réponses sont stockées par id dans le localStorage, un id inconnu est simplement ignoré.
- **Workflow `.github/workflows/deploy.yml` indispensable** : Pages est en mode « workflow ».
  Il avait été supprimé le 2026-07-06 (« unused ») → plus aucun déploiement jusqu'au
  2026-11-22, où il a été restauré. Ne pas le supprimer.
