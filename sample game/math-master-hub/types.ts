
export enum Subject {
  MATH = 'MATH',
  BRAIN = 'BRAIN',
  SCIENCE = 'SCIENCE',
  SOFTWARE = 'SOFTWARE'
}

export enum GameMode {
  FUN = 'FUN',
  DRILL = 'DRILL'
}

export enum Operator {
  ADD = '+',
  SUB = '-',
  MUL = '×',
  DIV = '÷'
}

export interface GamifiedGame {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  icon: string;
  color: string;
  category: string;
}

export interface CalculationDrill {
  id: string;
  operator: Operator;
  leftDigits: number;
  rightDigits: number;
  bestTime?: number;
  completedCount: number;
  level: number;
}

export interface BrainTraining {
  id: string;
  title: string;
  score: number;
  icon: string;
  tag: string;
}
