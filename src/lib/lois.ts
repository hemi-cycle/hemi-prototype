// Point d'entrée unique pour la liste des lois affichées par le prototype — utilisé
// par src/pages/index.astro (liste "À la une") et src/pages/loi/[id].astro (route
// dynamique). Chaque loi est un import explicite (pas de import.meta.glob) : à 2
// lois, la liste à plat reste plus simple à lire et à typer qu'une résolution
// dynamique JSON <-> image <-> votes par convention de nom de fichier.
import loiDuplomb from '../data/loi-duplomb-menonville.json';
import loiViolences from '../data/loi-integrale-violences-sexistes-sexuelles.json';
import thumbnailDuplomb from '../assets/lois/loi-duplomb-menonville.png';
import thumbnailViolences from '../assets/lois/loi-integrale-violences-sexistes-sexuelles.jpg';
import { votesMock, type VoteStep } from '../data/votes-mock';

export interface Argument {
  titre: string;
  description: string;
}

export interface Etape {
  date: string;
  chambre: string;
  type: string;
  libelle: string;
  description?: string;
  statut: string;
  source?: string;
}

export interface Depositaire {
  nom: string;
  fonction: string;
  parti: string;
  circonscription?: string;
  source: string;
}

export interface Source {
  label: string;
  url: string;
}

// Champs effectivement lus par les pages/composants — les deux fichiers JSON
// portent chacun quelques champs additionnels propres à leur loi (numero_loi vs
// numero_proposition, soutien_parlementaire...) non repris ici puisque non utilisés
// dans l'UI pour l'instant.
export interface Loi {
  id: string;
  titre_usuel: string;
  sous_titre: string;
  statut_actuel: string;
  depose_par: Depositaire[];
  description: string;
  etapes: Etape[];
  arguments_pour: Argument[];
  arguments_contre: Argument[];
  sources: Source[];
}

export interface LoiEntry {
  data: Loi;
  thumbnail: ImageMetadata;
  votes: VoteStep[];
}

export const lois: LoiEntry[] = [
  { data: loiDuplomb as Loi, thumbnail: thumbnailDuplomb, votes: votesMock },
  // Aucun vote pour l'instant : proposition encore en discussion en commission (voir
  // son étape "auditions", statut "a_venir").
  { data: loiViolences as Loi, thumbnail: thumbnailViolences, votes: [] },
];

export function getLoiEntry(id: string): LoiEntry | undefined {
  return lois.find((entry) => entry.data.id === id);
}
