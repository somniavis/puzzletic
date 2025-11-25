# 픽셀 아트 캐릭터 제작 가이드

> **버전**: 2.0
> **최종 업데이트**: 2025-11-25
> **작성자**: Gemini

## 1. 개요

Puzzleletic의 캐릭터는 이미지 파일을 사용하지 않고, **순수 코드로 픽셀 아트를 정의**합니다. 이 방식은 모든 에셋을 Git으로 버전 관리할 수 있게 해주며, 수정과 협업을 용이하게 합니다.

이 문서는 새로운 픽셀 아트 캐릭터를 제작하고 프로젝트에 통합하는 전체 과정을 안내합니다.

## 2. 픽셀 아트 시스템 구조

### 렌더링 방식
- **핵심 컴포넌트**: `src/components/PixelArt/PixelRenderer.tsx`
- **원리**: 2차원 색상 배열(`PixelColor[][]`)을 입력받아 CSS Grid를 사용하여 각 픽셀을 `<div>` 태그로 렌더링합니다.
- **선명도**: `image-rendering: pixelated` CSS 속성을 통해 확대 시에도 픽셀이 흐려지지 않고 선명하게 보입니다.

### 기술 사양
- **캔버스 크기**: **24x24 픽셀** (프로젝트 표준)
- **파일 형식**: TypeScript (`.ts` 또는 `.tsx`)
- **색상 수**: 캐릭터당 5~15개 내외 권장
- **필수 상태**: 모든 캐릭터는 최소 `idle`, `happy`, `sleeping` 3가지 상태의 스프라이트를 가져야 합니다.

## 3. 캐릭터 제작 워크플로우

새로운 캐릭터를 제작하는 과정은 크게 4단계로 나뉩니다.

### 1단계: 캐릭터 디자인 및 코드 생성 (AI 활용)

외부 AI 도구(예: ChatGPT, Claude)를 사용하여 픽셀 아트의 기반이 되는 코드를 생성하는 것을 권장합니다.

#### AI 프롬프트 템플릿
```
24x24 픽셀 크기의 [캐릭터 이름] 캐릭터를 생성해줘.
[캐릭터에 대한 상세 설명: 예) 보라색 털과 큰 눈을 가진 귀여운 고양이]

아래 3가지 상태가 필요해:
- idle: 기본 대기 상태
- happy: 행복하게 미소 짓는 상태
- sleeping: 눈을 감고 자는 상태

결과는 TypeScript 코드 형식으로 출력해줘. 요구사항은 다음과 같아:
- `COLORS` 객체에 색상 팔레트를 정의해줘 (5~10개).
- 각 색상에 대한 한 글자 단축 변수를 만들어줘 (예: _ = transparent).
- 각 상태에 대한 24x24 크기의 2차원 배열을 생성해줘 (예: `characterNameIdle`).
- 투명한 픽셀의 값은 `null`로 설정해줘.
```

### 2단계: 캐릭터 컴포넌트 생성

AI가 생성한 코드를 바탕으로 캐릭터의 React 컴포넌트를 생성합니다.

1.  **폴더 생성**: `src/components/characters/base` 또는 `evolved/stage2` 아래에 캐릭터 이름으로 새 폴더를 만듭니다. (예: `PurpleCat`)
2.  **CSS 파일 생성**: `PurpleCat.css` 파일을 만들고 캐릭터 애니메이션(예: `idle-bounce`)을 정의합니다.
3.  **TSX 파일 생성**: `PurpleCat.tsx` 파일을 만들고 아래 템플릿에 맞춰 코드를 작성합니다.

#### 캐릭터 컴포넌트 템플릿 (`PurpleCat.tsx`)
```typescript
import React from 'react';
import './PurpleCat.css';

// AI가 생성한 이미지 URL을 여기에 붙여넣습니다.
// TODO: 이 URL은 나중에 내부 에셋 경로로 변경되어야 합니다.
const imageUrl = 'https://...';

interface PurpleCatProps {
  // 캐릭터의 상태에 따라 다른 이미지를 보여주기 위한 props
  emotion?: 'happy' | 'sad' | 'sleeping';
}

const PurpleCat: React.FC<PurpleCatProps> = ({ emotion }) => {
  // emotion prop에 따라 다른 이미지를 반환하는 로직 (현재는 단일 이미지)
  const getImageUrl = () => {
    // sleeping 상태일 때 다른 이미지를 보여주는 예시
    if (emotion === 'sleeping') {
      return 'https://.../sleeping_image_url.png';
    }
    return imageUrl;
  };

  return (
    <div className="character-container">
      <img src={getImageUrl()} alt="Purple Cat" className="character-image" />
    </div>
  );
};

export default PurpleCat;
```
> **참고**: 현재 시스템은 `PixelRenderer` 대신 외부 이미지를 사용하고 있습니다. 위 템플릿은 현재 구조에 맞춘 것이며, 향후 `PixelRenderer` 기반으로 전환될 수 있습니다.

### 3단계: 캐릭터 등록

새로 만든 캐릭터를 시스템에 등록해야 다른 곳에서 사용할 수 있습니다.

1.  **캐릭터 인덱스에 추가**: `src/components/characters/index.ts` 파일에 새로 만든 컴포넌트를 `export` 하도록 추가합니다.

    ```typescript
    // src/components/characters/index.ts
    // ... 기존 캐릭터들
    import PurpleCat from './base/PurpleCat/PurpleCat';

    export const CHARACTERS = {
      // ...
      purpleCat: PurpleCat,
    } as const;

    export type CharacterType = keyof typeof CHARACTERS;
    ```

2.  **진화 트리에 추가**: `src/components/characters/metadata/evolutionTree.ts` 파일에 캐릭터의 진화 정보를 추가합니다.

    ```typescript
    // src/components/characters/metadata/evolutionTree.ts
    export const EVOLUTION_TREE: Record<string, EvolutionNode> = {
      // ...
      purpleCat: {
        stage: 1,
        evolvesTo: ['purpleClawCat'], // 진화 후 캐릭터 ID
        displayName: 'Purple Cat',
        color: 'purple',
      },
      // ...
    };
    ```

### 4단계: 테스트 및 검증

1.  **개발 서버 실행**: `npm run dev` 명령으로 개발 서버를 실행합니다.
2.  **캐릭터 관리자 페이지 확인**: `http://localhost:5173`에 접속한 후, "Character Gallery" 페이지로 이동하여 새로 추가한 캐릭터가 정상적으로 표시되는지 확인합니다.
3.  **체크리스트**:
    - [ ] 캐릭터가 갤러리에 나타나는가?
    - [ ] 캐릭터 이미지가 올바르게 로드되는가?
    - [ ] CSS 애니메이션이 적용되는가?
    - [ ] 콘솔에 오류가 없는가?

## 4. 자동 통합 가이드

위 과정을 수동으로 진행하는 대신, Claude Code와 같은 AI 에이전트에게 작업을 위임하여 자동화할 수 있습니다.

### 제출 형식
AI 에이전트에게 아래 형식으로 정보를 제공하면, 에이전트가 나머지 파일 생성 및 등록 절차를 자동으로 수행합니다.

```
캐릭터 추가 요청

- ID: purpleCat
- 이름: Purple Cat
- 설명: 보라색 털을 가진 귀여운 고양이입니다.
- 진화 정보: 1단계이며, 'purpleClawCat'으로 진화합니다.
- 이미지 URL (idle): https://.../idle_image.png
- 이미지 URL (happy): https://.../happy_image.png
- 이미지 URL (sleeping): https://.../sleeping_image.png
```

AI 에이전트는 이 정보를 바탕으로 필요한 모든 파일을 생성하고 수정하여 Pull Request를 생성할 수 있습니다.
