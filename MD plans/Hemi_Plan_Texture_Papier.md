# Hémi — Texture papier en fond (Wiki-link)

**Assets fournis** (déjà compressés, à placer dans `src/assets/`) :
- `paper-texture.webp` (89 Ko, 750×1333) — format principal
- `paper-texture.jpg` (140 Ko, 750×1333) — fallback si WebP non supporté

Réduction : -74% vs l'original (341 Ko → 89 Ko), redimensionné pour un fond mobile (le détail fin d'une photo pleine résolution ne s'y prête pas, et alourdit le bundle pour rien).

## Composant concerné

`src/components/WikiLink.astro` (node Figma `2587:5596`) — anatomie déjà documentée dans le plan composants : icône `book-03` + texte question + icône `arrow-up-right-01`, conteneur 358×74px.

## Implémentation

1. **Import via `astro:assets`** plutôt qu'un `<img>` brut, pour bénéficier de l'optimisation au build :
   ```astro
   ---
   import paperTexture from '../assets/paper-texture.webp';
   ---
   ```
2. **Fond en CSS**, pas en `<img>` séparée (la texture n'est pas un contenu, c'est un fond) :
   ```css
   .wiki-link {
     background-image: url(paperTexture.src);
     background-size: cover;
     background-position: center;
     border-radius: var(--radius-md);
     /* superposition claire semi-transparente pour garder le texte lisible
        malgré le quadrillage/les plis de la texture */
     background-color: color-mix(in srgb, var(--bg-secondary) 85%, transparent);
     background-blend-mode: normal;
   }
   ```
   → Tester la lisibilité du texte (`--text-default`) une fois la texture posée. Si le contraste est limite à cause des plis/ombres de la photo, ajouter un calque blanc semi-transparent par-dessus (`::before` avec `background: rgba(255,255,255,0.55)`) plutôt que d'assombrir le texte.
3. **Un seul composant pour l'instant** : ne pas généraliser la texture à d'autres surfaces (cartes de loi, fond de page) tant que ce n'est pas confirmé — plus simple à étendre plus tard qu'à retirer partout si ce n'était pas voulu.
4. **Pas de tiling** : c'est une photo, pas un motif seamless — `background-repeat: no-repeat` + `cover`, ne pas répéter en mosaïque (ça créerait des raccords visibles).

## Question ouverte

Cette texture doit-elle rester limitée au Wiki-link, ou s'étendre à d'autres éléments "note/glossaire" de l'anti-sèche (ex. les entrées du glossaire en accordéon) ? Si oui, dis-le et j'ajoute la variante au plan composants.
