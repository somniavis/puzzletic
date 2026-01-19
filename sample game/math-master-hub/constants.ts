
import { GamifiedGame, CalculationDrill, Operator, BrainTraining } from './types';

export const FUN_MATH_GAMES: (GamifiedGame & { progress: number })[] = [
  { id: 'fun-1', title: 'Ten-Blocks', description: 'Count by Tens!', difficulty: 1, icon: '🧱', color: 'bg-orange-100', category: 'Basic', progress: 60 },
  { id: 'fun-2', title: 'Spin Wheel', description: 'Fix the Propeller!', difficulty: 1, icon: '🍭', color: 'bg-blue-100', category: 'Logic', progress: 10 },
  { id: 'fun-3', title: 'Deep Dive', description: 'Dive Deeper!', difficulty: 2, icon: '🤿', color: 'bg-cyan-100', category: 'Numbers', progress: 0 },
  { id: 'fun-4', title: 'Pizza Tycoon', description: 'Calculate the slices!', difficulty: 2, icon: '🍕', color: 'bg-red-100', category: 'Fractions', progress: 85 },
];

export const BRAIN_TRAINING_GAMES: (BrainTraining & { difficulty: number, progress: number })[] = [
  { id: 'brain-1', title: 'Memory Matrix', score: 1240, icon: '🧠', tag: 'Memory', difficulty: 1, progress: 40 },
  { id: 'brain-2', title: 'Focus Flow', score: 850, icon: '👁️', tag: 'Attention', difficulty: 2, progress: 20 },
  { id: 'brain-3', title: 'Speed Match', score: 2100, icon: '⚡', tag: 'Speed', difficulty: 1, progress: 90 },
];

const generateDrills = (): CalculationDrill[] => {
  const drills: CalculationDrill[] = [];
  const configs = [
    { op: Operator.ADD, pairs: [[2, 1], [2, 2], [3, 2]] },
    { op: Operator.SUB, pairs: [[2, 1], [2, 2], [3, 2]] },
    { op: Operator.MUL, pairs: [[2, 1], [2, 2]] },
  ];

  let idCounter = 1;
  configs.forEach(config => {
    config.pairs.forEach((pair, index) => {
      drills.push({
        id: `drill-${idCounter++}`,
        operator: config.op,
        leftDigits: pair[0],
        rightDigits: pair[1],
        completedCount: Math.floor(Math.random() * 10),
        bestTime: Math.random() < 0.5 ? parseFloat((Math.random() * 10 + 2).toFixed(2)) : undefined,
        level: index + 1
      });
    });
  });

  return drills;
};

export const DRILL_DATA = generateDrills();
