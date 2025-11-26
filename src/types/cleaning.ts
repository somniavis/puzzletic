export interface CleaningTool {
  id: 'broom' | 'newspaper' | 'robot_cleaner';
  nameKey: string;
  descriptionKey: string;
  icon: string;
  price: number;
}

export const CLEANING_TOOLS: CleaningTool[] = [
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
    price: 300,
  },
];
