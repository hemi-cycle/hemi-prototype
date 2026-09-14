# Hémi — Plan d'implémentation du MVP prototype (v3 — prêt pour exécution)

*Ce document est conçu pour être donné tel quel à Claude Code, qui a un accès réseau complet (contrairement à la session claude.ai où il a été rédigé) et peut donc exécuter chaque étape, y compris créer le repo GitHub et déployer.*

---

## 1. Décisions de scope (verrouillées)

| Sujet | Décision |
|---|---|
| Stack | Astro — zéro/peu de surcouche JS (voir §2) |
| Données | JSON statique, contenu réel sourcé (pas de backend pour l'instant) |
| Hémicycle (US-8) | Version simple (totaux de votes uniquement) pour cette itération |
| Anti-sèche (US-10) | Glossaire minimal en accordéon (HTML natif `<details>`) |
| Contenu loi | Vrai contenu sourcé, liens vers les sources en bas de la page détail |
| Responsive | Mobile uniquement, pas de breakpoints pour l'instant |
| Compte utilisateur | Aucun — 100% anonyme |
| Dépôt de code | GitHub, repo créé dès le départ |
| Démo en ligne | **GitHub Pages, dès le départ** (nouveau, voir §6) |
| Hébergement cible (futur, production) | France/UE obligatoire, licence open source — GitHub Pages reste une démo, pas la cible finale (voir note §6.4) |
| Méthode de travail | Itératif, user story par user story |

---

## 2. Stack retenue : Astro + JSON local, zéro framework JS

**Choix : [Astro](https://astro.build)** plutôt que React/Next/Vue.

- Zéro JS envoyé au navigateur par défaut — l'accordéon de l'anti-sèche se fait en HTML natif (`<details><summary>`), et US-1 (clic sur une carte → détail) est un simple `<a href>`.
- Routage par fichier = l'arborescence à 3 pages, telle quelle.
- Peut lire un fichier JSON local au moment du build (`import data from '../data/loi.json'`) — pas besoin de backend pour committer une vraie donnée.
- Sortie 100% statique → se déploie nativement sur GitHub Pages, sans configuration lourde.

---

## 3. Arborescence du projet

```
hemi-prototype/
├── src/
│   ├── pages/
│   │   ├── index.astro              → À la une
│   │   ├── loi/[id].astro           → Détail d'une loi (route dynamique)
│   │   └── antiseche.astro          → Anti-sèche
│   ├── components/
│   │   ├── LawCard.astro
│   │   ├── Chip.astro
│   │   ├── Button.astro
│   │   ├── Timeline.astro           → frise du parcours
│   │   ├── VoteSummary.astro        → version simple des votes
│   │   └── GlossaryAccordion.astro  → <details>/<summary> natif
│   ├── data/
│   │   └── loi-duplomb-menonville.json
│   ├── layouts/
│   │   └── MobileLayout.astro       → viewport fixe mobile + bottom-nav
│   └── styles/
│       └── tokens.css               → tokens du design system
├── public/
├── .github/
│   └── workflows/
│       └── deploy.yml               → voir §6.2
├── astro.config.mjs                 → voir §6.1
├── package.json
└── README.md
```

---

## 4. Preuve de faisabilité data — vrai contenu sourcé

Le contenu de `loi-duplomb-menonville.json` (déjà rédigé, livré séparément à cette conversation) est basé sur le vrai dossier législatif consulté sur **senat.fr**, pas un placeholder :

- Rejet en première lecture par l'Assemblée nationale (26 mai 2025), adoption après accord en CMP.
- Article sur l'acétamipride censuré par le Conseil constitutionnel (7 août 2025) juste avant promulgation.
- Chaque étape de la frise est sourcée individuellement (champ `source` sur chaque entrée).

⚠️ Les champs `arguments_pour` / `arguments_contre` sont une synthèse éditoriale des faits, pas des citations — à faire relire par un expert avant mise en ligne réelle, comme prévu dans la méthodologie du projet.

---

## 5. Backlog

| # | User story | Statut |
|---|---|---|
| **US-1** | Cliquer sur une carte de loi → voir son détail | 🟢 **Prochaine étape produit** |
| US-2 | Voir la liste des lois du mois sur l'accueil | À venir |
| US-3 | Lire le résumé et la description d'une loi | À venir |
| US-4 | Voir la fiche de la personne qui a déposé la loi | À venir |
| US-5 | Voir les arguments pour et contre | À venir |
| US-6 | Voir la frise du parcours législatif | À venir |
| US-7 | Voir le résultat global d'un vote (version simple) | À venir |
| US-8 | Hémicycle interactif détaillé par député | ⏸️ Reporté à une itération dédiée |
| US-9 | Cliquer sur un terme technique → anti-sèche | À venir |
| US-10 | Glossaire en accordéon | À venir |
| US-11 | Comprendre le parcours générique d'une loi | À venir |
| US-12 | Comprendre la composition de l'hémicycle | À venir |

---

## 6. GitHub — repo + déploiement GitHub Pages dès le départ

### 6.1 Configuration Astro pour GitHub Pages

Dans `astro.config.mjs`, définir `site` et `base` (le `base` doit correspondre au nom exact du repo) :

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://<GITHUB_USERNAME>.github.io',
  base: 'hemi-prototype',
});
```

*(Remplacer `<GITHUB_USERNAME>` par le compte GitHub réel. Si le repo est renommé, mettre `base` à jour en conséquence.)*

### 6.2 Workflow GitHub Actions de déploiement

Créer `.github/workflows/deploy.yml` :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Install, build, and upload your site
        uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

⚠️ **Note pour Claude Code** : vérifier au moment de l'exécution la dernière version recommandée de `withastro/action` sur la doc officielle (https://docs.astro.build/en/guides/deploy/github/), le tag exact peut avoir évolué.

### 6.3 Étapes d'exécution (repo → premier déploiement)

1. Scaffolder le projet Astro (`npm create astro@latest hemi-prototype -- --template minimal --no-install`, ou équivalent).
2. Initialiser git, créer le repo distant sur GitHub (`gh repo create hemi-prototype --public --source=. --push`, ou instructions manuelles si `gh` CLI indisponible/non authentifié).
3. Ajouter `astro.config.mjs` (§6.1) et `.github/workflows/deploy.yml` (§6.2).
4. Dans les paramètres du repo GitHub → **Pages** → Source : **GitHub Actions** (à activer manuellement une seule fois, l'UI web de GitHub ne s'automatise pas en CLI de façon fiable — le signaler à l'utilisateur si l'automatisation échoue).
5. Push sur `main` → le déploiement se déclenche automatiquement.
6. Vérifier l'URL finale : `https://<GITHUB_USERNAME>.github.io/hemi-prototype/`.

### 6.4 Rappel — nuance hébergement France (toujours valable)

GitHub Pages est hébergé sur l'infrastructure GitHub/Microsoft (États-Unis). À ce stade du MVP, **aucune donnée personnelle n'est traitée** (pas de compte, pas de backend, JSON public statique) — donc pas de problème de souveraineté des données pour cette démo. Cette contrainte redevient active **quand un vrai backend + des comptes utilisateurs arriveront** : il faudra alors migrer l'hébergement de production vers un fournisseur français/UE (OVHcloud, Scaleway, Clever Cloud). GitHub Pages reste la démo de faisabilité, pas la cible finale.

---

## 7. Checklist d'exécution pour Claude Code

1. Scaffolder le projet Astro selon §3.
2. Créer le repo GitHub et pousser le squelette initial (§6.3, étapes 1-3).
3. Ajouter les tokens du design system dans `src/styles/tokens.css` (palette, typographie, espacements — déjà extraits du design system Hémi, à redemander à l'utilisateur si non fournis dans ce chat).
4. Copier `loi-duplomb-menonville.json` dans `src/data/`.
5. Implémenter **US-1** : `MobileLayout` + `LawCard` + `index.astro` (une carte, la loi Duplomb) + `loi/[id].astro` (titre + résumé minimum).
6. Configurer et déclencher le déploiement GitHub Pages (§6.1, §6.2, §6.3 étape 4-6).
7. Rendre compte à l'utilisateur : lien de démo + statut de chaque user story du backlog (§5).
8. Attendre validation utilisateur avant de passer à US-2 — méthode de travail itérative confirmée, ne pas enchaîner plusieurs user stories sans point d'étape.
