export interface CleaningTool {
  id: 'broom' | 'newspaper' | 'shower' | 'robot_cleaner' | 'toothbrush' | 'max_stats';
  nameKey: string;
  descriptionKey: string;
  icon: string;
  price: number;
}

export const CLEANING_TOOLS: CleaningTool[] = [
  {
    id: 'toothbrush',
    nameKey: 'cleanMenu.toothbrush.name',
    descriptionKey: 'cleanMenu.toothbrush.effect',
    icon: '🪥',
    price: 1,
  },
  {
    id: 'shower',
    nameKey: 'cleanMenu.shower.name',
    descriptionKey: 'cleanMenu.shower.effect',
    icon: '🛁',
    price: 3,
  },
  {
    id: 'broom',
    nameKey: 'cleanMenu.broom.name',
    descriptionKey: 'cleanMenu.broom.effect',
    icon: '🧹',
    price: 0,
  },
  {
    id: 'newspaper',
    nameKey: 'cleanMenu.newspaper.name',
    descriptionKey: 'cleanMenu.newspaper.effect',
    icon: '🗞️',
    price: 0,
  },
  {
    id: 'robot_cleaner',
    nameKey: 'cleanMenu.robot_cleaner.name',
    descriptionKey: 'cleanMenu.robot_cleaner.effect',
    icon: '🖲️',
    price: 30,
  },
];
