# 픽셀 아트 캐릭터 생성 가이드

## 개요

Puzzletic에서는 코드 기반 픽셀 아트 시스템을 사용하여 캐릭터를 구현합니다. 이 방식은 외부 이미지 파일 없이 순수 코드로 캐릭터를 정의하여 버전 관리와 수정이 용이합니다.

---

## 픽셀 아트 시스템 구조

### 렌더링 방식

**PixelRenderer 컴포넌트** ([PixelRenderer.tsx](../src/components/PixelArt/PixelRenderer.tsx))
- 2D 배열을 CSS Grid로 렌더링
- 각 픽셀은 개별 `<div>` 요소
- `image-rendering: pixelated` 속성으로 선명한 픽셀 효과

```typescript
interface PixelArtProps {
  pixels: PixelColor[][];    // 2D 색상 배열
  pixelSize?: number;        // 각 픽셀 크기 (px)
  className?: string;
  onClick?: () => void;
}
```

### 픽셀 크기 기준

**표준 그리드 크기: 24×24 픽셀**

| Size   | Pixel Size | 최종 크기 (24x24 기준) |
|--------|------------|----------------------|
| small  | 4px        | 96px × 96px          |
| medium | 8px        | 192px × 192px        |
| large  | 12px       | 288px × 288px        |

---

## 캐릭터 제작 워크플로우

### 1단계: 디자인 계획

#### 캐릭터 콘셉트 정의
- **테마**: 어떤 캐릭터인가? (전사, 마법사, 동물 등)
- **색상 팔레트**: 주요 색상 3-5개 선정
- **특징**: 시각적 특징 (머리 스타일, 옷, 액세서리)

#### 그리드 크기 결정
- **표준**: 24×24 픽셀 ⭐ (공식 표준 - 모든 캐릭터 필수)
  - 간결하고 귀여운 스타일
  - 제작 시간 단축
- **대형**: 32×32 픽셀 (선택 사항)
  - 더 많은 디테일과 복잡한 표현 가능
  - 표정 및 액세서리 세밀 표현

### 2단계: 색상 팔레트 정의

#### 색상 선택 원칙
1. **제한된 색상**: 10-15개 이내
2. **그라데이션**: 같은 색의 밝기 변화 3-4단계
3. **대비**: 충분한 명암 대비 확보
4. **일관성**: 프로젝트 전체에서 유사한 색 톤 사용

#### 예시: Blue Hero 색상 팔레트

```typescript
const COLORS = {
  // 머리카락 (파란색 그라데이션)
  darkestBlue: '#1A3840',   // 가장 어두운 부분
  darkBlue: '#2B4C5E',      // 어두운 부분
  mediumBlue: '#3D6B7D',    // 중간
  lightBlue: '#5DA5B8',     // 밝은 부분
  cyan: '#7FCDD9',          // 하이라이트
  lightCyan: '#A0E5F0',     // 가장 밝은 하이라이트

  // 피부 (살색 그라데이션)
  skin: '#F5D4B0',          // 기본 피부색
  mediumSkin: '#E8B890',    // 중간 톤
  darkSkin: '#D4A57A',      // 그림자

  // 액세서리 (주황색 왕관)
  lightOrange: '#F5B678',   // 밝은 주황
  orange: '#E89560',        // 기본 주황
  darkOrange: '#C87A48',    // 어두운 주황

  // 옷 (갈색 그라데이션)
  darkestBrown: '#3A2E24',  // 가장 어두운 갈색
  darkBrown: '#4D3A2C',     // 어두운 갈색
  mediumBrown: '#6B5445',   // 중간 갈색
  lightBrown: '#8A6F5E',    // 밝은 갈색
  lightestBrown: '#A88968', // 가장 밝은 갈색

  // 기본 색상
  white: '#FFFFFF',
  black: '#2D2D2D',
  shadow: '#C8C8C8',        // 그림자
  lightShadow: '#E0E0E0',   // 연한 그림자

  transparent: null,         // 투명 (배경)
};
```

### 3단계: 픽셀 배열 작성

#### 기본 구조

```typescript
import type { PixelColor } from '../../PixelArt/PixelRenderer';

// 색상 약어 정의
const _ = COLORS.transparent;
const W = COLORS.white;
const B = COLORS.black;
const SK = COLORS.skin;
// ... 모든 색상에 대한 약어

// 32x32 픽셀 배열
export const characterIdle: PixelColor[][] = [
  // Row 0
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  // Row 1
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  // ... 총 32행
];
```

#### 픽셀 배치 전략

**레이어별 작업 순서**:
1. **아웃라인**: 캐릭터 외곽선 먼저 그리기
2. **큰 영역**: 몸통, 머리 등 큰 영역 채우기
3. **디테일**: 얼굴, 옷 디테일 추가
4. **하이라이트/그림자**: 입체감을 위한 명암 추가
5. **액세서리**: 왕관, 장신구 등 추가

**예시: 머리 부분 (32×32 기준)**
```typescript
// 32×32 픽셀로 더 디테일한 표현 가능
// Row 4-7: 왕관 (더 정교한 그라데이션)
// Row 8-16: 머리카락 (부드러운 곡선과 하이라이트)
// Row 17-24: 얼굴 (선명한 표정, 세밀한 눈동자)
// 참고: BlueHeroPixelData.ts에서 전체 예시 확인
```

### 4단계: 필수 스프라이트 생성

각 캐릭터는 **최소 3가지 스프라이트** 필요:

#### 1. Idle (기본 대기)
```typescript
export const characterIdle: PixelColor[][] = [
  // 눈 뜬 상태, 중립적 표정
];
```

#### 2. Happy (행복)
```typescript
export const characterHappy: PixelColor[][] = [
  // 미소, 눈 반짝임 등
  // Idle 기반으로 입 부분만 수정
];
```

#### 3. Sleeping (수면)
```typescript
export const characterSleeping: PixelColor[][] = [
  // 눈 감은 상태
  // Idle 기반으로 눈 부분만 수정
];
```

### 5단계: 픽셀 데이터 최적화

#### 가독성 향상
```typescript
// 나쁜 예: 한 줄에 모든 픽셀
[_,_,_,W,W,W,_,_,_]

// 좋은 예: 보기 쉽게 간격 조정
[_, _, _, W, W, W, _, _, _]
```

#### 주석 활용
```typescript
export const characterIdle: PixelColor[][] = [
  // Row 0-1: Empty space
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],

  // Row 2-4: Crown
  [_, _, _, _, _, _, _, _, _, LO, LO, LO, LO, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, LO, OR, OR, OR, OR, LO, _, _, _, _, _, _, _, _, _],

  // Row 5-10: Hair
  // ...

  // Row 11-15: Face
  // ...

  // Row 16-21: Body
  // ...

  // Row 22-23: Shadow
  // ...
];
```

---

## 참고 이미지를 픽셀 아트로 변환하기

### 방법 1: 수동 변환 (권장)

1. **참고 이미지 분석**
   - 주요 색상 추출 (5-10개)
   - 캐릭터를 기본 도형으로 단순화

2. **그리드 오버레이**
   - 이미지에 24×24 그리드 상상하기
   - 각 영역의 중심 색상 선택

3. **픽셀별 코딩**
   - 위에서 아래로, 왼쪽에서 오른쪽으로 작업
   - 한 줄씩 색상 배열 작성

### 방법 2: 온라인 도구 활용

#### 추천 도구
1. **Piskel** (https://www.piskelapp.com/)
   - 무료 온라인 픽셀 아트 에디터
   - **32×32 캔버스 생성** (필수)
   - 색상 팔레트 커스터마이징
   - Export → 육안으로 코드 변환

2. **Aseprite** (유료)
   - 전문 픽셀 아트 소프트웨어
   - 애니메이션 지원
   - 색상 팔레트 관리
   - 32×32 템플릿 지원

### 변환 프로세스

```
참고 이미지
    ↓
Piskel로 트레이싱 (32×32 캔버스)
    ↓
색상 단순화 (10-15색)
    ↓
32×32 그리드로 Export
    ↓
수동으로 코드 변환
```

---

## 실전 예시: Blue Hero 제작 과정

### 1. 참고 이미지 분석
- **이미지**: 파란 머리, 주황 왕관, 갈색 옷을 입은 캐릭터
- **그리드**: 32×32 픽셀
- **주요 영역**: 왕관(4행), 머리카락(9행), 얼굴(8행), 몸통(8행), 다리(2행), 그림자(1행)

### 2. 색상 팔레트 생성
```typescript
const COLORS = {
  darkestBlue: '#1A3840',   // 머리카락 외곽
  darkBlue: '#2B4C5E',
  mediumBlue: '#3D6B7D',
  lightBlue: '#5DA5B8',
  cyan: '#7FCDD9',
  lightCyan: '#A0E5F0',     // 머리카락 하이라이트
  // ... (전체 팔레트)
};
```

### 3. 왕관 부분 코딩 (32×32 - 더 정교한 표현)
```typescript
// 32×32 픽셀로 왕관의 디테일을 더욱 세밀하게 표현
// - 더 부드러운 곡선
// - 3단계 이상의 그라데이션
// - 하이라이트와 그림자의 섬세한 배치
// 전체 코드는 BlueHeroPixelData.ts 참조
```

### 4. 얼굴 표정 변형 (32×32 기준)

**32×32 픽셀의 장점:**
- **눈**: 더 섬세한 눈동자 표현 (하이라이트, 그림자)
- **입**: 다양한 표정 (미소, 행복, 슬픔)
- **전체**: 자연스러운 얼굴 비율

**스프라이트 변형:**
- **Idle**: 중립적 표정, 눈 뜬 상태
- **Happy**: 미소, 눈에 반짝임 추가
- **Sleeping**: 눈 감음, 평화로운 표정

전체 32×32 픽셀 데이터는 `BlueHeroPixelData.ts` 및 `GreenSlimePixelData.ts` 파일 참조

---

## 디버깅 및 테스트

### 일반적인 문제

#### 1. 픽셀 개수 불일치
```
Error: Each row must have 32 pixels
```
**해결**: 각 행의 픽셀 개수 확인
```typescript
// 잘못된 예
[_, _, W, W, _], // 5개만

// 올바른 예 (32×32 표준)
[_, _, W, W, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _], // 32개
```

#### 2. 색상 약어 미정의
```
Error: 'BL' is not defined
```
**해결**: 색상 약어 선언 확인
```typescript
const BL = COLORS.blue; // 선언 추가
```

#### 3. 비대칭 캐릭터
**해결**: 중심선 기준으로 좌우 대칭 확인
```typescript
// 중앙 픽셀 인덱스: 15, 16 (32픽셀 기준, 0부터 시작)
[_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, C, C, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _]
//                                              ↑ ↑
//                                          중심선
```

### 시각적 검증

#### 개발 서버에서 확인
```bash
npm run dev
# http://localhost:5173/ 접속
# Character Gallery → 해당 캐릭터 확인
```

#### 체크리스트
- [ ] 캐릭터가 정상적으로 렌더링되는가?
- [ ] 색상이 의도한 대로 표시되는가?
- [ ] 좌우 대칭이 정확한가? (필요 시)
- [ ] 애니메이션이 자연스러운가?
- [ ] 다양한 크기(small/medium/large)에서 정상인가?

---

## 최적화 팁

### 1. 색상 재사용
```typescript
// 같은 색은 변수로 재사용
const hairColor = COLORS.darkBlue;
const _ = COLORS.transparent;

export const characterIdle: PixelColor[][] = [
  [_, _, hairColor, hairColor, hairColor, _, _, _, ...],
  // ...
];
```

### 2. 반복 패턴 활용
```typescript
// 대칭 패턴은 주석으로 명시
const leftEye = [W, BK, BK];
const rightEye = [W, BK, BK];

// Row 11: 눈
[_, _, _, SK, ...leftEye, SK, SK, SK, ...rightEye, SK, _, _, _],
```

### 3. 템플릿 재사용
- Idle 스프라이트를 기본으로 복사
- 필요한 부분만 수정하여 다른 스프라이트 생성

---

## 애니메이션 가이드

### CSS 애니메이션 추가

**파일**: `[CharacterName].css`

```css
/* 기본 Idle 바운스 */
@keyframes idle-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.character-name--idle {
  animation: idle-bounce 2s ease-in-out infinite;
}

/* 점프 */
@keyframes jump {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-40px);
  }
}

.character-name--jumping {
  animation: jump 0.6s ease-in-out infinite;
}

/* 흔들림 */
@keyframes wiggle {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

.character-name--happy {
  animation: wiggle 0.5s ease-in-out 3;
}
```

### 애니메이션 조합
```css
/* 점프 + 흔들림 */
.character-name--playing {
  animation:
    jump 0.8s ease-in-out infinite,
    wiggle 1s ease-in-out infinite;
}
```

---

## 고급 기법

### 1. 그라데이션 효과
```typescript
// 머리카락에 그라데이션 적용
// 어두운 색 → 밝은 색 순서로 배치
const row5 = [_, _, DB, DB, MB, LB, CY, CY, LB, MB, DB, DB, _, _];
//             어두움 ───────────────────────────→ 밝음
```

### 2. 입체감 표현
```typescript
// 왼쪽 위: 밝은 색 (광원)
// 오른쪽 아래: 어두운 색 (그림자)

// 구체 예시
[
  [_, _, _, LT, LT, MD, _, _],  // 위: 밝음
  [_, _, LT, MD, MD, DK, _, _],  // 중간
  [_, _, MD, DK, DK, DK, _, _],  // 아래: 어두움
]
```

### 3. 외곽선 (Anti-aliasing)
```typescript
// 계단 현상 완화를 위한 중간 톤 사용
[
  [_, _, BK, BK, BK, _, _],      // 검정 외곽선
  [_, BK, MD, MD, MD, BK, _],    // 중간 톤으로 부드럽게
  [BK, LT, LT, LT, LT, LT, BK],  // 내부 색
]
```

---

## 참고 자료

### 픽셀 아트 학습
- **Lospec**: 픽셀 아트 튜토리얼 및 팔레트 (https://lospec.com/)
- **PixelJoint**: 픽셀 아트 커뮤니티 (https://pixeljoint.com/)
- **Pixel Art Tutorial**: 기초부터 고급까지 (https://blog.studiominiboss.com/pixelart)

### 색상 팔레트 도구
- **Lospec Palette List**: 큐레이션된 팔레트 모음
- **Coolors**: 색상 조합 생성기 (https://coolors.co/)
- **Adobe Color**: 색상 휠 및 조화 (https://color.adobe.com/)

### 레퍼런스
- **OpenGameArt**: 무료 픽셀 아트 리소스
- **itch.io**: 픽셀 아트 게임 아트 팩
- **Kenney**: 무료 게임 에셋 (픽셀 아트 포함)

---

## 체크리스트

### 새 캐릭터 완성 전 확인사항

#### 코드
- [ ] 색상 팔레트 정의됨
- [ ] 색상 약어 모두 선언됨
- [ ] **32×32 배열** (공식 표준)
- [ ] 각 행 픽셀 개수 일치 (32개)
- [ ] 3가지 스프라이트 완성 (Idle, Happy, Sleeping)
- [ ] Export 구문 작성

#### 디자인
- [ ] 캐릭터가 식별 가능한가?
- [ ] 색상 조화가 좋은가?
- [ ] 디테일이 적절한가? (너무 복잡하지 않은가?)
- [ ] 다른 캐릭터와 스타일이 일관되는가?

#### 테스트
- [ ] 개발 서버에서 렌더링 확인
- [ ] Small/Medium/Large 크기 모두 확인
- [ ] 애니메이션 자연스러움 확인
- [ ] 모바일 화면에서도 확인

---

## FAQ

### Q: 픽셀 크기는 어떻게 정하나요?
**A**: **32×32가 공식 표준입니다** (필수). 충분한 디테일을 표현하면서도 부드러운 그라데이션과 입체감을 구현할 수 있는 최적의 크기입니다.

### Q: 몇 가지 색상을 사용해야 하나요?
**A**: 10-15개를 권장합니다. 너무 많으면 복잡하고, 너무 적으면 표현이 제한됩니다.

### Q: 애니메이션은 어떻게 만드나요?
**A**: 스프라이트 전환(Idle → Happy)과 CSS 애니메이션을 조합합니다. 복잡한 프레임 애니메이션은 현재 시스템에서 지원하지 않습니다.

### Q: 투명 배경은 어떻게 만드나요?
**A**: `transparent: null`로 정의하고 `_` 약어를 사용합니다.

### Q: 참고 이미지를 자동으로 변환할 수 있나요?
**A**: 완전 자동 변환은 어렵습니다. Piskel 등의 도구로 트레이싱한 후 수동으로 코드 변환을 권장합니다.

---

---

## 변경 이력

### v1.1 (2025-11-09)
- **주요 변경**: 32×32 픽셀을 공식 표준으로 확정
- 모든 예시 및 설명을 32×32 기준으로 업데이트
- BlueHero, GreenSlime 캐릭터 32×32로 전환 완료

### v1.0 (2025-11-09)
- 초기 문서 작성
- 픽셀 아트 시스템 기본 구조 정의

---

**문서 버전**: 1.1
**최종 업데이트**: 2025-11-09
**작성자**: Claude Code Assistant
