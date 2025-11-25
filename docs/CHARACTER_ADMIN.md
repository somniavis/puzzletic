# 캐릭터 관리자 페이지 가이드

> **버전**: 2.0
> **최종 업데이트**: 2025-11-25
> **작성자**: Gemini

## 1. 개요

캐릭터 관리자 페이지는 게임에 존재하는 모든 캐릭터 종(Species)을 진화 단계별로 확인하고 관리할 수 있는 갤러리 형태의 도구입니다. 개발 및 기획 단계에서 캐릭터의 시각적 모습과 진화 정보를 한눈에 파악하는 데 사용됩니다.

- **접근 경로**: `/` (현재 `App.tsx`에서 바로 렌더링)
- **핵심 파일**: `src/pages/CharacterAdmin.tsx`
- **데이터 소스**: `src/data/species.ts`

## 2. 주요 기능

### 단계별 캐릭터 갤러리
- **단계 선택**: 상단의 버튼을 통해 1, 2, 3단계 캐릭터를 필터링하여 볼 수 있습니다.
- **캐릭터 카드**: 각 캐릭터는 개별 카드로 표시되며, 다음 정보를 포함합니다.
  - 캐릭터 이미지 (현재 외부 URL 사용)
  - 진화 단계에 맞는 이름
  - 진화에 필요한 레벨 및 애정도
- **선택 정보**: 카드를 클릭하면 선택된 캐릭터의 ID가 콘솔에 기록되고, 페이지 하단에 이름이 표시됩니다.

> **참고**: 현재 데이터(`species.ts`)는 5단계 진화까지 정의되어 있으나, 관리자 페이지 UI에는 3단계까지의 필터링 버튼만 구현되어 있습니다.

## 3. 파일 구조

```
src/
├── pages/
│   └── CharacterAdmin.tsx       # 관리자 페이지 메인 컴포넌트
│   └── CharacterAdmin.css       # 관리자 페이지 스타일
├── components/
│   └── CharacterGallery/
│       ├── CharacterGallery.tsx # 캐릭터 목록을 렌더링하는 컴포넌트
│       └── CharacterGallery.css # 갤러리 스타일
├── data/
│   └── species.ts               # 모든 캐릭터 종과 진화 데이터의 원본 소스
└── types/
    └── character.ts             # CharacterSpecies 등 관련 타입 정의
```

## 4. 데이터 구조 (`species.ts`)

모든 캐릭터의 정보는 `src/data/species.ts`의 `CHARACTER_SPECIES` 객체에 정의되어 있습니다. 각 캐릭터 종은 고유한 ID를 키로 가지며, 내부에 상세 설명과 5단계에 걸친 진화 정보를 포함합니다.

### 데이터 예시: `yellowJello`
```typescript
// src/data/species.ts

export const CHARACTER_SPECIES: Record<string, CharacterSpecies> = {
  yellowJello: {
    id: 'yellowJello',
    name: 'Yellow Jello',
    description: 'A sweet and adorable jello with a sunny glow.',
    personality: 'affectionate',
    evolutions: [
      {
        stage: 1,
        name: 'Yellow Jello',
        requiredLevel: 1,
        requiredAffection: 0,
        description: 'A tiny yellow jello, soft and squishy.',
      },
      {
        stage: 2,
        name: 'Yellow Pear Jello',
        requiredLevel: 10,
        requiredAffection: 50,
        description: 'A pear-shaped yellow jello with evolved features.',
      },
      {
        stage: 3,
        name: 'Sunlight Jello',
        requiredLevel: 25,
        requiredAffection: 80,
        description: 'A radiant yellow jello that glows brilliantly.',
      },
      {
        stage: 4,
        name: 'Golden Star Jello',
        requiredLevel: 40,
        requiredAffection: 90,
        description: 'A star-shaped golden jello shining like the sun.',
      },
      {
        stage: 5,
        name: 'Solar King Jello',
        requiredLevel: 60,
        requiredAffection: 100,
        description: 'The ultimate yellow jello, radiating immense solar power.',
      },
    ],
  },
  // ... 다른 캐릭터 종들
};
```

## 5. 새 캐릭터 추가 방법

새로운 캐릭터를 관리자 페이지에 표시하려면 다음 두 파일을 수정해야 합니다.

### 1단계: 캐릭터 컴포넌트 생성 및 등록
1.  `src/components/characters/base` 또는 `evolved` 폴더에 새 캐릭터의 컴포넌트(`NewCharacter.tsx`)를 생성합니다. (자세한 내용은 `PIXEL_ART.md` 참조)
2.  `src/components/characters/index.ts` 파일에 새로 만든 컴포넌트를 추가하여 시스템에 등록합니다.

    ```typescript
    // src/components/characters/index.ts
    // ...
    import NewCharacter from './base/NewCharacter/NewCharacter';

    export const CHARACTERS = {
      // ...
      newCharacter: NewCharacter, // 'newCharacter'는 species.ts의 ID와 일치해야 함
    } as const;
    ```

### 2단계: `species.ts`에 데이터 추가
`src/data/species.ts` 파일의 `CHARACTER_SPECIES` 객체에 새로운 캐릭터의 ID를 키로 하여 종 정보를 추가합니다. 위 `yellowJello` 예시와 동일한 구조를 따라야 합니다.

```typescript
// src/data/species.ts
export const CHARACTER_SPECIES: Record<string, CharacterSpecies> = {
  // ... 기존 캐릭터들
  newCharacter: {
    id: 'newCharacter',
    name: 'New Character',
    description: 'A brand new character.',
    personality: 'brave',
    evolutions: [
      {
        stage: 1,
        name: 'New Character',
        requiredLevel: 1,
        // ... 5단계까지의 진화 정보
      },
      // ...
    ],
  },
};
```

위 두 단계가 완료되면, 캐릭터 관리자 페이지의 갤러리에 새 캐릭터가 자동으로 나타납니다.