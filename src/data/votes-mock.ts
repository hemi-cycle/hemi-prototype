// Modèle de données pour le module Votes & Hémicycle — voir
// "MD plans/Hemi_Plan_Votes_Hemicycle.md" §1. Une seule donnée réelle sourcée pour
// l'instant (vote définitif AN, 8 juillet 2025) ; les autres étapes de vote de la loi
// Duplomb utilisent des chiffres plausibles mais NON sourcés (isDonneeReelle: false),
// en attendant l'intégration CIVIX. Chaque VoteStep est rattaché à une étape du JSON
// de la loi via (chambre, date) — voir VotesTimeline.astro.
export type Chambre = 'assemblee_nationale' | 'senat';

export interface VoteStep {
  id: string;
  chambre: Chambre;
  date: string;
  totalSieges: number;
  pour: number;
  contre: number;
  abstention: number;
  nonVotant: number;
  isDonneeReelle: boolean;
  source?: string;
}

export const SIEGES_ASSEMBLEE_NATIONALE = 577;
export const SIEGES_SENAT = 348;

export const votesMock: VoteStep[] = [
  {
    id: 'vote-senat-1ere-lecture',
    chambre: 'senat',
    date: '2025-01-27',
    totalSieges: SIEGES_SENAT,
    pour: 233,
    contre: 91,
    abstention: 16,
    nonVotant: 8,
    isDonneeReelle: false,
  },
  {
    id: 'vote-an-1ere-lecture',
    chambre: 'assemblee_nationale',
    date: '2025-05-26',
    totalSieges: SIEGES_ASSEMBLEE_NATIONALE,
    pour: 185,
    contre: 260,
    abstention: 40,
    nonVotant: 92,
    isDonneeReelle: false,
  },
  {
    id: 'vote-senat-cmp',
    chambre: 'senat',
    date: '2025-07-02',
    totalSieges: SIEGES_SENAT,
    pour: 214,
    contre: 108,
    abstention: 12,
    nonVotant: 14,
    isDonneeReelle: false,
  },
  {
    id: 'vote-an-final',
    chambre: 'assemblee_nationale',
    date: '2025-07-08',
    totalSieges: SIEGES_ASSEMBLEE_NATIONALE,
    pour: 316,
    contre: 223,
    abstention: 25,
    nonVotant: 13,
    isDonneeReelle: true,
    source: 'https://www.maire-info.com/le-parlement-adopte-definitivement-la-loi-duplomb-article2-29875',
  },
];
