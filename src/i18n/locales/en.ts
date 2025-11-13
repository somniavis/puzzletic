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
    species: {
      yellowJello: 'Yellow Jello',
      redJello: 'Red Jello',
      limeJello: 'Lime Jello',
      mintJello: 'Mint Jello',
      blueJello: 'Blue Jello',
      creamJello: 'Cream Jello',
      purpleJello: 'Purple Jello',
      skyJello: 'Sky Jello',
      brownJello: 'Brown Jello',
      orangeJello: 'Orange Jello',
      oliveJello: 'Olive Jello',
      cyanJello: 'Cyan Jello',
    },
    evolutions: {
      // Yellow Jello
      'Yellow Jello': 'Yellow Jello',
      'Golden Jello': 'Golden Jello',
      'Sunlight Jello': 'Sunlight Jello',
      // Red Jello
      'Red Jello': 'Red Jello',
      'Ruby Jello': 'Ruby Jello',
      'Crimson Jello': 'Crimson Jello',
      // Lime Jello
      'Lime Jello': 'Lime Jello',
      'Emerald Jello': 'Emerald Jello',
      'Jade Jello': 'Jade Jello',
      // Mint Jello
      'Mint Jello': 'Mint Jello',
      'Glacier Jello': 'Glacier Jello',
      'Arctic Jello': 'Arctic Jello',
      // Blue Jello
      'Blue Jello': 'Blue Jello',
      'Sapphire Jello': 'Sapphire Jello',
      'Ocean Jello': 'Ocean Jello',
      // Cream Jello
      'Cream Jello': 'Cream Jello',
      'Ivory Jello': 'Ivory Jello',
      'Pearl Jello': 'Pearl Jello',
      // Purple Jello
      'Purple Jello': 'Purple Jello',
      'Amethyst Jello': 'Amethyst Jello',
      'Royal Jello': 'Royal Jello',
      // Sky Jello
      'Sky Jello': 'Sky Jello',
      'Azure Jello': 'Azure Jello',
      'Heaven Jello': 'Heaven Jello',
      // Brown Jello
      'Brown Jello': 'Brown Jello',
      'Cocoa Jello': 'Cocoa Jello',
      'Chocolate Jello': 'Chocolate Jello',
      // Orange Jello
      'Orange Jello': 'Orange Jello',
      'Tangerine Jello': 'Tangerine Jello',
      'Sunset Jello': 'Sunset Jello',
      // Olive Jello
      'Olive Jello': 'Olive Jello',
      'Moss Jello': 'Moss Jello',
      'Forest Jello': 'Forest Jello',
      // Cyan Jello
      'Cyan Jello': 'Cyan Jello',
      'Aqua Jello': 'Aqua Jello',
      'Crystal Jello': 'Crystal Jello',
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
