# Landing Preview History

## 문서 목적

이 문서는 랜딩페이지 시안 작업과 실제 반영 상태를 기록하기 위한 메모다.

- 임시 랜딩 시안의 역할
- 실제 서비스 랜딩으로 승격된 버전
- URL 공개 여부
- 추후 신규 시안 추가 시 지켜야 할 기준

---

## 현재 상태 요약

### 실제 서비스 랜딩

- 실제 `/` 랜딩페이지는 `LandingPortalPage` UI를 사용한다.
- 구현 파일:
  - `src/pages/LandingPage.tsx`
  - `src/pages/LandingPagePreview2.tsx`
  - `src/pages/LandingPagePreview2.css`

현재 구조는 다음과 같다.

- `LandingPage.tsx`는 실제 진입용 라우트 컴포넌트다.
- 실제 렌더링 본체는 `LandingPagePreview2.tsx` 내부의 `LandingPortalPage`다.
- 즉, preview2 시안을 실제 랜딩으로 승격해 사용 중이다.

---

## 프리뷰 페이지 보존 정책

다음 파일들은 코드 참조용으로 유지한다.

- `src/pages/LandingPagePreview.tsx`
- `src/pages/LandingPagePreview1.tsx`
- `src/pages/LandingPagePreview2.tsx`

의도:

- 이전 시안/실험 흔적을 코드 차원에서 보존
- 향후 새로운 랜딩 시안 제작 시 참고 자산으로 재사용
- 실제 서비스 페이지와 완전히 분리된 실험 베이스 유지

중요:

- 위 프리뷰 파일들은 **코드로만 유지**한다.
- 실제 URL 진입 경로는 열어두지 않는다.

---

## URL 공개 정책

현재 다음 프리뷰 URL은 라우트에서 제거되어 있다.

- `/landing-preview`
- `/landing-preview1`
- `/landing-preview2`

즉:

- 브라우저 주소로 직접 접근 불가
- 외부 사용자 노출 불가
- 내부 개발자가 코드 수정 후 실제 랜딩에 반영하는 방식만 허용

관련 처리 파일:

- `src/App.tsx`

---

## 랜딩 문구 및 다국어 상태

현재 실 랜딩에서 사용하는 핵심 문구는 다국어 키 기반으로 정리되어 있다.

주요 키:

- `landing.secret_invitation`
- `landing.portal_chip_raise`
- `landing.portal_chip_play`
- `landing.portal_chip_learn`
- `landing.free_start`
- `landing.continue_experience`
- `landing.login`
- `landing.signup`

적용 로케일:

- `en`
- `en-UK`
- `ko`
- `ja`
- `es-ES`
- `fr-FR`
- `id-ID`
- `pt-PT`
- `vi-VN`

---

## 모바일 공통 처리

랜딩 및 향후 유사 UI에서 모바일 롱탭/복사/탭 하이라이트 재발을 줄이기 위해 공통 가드를 추가했다.

공통 유틸리티:

- `src/index.css`
- 클래스명: `mobile-ui-guard`

용도:

- 텍스트 선택 방지
- iOS/Android 롱탭 콜아웃 방지
- 탭 하이라이트 제거

적용 방식:

- 새 랜딩/임시 페이지 루트에 `mobile-ui-guard` 클래스를 부여

주의:

- 입력창(`input`, `textarea`, `select`, `contenteditable`)은 예외 처리되어 일반 입력 가능

---

## 신규 시안 작업 규칙

향후 새 랜딩 시안을 추가할 때는 아래 규칙을 따른다.

1. 실제 랜딩을 바로 수정하지 말고 별도 시안 파일로 만든다.
2. 시안 파일은 `src/pages/` 아래 preview 성격으로 보존 가능하다.
3. 시안은 기본적으로 URL 라우트를 열지 않는다.
4. 충분히 검증된 뒤 실제 `LandingPage`에 연결한다.
5. 실 랜딩으로 승격된 시안은 문구를 다국어 키로 이관한다.
6. 모바일 제스처/롱탭 방지는 `mobile-ui-guard` 공통 처리 우선 적용

---

## 다음 정리 후보

현재는 안정성을 우선해 `LandingPagePreview2.tsx` 파일명을 유지하고 있다.

추후 리팩터링 후보:

- `LandingPagePreview2.tsx` -> 실제 용도에 맞는 파일명으로 변경
- preview 전용 파일들을 `draft` 또는 `archive` 네이밍으로 재정리
- 랜딩 시안 관련 컴포넌트/스타일 디렉터리 분리

현재 단계에서는 **동작 안정성 우선**으로 유지한다.
