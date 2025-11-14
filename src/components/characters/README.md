# Characters Folder Structure

캐릭터 컴포넌트의 폴더 구조는 진화 단계별로 구성되어 있습니다.

## 폴더 구조

```
characters/
├── base/                    # Stage 1 - 기본 캐릭터들
│   ├── YellowJello/
│   ├── RedJello/
│   ├── LimeJello/
│   ├── MintJello/
│   ├── BlueJello/
│   ├── CreamJello/
│   ├── PurpleJello/
│   ├── SkyJello/
│   ├── BrownJello/
│   ├── OrangeJello/
│   ├── OliveJello/
│   ├── CyanJello/
│   └── index.ts            # Base 캐릭터 export
│
├── evolved/                 # Stage 2+ - 진화한 캐릭터들
│   ├── stage2/
│   │   ├── YellowPearJello/
│   │   ├── RedDevilJello/
│   │   ├── LimeLeafJello/
│   │   ├── MintSproutJello/
│   │   ├── BlueCatJello/
│   │   ├── CreamRamJello/
│   │   ├── PurpleImpJello/
│   │   ├── SkyLynxJello/
│   │   ├── BrownWillowJello/
│   │   ├── OrangeTailJello/
│   │   ├── OliveBloomJello/
│   │   ├── CyanGhostJello/
│   │   └── index.ts        # Stage 2 캐릭터 export
│   ├── stage3/             # Stage 3 캐릭터 (추후 추가)
│   ├── stage4/             # Stage 4 캐릭터 (추후 추가)
│   ├── stage5/             # Stage 5 캐릭터 (추후 추가)
│   └── index.ts            # 모든 진화 캐릭터 export
│
├── metadata/                # 캐릭터 메타데이터
│   ├── evolutionTree.ts    # 진화 관계 데이터 및 유틸리티
│   └── index.ts
│
├── index.ts                 # 메인 export 파일
└── README.md               # 이 파일
```

## 사용 방법

### 1. 개별 캐릭터 Import

```typescript
// 기본 방법 (권장)
import { YellowJello, RedDevilJello } from '@/components/characters';

// 특정 단계에서만 import
import { YellowJello } from '@/components/characters/base';
import { RedDevilJello } from '@/components/characters/evolved/stage2';
```

### 2. CHARACTERS 객체 사용

```typescript
import { CHARACTERS } from '@/components/characters';

const MyCharacter = CHARACTERS.yellowJello;
```

### 3. 진화 메타데이터 활용

```typescript
import {
  EVOLUTION_TREE,
  getEvolutionPath,
  getCharactersByStage,
  canEvolve
} from '@/components/characters';

// 특정 캐릭터의 진화 경로 확인
const path = getEvolutionPath('redDevilJello');
// 결과: ['redJello', 'redDevilJello']

// Stage 2의 모든 캐릭터 가져오기
const stage2Characters = getCharactersByStage(2);

// 진화 가능 여부 확인
const canYellowEvolve = canEvolve('yellowJello'); // true
```

## 새로운 캐릭터 추가하기

### Stage 1 (Base) 캐릭터 추가

1. `base/` 폴더에 새 캐릭터 폴더 생성
2. 캐릭터 컴포넌트 파일 작성
3. `base/index.ts`에 export 추가
4. `metadata/evolutionTree.ts`에 메타데이터 추가

### Stage 2+ 진화 캐릭터 추가

1. 해당 stage 폴더에 새 캐릭터 폴더 생성
2. 캐릭터 컴포넌트 파일 작성
3. 해당 stage의 `index.ts`에 export 추가
4. `evolved/index.ts`에서 해당 stage export (필요시)
5. `metadata/evolutionTree.ts`에 진화 관계 추가

예시:
```typescript
// metadata/evolutionTree.ts에 추가
yellowJello: {
  stage: 1,
  evolvesTo: ['yellowPearJello'], // 진화할 캐릭터 ID 추가
  displayName: 'Yellow Jello',
  color: 'yellow',
},
yellowPearJello: {
  stage: 2,
  evolvesFrom: 'yellowJello',      // 이전 단계 캐릭터 ID
  evolvesTo: ['yellowStage3Name'], // 다음 진화 단계
  displayName: 'Yellow Pear Jello',
  color: 'yellow',
},
```

## 장점

1. **확장성**: 5단계까지 진화를 명확하게 관리 가능
2. **가독성**: 진화 단계별로 폴더가 구분되어 파일 탐색 용이
3. **메타데이터 관리**: evolutionTree를 통한 진화 관계 추적
4. **코드 스플리팅**: 단계별로 청크 분리 가능
5. **유지보수**: 각 단계별 독립적인 index.ts로 관리 용이

## 주의사항

- 캐릭터 파일 내부의 import 경로는 폴더 depth에 따라 다릅니다
  - base: `../../../../types/character`
  - evolved/stage2: `../../../../../types/character`
- 새 캐릭터 추가 시 반드시 evolutionTree.ts 업데이트
- 빌드 후 TypeScript 에러 확인 필수
