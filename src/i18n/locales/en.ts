export const en = {
  character: {
    profile: {
      level: 'Lv.{{level}}',
    },
    stats: {
      hunger: 'Hunger',
      happiness: 'Happiness',
      health: 'Health',
      hygiene: 'Hygiene',
      fatigue: 'Fatigue',
      affection: 'Affection',
    },
  },
  food: {
    menu: {
      title: 'Select Food',
      close: 'Close',
    },
    categories: {
      meal: 'Meal',
      snack: 'Snack',
      drink: 'Drink',
      treat: 'Special',
    },
    items: {
      // Meals
      meat: 'Meat',
      fish: 'Fish',
      rice: 'Rice',
      steak: 'Steak',
      chicken: 'Chicken',
      bacon: 'Bacon',
      egg: 'Egg',
      bread: 'Bread',
      pasta: 'Pasta',
      salad: 'Salad',
      // Snacks
      cookie: 'Cookie',
      candy: 'Candy',
      donut: 'Donut',
      ice_cream: 'Ice Cream',
      chocolate: 'Chocolate',
      lollipop: 'Lollipop',
      popcorn: 'Popcorn',
      pretzel: 'Pretzel',
      chips: 'Chips',
      cupcake: 'Cupcake',
      // Drinks
      water: 'Water',
      juice: 'Juice',
      milk: 'Milk',
      soda: 'Soda',
      coffee: 'Coffee',
      tea: 'Tea',
      smoothie: 'Smoothie',
      hot_chocolate: 'Hot Chocolate',
      lemonade: 'Lemonade',
      bubble_tea: 'Bubble Tea',
      // Special treats
      cake: 'Cake',
      pizza: 'Pizza',
      burger: 'Burger',
      sushi: 'Sushi',
      ramen: 'Ramen',
      hot_dog: 'Hot Dog',
      taco: 'Taco',
      burrito: 'Burrito',
      ice_cream_sundae: 'Ice Cream Sundae',
      pie: 'Pie',
    },
    effects: {
      hunger: 'Hunger',
      happiness: 'Happiness',
      health: 'Health',
    },
  },
  actions: {
    feed: 'Feed',
    medicine: 'Medicine',
    play: 'Play',
    clean: 'Clean',
    settings: 'Settings',
  },
} as const;

export type TranslationKeys = typeof en;
