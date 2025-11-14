/**
 * 캐릭터 진화 트리 메타데이터
 * 각 캐릭터의 진화 단계와 진화 관계를 정의합니다.
 */

export interface EvolutionNode {
  stage: 1 | 2 | 3 | 4 | 5;
  evolvesFrom?: string;
  evolvesTo?: string[];
  displayName: string;
  color: string;
}

export const EVOLUTION_TREE: Record<string, EvolutionNode> = {
  // Stage 1 - Base Characters
  yellowJello: {
    stage: 1,
    evolvesTo: ['yellowPearJello'],
    displayName: 'Yellow Jello',
    color: 'yellow',
  },
  redJello: {
    stage: 1,
    evolvesTo: ['redDevilJello'],
    displayName: 'Red Jello',
    color: 'red',
  },
  limeJello: {
    stage: 1,
    evolvesTo: ['limeLeafJello'],
    displayName: 'Lime Jello',
    color: 'lime',
  },
  mintJello: {
    stage: 1,
    evolvesTo: ['mintSproutJello'],
    displayName: 'Mint Jello',
    color: 'mint',
  },
  blueJello: {
    stage: 1,
    evolvesTo: ['blueCatJello'],
    displayName: 'Blue Jello',
    color: 'blue',
  },
  creamJello: {
    stage: 1,
    evolvesTo: ['creamRamJello'],
    displayName: 'Cream Jello',
    color: 'cream',
  },
  purpleJello: {
    stage: 1,
    evolvesTo: ['purpleImpJello'],
    displayName: 'Purple Jello',
    color: 'purple',
  },
  skyJello: {
    stage: 1,
    evolvesTo: ['skyLynxJello'],
    displayName: 'Sky Jello',
    color: 'sky',
  },
  brownJello: {
    stage: 1,
    evolvesTo: ['brownWillowJello'],
    displayName: 'Brown Jello',
    color: 'brown',
  },
  orangeJello: {
    stage: 1,
    evolvesTo: ['orangeTailJello'],
    displayName: 'Orange Jello',
    color: 'orange',
  },
  oliveJello: {
    stage: 1,
    evolvesTo: ['oliveBloomJello'],
    displayName: 'Olive Jello',
    color: 'olive',
  },
  cyanJello: {
    stage: 1,
    evolvesTo: ['cyanGhostJello'],
    displayName: 'Cyan Jello',
    color: 'cyan',
  },

  // Stage 2 - Evolved Characters
  yellowPearJello: {
    stage: 2,
    evolvesFrom: 'yellowJello',
    evolvesTo: [], // Stage 3으로 진화할 캐릭터를 여기에 추가
    displayName: 'Yellow Pear Jello',
    color: 'yellow',
  },
  redDevilJello: {
    stage: 2,
    evolvesFrom: 'redJello',
    evolvesTo: [],
    displayName: 'Red Devil Jello',
    color: 'red',
  },
  limeLeafJello: {
    stage: 2,
    evolvesFrom: 'limeJello',
    evolvesTo: [],
    displayName: 'Lime Leaf Jello',
    color: 'lime',
  },
  mintSproutJello: {
    stage: 2,
    evolvesFrom: 'mintJello',
    evolvesTo: [],
    displayName: 'Mint Sprout Jello',
    color: 'mint',
  },
  blueCatJello: {
    stage: 2,
    evolvesFrom: 'blueJello',
    evolvesTo: [],
    displayName: 'Blue Cat Jello',
    color: 'blue',
  },
  creamRamJello: {
    stage: 2,
    evolvesFrom: 'creamJello',
    evolvesTo: [],
    displayName: 'Cream Ram Jello',
    color: 'cream',
  },
  purpleImpJello: {
    stage: 2,
    evolvesFrom: 'purpleJello',
    evolvesTo: [],
    displayName: 'Purple Imp Jello',
    color: 'purple',
  },
  skyLynxJello: {
    stage: 2,
    evolvesFrom: 'skyJello',
    evolvesTo: [],
    displayName: 'Sky Lynx Jello',
    color: 'sky',
  },
  brownWillowJello: {
    stage: 2,
    evolvesFrom: 'brownJello',
    evolvesTo: [],
    displayName: 'Brown Willow Jello',
    color: 'brown',
  },
  orangeTailJello: {
    stage: 2,
    evolvesFrom: 'orangeJello',
    evolvesTo: [],
    displayName: 'Orange Tail Jello',
    color: 'orange',
  },
  oliveBloomJello: {
    stage: 2,
    evolvesFrom: 'oliveJello',
    evolvesTo: [],
    displayName: 'Olive Bloom Jello',
    color: 'olive',
  },
  cyanGhostJello: {
    stage: 2,
    evolvesFrom: 'cyanJello',
    evolvesTo: [],
    displayName: 'Cyan Ghost Jello',
    color: 'cyan',
  },
} as const;

/**
 * 특정 캐릭터의 진화 경로를 가져옵니다.
 * @param characterId - 캐릭터 ID
 * @returns 진화 경로 배열 (stage 1부터 현재 캐릭터까지)
 */
export function getEvolutionPath(characterId: string): string[] {
  const path: string[] = [];
  let current: string | undefined = characterId;

  while (current) {
    path.unshift(current);
    current = EVOLUTION_TREE[current]?.evolvesFrom;
  }

  return path;
}

/**
 * 특정 stage의 모든 캐릭터를 가져옵니다.
 * @param stage - 진화 단계 (1-5)
 * @returns 해당 stage의 캐릭터 ID 배열
 */
export function getCharactersByStage(stage: 1 | 2 | 3 | 4 | 5): string[] {
  return Object.entries(EVOLUTION_TREE)
    .filter(([_, node]) => node.stage === stage)
    .map(([id, _]) => id);
}

/**
 * 특정 캐릭터가 진화 가능한지 확인합니다.
 * @param characterId - 캐릭터 ID
 * @returns 진화 가능 여부
 */
export function canEvolve(characterId: string): boolean {
  const node = EVOLUTION_TREE[characterId];
  return node ? (node.evolvesTo?.length ?? 0) > 0 : false;
}

/**
 * 특정 color의 모든 캐릭터를 가져옵니다.
 * @param color - 캐릭터 색상
 * @returns 해당 색상의 모든 진화 단계 캐릭터 ID 배열
 */
export function getCharactersByColor(color: string): string[] {
  return Object.entries(EVOLUTION_TREE)
    .filter(([_, node]) => node.color === color)
    .map(([id, _]) => id);
}
