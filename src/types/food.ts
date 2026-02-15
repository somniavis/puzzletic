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
  price: number; // Price in 'glo'
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
  // Fruits (Hunger: 0.4x, Happy: 0.4x, Health: 0.1x)
  { id: 'lemon', nameKey: 'food.items.lemon', icon: '🍋', category: 'fruit', effects: { hunger: -2, happiness: 2, health: 1 }, price: 3 },
  { id: 'olive', nameKey: 'food.items.olive', icon: '🫒', category: 'fruit', effects: { hunger: -2, happiness: 2, health: 1 }, price: 3 },
  { id: 'cherries', nameKey: 'food.items.cherries', icon: '🍒', category: 'fruit', effects: { hunger: -3, happiness: 3, health: 1 }, price: 4 },
  { id: 'blueberries', nameKey: 'food.items.blueberries', icon: '🫐', category: 'fruit', effects: { hunger: -3, happiness: 3, health: 1 }, price: 4 },
  { id: 'tangerine', nameKey: 'food.items.tangerine', icon: '🍊', category: 'fruit', effects: { hunger: -3, happiness: 3, health: 1 }, price: 4 },
  { id: 'tomato', nameKey: 'food.items.tomato', icon: '🍅', category: 'fruit', effects: { hunger: -3, happiness: 3, health: 1 }, price: 4 },
  { id: 'strawberry', nameKey: 'food.items.strawberry', icon: '🍓', category: 'fruit', effects: { hunger: -3, happiness: 3, health: 1 }, price: 4 },
  { id: 'grapes', nameKey: 'food.items.grapes', icon: '🍇', category: 'fruit', effects: { hunger: -3, happiness: 3, health: 1 }, price: 4 },
  { id: 'kiwi_fruit', nameKey: 'food.items.kiwi_fruit', icon: '🥝', category: 'fruit', effects: { hunger: -5, happiness: 4, health: 1 }, price: 5 },
  { id: 'peach', nameKey: 'food.items.peach', icon: '🍑', category: 'fruit', effects: { hunger: -5, happiness: 4, health: 1 }, price: 5 },
  { id: 'melon', nameKey: 'food.items.melon', icon: '🍈', category: 'fruit', effects: { hunger: -5, happiness: 4, health: 1 }, price: 5 },
  { id: 'pear', nameKey: 'food.items.pear', icon: '🍐', category: 'fruit', effects: { hunger: -5, happiness: 4, health: 1 }, price: 5 },
  { id: 'red_apple', nameKey: 'food.items.red_apple', icon: '🍎', category: 'fruit', effects: { hunger: -5, happiness: 4, health: 1 }, price: 5 },
  { id: 'green_apple', nameKey: 'food.items.green_apple', icon: '🍏', category: 'fruit', effects: { hunger: -5, happiness: 4, health: 1 }, price: 5 },
  { id: 'watermelon', nameKey: 'food.items.watermelon', icon: '🍉', category: 'fruit', effects: { hunger: -6, happiness: 5, health: 2 }, price: 6 },
  { id: 'banana', nameKey: 'food.items.banana', icon: '🍌', category: 'fruit', effects: { hunger: -6, happiness: 5, health: 2 }, price: 6 },
  { id: 'mango', nameKey: 'food.items.mango', icon: '🥭', category: 'fruit', effects: { hunger: -7, happiness: 6, health: 2 }, price: 7 },
  { id: 'pineapple', nameKey: 'food.items.pineapple', icon: '🍍', category: 'fruit', effects: { hunger: -7, happiness: 6, health: 2 }, price: 7 },
  { id: 'coconut', nameKey: 'food.items.coconut', icon: '🥥', category: 'fruit', effects: { hunger: -8, happiness: 8, health: 2 }, price: 8 },

  // Vegetables (Hunger: 0.3x, Happy: 0.1x, Health: 0.5x)
  { id: 'ginger', nameKey: 'food.items.ginger', icon: '🫚', category: 'vegetable', effects: { hunger: -2, happiness: 0, health: 3 }, price: 3 },
  { id: 'garlic', nameKey: 'food.items.garlic', icon: '🧄', category: 'vegetable', effects: { hunger: -2, happiness: 0, health: 3 }, price: 3 },
  { id: 'onion', nameKey: 'food.items.onion', icon: '🧅', category: 'vegetable', effects: { hunger: -2, happiness: 0, health: 3 }, price: 3 },
  { id: 'hot_pepper', nameKey: 'food.items.hot_pepper', icon: '🌶️', category: 'vegetable', effects: { hunger: -2, happiness: 0, health: 3 }, price: 3 },
  { id: 'leafy_green', nameKey: 'food.items.leafy_green', icon: '🥬', category: 'vegetable', effects: { hunger: -3, happiness: 1, health: 4 }, price: 4 },
  { id: 'cucumber', nameKey: 'food.items.cucumber', icon: '🥒', category: 'vegetable', effects: { hunger: -3, happiness: 1, health: 4 }, price: 4 },
  { id: 'bell_pepper', nameKey: 'food.items.bell_pepper', icon: '🫑', category: 'vegetable', effects: { hunger: -3, happiness: 1, health: 4 }, price: 4 },
  { id: 'pea_pod', nameKey: 'food.items.pea_pod', icon: '🫛', category: 'vegetable', effects: { hunger: -3, happiness: 1, health: 4 }, price: 4 },
  { id: 'eggplant', nameKey: 'food.items.eggplant', icon: '🍆', category: 'vegetable', effects: { hunger: -3, happiness: 1, health: 4 }, price: 4 },
  { id: 'peanuts', nameKey: 'food.items.peanuts', icon: '🥜', category: 'vegetable', effects: { hunger: -3, happiness: 1, health: 4 }, price: 4 },
  { id: 'mushroom', nameKey: 'food.items.mushroom', icon: '🍄‍🟫', category: 'vegetable', effects: { hunger: -3, happiness: 1, health: 4 }, price: 4 },
  { id: 'broccoli', nameKey: 'food.items.broccoli', icon: '🥦', category: 'vegetable', effects: { hunger: -4, happiness: 1, health: 5 }, price: 5 },
  { id: 'beans', nameKey: 'food.items.beans', icon: '🫘', category: 'vegetable', effects: { hunger: -4, happiness: 1, health: 5 }, price: 5 },
  { id: 'carrot', nameKey: 'food.items.carrot', icon: '🥕', category: 'vegetable', effects: { hunger: -4, happiness: 1, health: 5 }, price: 5 },
  { id: 'chestnut', nameKey: 'food.items.chestnut', icon: '🌰', category: 'vegetable', effects: { hunger: -4, happiness: 1, health: 5 }, price: 5 },
  { id: 'avocado', nameKey: 'food.items.avocado', icon: '🥑', category: 'vegetable', effects: { hunger: -4, happiness: 1, health: 5 }, price: 5 },
  { id: 'ear_of_corn', nameKey: 'food.items.ear_of_corn', icon: '🌽', category: 'vegetable', effects: { hunger: -5, happiness: 2, health: 6 }, price: 6 },
  { id: 'potato', nameKey: 'food.items.potato', icon: '🥔', category: 'vegetable', effects: { hunger: -5, happiness: 2, health: 6 }, price: 6 },

  // Bakery (Hunger: 0.5x, Happy: 0.4x, Health: -0.1x)
  { id: 'butter', nameKey: 'food.items.butter', icon: '🧈', category: 'bakery', effects: { hunger: -4, happiness: 3, health: -1 }, price: 4 },
  { id: 'flatbread', nameKey: 'food.items.flatbread', icon: '🫓', category: 'bakery', effects: { hunger: -6, happiness: 5, health: -1 }, price: 6 },
  { id: 'cheese_wedge', nameKey: 'food.items.cheese_wedge', icon: '🧀', category: 'bakery', effects: { hunger: -8, happiness: 6, health: -1 }, price: 7 },
  { id: 'bread', nameKey: 'food.items.bread', icon: '🍞', category: 'bakery', effects: { hunger: -9, happiness: 7, health: -1 }, price: 8 },
  { id: 'pretzel', nameKey: 'food.items.pretzel', icon: '🥨', category: 'bakery', effects: { hunger: -10, happiness: 8, health: -1 }, price: 9 },
  { id: 'croissant', nameKey: 'food.items.croissant', icon: '🥐', category: 'bakery', effects: { hunger: -12, happiness: 10, health: -2 }, price: 10 },
  { id: 'baguette_bread', nameKey: 'food.items.baguette_bread', icon: '🥖', category: 'bakery', effects: { hunger: -12, happiness: 10, health: -2 }, price: 10 },
  { id: 'bagel', nameKey: 'food.items.bagel', icon: '🥯', category: 'bakery', effects: { hunger: -14, happiness: 11, health: -2 }, price: 11 },
  { id: 'pancakes', nameKey: 'food.items.pancakes', icon: '🥞', category: 'bakery', effects: { hunger: -18, happiness: 14, health: -3 }, price: 15 },
  { id: 'waffle', nameKey: 'food.items.waffle', icon: '🧇', category: 'bakery', effects: { hunger: -18, happiness: 14, health: -3 }, price: 15 },

  // Meals (Hunger: 0.6x, Happy: 0.3x, Health: ±0.05x)
  { id: 'oden', nameKey: 'food.items.oden', icon: '🍢', category: 'meal', effects: { hunger: -12, happiness: 6, health: 1 }, price: 8 },
  { id: 'egg', nameKey: 'food.items.egg', icon: '🥚', category: 'meal', effects: { hunger: -13, happiness: 7, health: 1 }, price: 9 },
  { id: 'cooked_rice', nameKey: 'food.items.cooked_rice', icon: '🍚', category: 'meal', effects: { hunger: -15, happiness: 8, health: 1 }, price: 10 },
  { id: 'rice_ball', nameKey: 'food.items.rice_ball', icon: '🍙', category: 'meal', effects: { hunger: -15, happiness: 8, health: 1 }, price: 10 },
  { id: 'canned_food', nameKey: 'food.items.canned_food', icon: '🥫', category: 'meal', effects: { hunger: -17, happiness: 8, health: -1 }, price: 11 },
  { id: 'dumpling', nameKey: 'food.items.dumpling', icon: '🥟', category: 'meal', effects: { hunger: -18, happiness: 9, health: 2 }, price: 12 },
  { id: 'cooking', nameKey: 'food.items.cooking', icon: '🍳', category: 'meal', effects: { hunger: -18, happiness: 9, health: 2 }, price: 12 },
  { id: 'fried_shrimp', nameKey: 'food.items.fried_shrimp', icon: '🍤', category: 'meal', effects: { hunger: -19, happiness: 10, health: -2 }, price: 13 },
  { id: 'bacon', nameKey: 'food.items.bacon', icon: '🥓', category: 'meal', effects: { hunger: -20, happiness: 10, health: -2 }, price: 14 },
  { id: 'french_fries', nameKey: 'food.items.french_fries', icon: '🍟', category: 'meal', effects: { hunger: -21, happiness: 11, health: -2 }, price: 14 },
  { id: 'poultry_leg', nameKey: 'food.items.poultry_leg', icon: '🍗', category: 'meal', effects: { hunger: -24, happiness: 12, health: 2 }, price: 15 },
  { id: 'falafel', nameKey: 'food.items.falafel', icon: '🧆', category: 'meal', effects: { hunger: -25, happiness: 13, health: 2 }, price: 16 },
  { id: 'taco', nameKey: 'food.items.taco', icon: '🌮', category: 'meal', effects: { hunger: -27, happiness: 14, health: -2 }, price: 18 },
  { id: 'meat_on_bone', nameKey: 'food.items.meat_on_bone', icon: '🍖', category: 'meal', effects: { hunger: -29, happiness: 14, health: 2 }, price: 20 },
  { id: 'hot_dog', nameKey: 'food.items.hot_dog', icon: '🌭', category: 'meal', effects: { hunger: -29, happiness: 14, health: -2 }, price: 20 },
  { id: 'steaming_bowl', nameKey: 'food.items.steaming_bowl', icon: '🍜', category: 'meal', effects: { hunger: -30, happiness: 15, health: 3 }, price: 22 },
  { id: 'sandwich', nameKey: 'food.items.sandwich', icon: '🥪', category: 'meal', effects: { hunger: -30, happiness: 15, health: 3 }, price: 22 },
  { id: 'curry_rice', nameKey: 'food.items.curry_rice', icon: '🍛', category: 'meal', effects: { hunger: -30, happiness: 15, health: -3 }, price: 22 },
  { id: 'cut_of_meat', nameKey: 'food.items.cut_of_meat', icon: '🥩', category: 'meal', effects: { hunger: -36, happiness: 18, health: 3 }, price: 25 },
  { id: 'stuffed_flatbread', nameKey: 'food.items.stuffed_flatbread', icon: '🥙', category: 'meal', effects: { hunger: -36, happiness: 18, health: 3 }, price: 25 },
  { id: 'hamburger', nameKey: 'food.items.hamburger', icon: '🍔', category: 'meal', effects: { hunger: -36, happiness: 18, health: -3 }, price: 25 },
  { id: 'burrito', nameKey: 'food.items.burrito', icon: '🌯', category: 'meal', effects: { hunger: -36, happiness: 18, health: -3 }, price: 25 },
  { id: 'pot_of_food', nameKey: 'food.items.pot_of_food', icon: '🍲', category: 'meal', effects: { hunger: -42, happiness: 20, health: 4 }, price: 30 },
  { id: 'pizza', nameKey: 'food.items.pizza', icon: '🍕', category: 'meal', effects: { hunger: -42, happiness: 20, health: -4 }, price: 30 },
  { id: 'shallow_pan_of_food', nameKey: 'food.items.shallow_pan_of_food', icon: '🥘', category: 'meal', effects: { hunger: -42, happiness: 20, health: 4 }, price: 30 },

  // Desserts (Hunger: 0.1x, Happy: 0.8x, Health: -0.1x [Reduced from -0.3x])
  // Adjusted: Health penalty reduced to ~1/3
  { id: 'lollipop', nameKey: 'food.items.lollipop', icon: '🍭', category: 'dessert', effects: { hunger: -1, happiness: 10, health: -1 }, price: 6 },
  { id: 'candy', nameKey: 'food.items.candy', icon: '🍬', category: 'dessert', effects: { hunger: -1, happiness: 10, health: -1 }, price: 6 },
  { id: 'rice_cracker', nameKey: 'food.items.rice_cracker', icon: '🍘', category: 'dessert', effects: { hunger: -1, happiness: 10, health: -1 }, price: 6 },
  { id: 'cookie', nameKey: 'food.items.cookie', icon: '🍪', category: 'dessert', effects: { hunger: -2, happiness: 10, health: -1 }, price: 8 }, // Price check: Table says 6-8, kept 8
  { id: 'fortune_cookie', nameKey: 'food.items.fortune_cookie', icon: '🥠', category: 'dessert', effects: { hunger: -2, happiness: 12, health: -2 }, price: 8 },
  { id: 'shaved_ice', nameKey: 'food.items.shaved_ice', icon: '🍧', category: 'dessert', effects: { hunger: -2, happiness: 15, health: -2 }, price: 9 },
  { id: 'soft_ice_cream', nameKey: 'food.items.soft_ice_cream', icon: '🍦', category: 'dessert', effects: { hunger: -3, happiness: 18, health: -2 }, price: 10 },
  { id: 'chocolate_bar', nameKey: 'food.items.chocolate_bar', icon: '🍫', category: 'dessert', effects: { hunger: -3, happiness: 20, health: -3 }, price: 11 },
  { id: 'ice_cream', nameKey: 'food.items.ice_cream', icon: '🍨', category: 'dessert', effects: { hunger: -3, happiness: 24, health: -3 }, price: 12 },
  { id: 'honey_pot', nameKey: 'food.items.honey_pot', icon: '🍯', category: 'dessert', effects: { hunger: -3, happiness: 24, health: -3 }, price: 12 },
  { id: 'popcorn', nameKey: 'food.items.popcorn', icon: '🍿', category: 'dessert', effects: { hunger: -3, happiness: 24, health: -3 }, price: 12 },
  { id: 'doughnut', nameKey: 'food.items.doughnut', icon: '🍩', category: 'dessert', effects: { hunger: -4, happiness: 28, health: -4 }, price: 16 }, // Table 14 or 16? Kept 16 from previous
  { id: 'moon_cake', nameKey: 'food.items.moon_cake', icon: '🥮', category: 'dessert', effects: { hunger: -4, happiness: 28, health: -4 }, price: 15 },
  { id: 'custard', nameKey: 'food.items.custard', icon: '🍮', category: 'dessert', effects: { hunger: -4, happiness: 30, health: -4 }, price: 16 },
  { id: 'cupcake', nameKey: 'food.items.cupcake', icon: '🧁', category: 'dessert', effects: { hunger: -5, happiness: 36, health: -5 }, price: 18 },
  { id: 'pie', nameKey: 'food.items.pie', icon: '🥧', category: 'dessert', effects: { hunger: -5, happiness: 45, health: -5 }, price: 22 },
  { id: 'shortcake', nameKey: 'food.items.shortcake', icon: '🍰', category: 'dessert', effects: { hunger: -6, happiness: 55, health: -6 }, price: 27 },
  { id: 'birthday_cake', nameKey: 'food.items.birthday_cake', icon: '🎂', category: 'dessert', effects: { hunger: -8, happiness: 80, health: -8 }, price: 40 },
];
