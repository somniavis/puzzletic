export type CharacterMood = 'happy' | 'sad' | 'neutral' | 'excited' | 'sick' | 'sleeping';

export type CharacterAction =
  | 'idle'
  | 'eating'
  | 'playing'
  | 'sleeping'
  | 'sick'
  | 'happy'
  | 'jumping';

export interface CharacterStats {
  hunger: number;        // 0-100
  happiness: number;     // 0-100
  health: number;        // 0-100
  hygiene: number;       // 0-100
  fatigue: number;       // 0-100
  affection: number;     // 0-100
  intelligence: number;  // 0-100
  stamina: number;       // 0-100
}

export type EvolutionStage = 1 | 2 | 3 | 4 | 5;

export interface CharacterEvolution {
  stage: EvolutionStage;
  name: string;
  requiredLevel: number;
  requiredAffection: number;
  description?: string;
}

export interface CharacterSpecies {
  id: string;
  name: string;
  description: string;
  evolutions: CharacterEvolution[];
}

export interface Character {
  id: string;
  speciesId: string; // e.g., 'blueHero'
  name: string; // Custom name given by user
  type: string; // For backwards compatibility
  level: number;
  experience: number;
  evolutionStage: EvolutionStage;
  stats: CharacterStats;
  currentMood: CharacterMood;
  currentAction: CharacterAction;
}

export interface CharacterComponentProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}
