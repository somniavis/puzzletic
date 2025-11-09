# 캐릭터 관리 Admin 가이드

## 개요

캐릭터 관리 Admin은 게임 내 모든 캐릭터를 단계별로 관리하고 확인할 수 있는 갤러리 형태의 관리 페이지입니다.

**접근 경로**: 메인 페이지 우측 상단 "Character Gallery" 버튼

---

## 주요 기능

### 1. 진화 단계별 캐릭터 보기

현재 3단계 진화 시스템 지원 (향후 확장 가능):

#### Stage 1: 초보 단계 🥚
- **특징**: 게임 시작 시 선택 가능한 캐릭터
- **진화 조건**: 없음 (기본 상태)
- **표시 정보**:
  - 캐릭터 이름 (Stage 1 버전)
  - 캐릭터 설명
  - "Stage 1" 배지

#### Stage 2: 중급 단계 ⚔️
- **특징**: 육성을 통해 진화한 캐릭터
- **진화 조건**:
  - 레벨 요구사항 (예: 레벨 10+)
  - 애정도 요구사항 (예: 애정도 50+)
- **표시 정보**:
  - 진화된 이름
  - 레벨 요구사항 배지
  - 애정도 요구사항 배지

#### Stage 3: 마스터 단계 👑
- **특징**: 최종 진화 형태
- **진화 조건**:
  - 높은 레벨 요구사항 (예: 레벨 25+)
  - 높은 애정도 요구사항 (예: 애정도 80+)
- **표시 정보**:
  - 최종 진화 이름
  - 레벨 요구사항 배지
  - 애정도 요구사항 배지

### 2. 캐릭터 갤러리

#### 레이아웃
- **그리드 형태**: 반응형 카드 레이아웃
- **카드 크기**: 자동 조정 (최소 280px)
- **카드당 정보**:
  - 캐릭터 미리보기 (애니메이션)
  - 캐릭터 이름
  - 설명
  - 진화 요구사항 배지

#### 상호작용
- **호버 효과**: 카드 위로 올리면 상승 효과
- **클릭**: 캐릭터 선택 (콘솔에 로그)
- **선택 표시**: 하단에 선택된 캐릭터 이름 표시

### 3. 단계 선택기

3개의 큰 버튼으로 단계 전환:
- **아이콘 표시**: 각 단계별 이모지
- **라벨**: Stage 1/2/3
- **서브라벨**: Beginner/Advanced/Master
- **활성 상태**: 선택된 단계는 그라데이션 배경

---

## 파일 구조

```
src/
├── pages/
│   ├── CharacterAdmin.tsx       # Admin 메인 페이지
│   └── CharacterAdmin.css       # Admin 스타일
├── components/
│   └── CharacterGallery/
│       ├── CharacterGallery.tsx # 갤러리 컴포넌트
│       └── CharacterGallery.css # 갤러리 스타일
├── data/
│   └── species.ts               # 캐릭터 종 데이터 정의
└── types/
    └── character.ts             # 타입 정의
```

---

## 코드 구조

### CharacterAdmin 컴포넌트

**위치**: `src/pages/CharacterAdmin.tsx`

**주요 State**:
```typescript
const [selectedStage, setSelectedStage] = useState<EvolutionStage>(1);
const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
```

**주요 함수**:
- `handleStageChange(stage)`: 진화 단계 변경
- `handleSpeciesSelect(speciesId)`: 캐릭터 선택

**렌더링 구조**:
1. 헤더 (제목 + 설명)
2. 단계 선택기 (3개 버튼)
3. 갤러리 컨테이너
   - 단계 설명
   - CharacterGallery 컴포넌트
4. 선택 정보 (하단)

### CharacterGallery 컴포넌트

**위치**: `src/components/CharacterGallery/CharacterGallery.tsx`

**Props**:
```typescript
interface CharacterGalleryProps {
  species: CharacterSpecies[];      // 표시할 캐릭터 종 목록
  selectedStage?: EvolutionStage;   // 현재 선택된 단계
  onSelect?: (speciesId: string) => void; // 선택 콜백
}
```

**주요 기능**:
- 각 캐릭터 종에 대해 카드 렌더링
- 선택된 단계에 맞는 진화 정보 표시
- 캐릭터 컴포넌트 동적 로딩
- Coming Soon 플레이스홀더 표시 (미구현 캐릭터)

---

## 데이터 구조

### 캐릭터 종 정의

**위치**: `src/data/species.ts`

```typescript
export const CHARACTER_SPECIES: Record<string, CharacterSpecies> = {
  blueHero: {
    id: 'blueHero',
    name: 'Blue Hero',
    description: 'A brave warrior with blue hair and a golden crown',
    evolutions: [
      {
        stage: 1,
        name: 'Blue Novice',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'The beginning of a hero\'s journey',
      },
      {
        stage: 2,
        name: 'Blue Knight',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A skilled warrior ready for battle',
      },
      {
        stage: 3,
        name: 'Blue Champion',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A legendary hero of unmatched power',
      },
    ],
  },
  // 추가 캐릭터 종...
};
```

### 헬퍼 함수

```typescript
// 특정 단계의 진화 이름 가져오기
getEvolutionName(speciesId: string, stage: EvolutionStage): string

// Stage 1 캐릭터 목록 가져오기
getStage1Species(): string[]

// 진화 가능 여부 확인
canEvolve(level: number, affection: number, currentStage: EvolutionStage, speciesId: string): boolean
```

---

## 새 캐릭터 종 추가 방법

### 1. 픽셀 아트 데이터 생성

**파일**: `src/components/characters/[CharacterName]/[CharacterName]PixelData.ts`

```typescript
import type { PixelColor } from '../../PixelArt/PixelRenderer';

const COLORS = {
  // 색상 팔레트 정의
};

// 최소 3개의 스프라이트 필요 (24×24 표준)
export const characterNameIdle: PixelColor[][] = [ /* 24x24 배열 */ ];
export const characterNameHappy: PixelColor[][] = [ /* 24x24 배열 */ ];
export const characterNameSleeping: PixelColor[][] = [ /* 24x24 배열 */ ];
```

### 2. 캐릭터 컴포넌트 생성

**파일**: `src/components/characters/[CharacterName]/[CharacterName].tsx`

```typescript
import React from 'react';
import type { Character, CharacterMood, CharacterAction } from '../../../types/character';
import { PixelRenderer } from '../../PixelArt/PixelRenderer';
import { characterNameIdle, characterNameHappy, characterNameSleeping } from './[CharacterName]PixelData';
import './[CharacterName].css';

interface CharacterNameProps {
  character: Character;
  size?: 'small' | 'medium' | 'large';
  mood?: CharacterMood;
  action?: CharacterAction;
  onClick?: () => void;
}

export const CharacterName: React.FC<CharacterNameProps> = ({
  character,
  size = 'medium',
  mood = 'neutral',
  action = 'idle',
  onClick,
}) => {
  const getPixelSize = () => {
    switch (size) {
      case 'small': return 4;
      case 'large': return 12;
      default: return 8;
    }
  };

  const getPixelData = () => {
    if (mood === 'happy') return characterNameHappy;
    if (mood === 'sleeping') return characterNameSleeping;
    return characterNameIdle;
  };

  return (
    <div className={`character-name character-name--${action}`}>
      <PixelRenderer
        pixels={getPixelData()}
        pixelSize={getPixelSize()}
        onClick={onClick}
      />
    </div>
  );
};

export default CharacterName;
```

### 3. CSS 애니메이션 추가

**파일**: `src/components/characters/[CharacterName]/[CharacterName].css`

```css
.character-name {
  position: relative;
  display: inline-block;
  cursor: pointer;
  user-select: none;
}

/* 애니메이션 정의 */
@keyframes idle-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 액션 상태별 애니메이션 */
.character-name--idle {
  animation: idle-bounce 2s ease-in-out infinite;
}

/* 호버 효과 */
.character-name:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}
```

### 4. 캐릭터 레지스트리에 등록

**파일**: `src/components/characters/index.ts`

```typescript
import { BlueHero } from './BlueHero/BlueHero';
import { CharacterName } from './[CharacterName]/[CharacterName]';

export const CHARACTERS = {
  blueHero: BlueHero,
  characterName: CharacterName, // 추가
} as const;

export type CharacterType = keyof typeof CHARACTERS;

export { BlueHero, CharacterName };
```

### 5. 종 데이터 정의

**파일**: `src/data/species.ts`

```typescript
export const CHARACTER_SPECIES: Record<string, CharacterSpecies> = {
  // 기존 캐릭터...

  characterName: {
    id: 'characterName',
    name: 'Character Display Name',
    description: 'Character description',
    evolutions: [
      {
        stage: 1,
        name: 'Stage 1 Name',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'Stage 1 description',
      },
      {
        stage: 2,
        name: 'Stage 2 Name',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'Stage 2 description',
      },
      {
        stage: 3,
        name: 'Stage 3 Name',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'Stage 3 description',
      },
    ],
  },
};
```

---

## 스타일 가이드

### 색상 팔레트
- **Primary**: #667eea (보라-파랑 그라데이션)
- **Secondary**: #764ba2 (보라)
- **배경**: 흰색 / 연한 회색
- **텍스트**: #666 (중간 회색), #2D2D2D (검정)
- **강조**: 그라데이션 배경

### 간격
- **카드 간격**: 2rem
- **섹션 간격**: 3rem
- **패딩**: 1.5rem ~ 2rem

### 반응형
- **최소 카드 너비**: 280px
- **최대 컨테이너 너비**: 1400px
- **모바일 브레이크포인트**: 768px

---

## 테스트 체크리스트

### 기능 테스트
- [ ] Stage 1/2/3 버튼 클릭 시 캐릭터 목록 변경
- [ ] 각 단계별 올바른 진화 정보 표시
- [ ] 캐릭터 카드 클릭 시 선택 정보 업데이트
- [ ] 캐릭터 애니메이션 정상 작동
- [ ] Coming Soon 플레이스홀더 표시 (미구현 캐릭터)

### UI/UX 테스트
- [ ] 카드 호버 효과 작동
- [ ] 반응형 레이아웃 (모바일, 태블릿, 데스크톱)
- [ ] 스크롤 동작 정상
- [ ] 폰트 및 색상 일관성
- [ ] 버튼 활성/비활성 상태 구분

### 성능 테스트
- [ ] 캐릭터 다수(10개+) 로딩 시 성능
- [ ] 애니메이션 부드러움
- [ ] 단계 전환 시 지연 없음

---

## 향후 개선 계획

### 단기
- [ ] 캐릭터 상세 모달 (클릭 시)
- [ ] 검색 및 필터 기능
- [ ] 정렬 옵션 (이름, 레벨 요구사항)

### 중기
- [ ] 캐릭터 비교 기능
- [ ] 즐겨찾기 시스템
- [ ] 진화 시뮬레이터

### 장기
- [ ] 캐릭터 프리뷰 확대 기능
- [ ] 3D 뷰어 (향후 3D 모델 지원 시)
- [ ] 캐릭터 스킨 시스템

---

## 문제 해결

### 캐릭터가 표시되지 않음
1. `CHARACTERS` 레지스트리에 등록 확인
2. 픽셀 데이터 export 확인
3. 컴포넌트 import 경로 확인

### 진화 정보가 잘못 표시됨
1. `species.ts`의 단계 번호 확인 (1, 2, 3)
2. `requiredLevel`, `requiredAffection` 값 확인

### 애니메이션이 작동하지 않음
1. CSS 파일 import 확인
2. 클래스명 매칭 확인 (`character-name--idle` 등)

---

---

## 변경 이력

### v1.1 (2025-11-09)
- 32×32 픽셀 표준 반영
- 픽셀 데이터 예시 업데이트

### v1.0 (2025-11-09)
- 초기 문서 작성

---

**문서 버전**: 1.1
**최종 업데이트**: 2025-11-09
**작성자**: Claude Code Assistant
