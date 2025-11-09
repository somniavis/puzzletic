# Puzzletic 서비스 구조 문서

## 개요

Puzzletic은 Tamagotchi 스타일의 가상 펫 육성 게임과 교육용 퍼즐 게임을 결합한 웹 애플리케이션입니다.

### 기술 스택
- **프레임워크**: React 18 + TypeScript
- **빌드 도구**: Vite
- **배포**: Vercel
- **버전 관리**: GitHub

---

## 핵심 게임 메커니즘

### 1. 캐릭터 육성 시스템

#### 캐릭터 선택 및 진화
- **3단계 진화 시스템** (향후 확장 가능)
  - Stage 1: 초보 단계 (시작)
  - Stage 2: 중급 단계 (레벨 + 애정도 요구)
  - Stage 3: 마스터 단계 (높은 레벨 + 애정도 요구)

#### 캐릭터 스탯
각 캐릭터는 8가지 스탯을 가집니다 (0-100 범위):
- **hunger**: 배고픔 수치
- **happiness**: 행복도
- **health**: 건강 상태
- **hygiene**: 위생 상태
- **fatigue**: 피로도
- **affection**: 애정도 (진화 조건)
- **intelligence**: 지능 (퍼즐 성공률 영향)
- **stamina**: 체력

#### 캐릭터 상태
- **Mood (감정 상태)**: happy, sad, neutral, excited, sick, sleeping
- **Action (행동)**: idle, eating, playing, sleeping, sick, happy, jumping

### 2. 코인 시스템

#### 코인 획득 방법
- **퍼즐 풀기**: 수학/과학 문제를 풀어 코인 획득
  - 난이도에 따라 다른 보상
  - 연속 성공 시 보너스

#### 코인 사용처
- **먹이 구매**: 캐릭터의 배고픔 해소
- **놀이 아이템**: 행복도 증가
- **청소 도구**: 위생 상태 개선
- **약품**: 건강 회복
- **배경 커스터마이징**: 게임 환경 꾸미기
- **아이템 구매**: 다양한 장식품

### 3. 퍼즐 게임 시스템

#### 퍼즐 카테고리
- **수학**: 산술, 대수, 기하학 문제
- **과학**: 물리, 화학, 생물 퀴즈

#### 난이도 설정
- 캐릭터 레벨에 따른 자동 조정
- 수동 난이도 선택 가능

---

## 프로젝트 구조

```
puzzleletic/
├── src/
│   ├── components/
│   │   ├── characters/          # 캐릭터 컴포넌트
│   │   │   ├── BlueHero/        # 개별 캐릭터 폴더
│   │   │   │   ├── BlueHero.tsx
│   │   │   │   ├── BlueHero.css
│   │   │   │   └── BlueHeroPixelData.ts
│   │   │   └── index.ts         # 캐릭터 레지스트리
│   │   ├── PixelArt/            # 픽셀 아트 렌더러
│   │   │   └── PixelRenderer.tsx
│   │   └── CharacterGallery/    # 캐릭터 갤러리
│   │       ├── CharacterGallery.tsx
│   │       └── CharacterGallery.css
│   ├── pages/                   # 페이지 컴포넌트
│   │   ├── CharacterAdmin.tsx   # 캐릭터 관리 페이지
│   │   └── CharacterAdmin.css
│   ├── types/
│   │   └── character.ts         # 캐릭터 관련 타입 정의
│   ├── data/
│   │   ├── species.ts           # 캐릭터 종 데이터
│   │   └── characters.ts        # 캐릭터 생성 헬퍼
│   ├── App.tsx                  # 메인 앱 컴포넌트
│   └── App.css
├── docs/                        # 문서
└── public/                      # 정적 파일
```

---

## 타입 시스템

### CharacterSpecies (캐릭터 종)
```typescript
interface CharacterSpecies {
  id: string;                    // 고유 ID (예: 'blueHero')
  name: string;                  // 종 이름
  description: string;           // 설명
  evolutions: CharacterEvolution[]; // 진화 단계 정보
}
```

### CharacterEvolution (진화 단계)
```typescript
interface CharacterEvolution {
  stage: EvolutionStage;         // 1, 2, 3
  name: string;                  // 진화 단계 이름
  requiredLevel: number;         // 필요 레벨
  requiredAffection: number;     // 필요 애정도
  description?: string;          // 설명
}
```

### Character (캐릭터 인스턴스)
```typescript
interface Character {
  id: string;                    // 고유 인스턴스 ID
  speciesId: string;             // 종 ID
  name: string;                  // 사용자 지정 이름
  level: number;                 // 현재 레벨
  experience: number;            // 경험치
  evolutionStage: EvolutionStage; // 현재 진화 단계
  stats: CharacterStats;         // 스탯
  currentMood: CharacterMood;    // 현재 감정
  currentAction: CharacterAction; // 현재 행동
}
```

---

## 캐릭터 렌더링 시스템

### 픽셀 아트 방식
- **2D 배열 기반**: 각 픽셀을 색상 코드로 표현
- **그리드 크기**: **24×24 픽셀** ⭐ (공식 표준)
- **CSS Grid 렌더링**: 픽셀별 div 요소로 렌더링
- **스케일링**: small(4px), medium(8px), large(12px)
- **최종 크기 (24x24 기준)**: small(96px), medium(192px), large(288px)

### 캐릭터 상태별 스프라이트
각 캐릭터는 최소 3가지 스프라이트 필요:
- **Idle**: 기본 대기 상태
- **Happy**: 행복한 상태 (미소)
- **Sleeping**: 잠자는 상태 (눈 감음)

### 애니메이션
- **idle-bounce**: 2초 주기 위아래 움직임
- **jump**: 0.6초 점프 애니메이션
- **wiggle**: 0.5초 좌우 흔들림
- **playing**: 점프 + 흔들림 조합

---

## 향후 개발 계획

### 단기 (1-2개월)
- [ ] 추가 캐릭터 종 개발 (최소 3-5종)
- [ ] 퍼즐 게임 시스템 구현
- [ ] 코인 시스템 및 상점 구현
- [ ] 스탯 관리 시스템 (먹이주기, 놀아주기 등)

### 중기 (3-6개월)
- [ ] 배경 커스터마이징 시스템
- [ ] 진화 애니메이션 및 이벤트
- [ ] 업적 시스템
- [ ] 사용자 계정 및 데이터 저장 (로컬스토리지 → 백엔드)

### 장기 (6개월+)
- [ ] 멀티플레이어 기능
- [ ] 캐릭터 교환/거래 시스템
- [ ] 시즌별 이벤트 캐릭터
- [ ] 모바일 앱 버전

---

## 성능 최적화 고려사항

- **픽셀 렌더링 최적화**: React.memo 활용
- **애니메이션 최적화**: CSS transform 사용
- **상태 관리**: Context API 또는 Zustand 도입 검토
- **코드 분할**: React.lazy를 통한 페이지별 번들 분리

---

## 배포 정보

- **개발 서버**: http://localhost:5173/
- **프로덕션 URL**: https://puzzletic.vercel.app/
- **Git 저장소**: https://github.com/somniavis/puzzletic

### 배포 프로세스
1. `main` 브랜치에 push
2. Vercel 자동 빌드 및 배포
3. 프리뷰 URL 생성 (PR 시)

---

## 개발 가이드

### 새 캐릭터 추가 방법
1. 픽셀 데이터 생성 (`src/components/characters/[Name]/[Name]PixelData.ts`)
2. 컴포넌트 생성 (`src/components/characters/[Name]/[Name].tsx`)
3. `src/components/characters/index.ts`에 등록
4. `src/data/species.ts`에 종 정의 추가

### 개발 환경 설정
```bash
npm install
npm run dev
```

### 빌드
```bash
npm run build
```

---

---

## 변경 이력

### v1.1 (2025-11-09)
- **픽셀 표준 확정**: 32×32 픽셀을 공식 표준으로 지정
- 캐릭터 렌더링 시스템 설명 업데이트
- 기존 캐릭터(BlueHero, GreenSlime) 32×32로 전환 완료

### v1.0 (2025-11-09)
- 초기 서비스 구조 문서 작성
- 핵심 시스템 정의

---

**문서 버전**: 1.1
**최종 업데이트**: 2025-11-09
**작성자**: Claude Code Assistant
