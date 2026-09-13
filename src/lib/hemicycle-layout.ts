// Génération de la disposition d'un hémicycle : 1 point = 1 siège réel (577 ou 348),
// contrairement à la maquette Figma qui fige 204 points décoratifs — voir
// "MD plans/Hemi_Plan_Votes_Hemicycle.md" §3. Algorithme : rangées concentriques
// espacées radialement à pas constant, chacune remplie à la densité angulaire cible
// jusqu'à épuisement du total de sièges. Validé isolément pour n=577 (15 rangées,
// rayon 40→208) et n=348 (11 rangées, rayon 40→160) avant tout rendu visuel.
export type VoteCategory = 'pour' | 'contre' | 'abstention' | 'non-votant';

export interface HemicyclePoint {
  x: number;
  y: number;
  category: VoteCategory;
}

export interface HemicycleLayout {
  points: HemicyclePoint[];
  width: number;
  height: number;
}

export interface VoteCounts {
  pour: number;
  contre: number;
  abstention: number;
  nonVotant: number;
}

const INNER_RADIUS = 40;
const ROW_SPACING = 12;
const DOT_ARC_SPACING = 10;
export const DOT_SIZE = 6;

function rowCountForRadius(radius: number): number {
  const arcLength = Math.PI * radius;
  return Math.floor(arcLength / DOT_ARC_SPACING) + 1;
}

// Rangées (rayon, nombre de points), du centre vers l'extérieur, jusqu'à `total`.
function generateRows(total: number): { radius: number; count: number }[] {
  const rows: { radius: number; count: number }[] = [];
  let remaining = total;
  let radius = INNER_RADIUS;

  while (remaining > 0) {
    const count = Math.min(rowCountForRadius(radius), remaining);
    rows.push({ radius, count });
    remaining -= count;
    radius += ROW_SPACING;
  }

  return rows;
}

// Attribution pour/contre/abstention/non-votant : arbitraire (remplissage séquentiel
// par catégorie), faute de données réelles par élu·e. Ne pas laisser entendre qu'un
// point précis correspond à un·e élu·e précis·e — voir plan §3.
export function categoryForIndex(index: number, counts: VoteCounts): VoteCategory {
  if (index < counts.pour) return 'pour';
  if (index < counts.pour + counts.contre) return 'contre';
  if (index < counts.pour + counts.contre + counts.abstention) return 'abstention';
  return 'non-votant';
}

export function generateHemicycleLayout(total: number, counts: VoteCounts): HemicycleLayout {
  const rows = generateRows(total);
  const outerRadius = rows[rows.length - 1]?.radius ?? INNER_RADIUS;

  const width = 2 * (outerRadius + DOT_SIZE / 2);
  const height = outerRadius + DOT_SIZE / 2;
  const centerX = width / 2;
  const centerY = height;

  const points: HemicyclePoint[] = [];
  let index = 0;

  for (const row of rows) {
    for (let i = 0; i < row.count; i++) {
      const angle = row.count === 1 ? Math.PI / 2 : (i / (row.count - 1)) * Math.PI;
      const x = centerX - row.radius * Math.cos(angle);
      const y = centerY - row.radius * Math.sin(angle);
      points.push({ x, y, category: categoryForIndex(index, counts) });
      index++;
    }
  }

  return { points, width, height };
}
