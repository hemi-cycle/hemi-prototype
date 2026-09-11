## Roadmap — page détail loi

La page `src/pages/loi/[id].astro` reproduit la structure du Figma "Détail proposition
de loi" (node `2583-17955`) pour tout ce qui a une donnée ou un asset réel disponible.
Ce qui suit a été volontairement omis plutôt qu'approximé/inventé :

| Section Figma | Pourquoi ce n'est pas construit | Ce qu'il faut pour débloquer |
|---|---|---|
| Photo de couverture (hero) | Pas de photo réelle sourcée pour la loi | Choisir/licencier une image éditoriale par loi (champ à ajouter au JSON) |
| Soutiens / Opposants / Indécis par parti | Aucune donnée sur quel parti soutient/s'oppose à une loi dans le JSON actuel | Modéliser cette donnée (recherche éditoriale par loi + nouveau champ JSON) |
| Les discours marquants (vidéos) | Pas de vidéos sourcées, pas de composant lecteur vidéo | Sourcer des extraits vidéo réels + choisir un hébergement/lecteur |
| Hémicycle interactif (grille de sièges colorés) | US-8 du backlog, déjà explicitement reportée à une itération dédiée | Décision produit à reconfirmer avant de démarrer |
| Carousel multi-votes (Vote 1 / Vote 2 / Prochain vote) | Le JSON ne modélise qu'un vote réel à la fois (pas de notion de "vote à venir estimé") | Étendre le schéma `votes` pour supporter plusieurs lectures + votes futurs estimés |
| Chips de filtrage des arguments par motivation | Le JSON n'a que 2 listes plates pour/contre, pas de catégorisation par argument | Ajouter une catégorie par argument dans le JSON |
| Bouton "Voir + en détails" sous le résultat du vote | Il n'y a pas encore de page dédiée à un vote individuel | Décider si ça vaut le coup pour un seul vote, ou attendre le multi-votes |
| Lien Wiki-link → anti-sèche | La page anti-sèche/glossaire n'existe pas encore (US-10, backlog) | Construire US-10 |
| Logos de partis réels sur les avatars | `src/assets/logos_partis/` contient les PNG mais rien ne les mappe encore aux noms du JSON | Écrire le mapping nom de parti → fichier logo |
| Palette de couleurs "Avatar Monogram" | Les 8 vraies couleurs Figma n'ont pas pu être récupérées (pas d'instance monogram dans le fichier) | Vérifier/exporter la palette réelle depuis Figma |

---

# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
