# SUIVI — Purity Test

## 🧭 Ligne directrice
*(maj 2026-11-22)* — **v1 EN LIGNE** : https://floran-grmxx.github.io/purity-test/
(repo public `Floran-grmxx/purity-test`, déploiement auto à chaque push sur `main`).
**Nouveau (pushé le 2026-11-22)** : réponses contradictoires masquées (`answerLimits`),
comptages chiffrés, questions de fréquence au passé, **portrait** texte sous les résultats
(aussi sur la page partagée, version scores seuls), **partage par QR code**. **72/72 tests
verts**, build propre. Questions à un seul choix répondues automatiquement, temps de réponse affiché.
**Prochaine priorité** : vérif sur téléphone (scan du QR), choix du nom.

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

- [x] Réponses contradictoires masquées + comptages chiffrés + fréquences au passé
- [x] Portrait texte (résultat perso + page partagée) et panneau de partage QR / lien
- [x] Temps de réponse affiché sur le résultat global (temps actif, pauses > 2 min plafonnées)
- [x] Questions réduites à un seul choix : répondues automatiquement et sautées (`isAutoAnswered`)
- [x] Lien « About » du repo corrigé (pointait vers l'ancien compte gourmaxx.github.io)

## ⏳ Reste à faire
- [x] Pusher l'audit logique (captures inchangées : pas de changement visuel)
- [x] Déploiement statique → GitHub Pages (Actions, repo public)
- [ ] Vérification visuelle réelle sur téléphone + install PWA
- [x] Relecture/édition fine des questions (revue par 5 sous-agents + corrections appliquées)
- [ ] Choisir le nom définitif (actuel : « Purity Test »)
- [x] Icônes PNG (192, 512, maskable 512, apple-touch 180) générées depuis les SVG et déclarées

## 📋 Notes / gotchas
- **Questions de fréquence = au passé inclusif** (« au plus fort de ta consommation… ») pour que les ex-consommateurs puissent répondre. Ne jamais formuler une fréquence au présent seul. Garder l'ordre des réponses (les gates `minAnswerIndex` en dépendent).
- **Chaîne alcool** : `alcool-01`≥« Plusieurs fois » débloque cuite/vomi/jeux/shots/binge ; `alcool-05` (« première cuite » ≠ Jamais) débloque ivresse, blackout, honte, gueule de bois, verre du lendemain. Masquer = 0 pt = même score que « Jamais ». Tester avec des profils simulés (1re / 2e / milieu / dernière réponse) après chaque changement de gates.
- **Réponse `notApplicable: true`** (« Pas concerné·e ») : la question sort du score (ni gagnés ni max). Doit valoir 0 pt. Utilisé par hygiene-21. `drogue-16` (nombre de substances) supprimée car elle contredisait les réponses précédentes.
- **`answerLimits`** : masque les réponses qui contrediraient une réponse précédente (ex. record de verres ≥ soirée normale, ivresse ≤ fréquence de consommation). Une réponse stockée devenue contradictoire est ignorée (`sanitizeAnswers`) et la question est reposée. Échelle de comptage standard : `Jamais | 1 fois | 2 à 10 fois | Plus de 10 fois` (garder 4 réponses pour ne pas décaler les index des gates).
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
