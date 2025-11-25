# Puzzletic 서비스 구조 문서

## 개요

Puzzletic은 React와 TypeScript를 기반으로 구축된 가상 펫 육성 웹 애플리케이션입니다. 사용자는 캐릭터를 입양하고, 다양한 상호작용과 퍼즐 게임을 통해 캐릭터를 성장시킬 수 있습니다.

### 기술 스택
- **프레임워크**: React 19 + TypeScript
- **빌드 도구**: Vite
- **상태 관리**: React Context API (`NurturingContext`)
- **국제화**: i18next
- **배포**: Vercel

---

## 핵심 시스템

### 1. 캐릭터 시스템
- **진화**: `evolutionTree.ts`에 정의된 트리를 따라 여러 단계로 진화합니다.
- **컴포넌트**: 모든 캐릭터는 `src/components/characters` 내부에 자체 폴더와 컴포넌트(`*.tsx`)를 가집니다.
- **렌더링**: 캐릭터의 시각적 표현은 외부 이미지 URL에 의존하며, 각 캐릭터 컴포넌트 내에서 관리됩니다. (자세한 내용은 `ASSETS.md` 참조)

### 2. 양육 시스템 (`Nurturing`)
- **실시간 상호작용**: `gameTickService.ts`를 통해 캐릭터의 상태(포만감, 건강, 행복)가 실시간으로 변화합니다.
- **상태 관리**: `NurturingContext.tsx`가 모든 양육 관련 상태와 행동을 전역적으로 관리합니다.
- **주요 기능**:
  - **스탯 관리**: 먹이주기, 약주기, 놀아주기 등을 통해 캐릭터의 3대 핵심 스탯(포만감, 건강, 행복)을 관리합니다.
  - **오염 시스템**: 음식을 먹으면 `Poop`(똥)이 생성되고, 시간이 지나면 `Bug`(벌레)가 발생하여 청결도와 건강에 영향을 줍니다.
  - **가출 시스템**: 캐릭터를 장기간 방치하면 정해진 규칙에 따라 가출합니다.
  - **데이터 영속성**: `persistenceService.ts`가 `localStorage`를 사용하여 사용자의 게임 상태를 저장하고, 오프라인 진행 상황을 계산합니다.
- (자세한 내용은 `NURTURING.md` 참조)

### 3. 관리자 페이지 (`CharacterAdmin`)
- **위치**: `src/pages/CharacterAdmin.tsx`
- **기능**: 게임에 존재하는 모든 캐릭터를 진화 단계별로 확인하고 관리할 수 있는 갤러리 형태의 페이지입니다.
- (자세한 내용은 `CHARACTER_ADMIN.md` 참조)

---

## 프로젝트 구조

```
puzzleletic/
├── public/                      # 정적 에셋 (Vite 로고 등)
├── src/
│   ├── assets/                  # 내부 이미지 에셋 (React 로고 등)
│   ├── components/              # 재사용 가능한 UI 컴포넌트
│   │   ├── characters/          # 모든 캐릭터 컴포넌트
│   │   │   ├── base/            # 1단계 기본 캐릭터
│   │   │   ├── evolved/         # 2단계 이상 진화 캐릭터
│   │   │   └── metadata/        # 캐릭터 메타데이터 (진화 트리)
│   │   ├── Bug/                 # 벌레 컴포넌트
│   │   ├── Poop/                # 똥 컴포넌트
│   │   ├── NurturingPanel/      # 양육 상태 UI 패널
│   │   └── PetRoom/             # 캐릭터가 머무는 방
│   ├── constants/               # 상수 (양육 규칙, 성격 등)
│   │   └── nurturing.ts
│   ├── contexts/                # 전역 상태 관리
│   │   └── NurturingContext.tsx
│   ├── data/                    # 정적 데이터 (캐릭터, 감정, 종)
│   ├── i18n/                    # 국제화 (i18next)
│   ├── pages/                   # 페이지 단위 컴포넌트
│   │   └── CharacterAdmin.tsx
│   ├── services/                # 핵심 비즈니스 로직
│   │   ├── actionService.ts     # 사용자 행동 처리
│   │   ├── gameTickService.ts   # 실시간 게임 상태 변화
│   │   └── persistenceService.ts# 데이터 저장/로드
│   ├── types/                   # TypeScript 타입 정의
│   └── utils/                   # 유틸리티 함수
├── docs/                        # 프로젝트 문서
├── index.html                   # 메인 HTML 파일
├── package.json                 # 프로젝트 의존성 및 스크립트
└── vite.config.ts               # Vite 설정 파일
```

---

## 데이터 흐름

1.  **앱 시작**: `App.tsx`가 `NurturingProvider`를 렌더링합니다.
2.  **상태 초기화**: `NurturingContext` 내부에서 `persistenceService.ts`를 호출하여 `localStorage`에서 이전 게임 상태를 불러옵니다.
3.  **오프라인 진행 계산**: 마지막 접속 시간과 현재 시간의 차이를 계산하여, 그동안 진행되었을 게임 틱을 시뮬레이션하고 상태를 업데이트합니다.
4.  **게임 틱 시작**: `gameTickService.ts`의 로직에 따라 `TICK_INTERVAL_MS` 간격으로 캐릭터의 상태가 주기적으로 업데이트됩니다.
5.  **사용자 행동**: 사용자가 버튼(먹이주기, 놀기 등)을 클릭하면 `actionService.ts`의 함수가 호출되어 캐릭터의 상태가 즉시 변경됩니다.
6.  **상태 변경 및 저장**: 모든 상태 변경은 `NurturingContext`를 통해 이루어지며, 변경된 내용은 즉시 `localStorage`에 저장됩니다.
7.  **UI 렌더링**: `PetRoom`, `NurturingPanel` 등의 컴포넌트는 `useNurturing` 훅을 통해 최신 상태를 구독하고 UI를 렌더링합니다.

---

## 개발 가이드

### 개발 환경 설정
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev
```

### 주요 스크립트
- `npm run lint`: ESLint로 코드 스타일을 검사합니다.
- `npm run build`: 프로덕션용으로 프로젝트를 빌드합니다.
- `npm run preview`: 빌드된 결과물을 미리 봅니다.

---
**문서 버전**: 2.0
**최종 업데이트**: 2025-11-25
**작성자**: Gemini