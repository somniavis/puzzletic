import type { FoodCategory } from './food';

export type DailyRoutineTaskType =
  | 'study_stars'
  | 'pet_touch'
  | 'feed_category'
  | 'brush_teeth'
  | 'shower'
  | 'clean_poop'
  | 'clean_bug'
  | 'sleep';

interface DailyRoutineTaskBase {
  id: string;
  type: DailyRoutineTaskType;
  target: number;
  progress: number;
  completed: boolean;
}

export interface DailyRoutineFeedCategoryTask extends DailyRoutineTaskBase {
  type: 'feed_category';
  foodCategory: FoodCategory;
}

export interface DailyRoutineSimpleTask extends DailyRoutineTaskBase {
  type: Exclude<DailyRoutineTaskType, 'feed_category'>;
}

export type DailyRoutineTask =
  | DailyRoutineFeedCategoryTask
  | DailyRoutineSimpleTask;

export interface DailyRoutineState {
  dateKey: string;
  tasks: DailyRoutineTask[];
  completed: boolean;
  claimed: boolean;
  claimedAt?: number;
  updatedAt: number;
}

export interface DailyRoutineProgressPayload {
  type: DailyRoutineTaskType;
  foodCategory?: FoodCategory;
}
