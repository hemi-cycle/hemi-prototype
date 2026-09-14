# Hémi — Plan d'implémentation des composants du design system

*Prompt destiné à Claude Code. Source : métadonnées structurelles extraites du fichier Figma "HÉMI | DS Mar 2025" (fileKey `pSEt5D1RMWRHbvo1KbrMjc`). `get_design_context` n'a pas pu être appelé dans la session d'origine (nécessite une sélection active dans Figma desktop) — les couleurs exactes par état/variante doivent être vérifiées directement dans Figma ou dans `hemi-ds-foundations.html` avant implémentation finale.*

## Conventions générales

- Chaque composant = un fichier `.astro` dans `src/components/`, avec une interface TypeScript de props dans le frontmatter.
- Les variantes Figma (`style=`, `type=`, `density=`, etc.) deviennent des unions TypeScript (`type Style = 'neutral' | 'brand' | 'danger' | 'success' | 'warning'`).
- Les couleurs par variante doivent référencer les tokens déjà extraits dans `src/styles/tokens.css` (`--brand`, `--state-error-dark`, `--state-success-dark`, `--state-warn-dark`, palette neutre) — ne pas coder de valeurs hex en dur dans les composants.
- Densité `compact` vs `comfortable` (vue dans Tag, Key-numbers) → prévoir une prop `density` par défaut `compact` pour les composants mobiles denses (listes, cartes).
- États interactifs communs à plusieurs composants (`enabled/hovered/focused/pressed/dragged`) → gérer via CSS natif (`:hover`, `:focus-visible`, `:active`) plutôt que dupliquer manuellement, sauf si Figma montre une différence de couleur non déductible d'un simple assombrissement/éclaircissement (à vérifier visuellement).

---

## 1. Tag

**Rôle dans Hémi** : statut d'une loi (`Tag/Law-state`), catégorie thématique, badge de parti.

**Variantes (composant générique)** : `style` = neutral / brand / danger / success / warning · `type` = tonal / tonal-on-dark / fill · `leading` = dot / icon / none · `density` = compact / comfortable · `trailing` = none / icon

**Variante dédiée métier** : `Tag/Law-state` avec `state` = `in-debate` / `rejected` / `adopted` / `promulgated` — **à utiliser directement pour le champ `statut_actuel` du JSON loi**, plutôt que de recomposer avec le Tag générique.

**Anatomie** : [dot ou icône de tête] + [label texte] + [icône de fin optionnelle].

**Tailles observées** : compact ≈ 28px de hauteur, comfortable ≈ 45px.

**À faire** :
- `src/components/Tag.astro` (générique) + `src/components/LawStateTag.astro` (wrapper dédié qui mappe `statut_actuel` → le bon `state`).
- Mapper `style=danger` → `--state-error-dark`, `style=success` → `--state-success-dark`, `style=warning` → `--state-warn-dark`, `style=brand` → `--brand`, `style=neutral` → palette neutre.

---

## 2. Avatar

**Rôle dans Hémi** : photo d'un·e élu·e sur les cartes de profil et dans les listes.

**Variantes documentées** : `type=photo` · `size` = 88 / 64 / 40 / 32 / 24 / 20 / 16 · `show-border` = true / false

⚠️ **Point à vérifier** : la documentation textuelle du composant (trouvée dans les mêmes métadonnées) mentionne un variant **monogram** avec une couleur de fond prédéfinie selon la première lettre du nom (couleur par défaut : `avatarBg8` si pas de prénom disponible) — mais aucune instance `type=monogram` n'était visible dans ce que j'ai pu extraire. Il faut probablement l'existence de ce variant pour gérer le cas où un·e élu·e n'a pas de photo dans les données CIVIX.

**À faire** :
- `src/components/Avatar.astro` avec props `size` (union des 7 tailles), `showBorder: boolean`, `src?: string`, `initials?: string`.
- Si `src` absent → fallback monogramme (à construire même si le variant exact n'a pas pu être confirmé visuellement — logique : initiale(s) sur fond de couleur déterministe).

---

## 3. Chip

**Rôle dans Hémi** : filtres sélectionnables (ex. filtrer les lois par thématique sur la page "À la une", filtrer les votes par parti).

**Variantes** : `selected?` = true / false · `leading` = none / avatar

⚠️ Contrairement au Tag, **pas de `leading=icon`** documenté pour le Chip — seulement avatar ou rien. Si un filtre a besoin d'une icône (pas un avatar), utiliser un Tag cliquable plutôt qu'un Chip, ou vérifier dans Figma s'il existe une variante icône non capturée ici.

**États** : enabled / hovered / focused / pressed / dragged (state-layer standard).

**À faire** :
- `src/components/Chip.astro`, props `selected: boolean`, `leadingAvatar?: string`, `onToggle` (event).
- Utilisé pour : filtres thématiques (US-2/US-3 backlog), filtres de vote par parti sur la vue simplifiée des votes.

---

## 4. List / List item

**Rôle dans Hémi** : composant transverse le plus utilisé — liste de lois, liste d'élu·es, glossaire de l'anti-sèche, étapes de la frise en version condensée.

**Variantes List item** : `lines` = 1 ligne / 2 lignes (label seul vs label + supporting text)
**Variantes List (conteneur)** : `Type` = Default / Compact

**Anatomie du List item** : slot `prepend` (icône/avatar, masqué par défaut) → contenu (Label + Supporting text optionnel) → slot `append` (icône, masqué par défaut) → Divider (masqué par défaut, à activer entre items).

**Hauteurs observées** : 48px (label seul), 61px (label + 1 ligne de texte de support), jusqu'à ~98px pour texte de support sur 2 lignes.

**Règles d'accessibilité documentées dans Figma** :
- Hauteur minimale de 48px pour garantir une zone tactile correcte (à respecter strictement, y compris pour la variante "label seul").
- Gérer l'ordre de focus de haut en bas.
- Max 10 items visibles à la fois recommandé (au-delà, prévoir pagination/scroll géré explicitement, pas une liste infinie non maîtrisée).
- Restreindre à 1 seule zone interactive par item (pas de bouton + toute la ligne cliquable en même temps).

**À faire** :
- `src/components/ListItem.astro` avec slots nommés `prepend`/`append`, props `label`, `supportingText?`, `divider: boolean`.
- `src/components/ListComponent.astro` (conteneur) qui itère sur un tableau d'items et gère l'espacement/dividers.
- Utilisé directement pour : le glossaire de l'anti-sèche (US-10), une éventuelle liste de lois alternative à la vue cartes.

---

## 5. Buttons (Button + Icon Button)

**Rôle dans Hémi** : actions principales (ex. "Partager"), navigation, actions secondaires en texte seul.

**Variantes Button** : `Type` = Brand (rempli) / Text (texte seul) · `Disabled` = true/false · `Loading` = true/false

⚠️ **Seulement 2 types documentés** (Brand et Text) — pas de bouton "Secondary/Outline" visible dans ce composant. Si le produit a besoin d'un niveau de hiérarchie intermédiaire (ex. bouton secondaire contouré), il faudra soit le construire par dérivation (Brand avec fond transparent + bordure), soit confirmer qu'il n'existe pas dans le DS et que 2 niveaux suffisent pour le MVP.

**Variantes Icon Button** : `Density` = Default / Compact · `Color` = Brand / White · `Disabled` = true/false · `Loading` = true/false

**Règles d'accessibilité documentées** : hauteur minimale 48px, icône ≥ 24px, texte du label ≥ 14px, prévoir `aria-label` + rôle HTML explicite.

**À faire** :
- `src/components/Button.astro` (props `type: 'brand' | 'text'`, `disabled`, `loading`).
- `src/components/IconButton.astro` (props `density`, `color`, `disabled`, `loading`, `ariaLabel` obligatoire).
- État `loading` → prévoir un spinner inline, pas de layout shift (la largeur du bouton semble fixe entre état normal/loading d'après les tailles observées).

---

## 6. Key numbers

**Rôle dans Hémi** : affichage des totaux de vote (pour/contre/abstention) sur la page détail loi — **US-7 du backlog**.

**Variantes** : `size` = compact / comfortable · `state` = default / success / failure · `color` = on-light / on-dark

**Anatomie** : le nombre en grand + une légende en dessous avec une flèche directionnelle (ex. "100" / "↑ POUR"). Le state `success`/`failure` permet de colorer différemment un chiffre selon qu'il représente par exemple le camp majoritaire ou minoritaire.

**À faire** :
- `src/components/KeyNumber.astro`, props `value: number`, `label: string`, `state: 'default' | 'success' | 'failure'`, `size`, `color`.
- Sur la page détail loi : 3 instances (pour / contre / abstention), avec `state` déterminé dynamiquement (ex. le nombre le plus haut en `success`, à confirmer comme règle produit plutôt que supposée).

---

## 7. Wiki link

**Rôle dans Hémi** : lien contextuel vers l'anti-sèche depuis n'importe quel terme technique — **US-9 du backlog**, et c'est littéralement le composant prévu pour ça (l'exemple dans la spec Figma est *"C'est quoi la différence entre 'voter' et 'promulguer' ?"*).

**Variantes** : composant unique, pas de variante de style documentée.

**Anatomie** : icône livre + texte de la question + flèche externe (arrow-up-right) en fin de ligne.

**À faire** :
- `src/components/WikiLink.astro`, props `question: string`, `href: string` (lien vers l'entrée du glossaire correspondante).
- Utilisé partout où un terme technique apparaît dans le contenu d'une loi (ex. dans la description de la loi Duplomb : "commission mixte paritaire", "Conseil constitutionnel").

---

## 8. Text field

**Rôle dans Hémi** : champ de recherche (page "À la une" et éventuellement anti-sèche).

**Deux composants documentés** :
1. `TextField / Master` (complet) : `error?` = true/false · `OD-text-configurations` = placeholder-text / label-text / input-text · `state` = enabled/hovered/focused/disabled. Anatomie complète : leading-icon, label flottant, input-text, supporting-text, active-indicator (soulignement), avec règle de padding précise à respecter.
2. `TextField` (recherche, plus simple) : juste `state` = enabled/hovered/focused, sans label flottant ni erreur — **probablement le bon composant pour la barre de recherche du MVP**, plus léger que le Master.

**À faire** :
- `src/components/SearchField.astro` basé sur la version simple (2), props `placeholder`, `value`, `onInput`.
- Garder `TextField/Master` en réserve pour un futur formulaire (pas nécessaire pour le scope MVP actuel qui n'a pas de formulaire complexe).

---

## 9. Select

⚠️ **Point de vigilance important** : dans les métadonnées récupérées, le composant Select (`TextInput / Master` et `TextInput` simple) a **exactement la même structure de variantes que Text field** (`error?`, `OD-text-configurations`, `state`) — aucune anatomie spécifique de liste déroulante (chevron, liste d'options, état ouvert/fermé) n'apparaît dans ce que j'ai pu extraire par métadonnées seules. Il est probable que Select réutilise la coquille visuelle du Text field avec un comportement JS différent (ouverture d'une liste), mais ça reste à confirmer visuellement dans Figma — **Claude Code devrait ouvrir ce composant directement dans Figma (ou réessayer `get_design_context` s'il a un accès désktop actif) avant de coder le comportement d'ouverture/fermeture**, plutôt que de l'inventer.

**À faire** :
- Ne pas démarrer l'implémentation du Select avant cette vérification — les autres composants peuvent être construits en parallèle sans ce blocage.

---

## Points à trancher avant de lancer l'implémentation

1. **Avatar** : confirmer l'existence et l'apparence du variant `monogram` (fallback sans photo) — nécessaire pour les élu·es sans photo dans les données CIVIX.
2. **Buttons** : 2 niveaux (Brand/Text) suffisent-ils pour le MVP, ou faut-il un 3ᵉ niveau secondaire ?
3. **Chip** : confirmer l'absence de variante `leading=icon` — sinon utiliser Tag pour les filtres à icône.
4. **Select** : vérifier l'anatomie réelle (chevron, liste, états ouvert/fermé) avant de coder — bloquant pour ce composant seulement.
5. **List** : veut-on des avatars en `prepend` dès le MVP (ex. liste d'élu·es), ou uniquement du texte pour l'itération 1 ?
