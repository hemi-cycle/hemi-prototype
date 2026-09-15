// V2 (expérimentation) — même géométrie de rangées que hemicycle-layout.ts
// (1 point = 1 siège réel), mais assignation des catégories par "balayage global" au
// lieu d'une répartition proportionnelle rangée par rangée. On calcule l'angle de
// CHAQUE point sur TOUTE la demi-lune, on trie une seule fois de gauche à droite, puis
// on découpe cet ordre en 4 tranches contiguës (pour | abstention | non-votant |
// contre). Résultat : un bloc plein par catégorie (comme sur une vraie photo
// d'hémicycle) plutôt que des paliers/anneaux à chaque rangée. Ne remplace pas
// hemicycle-layout.ts, dont ce module réutilise generateRows/DOT_SIZE (voir
// HemicycleChartV2.astro).
import { DOT_SIZE, generateRows, type HemicycleLayout, type HemicyclePoint, type VoteCategory, type VoteCounts } from './hemicycle-layout';

export { DOT_SIZE };
export type { HemicycleLayout, HemicyclePoint, VoteCategory, VoteCounts };

export function categorizeSeatsByWedge(total: number, counts: VoteCounts): VoteCategory[] {
  const rows = generateRows(total);

  const angles: number[] = [];
  for (const row of rows) {
    for (let i = 0; i < row.count; i++) {
      angles.push(row.count === 1 ? Math.PI / 2 : (i / (row.count - 1)) * Math.PI);
    }
  }

  // Ordre des indices trié par angle croissant (gauche -> droite). Tri stable : à
  // angle égal (rangées à un seul siège), on garde l'ordre d'origine.
  const order = angles.map((_, index) => index).sort((a, b) => angles[a] - angles[b] || a - b);

  const categories: VoteCategory[] = new Array(angles.length);
  let cursor = 0;
  const assign = (count: number, category: VoteCategory) => {
    for (let i = 0; i < count; i++) {
      categories[order[cursor]] = category;
      cursor++;
    }
  };

  assign(counts.pour, 'pour');
  assign(counts.abstention, 'abstention');
  assign(counts.nonVotant, 'non-votant');
  assign(counts.contre, 'contre');

  return categories;
}

export function generateHemicycleLayoutV2(total: number, counts: VoteCounts): HemicycleLayout {
  const rows = generateRows(total);
  const outerRadius = rows[rows.length - 1]?.radius ?? 40;

  const width = 2 * (outerRadius + DOT_SIZE / 2);
  // centerY (où sin(angle)=0, aux extrémités gauche/droite de chaque rangée) doit
  // rester à outerRadius + DOT_SIZE/2 du haut du viewBox. La hauteur du SVG doit en
  // plus loger la moitié inférieure de ces points, +1 de marge : le point ".dot" en
  // "non-votant" a un stroke-width:1 dessiné à cheval sur le bord du rect, donc 0.5px
  // dépasse déjà du rayon DOT_SIZE/2 nominal. Sans cette marge, ce stroke se faisait
  // rogner pile sur le bord inférieur du viewBox (visible comme un léger "cut" de la
  // dernière rangée).
  const centerY = outerRadius + DOT_SIZE / 2;
  const height = centerY + DOT_SIZE / 2 + 1;
  const centerX = width / 2;

  const categories = categorizeSeatsByWedge(total, counts);
  const points: HemicyclePoint[] = [];
  let index = 0;

  for (const row of rows) {
    for (let i = 0; i < row.count; i++) {
      const angle = row.count === 1 ? Math.PI / 2 : (i / (row.count - 1)) * Math.PI;
      const x = centerX - row.radius * Math.cos(angle);
      const y = centerY - row.radius * Math.sin(angle);
      points.push({ x, y, category: categories[index] });
      index++;
    }
  }

  return { points, width, height };
}
