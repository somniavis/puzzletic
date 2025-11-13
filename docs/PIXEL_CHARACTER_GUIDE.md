# 픽셀아트 캐릭터 생성 가이드

이 문서는 Puzzleletic 프로젝트에 새로운 픽셀아트 캐릭터를 추가하는 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [AI 툴 사용 규칙](#ai-툴-사용-규칙)
3. [기술 사양](#기술-사양)
4. [코드 형식](#코드-형식)
5. [제출 방법](#제출-방법)
6. [예시](#예시)

---

## 개요

토큰 소모를 최소화하기 위해, 외부 AI 툴에서 픽셀아트를 생성하고 코드를 추출한 후, Claude Code가 프로젝트에 자동으로 추가하는 방식을 사용합니다.

**작업 흐름:**
1. 사용자가 외부 AI 툴에서 픽셀아트 캐릭터 생성
2. TypeScript 형식의 코드 추출
3. Claude Code에게 코드 전달
4. 자동으로 프로젝트에 통합

---

## AI 툴 사용 규칙

### 기본 요청 템플릿

외부 AI 툴(ChatGPT, Claude 등)에게 다음과 같이 요청하세요:

```
24x24 픽셀 크기의 [캐릭터명] 캐릭터를 생성해줘.
[캐릭터 설명 및 디자인 요구사항]

필요한 상태:
- idle: 기본 대기 상태
- happy: 행복한 표정
- sleeping: 수면 상태 (눈 감음)

TypeScript 형식으로 출력해줘:
- COLORS 객체에 색상 정의 (5-10가지)
- 각 색상의 단축 변수 (예: _ = transparent, O = outline)
- 상태별 24x24 2차원 배열
  - characterIdle
  - characterHappy
  - characterSleeping
- transparent는 null로 표현
```

### 선택적 추가 상태

필요시 다음 상태도 요청할 수 있습니다:
- `sad` - 슬픈 표정
- `excited` - 흥분한 상태
- `sick` - 아픈 상태
- `eating` - 먹는 동작
- `playing` - 놀고 있는 상태
- `jumping` - 점프 동작

---

## 기술 사양

### 필수 구조

| 항목 | 사양 |
|------|------|
| 캔버스 크기 | 24x24 픽셀 (고정) |
| 파일 형식 | TypeScript (.ts) |
| 타입 | `PixelColor[][]` (2차원 배열) |
| 색상 수 | 5-10가지 |
| 필수 상태 | idle, happy, sleeping (최소 3개) |

### 색상 정의 규칙

```typescript
const COLORS = {
  colorName: '#HEX_CODE',  // 최소 5개, 최대 10개
  transparent: null,        // 필수
};

// 단축 변수 정의 (필수)
const _ = COLORS.transparent;
const O = COLORS.outline;
// ... 기타 색상
```

### 배열 구조

- 정확히 24줄 (행)
- 각 줄마다 정확히 24개의 요소 (열)
- 각 요소는 색상 단축 변수

---

## 코드 형식

AI 툴에게 다음 형식으로 코드를 받으세요:

```typescript
import type { PixelColor } from '../../PixelArt/PixelRenderer';

const COLORS = {
  // 캐릭터에 맞는 색상 정의 (5-10개)
  mainColor: '#HEX_CODE',
  darkShade: '#HEX_CODE',
  lightShade: '#HEX_CODE',
  accent: '#HEX_CODE',
  outline: '#HEX_CODE',
  eye: '#HEX_CODE',
  transparent: null,
};

// 단축 변수
const _ = COLORS.transparent;
const M = COLORS.mainColor;
const D = COLORS.darkShade;
const L = COLORS.lightShade;
const A = COLORS.accent;
const O = COLORS.outline;
const E = COLORS.eye;

// 24x24 픽셀 - idle 상태
export const characterNameIdle: PixelColor[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  // ... 21줄 더 (총 24줄)
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// 24x24 픽셀 - happy 상태
export const characterNameHappy: PixelColor[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  // ... 24줄
];

// 24x24 픽셀 - sleeping 상태
export const characterNameSleeping: PixelColor[][] = [
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  // ... 24줄
];
```

---

## 제출 방법

AI 툴에게 코드를 받은 후, Claude Code에게 다음 형식으로 전달하세요:

```
캐릭터 추가 요청

ID: characterId (camelCase, 예: purpleCat, redKnight)
이름: Character Name (예: Purple Cat, Red Knight)
설명: 캐릭터에 대한 간단한 설명 (한 줄)

[여기에 AI가 생성한 전체 TypeScript 코드 붙여넣기]
```

### 필요한 정보

1. **캐릭터 ID**: camelCase 형식 (예: `redKnight`, `yellowChick`)
2. **캐릭터 이름**: 표시용 이름 (예: `Red Knight`, `Yellow Chick`)
3. **캐릭터 설명**: 한 줄 설명 (예: "용감한 붉은 기사")
4. **픽셀 데이터 코드**: 위 형식의 전체 TypeScript 코드

---

## 예시

### 1. AI 툴에게 요청하기

```
24x24 픽셀 크기의 "Purple Cat" 캐릭터를 만들어줘.
보라색 고양이 모양으로 귀엽게 디자인해줘.
고양이 귀가 있고, 큰 눈을 가진 모습으로.

필요한 상태:
- idle: 가만히 앉아있는 모습
- happy: 미소 짓는 모습
- sleeping: 눈 감고 자는 모습

TypeScript 형식으로 출력해줘:
- COLORS 객체 (보라색 계열 5-8가지 색상)
- 단축 변수 정의
- purpleCatIdle, purpleCatHappy, purpleCatSleeping 배열 (각 24x24)
- transparent는 null로 표현
```

### 2. Claude Code에게 전달하기

```
캐릭터 추가 요청

ID: purpleCat
이름: Purple Cat
설명: 보라색 털을 가진 귀여운 고양이

import type { PixelColor } from '../../PixelArt/PixelRenderer';

const COLORS = {
  darkPurple: '#6B2D8F',
  purple: '#8E44AD',
  lightPurple: '#B388EB',
  pink: '#F0A6CA',
  white: '#FFFFFF',
  black: '#2D2D2D',
  transparent: null,
};

const _ = COLORS.transparent;
const DP = COLORS.darkPurple;
const P = COLORS.purple;
const LP = COLORS.lightPurple;
const PK = COLORS.pink;
const W = COLORS.white;
const B = COLORS.black;

export const purpleCatIdle: PixelColor[][] = [
  // ... 24x24 배열
];

export const purpleCatHappy: PixelColor[][] = [
  // ... 24x24 배열
];

export const purpleCatSleeping: PixelColor[][] = [
  // ... 24x24 배열
];
```

---

## 자동 처리 내용

코드를 전달하면 Claude Code가 자동으로 다음 작업을 수행합니다:

1. ✅ `src/components/characters/[CharacterName]/[CharacterName]PixelData.ts` 생성
2. ✅ `src/components/characters/[CharacterName]/[CharacterName].tsx` 컴포넌트 생성
3. ✅ `src/components/characters/index.ts`에 export 추가
4. ✅ `src/data/species.ts`에 종(species) 정보 등록
5. ✅ 필요시 i18n 다국어 지원 추가

---

## 참고 자료

- 기존 캐릭터 예시:
  - [BlueHero](../src/components/characters/BlueHero/BlueHeroPixelData.ts)
  - [GreenSlime](../src/components/characters/GreenSlime/GreenSlimePixelData.ts)
- [캐릭터 타입 정의](../src/types/character.ts)
- [종(Species) 데이터](../src/data/species.ts)

---

## 문제 해결

### 배열 크기가 맞지 않는 경우
- 반드시 24x24 크기를 확인하세요
- 각 행마다 정확히 24개의 요소가 있어야 합니다

### 색상이 제대로 표시되지 않는 경우
- HEX 코드 형식을 확인하세요 (`#RRGGBB`)
- transparent는 반드시 `null`이어야 합니다

### import 오류가 발생하는 경우
- `import type { PixelColor }` 구문이 정확한지 확인하세요
- 파일 경로가 올바른지 확인하세요

---

**마지막 업데이트**: 2025-11-12
