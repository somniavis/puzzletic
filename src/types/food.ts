export interface FoodItem {
  id: string;
  nameKey: string; // i18n key for food name
  icon: string;
  category: FoodCategory;
  effects: {
    hunger: number;
    happiness: number;
    health?: number;
  };
}

export type FoodCategory = 'meal' | 'snack' | 'drink' | 'treat';

export const FOOD_CATEGORIES: Record<FoodCategory, { nameKey: string; icon: string }> = {
  meal: { nameKey: 'food.categories.meal', icon: '🍖' },
  snack: { nameKey: 'food.categories.snack', icon: '🍪' },
  drink: { nameKey: 'food.categories.drink', icon: '🥤' },
  treat: { nameKey: 'food.categories.treat', icon: '🎂' },
};

export const FOOD_ITEMS: FoodItem[] = [
  // Meals (10 items)
  {
    id: 'meat',
    nameKey: 'food.items.meat',
    icon: '🍖',
    category: 'meal',
    effects: { hunger: -30, happiness: 10 },
  },
  {
    id: 'fish',
    nameKey: 'food.items.fish',
    icon: '🐟',
    category: 'meal',
    effects: { hunger: -25, happiness: 8, health: 5 },
  },
  {
    id: 'rice',
    nameKey: 'food.items.rice',
    icon: '🍚',
    category: 'meal',
    effects: { hunger: -20, happiness: 5 },
  },
  {
    id: 'steak',
    nameKey: 'food.items.steak',
    icon: '🥩',
    category: 'meal',
    effects: { hunger: -35, happiness: 15, health: 10 },
  },
  {
    id: 'chicken',
    nameKey: 'food.items.chicken',
    icon: '🍗',
    category: 'meal',
    effects: { hunger: -28, happiness: 12 },
  },
  {
    id: 'bacon',
    nameKey: 'food.items.bacon',
    icon: '🥓',
    category: 'meal',
    effects: { hunger: -22, happiness: 14 },
  },
  {
    id: 'egg',
    nameKey: 'food.items.egg',
    icon: '🍳',
    category: 'meal',
    effects: { hunger: -18, happiness: 8, health: 6 },
  },
  {
    id: 'bread',
    nameKey: 'food.items.bread',
    icon: '🍞',
    category: 'meal',
    effects: { hunger: -15, happiness: 6 },
  },
  {
    id: 'pasta',
    nameKey: 'food.items.pasta',
    icon: '🍝',
    category: 'meal',
    effects: { hunger: -32, happiness: 16 },
  },
  {
    id: 'salad',
    nameKey: 'food.items.salad',
    icon: '🥗',
    category: 'meal',
    effects: { hunger: -16, happiness: 7, health: 12 },
  },

  // Snacks (10 items)
  {
    id: 'cookie',
    nameKey: 'food.items.cookie',
    icon: '🍪',
    category: 'snack',
    effects: { hunger: -10, happiness: 15 },
  },
  {
    id: 'candy',
    nameKey: 'food.items.candy',
    icon: '🍬',
    category: 'snack',
    effects: { hunger: -5, happiness: 10 },
  },
  {
    id: 'donut',
    nameKey: 'food.items.donut',
    icon: '🍩',
    category: 'snack',
    effects: { hunger: -15, happiness: 18 },
  },
  {
    id: 'ice_cream',
    nameKey: 'food.items.ice_cream',
    icon: '🍦',
    category: 'snack',
    effects: { hunger: -12, happiness: 20 },
  },
  {
    id: 'chocolate',
    nameKey: 'food.items.chocolate',
    icon: '🍫',
    category: 'snack',
    effects: { hunger: -8, happiness: 16 },
  },
  {
    id: 'lollipop',
    nameKey: 'food.items.lollipop',
    icon: '🍭',
    category: 'snack',
    effects: { hunger: -6, happiness: 12 },
  },
  {
    id: 'popcorn',
    nameKey: 'food.items.popcorn',
    icon: '🍿',
    category: 'snack',
    effects: { hunger: -14, happiness: 14 },
  },
  {
    id: 'pretzel',
    nameKey: 'food.items.pretzel',
    icon: '🥨',
    category: 'snack',
    effects: { hunger: -11, happiness: 11 },
  },
  {
    id: 'chips',
    nameKey: 'food.items.chips',
    icon: '🥔',
    category: 'snack',
    effects: { hunger: -13, happiness: 13 },
  },
  {
    id: 'cupcake',
    nameKey: 'food.items.cupcake',
    icon: '🧁',
    category: 'snack',
    effects: { hunger: -16, happiness: 19 },
  },

  // Drinks (10 items)
  {
    id: 'water',
    nameKey: 'food.items.water',
    icon: '💧',
    category: 'drink',
    effects: { hunger: -5, happiness: 3, health: 5 },
  },
  {
    id: 'juice',
    nameKey: 'food.items.juice',
    icon: '🧃',
    category: 'drink',
    effects: { hunger: -10, happiness: 12 },
  },
  {
    id: 'milk',
    nameKey: 'food.items.milk',
    icon: '🥛',
    category: 'drink',
    effects: { hunger: -15, happiness: 8, health: 8 },
  },
  {
    id: 'soda',
    nameKey: 'food.items.soda',
    icon: '🥤',
    category: 'drink',
    effects: { hunger: -8, happiness: 15 },
  },
  {
    id: 'coffee',
    nameKey: 'food.items.coffee',
    icon: '☕',
    category: 'drink',
    effects: { hunger: -6, happiness: 10 },
  },
  {
    id: 'tea',
    nameKey: 'food.items.tea',
    icon: '🍵',
    category: 'drink',
    effects: { hunger: -7, happiness: 9, health: 6 },
  },
  {
    id: 'smoothie',
    nameKey: 'food.items.smoothie',
    icon: '🥤',
    category: 'drink',
    effects: { hunger: -12, happiness: 14, health: 10 },
  },
  {
    id: 'hot_chocolate',
    nameKey: 'food.items.hot_chocolate',
    icon: '☕',
    category: 'drink',
    effects: { hunger: -11, happiness: 17 },
  },
  {
    id: 'lemonade',
    nameKey: 'food.items.lemonade',
    icon: '🍋',
    category: 'drink',
    effects: { hunger: -9, happiness: 13 },
  },
  {
    id: 'bubble_tea',
    nameKey: 'food.items.bubble_tea',
    icon: '🧋',
    category: 'drink',
    effects: { hunger: -13, happiness: 18 },
  },

  // Special treats (10 items)
  {
    id: 'cake',
    nameKey: 'food.items.cake',
    icon: '🎂',
    category: 'treat',
    effects: { hunger: -25, happiness: 30, health: 5 },
  },
  {
    id: 'pizza',
    nameKey: 'food.items.pizza',
    icon: '🍕',
    category: 'treat',
    effects: { hunger: -40, happiness: 25 },
  },
  {
    id: 'burger',
    nameKey: 'food.items.burger',
    icon: '🍔',
    category: 'treat',
    effects: { hunger: -35, happiness: 22 },
  },
  {
    id: 'sushi',
    nameKey: 'food.items.sushi',
    icon: '🍣',
    category: 'treat',
    effects: { hunger: -30, happiness: 28, health: 15 },
  },
  {
    id: 'ramen',
    nameKey: 'food.items.ramen',
    icon: '🍜',
    category: 'treat',
    effects: { hunger: -33, happiness: 24 },
  },
  {
    id: 'hot_dog',
    nameKey: 'food.items.hot_dog',
    icon: '🌭',
    category: 'treat',
    effects: { hunger: -28, happiness: 20 },
  },
  {
    id: 'taco',
    nameKey: 'food.items.taco',
    icon: '🌮',
    category: 'treat',
    effects: { hunger: -32, happiness: 23 },
  },
  {
    id: 'burrito',
    nameKey: 'food.items.burrito',
    icon: '🌯',
    category: 'treat',
    effects: { hunger: -38, happiness: 26 },
  },
  {
    id: 'ice_cream_sundae',
    nameKey: 'food.items.ice_cream_sundae',
    icon: '🍨',
    category: 'treat',
    effects: { hunger: -22, happiness: 32 },
  },
  {
    id: 'pie',
    nameKey: 'food.items.pie',
    icon: '🥧',
    category: 'treat',
    effects: { hunger: -26, happiness: 29, health: 8 },
  },
];
