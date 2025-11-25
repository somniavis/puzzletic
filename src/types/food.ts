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

export type FoodCategory = 'fruit' | 'vegetable' | 'bakery' | 'meal' | 'dessert';

export const FOOD_CATEGORIES: Record<FoodCategory, { nameKey: string; icon: string }> = {
  fruit: { nameKey: 'food.categories.fruit', icon: '🍇' },
  vegetable: { nameKey: 'food.categories.vegetable', icon: '🥕' },
  bakery: { nameKey: 'food.categories.bakery', icon: '🍞' },
  meal: { nameKey: 'food.categories.meal', icon: '🍖' },
  dessert: { nameKey: 'food.categories.dessert', icon: '🍰' },
};

export const FOOD_ITEMS: FoodItem[] = [
  // Fruits
  { id: 'grapes', nameKey: 'food.items.grapes', icon: '🍇', category: 'fruit', effects: { hunger: -10, happiness: 5, health: 2 } },
  { id: 'melon', nameKey: 'food.items.melon', icon: '🍈', category: 'fruit', effects: { hunger: -12, happiness: 5, health: 2 } },
  { id: 'watermelon', nameKey: 'food.items.watermelon', icon: '🍉', category: 'fruit', effects: { hunger: -15, happiness: 6, health: 3 } },
  { id: 'tangerine', nameKey: 'food.items.tangerine', icon: '🍊', category: 'fruit', effects: { hunger: -8, happiness: 4, health: 2 } },
  { id: 'lemon', nameKey: 'food.items.lemon', icon: '🍋', category: 'fruit', effects: { hunger: -5, happiness: 2, health: 1 } },
  { id: 'lime', nameKey: 'food.items.lime', icon: '🍋‍🟩', category: 'fruit', effects: { hunger: -5, happiness: 2, health: 1 } },
  { id: 'banana', nameKey: 'food.items.banana', icon: '🍌', category: 'fruit', effects: { hunger: -15, happiness: 7, health: 3 } },
  { id: 'pineapple', nameKey: 'food.items.pineapple', icon: '🍍', category: 'fruit', effects: { hunger: -18, happiness: 8, health: 4 } },
  { id: 'mango', nameKey: 'food.items.mango', icon: '🥭', category: 'fruit', effects: { hunger: -16, happiness: 9, health: 4 } },
  { id: 'red_apple', nameKey: 'food.items.red_apple', icon: '🍎', category: 'fruit', effects: { hunger: -10, happiness: 5, health: 3 } },
  { id: 'green_apple', nameKey: 'food.items.green_apple', icon: '🍏', category: 'fruit', effects: { hunger: -10, happiness: 5, health: 3 } },
  { id: 'pear', nameKey: 'food.items.pear', icon: '🍐', category: 'fruit', effects: { hunger: -12, happiness: 6, health: 2 } },
  { id: 'peach', nameKey: 'food.items.peach', icon: '🍑', category: 'fruit', effects: { hunger: -11, happiness: 7, health: 2 } },
  { id: 'cherries', nameKey: 'food.items.cherries', icon: '🍒', category: 'fruit', effects: { hunger: -7, happiness: 4, health: 1 } },
  { id: 'strawberry', nameKey: 'food.items.strawberry', icon: '🍓', category: 'fruit', effects: { hunger: -8, happiness: 6, health: 2 } },
  { id: 'blueberries', nameKey: 'food.items.blueberries', icon: '🫐', category: 'fruit', effects: { hunger: -6, happiness: 5, health: 2 } },
  { id: 'kiwi_fruit', nameKey: 'food.items.kiwi_fruit', icon: '🥝', category: 'fruit', effects: { hunger: -10, happiness: 6, health: 3 } },
  { id: 'tomato', nameKey: 'food.items.tomato', icon: '🍅', category: 'fruit', effects: { hunger: -7, happiness: 3, health: 4 } },
  { id: 'olive', nameKey: 'food.items.olive', icon: '🫒', category: 'fruit', effects: { hunger: -4, happiness: 2, health: 1 } },
  { id: 'coconut', nameKey: 'food.items.coconut', icon: '🥥', category: 'fruit', effects: { hunger: -20, happiness: 8, health: 5 } },

  // Vegetables
  { id: 'avocado', nameKey: 'food.items.avocado', icon: '🥑', category: 'vegetable', effects: { hunger: -15, happiness: 5, health: 5 } },
  { id: 'eggplant', nameKey: 'food.items.eggplant', icon: '🍆', category: 'vegetable', effects: { hunger: -10, happiness: 3, health: 4 } },
  { id: 'potato', nameKey: 'food.items.potato', icon: '🥔', category: 'vegetable', effects: { hunger: -18, happiness: 4, health: 3 } },
  { id: 'carrot', nameKey: 'food.items.carrot', icon: '🥕', category: 'vegetable', effects: { hunger: -12, happiness: 4, health: 6 } },
  { id: 'ear_of_corn', nameKey: 'food.items.ear_of_corn', icon: '🌽', category: 'vegetable', effects: { hunger: -16, happiness: 6, health: 4 } },
  { id: 'hot_pepper', nameKey: 'food.items.hot_pepper', icon: '🌶️', category: 'vegetable', effects: { hunger: -8, happiness: 2, health: 1 } },
  { id: 'bell_pepper', nameKey: 'food.items.bell_pepper', icon: '🫑', category: 'vegetable', effects: { hunger: -9, happiness: 3, health: 4 } },
  { id: 'cucumber', nameKey: 'food.items.cucumber', icon: '🥒', category: 'vegetable', effects: { hunger: -10, happiness: 3, health: 3 } },
  { id: 'leafy_green', nameKey: 'food.items.leafy_green', icon: '🥬', category: 'vegetable', effects: { hunger: -8, happiness: 2, health: 5 } },
  { id: 'broccoli', nameKey: 'food.items.broccoli', icon: '🥦', category: 'vegetable', effects: { hunger: -11, happiness: 3, health: 6 } },
  { id: 'garlic', nameKey: 'food.items.garlic', icon: '🧄', category: 'vegetable', effects: { hunger: -5, happiness: 1, health: 2 } },
  { id: 'onion', nameKey: 'food.items.onion', icon: '🧅', category: 'vegetable', effects: { hunger: -6, happiness: 1, health: 2 } },
  { id: 'peanuts', nameKey: 'food.items.peanuts', icon: '🥜', category: 'vegetable', effects: { hunger: -10, happiness: 4, health: 3 } },
  { id: 'beans', nameKey: 'food.items.beans', icon: '🫘', category: 'vegetable', effects: { hunger: -14, happiness: 3, health: 4 } },
  { id: 'chestnut', nameKey: 'food.items.chestnut', icon: '🌰', category: 'vegetable', effects: { hunger: -12, happiness: 5, health: 3 } },
  { id: 'ginger', nameKey: 'food.items.ginger', icon: '🫚', category: 'vegetable', effects: { hunger: -4, happiness: 1, health: 2 } },
  { id: 'pea_pod', nameKey: 'food.items.pea_pod', icon: '🫛', category: 'vegetable', effects: { hunger: -9, happiness: 3, health: 3 } },
  { id: 'mushroom', nameKey: 'food.items.mushroom', icon: '🍄‍🟫', category: 'vegetable', effects: { hunger: -9, happiness: 4, health: 3 } },

  // Bakery
  { id: 'bread', nameKey: 'food.items.bread', icon: '🍞', category: 'bakery', effects: { hunger: -20, happiness: 8 } },
  { id: 'croissant', nameKey: 'food.items.croissant', icon: '🥐', category: 'bakery', effects: { hunger: -18, happiness: 12 } },
  { id: 'baguette_bread', nameKey: 'food.items.baguette_bread', icon: '🥖', category: 'bakery', effects: { hunger: -22, happiness: 9 } },
  { id: 'flatbread', nameKey: 'food.items.flatbread', icon: '🫓', category: 'bakery', effects: { hunger: -15, happiness: 7 } },
  { id: 'pretzel', nameKey: 'food.items.pretzel', icon: '🥨', category: 'bakery', effects: { hunger: -16, happiness: 10 } },
  { id: 'bagel', nameKey: 'food.items.bagel', icon: '🥯', category: 'bakery', effects: { hunger: -25, happiness: 11 } },
  { id: 'pancakes', nameKey: 'food.items.pancakes', icon: '🥞', category: 'bakery', effects: { hunger: -28, happiness: 15 } },
  { id: 'waffle', nameKey: 'food.items.waffle', icon: '🧇', category: 'bakery', effects: { hunger: -26, happiness: 16 } },
  { id: 'butter', nameKey: 'food.items.butter', icon: '🧈', category: 'bakery', effects: { hunger: -5, happiness: 5 } },
  { id: 'cheese_wedge', nameKey: 'food.items.cheese_wedge', icon: '🧀', category: 'bakery', effects: { hunger: -15, happiness: 9 } },

  // Meals
  { id: 'meat_on_bone', nameKey: 'food.items.meat_on_bone', icon: '🍖', category: 'meal', effects: { hunger: -40, happiness: 15 } },
  { id: 'poultry_leg', nameKey: 'food.items.poultry_leg', icon: '🍗', category: 'meal', effects: { hunger: -35, happiness: 12 } },
  { id: 'cut_of_meat', nameKey: 'food.items.cut_of_meat', icon: '🥩', category: 'meal', effects: { hunger: -45, happiness: 18 } },
  { id: 'bacon', nameKey: 'food.items.bacon', icon: '🥓', category: 'meal', effects: { hunger: -25, happiness: 14 } },
  { id: 'hamburger', nameKey: 'food.items.hamburger', icon: '🍔', category: 'meal', effects: { hunger: -50, happiness: 20 } },
  { id: 'french_fries', nameKey: 'food.items.french_fries', icon: '🍟', category: 'meal', effects: { hunger: -30, happiness: 18 } },
  { id: 'pizza', nameKey: 'food.items.pizza', icon: '🍕', category: 'meal', effects: { hunger: -60, happiness: 25 } },
  { id: 'hot_dog', nameKey: 'food.items.hot_dog', icon: '🌭', category: 'meal', effects: { hunger: -40, happiness: 19 } },
  { id: 'sandwich', nameKey: 'food.items.sandwich', icon: '🥪', category: 'meal', effects: { hunger: -45, happiness: 17 } },
  { id: 'taco', nameKey: 'food.items.taco', icon: '🌮', category: 'meal', effects: { hunger: -38, happiness: 22 } },
  { id: 'burrito', nameKey: 'food.items.burrito', icon: '🌯', category: 'meal', effects: { hunger: -55, happiness: 24 } },
  { id: 'stuffed_flatbread', nameKey: 'food.items.stuffed_flatbread', icon: '🥙', category: 'meal', effects: { hunger: -48, happiness: 21 } },
  { id: 'falafel', nameKey: 'food.items.falafel', icon: '🧆', category: 'meal', effects: { hunger: -35, happiness: 16, health: 5 } },
  { id: 'egg', nameKey: 'food.items.egg', icon: '🥚', category: 'meal', effects: { hunger: -20, happiness: 8, health: 7 } },
  { id: 'cooking', nameKey: 'food.items.cooking', icon: '🍳', category: 'meal', effects: { hunger: -25, happiness: 10, health: 8 } },
  { id: 'curry_rice', nameKey: 'food.items.curry_rice', icon: '🍛', category: 'meal', effects: { hunger: -40, happiness: 18 } },
  { id: 'steaming_bowl', nameKey: 'food.items.steaming_bowl', icon: '🍜', category: 'meal', effects: { hunger: -42, happiness: 20 } },
  { id: 'cooked_rice', nameKey: 'food.items.cooked_rice', icon: '🍚', category: 'meal', effects: { hunger: -30, happiness: 10 } },
  { id: 'pot_of_food', nameKey: 'food.items.pot_of_food', icon: '🍲', category: 'meal', effects: { hunger: -50, happiness: 22 } },
  { id: 'shallow_pan_of_food', nameKey: 'food.items.shallow_pan_of_food', icon: '🥘', category: 'meal', effects: { hunger: -55, happiness: 25 } },
  { id: 'oden', nameKey: 'food.items.oden', icon: '🍢', category: 'meal', effects: { hunger: -20, happiness: 12 } },
  { id: 'rice_ball', nameKey: 'food.items.rice_ball', icon: '🍙', category: 'meal', effects: { hunger: -25, happiness: 11 } },
  { id: 'fried_shrimp', nameKey: 'food.items.fried_shrimp', icon: '🍤', category: 'meal', effects: { hunger: -22, happiness: 14 } },
  { id: 'dumpling', nameKey: 'food.items.dumpling', icon: '🥟', category: 'meal', effects: { hunger: -20, happiness: 15 } },
  { id: 'canned_food', nameKey: 'food.items.canned_food', icon: '🥫', category: 'meal', effects: { hunger: -30, happiness: 10 } },

  // Desserts
  { id: 'soft_ice_cream', nameKey: 'food.items.soft_ice_cream', icon: '🍦', category: 'dessert', effects: { hunger: -15, happiness: 25 } },
  { id: 'shaved_ice', nameKey: 'food.items.shaved_ice', icon: '🍧', category: 'dessert', effects: { hunger: -12, happiness: 22 } },
  { id: 'ice_cream', nameKey: 'food.items.ice_cream', icon: '🍨', category: 'dessert', effects: { hunger: -18, happiness: 28 } },
  { id: 'doughnut', nameKey: 'food.items.doughnut', icon: '🍩', category: 'dessert', effects: { hunger: -20, happiness: 30 } },
  { id: 'cookie', nameKey: 'food.items.cookie', icon: '🍪', category: 'dessert', effects: { hunger: -12, happiness: 20 } },
  { id: 'birthday_cake', nameKey: 'food.items.birthday_cake', icon: '🎂', category: 'dessert', effects: { hunger: -40, happiness: 50 } },
  { id: 'shortcake', nameKey: 'food.items.shortcake', icon: '🍰', category: 'dessert', effects: { hunger: -30, happiness: 40 } },
  { id: 'cupcake', nameKey: 'food.items.cupcake', icon: '🧁', category: 'dessert', effects: { hunger: -25, happiness: 35 } },
  { id: 'pie', nameKey: 'food.items.pie', icon: '🥧', category: 'dessert', effects: { hunger: -35, happiness: 45 } },
  { id: 'chocolate_bar', nameKey: 'food.items.chocolate_bar', icon: '🍫', category: 'dessert', effects: { hunger: -15, happiness: 28 } },
  { id: 'candy', nameKey: 'food.items.candy', icon: '🍬', category: 'dessert', effects: { hunger: -10, happiness: 22 } },
  { id: 'lollipop', nameKey: 'food.items.lollipop', icon: '🍭', category: 'dessert', effects: { hunger: -8, happiness: 18 } },
  { id: 'custard', nameKey: 'food.items.custard', icon: '🍮', category: 'dessert', effects: { hunger: -20, happiness: 32 } },
  { id: 'honey_pot', nameKey: 'food.items.honey_pot', icon: '🍯', category: 'dessert', effects: { hunger: -15, happiness: 25, health: 5 } },
  { id: 'rice_cracker', nameKey: 'food.items.rice_cracker', icon: '🍘', category: 'dessert', effects: { hunger: -15, happiness: 9 } },
  { id: 'fortune_cookie', nameKey: 'food.items.fortune_cookie', icon: '🥠', category: 'dessert', effects: { hunger: -10, happiness: 18 } },
  { id: 'moon_cake', nameKey: 'food.items.moon_cake', icon: '🥮', category: 'dessert', effects: { hunger: -28, happiness: 20 } },
  { id: 'popcorn', nameKey: 'food.items.popcorn', icon: '🍿', category: 'dessert', effects: { hunger: -25, happiness: 17 } },
];