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
  dotSize: number;
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
// Exportée pour être réutilisée par hemicycle-layout-v2.ts (même géométrie de
// rangées, algorithme d'assignation des catégories différent).
export function generateRows(total: number): { radius: number; count: number }[] {
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

// Attribution pour/contre/abstention/non-votant : arbitraire (aucune donnée réelle
// par élu·e pour l'instant — ça viendra avec CIVIX), mais PAS aléatoire dans sa forme :
// chaque rangée est répartie proportionnellement aux 4 parts, dans l'ordre gauche→
// droite pour | abstention | non-votant | contre. Ça reproduit la disposition d'un
// vrai hémicycle vue en photo (bloc "pour" à gauche, bloc "contre" à droite, les
// non-exprimés au centre) au lieu d'un remplissage séquentiel rangée par rangée qui
// donnait des anneaux concentriques d'une seule couleur — voir Figma node 2583:18130
// (référence "vraie donnée" avec 316/223/25/13 sur 577). Ne pas laisser entendre
// qu'un point précis correspond à un·e élu·e précis·e — voir plan §3.
//
// Astuce anti-dérive d'arrondi : pour chaque catégorie, on arrondit le cumul idéal
// (rowIndex+1 rangées) plutôt que chaque rangée indépendamment, et on prend la
// différence avec le cumul déjà distribué. Le compte total par catégorie retombe
// alors exactement sur `counts`, sans accumuler d'écart au fil des rangées.
export function categorizeSeats(total: number, counts: VoteCounts): VoteCategory[] {
  const rows = generateRows(total);
  const pourRatio = counts.pour / total;
  const contreRatio = counts.contre / total;
  const abstentionRatio = counts.abstention / total;

  const categories: VoteCategory[] = [];
  let seatsSoFar = 0;
  let pourCumTarget = 0;
  let contreCumTarget = 0;
  let abstentionCumTarget = 0;
  let pourAssigned = 0;
  let contreAssigned = 0;
  let abstentionAssigned = 0;

  for (const row of rows) {
    seatsSoFar += row.count;
    pourCumTarget = Math.round(seatsSoFar * pourRatio);
    contreCumTarget = Math.round(seatsSoFar * contreRatio);
    abstentionCumTarget = Math.round(seatsSoFar * abstentionRatio);

    const pourInRow = Math.min(row.count, Math.max(0, pourCumTarget - pourAssigned));
    const contreInRow = Math.min(row.count - pourInRow, Math.max(0, contreCumTarget - contreAssigned));
    const abstentionInRow = Math.min(
      row.count - pourInRow - contreInRow,
      Math.max(0, abstentionCumTarget - abstentionAssigned)
    );
    const nonVotantInRow = row.count - pourInRow - contreInRow - abstentionInRow;

    pourAssigned += pourInRow;
    contreAssigned += contreInRow;
    abstentionAssigned += abstentionInRow;

    for (let i = 0; i < pourInRow; i++) categories.push('pour');
    for (let i = 0; i < abstentionInRow; i++) categories.push('abstention');
    for (let i = 0; i < nonVotantInRow; i++) categories.push('non-votant');
    for (let i = 0; i < contreInRow; i++) categories.push('contre');
  }

  return categories;
}

export function generateHemicycleLayout(total: number, counts: VoteCounts, dotSize: number = DOT_SIZE): HemicycleLayout {
  const rows = generateRows(total);
  const outerRadius = rows[rows.length - 1]?.radius ?? INNER_RADIUS;

  const width = 2 * (outerRadius + dotSize / 2);
  const height = outerRadius + dotSize / 2;
  const centerX = width / 2;
  const centerY = height;

  const categories = categorizeSeats(total, counts);
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

  return { points, width, height, dotSize };
}
