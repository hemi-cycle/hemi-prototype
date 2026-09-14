# Hémi — Plan d'implémentation : module Votes & Hémicycle (mock data)

**Référence Figma** : https://www.figma.com/design/pSEt5D1RMWRHbvo1KbrMjc/H%C3%89MI-%7C-DS-Mar-2025?node-id=2583-18131&t=vjK5hHvKTPBZuKkB-11
Nœud "Container" (2583:18131), contient "Votes timeline" + "Chart Container" (dataviz hémicycle + footer). Le `get_design_context` de cette session n'a pas pu être appelé (nécessite une sélection active en Figma desktop) — **Claude Code doit le réessayer directement sur ce node** pour récupérer les couleurs exactes et le code de référence avant de finaliser les styles ; ce plan est construit sur les métadonnées structurelles (variantes, tailles, anatomie), pas sur le rendu visuel exact.

## Périmètre de cette itération

- À construire : `VotesTimeline` + `HemicycleChart`, avec mock data.
- Déjà fait, ne pas reconstruire : le **Footer** (titre + 3 `Key-numbers` pour/contre/abstention + bouton).
- Donnée réelle disponible pour un seul vote pour l'instant (vote définitif AN, 8 juillet 2025 : 316 pour / 223 contre / 25 abstention / 577 sièges). Les autres étapes de vote utiliseront des chiffres mock clairement marqués comme tels, en attendant le sourcing réel (intégration CIVIX prévue plus tard dans le projet).

---

## 1. Modèle de données mock

```ts
type VoteStep = {
  id: string;
  chambre: 'assemblee_nationale' | 'senat';
  date: string;
  label: string;              // ex. "Adoption définitive"
  totalSieges: number;        // 577 (AN) ou 348 (Sénat)
  pour: number;
  contre: number;
  abstention: number;
  nonVotant: number;          // = totalSieges - (pour + contre + abstention)
  isDonneeReelle: boolean;    // false = mock, en attente de sourcing réel
  source?: string;
};
```

Exemple rempli avec la vraie donnée déjà sourcée :
```json
{
  "id": "vote-an-final",
  "chambre": "assemblee_nationale",
  "date": "2025-07-08",
  "label": "Adoption définitive",
  "totalSieges": 577,
  "pour": 316,
  "contre": 223,
  "abstention": 25,
  "nonVotant": 13,
  "isDonneeReelle": true,
  "source": "https://www.maire-info.com/le-parlement-adopte-definitivement-la-loi-duplomb-article2-29875"
}
```

Pour les autres étapes de vote (1ère lecture Sénat, adoption post-CMP) : même structure, avec `isDonneeReelle: false` et des chiffres plausibles à ajuster une fois les vraies données sourcées.

---

## 2. `VotesTimeline` — logique de filtrage

Ne garder, parmi les `etapes` du JSON de la loi, que celles dont `type` commence par `vote_` (`vote_1`, `vote_cmp`, `vote_final`) — exclure `depot`, `transmission`, `accord`, `controle_constitutionnalite`, `promulgation`. Chaque item de la timeline pointe vers un `VoteStep` (voir §1) qui alimente le chart au clic.

---

## 3. `HemicycleChart` — génération dynamique de la disposition

Contrairement à la maquette Figma (204 points fixes, décoratifs), l'objectif est **1 point = 1 siège réel** : 577 pour l'Assemblée, 348 pour le Sénat. À cette densité, garder la taille de point de la maquette (10px) ne tiendra probablement pas dans le même espace — prévoir de réduire la taille des points (proposition de départ : 4-6px) et/ou d'augmenter la hauteur du conteneur. À ajuster empiriquement une fois un premier rendu sous les yeux, pas à figer sur plan.

**Algorithme de placement** (calculé une fois côté build, pour chaque valeur de `totalSieges` rencontrée — 577 et 348) :
1. Fixer un espacement radial constant entre rangées.
2. Pour chaque rangée, du centre vers l'extérieur, calculer la longueur de son arc (demi-cercle) à ce rayon, en déduire combien de points y tiennent à espacement angulaire régulier.
3. Remplir les rangées une à une jusqu'à atteindre le total de sièges.
4. Convertir chaque position (rayon, angle) en coordonnées x/y pour un `<circle>` (ou `<path>`, voir §4) SVG.

Ce principe correspond à ce qu'on observe déjà dans la maquette Figma (rangées de 7, 11, 15, 17… points, croissant avec le rayon) — juste généralisé pour scaler à n'importe quel total plutôt que figé à 204.

⚠️ **L'attribution "quel point = quel vote" est arbitraire pour l'instant** (remplissage séquentiel par catégorie : d'abord tous les "pour", puis "contre", etc.), faute de données réelles par élu·e (ça viendra avec l'intégration CIVIX). Ne pas laisser entendre qu'un point précis correspond à un·e élu·e précis·e tant que ce n'est pas vraiment le cas.

---

## 4. Accessibilité — différencier par forme, pas seulement par couleur

Proposition (ce n'est pas dans le Figma — c'est une réponse directe à ta demande, à valider) :

| Vote | Couleur (token) | Forme du point |
|---|---|---|
| Pour | `--state-success-dark` | Cercle plein (forme par défaut) |
| Contre | `--state-error-dark` | Carré |
| Abstention | `--state-warn-dark` | Triangle |
| Non-votant | Neutre (gris clair) | Cercle contour, non rempli |

Le choix de la **forme** plutôt que d'une texture interne : à 4-6px de diamètre, un motif (rayures, pointillés) sera illisible, alors qu'une différence de silhouette (cercle/carré/triangle) reste perceptible même en très petit. Ça répond au critère d'accessibilité "ne pas coder l'information uniquement par la couleur" de façon plus robuste à cette échelle.

Implémentation suggérée : un seul composant SVG par point avec un attribut `data-vote="pour|contre|abstention|non-votant"`, et une classe CSS par valeur qui définit à la fois la couleur de fond et la forme (`clip-path` ou `<use>` vers un symbole SVG différent selon la valeur).

---

## 5. Chiffre central + seuil de majorité

Le "Chart Label" central affiche déjà le total de votants (comme dans la maquette). Ajouter en sous-titre le seuil de majorité :

```
seuil = Math.floor(totalSieges / 2) + 1
```

Exemple pour l'Assemblée : 577 → seuil **289**.

---

## 6. Le seul endroit du MVP qui nécessite du JS côté client

Jusqu'ici, tout le prototype tournait sans JS (liens natifs, `<details>`). Ce composant est la première exception légitime : cliquer sur une étape de la timeline doit changer le jeu de données affiché (couleurs/formes des points, chiffres du footer, sous-titre du seuil) sans recharger la page.

Approche recommandée pour rester léger : la **géométrie** des points (positions x/y) est calculée une seule fois, au build (Astro, côté serveur/génération statique) — le JS client se contente, au clic sur une étape de la timeline, de changer l'attribut `data-vote` (donc la classe couleur/forme) de chaque point déjà positionné, et de mettre à jour le texte des labels. Pas de recalcul de layout en direct, pas de framework réactif.

---

## 7. Découpage suggéré (rester itératif, un morceau à la fois)

1. `src/data/votes-mock.ts` — le type `VoteStep` + les données mock, dont la vraie donnée AN déjà sourcée.
2. Fonction de génération de layout hémicycle, testée isolément pour n=577 et n=348 avant tout rendu visuel.
3. `HemicycleChart.astro` — rendu statique des points positionnés, sans interactivité, avec le mapping couleur/forme de §4.
4. `VotesTimeline.astro` — bande de sélection filtrée (§2).
5. Script client minimal reliant timeline → chart → footer existant.
6. Vérification visuelle empirique (taille des points, hauteur du conteneur) une fois un premier rendu réel sous les yeux — ajuster plutôt que deviner à l'avance.
