import type { CharacterSpeciesDetail } from '../types/character';
import type { CharacterSpeciesId } from './speciesCore';

export const CHARACTER_SPECIES_DETAILS: Record<CharacterSpeciesId, CharacterSpeciesDetail> = {
  yellowJello: {
    description: 'A sweet and adorable jello with a sunny glow.',
    tags: ['defense', 'honey_wood'],
    evolutions: [
      { requiredLevel: 1, requiredAffection: 0, description: 'A sweet-smelling jelly. It looks like a small water drop in the forest.' },
      { requiredLevel: 10, requiredAffection: 50, description: 'A small twig has grown on its head. It attracts insects with the sweet sap flowing from the branch.' },
      { requiredLevel: 25, requiredAffection: 80, description: 'Wrapped in tough vines, it has high defense. It immobilizes enemies with sticky honey from between the vines.' },
      { requiredLevel: 40, requiredAffection: 90, description: 'Flowers have bloomed on its body, and it has sprouted limbs. It travels with its best friend, a honeybee, sharing honey to restore stamina.' },
      { requiredLevel: 60, requiredAffection: 100, description: 'The Guardian Dragon of the Great Forest. It flies with leaf wings and puts enemies to sleep with "Honey Breath" from the flower on its tail.', unlockConditions: { requiredStars: 1000 } },
    ],
  },
  redJello: {
    description: 'A vibrant red jello full of energy.',
    tags: ['attack', 'fire_flame'],
    evolutions: [
      { requiredLevel: 1, requiredAffection: 0, description: 'A jelly that feels hot to the touch. When angry, its red color deepens and the surroundings get hotter.' },
      { requiredLevel: 10, requiredAffection: 50, description: 'Cute red horns have sprouted on its head. It loves pricking things with its horns, and sparks fly when it gets mad.' },
      { requiredLevel: 25, requiredAffection: 80, description: 'It flies nimbly with bat wings. It plays mischievous pranks and runs away, but becomes docile if given candy.' },
      { requiredLevel: 40, requiredAffection: 90, description: 'An unquenchable flame burns on its tail. It can breathe fire and takes the lead to protect weaker friends.' },
      { requiredLevel: 60, requiredAffection: 100, description: 'The Lord of Hell with flowing magma. It is the incarnation of an "Oath", binding itself in chains to control its overflowing destructive power.', unlockConditions: { requiredStars: 1000 } },
    ],
  },
  mintJello: {
    description: 'A cool mint jello with refreshing charm.',
    tags: ['heal', 'purification_plant'],
    evolutions: [
      { requiredLevel: 1, requiredAffection: 0, description: 'A jelly with a cool, refreshing touch. It feeds on clear dew and leaves a fresh herbal scent.' },
      { requiredLevel: 10, requiredAffection: 50, description: 'A cute sprout has appeared on its head. It loves clear water and sunlight, always looking for a sunny spot.' },
      { requiredLevel: 25, requiredAffection: 80, description: 'The sprout has grown into a beautiful flower. It flutters its leaves to purify the air and give rest to its friends.' },
      { requiredLevel: 40, requiredAffection: 90, description: 'It flies through the forest with large leaf wings. It has the ability to revive withering plants by getting close to them.' },
      { requiredLevel: 60, requiredAffection: 100, description: 'The Guardian Dragon of the Forest, clad in the vitality of nature. Its wings create "Healing Winds" that recover a wide area at once.', unlockConditions: { requiredStars: 1000 } },
    ],
  },
  blueJello: {
    description: 'A calm blue jello like the deep ocean.',
    tags: ['speed', 'flexibility_water'],
    evolutions: [
      { requiredLevel: 1, requiredAffection: 0, description: 'A jelly transparent and cool like deep seawater. It has little facial expression and adapts flexibly to situations like water.' },
      { requiredLevel: 10, requiredAffection: 50, description: 'A sleek shark fin has appeared on its head. It is very fast underwater and escapes instantly in danger.' },
      { requiredLevel: 25, requiredAffection: 80, description: 'Colorful coral decorations have appeared on its body. It can breathe underwater and has a body hard enough to withstand water pressure.' },
      { requiredLevel: 40, requiredAffection: 90, description: 'It has fin wings and shoots "Water Cannons" from its mouth. It enjoys meditating at the bottom of deep water.' },
      { requiredLevel: 60, requiredAffection: 100, description: 'The Water Dragon ruling the sea. It has transparent, glowing scales, and causes massive tsunamis when angered.', unlockConditions: { requiredStars: 1000 } },
    ],
  },
  purpleJello: {
    description: 'A royal purple jello with mystical aura.',
    tags: ['magic', 'poison_curse'],
    evolutions: [
      { requiredLevel: 1, requiredAffection: 0, description: 'A jelly that glows at night. It makes sounds like chanting unknown spells in babble.' },
      { requiredLevel: 10, requiredAffection: 50, description: 'A Will-o\'-the-wisp has appeared on its tail. It communicates with spirits using this light and illuminates dark paths.' },
      { requiredLevel: 25, requiredAffection: 80, description: 'A single horn engraved with ancient runes has sprouted on its forehead. It lures enemies with its tail light to confuse them.' },
      { requiredLevel: 40, requiredAffection: 90, description: 'It is wrapped in talisman strips to control its magic power. Its best friend, a Skull, watches its back.' },
      { requiredLevel: 60, requiredAffection: 100, description: 'An ancient Magic Dragon with its seal broken. A guide of the underworld who grants extensive curses or blessings with a flap of its wings.', unlockConditions: { requiredStars: 1000 } },
    ],
  },
  orangeJello: {
    description: 'A tangy and zestful orange jello full of vitamins.',
    tags: ['hp', 'vitality_buff'],
    evolutions: [
      { requiredLevel: 1, requiredAffection: 0, description: 'A jelly with a fresh scent like freshly squeezed juice. It loves bouncing around like a ball due to its high elasticity.' },
      { requiredLevel: 10, requiredAffection: 50, description: 'Ears like tangerine slices have appeared. When happy, soda-like bubbles rise up. It is good at rolling.' },
      { requiredLevel: 25, requiredAffection: 80, description: 'A sprout and small wings have served on its head. It photosynthesizes in sunlight to share refreshing energy with surroundings.' },
      { requiredLevel: 40, requiredAffection: 90, description: 'A "Life Tangerine" full of nutrients grows on its tail. It shares juice with exhausted allies to restore their vitality.' },
      { requiredLevel: 60, requiredAffection: 100, description: 'A Fruit Dragon with resilient vitality. Its "Citrus Breath" is refreshing enough to make enemies lose their will to fight.', unlockConditions: { requiredStars: 1000 } },
    ],
  },
  creamJello: {
    description: 'A soft and fluffy cream jello with a gentle heart.',
    tags: ['bind', 'stability_normal'],
    evolutions: [
      { requiredLevel: 1, requiredAffection: 0, description: 'A cozy jelly smelling of freshly baked bread. Laid-back personality, often found melting asleep in sunny spots.' },
      { requiredLevel: 10, requiredAffection: 50, description: 'Cat ears have risen on its head. It has sensitive hearing and jumps up from sleep at the sound of a snack bag opening.' },
      { requiredLevel: 25, requiredAffection: 80, description: 'With whiskers and a long tail, it can do a perfect "loaf" pose. It loves narrow boxes and slaps the floor with its tail if annoyed.' },
      { requiredLevel: 40, requiredAffection: 90, description: 'Too lazy to move, it maintains the "loaf" pose. The fish on its head and yarn on its tail are treasures it defends with a hiss.' },
      { requiredLevel: 60, requiredAffection: 100, description: 'An elegant Cat Dragon. The jelly paw prints on its wings lower enemies\' guard before it strikes with a powerful "Meow Punch".', unlockConditions: { requiredStars: 1000 } },
    ],
  },
  pinkJello: {
    description: 'A lovely pink jello, full of affection and sweetness.',
    tags: ['sleep', 'illusion_cottoncandy'],
    evolutions: [
      { requiredLevel: 1, requiredAffection: 0, description: 'A pink jelly smelling of strawberries. When happy, it swells up and emits a sweet scent.' },
      { requiredLevel: 10, requiredAffection: 50, description: 'Lollipop antennae have appeared on its head. It waves them to comfort depressed friends.' },
      { requiredLevel: 25, requiredAffection: 80, description: 'Star candy decorations sparkle on its body. It makes a clear, popping sound whenever it moves.' },
      { requiredLevel: 40, requiredAffection: 90, description: 'It floats around with fluffy cotton candy clouds. It hides delicious snacks inside the cotton candy.' },
      { requiredLevel: 60, requiredAffection: 100, description: 'A Fantasy Dragon with cotton candy wings. The sweet powder it scatters puts enemies into a deep, happy sleep.', unlockConditions: { requiredStars: 1000 } },
    ],
  },
};
