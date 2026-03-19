import { FOOD_CATEGORIES } from '../types/food';
import type { FoodCategory } from '../types/food';
import type {
  DailyRoutineProgressPayload,
  DailyRoutineState,
  DailyRoutineTask,
  DailyRoutineTaskType,
} from '../types/dailyRoutine';

const DAILY_ROUTINE_STORAGE_KEY_PREFIX = 'puzzleletic_daily_routine_v3';

type DailyRoutineTaskDefinition =
  | { type: 'study_stars'; target: 5 }
  | { type: 'pet_touch'; target: 5 }
  | { type: 'feed_category'; target: 3 }
  | { type: 'brush_teeth'; target: 2 }
  | { type: 'shower'; target: 2 }
  | { type: 'clean_poop'; target: 2 }
  | { type: 'clean_bug'; target: 1 }
  | { type: 'sleep'; target: 1 };

const LEARNING_POOL: readonly DailyRoutineTaskDefinition[] = [
  { type: 'study_stars', target: 5 },
];

const CARE_POOL: readonly DailyRoutineTaskDefinition[] = [
  { type: 'pet_touch', target: 5 },
  { type: 'feed_category', target: 3 },
  { type: 'brush_teeth', target: 2 },
  { type: 'shower', target: 2 },
  { type: 'clean_poop', target: 2 },
  { type: 'clean_bug', target: 1 },
  { type: 'sleep', target: 1 },
];

const EXPECTED_TASK_COUNT = LEARNING_POOL.length + 2;

const FOOD_CATEGORY_VALUES = Object.keys(FOOD_CATEGORIES) as FoodCategory[];

const isTaskComplete = (progress: number, target: number) => progress >= target;

const getRandomItem = <T>(items: readonly T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const createTaskId = (dateKey: string, type: DailyRoutineTaskType, index: number) => {
  return `${dateKey}:${type}:${index}`;
};

const createTaskFromDefinition = (
  definition: DailyRoutineTaskDefinition,
  dateKey: string,
  index: number,
): DailyRoutineTask => {
  if (definition.type === 'feed_category') {
    return {
      id: createTaskId(dateKey, definition.type, index),
      type: definition.type,
      target: definition.target,
      progress: 0,
      completed: false,
      foodCategory: getRandomItem(FOOD_CATEGORY_VALUES),
    };
  }

  return {
    id: createTaskId(dateKey, definition.type, index),
    type: definition.type,
    target: definition.target,
    progress: 0,
    completed: false,
  };
};

const getStorageKey = (scopeId?: string) => {
  return scopeId
    ? `${DAILY_ROUTINE_STORAGE_KEY_PREFIX}_${scopeId}`
    : DAILY_ROUTINE_STORAGE_KEY_PREFIX;
};

const isValidTaskType = (value: unknown): value is DailyRoutineTaskType => {
  return [
    'study_stars',
    'pet_touch',
    'feed_category',
    'brush_teeth',
    'shower',
    'clean_poop',
    'clean_bug',
    'sleep',
  ].includes(String(value));
};

const normalizeTask = (task: unknown): DailyRoutineTask | null => {
  if (!task || typeof task !== 'object') return null;

  const candidate = task as Partial<DailyRoutineTask>;

  if (
    typeof candidate.id !== 'string' ||
    !isValidTaskType(candidate.type) ||
    typeof candidate.target !== 'number' ||
    typeof candidate.progress !== 'number'
  ) {
    return null;
  }

  const normalizedProgress = Math.max(0, Math.floor(candidate.progress));
  const normalizedTarget = Math.max(1, Math.floor(candidate.target));
  const completed = isTaskComplete(normalizedProgress, normalizedTarget);

  if (candidate.type === 'feed_category') {
    if (!candidate.foodCategory || !FOOD_CATEGORY_VALUES.includes(candidate.foodCategory)) {
      return null;
    }

    return {
      id: candidate.id,
      type: candidate.type,
      target: normalizedTarget,
      progress: Math.min(normalizedProgress, normalizedTarget),
      completed,
      foodCategory: candidate.foodCategory,
    };
  }

  return {
    id: candidate.id,
    type: candidate.type,
    target: normalizedTarget,
    progress: Math.min(normalizedProgress, normalizedTarget),
    completed,
  };
};

const normalizeState = (state: unknown): DailyRoutineState | null => {
  if (!state || typeof state !== 'object') return null;

  const candidate = state as Partial<DailyRoutineState>;

  if (
    typeof candidate.dateKey !== 'string' ||
    !Array.isArray(candidate.tasks) ||
    typeof candidate.claimed !== 'boolean'
  ) {
    return null;
  }

  const tasks = candidate.tasks
    .map(normalizeTask)
    .filter((task): task is DailyRoutineTask => task !== null);

  if (tasks.length !== EXPECTED_TASK_COUNT) return null;

  return {
    dateKey: candidate.dateKey,
    tasks,
    completed: tasks.every((task) => task.completed),
    claimed: candidate.claimed,
    claimedAt: typeof candidate.claimedAt === 'number' ? candidate.claimedAt : undefined,
    updatedAt: typeof candidate.updatedAt === 'number' ? candidate.updatedAt : Date.now(),
  };
};

export const getDailyRoutineDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const createDailyRoutineState = (date: Date = new Date()): DailyRoutineState => {
  const dateKey = getDailyRoutineDateKey(date);
  const learningTasks = LEARNING_POOL.map((taskDefinition, index) =>
    createTaskFromDefinition(taskDefinition, dateKey, index)
  );
  const selectedCareTasks = [...CARE_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  const careTasks = selectedCareTasks.map((taskDefinition, index) =>
    createTaskFromDefinition(taskDefinition, dateKey, index + LEARNING_POOL.length)
  );

  return {
    dateKey,
    tasks: [...learningTasks, ...careTasks],
    completed: false,
    claimed: false,
    updatedAt: Date.now(),
  };
};

export const saveDailyRoutineState = (state: DailyRoutineState, scopeId?: string): void => {
  try {
    localStorage.setItem(getStorageKey(scopeId), JSON.stringify(state));
  } catch (error) {
    console.warn('[DailyRoutine] Failed to save state:', error);
  }
};

export const loadDailyRoutineState = (scopeId?: string): DailyRoutineState | null => {
  try {
    const serialized = localStorage.getItem(getStorageKey(scopeId));

    if (!serialized) return null;

    return normalizeState(JSON.parse(serialized));
  } catch (error) {
    console.warn('[DailyRoutine] Failed to load state:', error);
    return null;
  }
};

export const getOrCreateDailyRoutineState = (
  scopeId?: string,
  date: Date = new Date(),
): DailyRoutineState => {
  const currentDateKey = getDailyRoutineDateKey(date);
  const loadedState = loadDailyRoutineState(scopeId);

  if (loadedState?.dateKey === currentDateKey) {
    return loadedState;
  }

  const newState = createDailyRoutineState(date);
  saveDailyRoutineState(newState, scopeId);
  return newState;
};

export const refreshDailyRoutineStateForToday = (
  state: DailyRoutineState,
  date: Date = new Date(),
): DailyRoutineState => {
  const currentDateKey = getDailyRoutineDateKey(date);
  if (state.dateKey === currentDateKey) return state;

  return createDailyRoutineState(date);
};

export const applyDailyRoutineProgress = (
  state: DailyRoutineState,
  payload: DailyRoutineProgressPayload,
): DailyRoutineState => {
  let didChange = false;

  const updatedTasks = state.tasks.map((task) => {
    if (task.completed || task.type !== payload.type) {
      return task;
    }

    if (task.type === 'feed_category' && task.foodCategory !== payload.foodCategory) {
      return task;
    }

    didChange = true;
    const progress = Math.min(task.progress + 1, task.target);

    return {
      ...task,
      progress,
      completed: isTaskComplete(progress, task.target),
    };
  });

  if (!didChange) return state;

  return {
    ...state,
    tasks: updatedTasks,
    completed: updatedTasks.every((task) => task.completed),
    updatedAt: Date.now(),
  };
};

export const markDailyRoutineClaimed = (state: DailyRoutineState): DailyRoutineState => {
  return {
    ...state,
    claimed: true,
    claimedAt: Date.now(),
    updatedAt: Date.now(),
  };
};
