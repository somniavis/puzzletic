# Capacitor 하이브리드 앱 구축 가이드 (React/Vite)

> **목표**: 현재의 웹 기반 Puzzleletic 서비스(`React` + `Vite`)를 수정 없이 네이티브 앱(`iOS`, `Android`)으로 패키징하여 스토어에 출시합니다.

## 1. Capacitor란?

**Capacitor**는 웹 앱을 네이티브 iOS, Android 앱으로 감싸주는(Wrapping) 크로스 플랫폼 런타임입니다.
- **웹이 메인**: 앱의 UI와 로직은 여전히 웹 기술(HTML/CSS/JS)로 돌아갑니다.
- **네이티브 쉘**: Capacitor가 네이티브 웹뷰(WebView)를 생성하고 그 안에서 웹 앱을 실행합니다.
- **브릿지**: 자바스크립트 코드에서 네이티브 기능(카메라, 푸시 알림, 진동 등)을 호출할 수 있게 다리를 놓아줍니다.

---

## 2. 프로젝트 설정 (Setup)

### A. 패키지 설치
기존 React 프로젝트 루트에서 다음 명령어를 실행합니다.

```bash
# Capacitor 코어 및 CLI 설치
npm install @capacitor/core @capacitor/cli

# Capacitor 초기화 (앱 이름과 ID 설정)
npx cap init Puzzleletic com.somniavis.puzzleletic
```

### B. 빌드 설정 수정 (`vite.config.ts`)
Capacitor는 빌드된 정적 파일(`dist` 폴더)을 가져와서 앱에 넣습니다.

```typescript
// vite.config.ts
export default defineConfig({
  // ...
  build: {
    outDir: 'dist', // 기본값이지만 명시적으로 확인
  }
});
```

### C. 플랫폼 추가
iOS와 Android 플랫폼 폴더를 생성합니다.

```bash
# 네이티브 플랫폼 패키지 설치
npm install @capacitor/android @capacitor/ios

# 플랫폼 추가
npx cap add android
npx cap add ios
```

---

## 3. 개발 워크플로우 (Workflow)

웹 앱을 수정하고 이를 앱에 반영하는 과정입니다.

1.  **웹 빌드**: `npm run build` (React 코드를 `dist` 폴더로 컴파일)
2.  **동기화**: `npx cap sync` (변경된 `dist` 파일과 플러그인 설정을 네이티브 프로젝트로 복사)
3.  **실행**:
    *   **iOS**: `npx cap open ios` (Xcode가 열리면 실행 버튼 클릭)
    *   **Android**: `npx cap open android` (Android Studio가 열리면 실행 버튼 클릭)

> **💡 꿀팁**: 개발 중에 매번 빌드하기 귀찮다면 `server.url` 설정을 통해 로컬 서버(localhost)를 앱에서 바로 띄울 수 있습니다. (단, 배포 전에는 반드시 제거해야 함)

---

## 3-1. 앱 패키징 전략 비교: `dist` 내장형 vs 원격 URL 로드형

현재 Puzzleletic의 하이브리드 앱 전략은 아래 두 가지로 나눠 검토할 수 있습니다.

### A. `dist` 내장형 (Bundled Web Assets)

웹 빌드 결과물(`dist`)을 앱 바이너리 안에 포함시키는 방식입니다.

- 앱 실행 시 네이티브 WebView가 앱 내부의 정적 파일을 바로 로드
- 앱 심사 시점에 검토된 화면/동작과 실제 배포 결과가 거의 동일
- 오프라인에서도 첫 진입이 가능
- 웹 코드를 "앱 코드로 변환"하는 것이 아니라, **빌드된 웹 자산을 앱 안에 탑재**하는 구조

**장점**
- 심사 리스크가 상대적으로 낮음
- 앱 버전과 UI/로직 버전의 대응 관계가 명확함
- 네트워크 상태와 무관하게 기본 로딩이 안정적
- Capacitor의 기본 워크플로우와 가장 잘 맞음

**단점**
- 화면/로직 수정 시 앱 재빌드 및 재배포가 필요
- 웹은 즉시 배포되지만 앱은 스토어 반영 시간이 걸림
- 웹/앱 버전이 잠시 다를 수 있음

### B. 원격 URL 로드형 (Remote Hosted Web App)

앱은 얇은 네이티브 셸만 두고, 실제 화면은 원격 웹 URL을 WebView로 불러오는 방식입니다.

- 앱 업데이트 없이 웹 배포만으로 화면 수정 가능
- 웹 운영 속도와 실험 속도가 매우 빠름
- 웹과 앱이 사실상 같은 URL을 바라보게 만들 수 있음

**장점**
- 수정/배포 속도가 가장 빠름
- 앱 재심사 없이 대부분의 UI 변경을 반영 가능
- 운영 복잡도가 낮아 보일 수 있음

**단점**
- 네트워크 의존도가 높음
- 앱 심사 시 "단순 웹 래퍼"로 보일 위험이 큼
- 심사 후에도 원격 콘텐츠가 크게 바뀔 수 있어 플랫폼 입장에서 통제가 어려움
- 로그인, 외부 링크, 결제 플로우, 딥링크, 오프라인 진입 등에서 예외 처리가 더 늘어남

### C. 앱 심사 관점에서 왜 원격 URL 로드형이 더 불리한가?

특히 iOS에서 아래 이유로 리스크가 커집니다.

1. **앱이 아니라 웹사이트처럼 보이기 쉬움**
   - App Review는 "브라우저 안에서 웹사이트를 띄운 것과 무엇이 다른가?"를 중요하게 봅니다.

2. **Minimum Functionality(4.2) 리젝 리스크**
   - 기능적으로 앱 고유성이 약하면 "웹사이트를 감싼 수준"으로 판단될 수 있습니다.

3. **심사 후 콘텐츠 변경 가능성**
   - 원격 URL 기반 앱은 바이너리 심사 후에도 경험이 크게 달라질 수 있어 심사 관점에서 불안정하게 보일 수 있습니다.

4. **Google Play도 완전히 자유롭지 않음**
   - Android 역시 단순 WebView 래퍼나 저품질 앱으로 보이면 정책상 불리할 수 있습니다.

### D. Puzzleletic 관점의 현재 판단

현재 서비스는 **웹을 메인으로 유지**하면서 앱도 추가로 운영하려는 목적이므로, 아래처럼 정리하는 것이 현실적입니다.

- **안정성/심사 우선**: `dist` 내장형이 더 적합
- **운영 속도/실험 우선**: 원격 URL 로드형이 더 유리

다만 현재 논의 기준으로는 아래와 같이 정리됩니다.

#### 현재 우선 검토 중인 1차 전략
- 기본 앱 구조: **원격 URL 로드형**
- 앱 전용 기능 최소 부착:
  - 푸시 알림
  - 인앱결제
- 목적:
  - 웹 운영 속도를 최대한 유지
  - 앱은 우선 얇은 셸로 빠르게 시장 반응 확인

#### 병행 검토 중인 대안 전략
- 심사 안정성과 오프라인 진입을 더 중시할 경우:
  - **`dist` 내장형**으로 전환
  - 여기에 푸시, 공유, 햅틱, 오프라인 시작화면 등 앱 전용 기능을 추가

#### 검토 가능한 2차 전략
- 출시 후 운영이 안정되면:
  - 일부 콘텐츠만 원격 제어
  - 또는 Live Update 계열 솔루션 검토

### E. "웹 코드가 앱 코드로 바뀌어 문제가 생기지 않나?"에 대한 정리

보통 문제의 본질은 "코드 변환"이 아닙니다.

- 웹 코드는 여전히 HTML/CSS/JS로 동작
- 단지 실행 환경이 브라우저에서 **모바일 WebView**로 바뀜

그래서 실제 점검 포인트는 아래입니다.

- 모바일 Safari / Android WebView 렌더링 차이
- safe area, status bar, back button
- OAuth/리다이렉트/딥링크 처리
- 파일 업로드/다운로드
- localStorage 및 인증 세션 지속성

즉, **웹 코드가 앱 코드로 변형되어 깨진다기보다, 모바일 WebView 환경 차이로 인해 보정이 필요할 수 있다**고 보는 것이 정확합니다.

### F. `dist` 내장형에서도 현재 서버 통신은 유지되는가?

기본적으로 **유지됩니다**.

중요한 점은 `dist` 내장형이 프론트 자산의 **로딩 위치**를 바꾸는 것이지, API 호출 구조를 제거하는 것이 아니라는 점입니다.

- 앱 화면(HTML/CSS/JS)은 앱 내부의 `dist`에서 로드
- 그 안에서 실행되는 프론트 코드는 기존처럼 외부 서버와 통신
  - Firebase
  - Cloudflare Worker API
  - 기타 외부 백엔드/정적 리소스

즉, 현재 Puzzleletic의 서버 연동은 원칙적으로 그대로 유지 가능합니다.

#### 단, 점검이 필요한 항목
- API 주소를 상대경로가 아닌 **절대 URL** 기준으로 정리할 것
- WebView origin 차이에 따른 **CORS 정책** 확인
- Firebase/소셜 로그인 리디렉션 방식 점검
- 쿠키 기반 세션보다 토큰 기반 인증이 더 안정적인지 검토
- 파일 업로드/다운로드/공유 동작 재검증

### G. 모바일 브라우저에서 잘 되던 UI가 WebView에서 틀어질 가능성은?

가능성은 있습니다. 다만 **모바일 크롬/사파리 테스트를 이미 마쳤다면 큰 레이아웃 붕괴 리스크는 많이 낮아진 상태**로 볼 수 있습니다.

보통 차이가 나는 지점은 아래입니다.

#### 상대적으로 안정적인 영역
- 반응형 레이아웃
- CSS 렌더링
- 터치 인터랙션
- 애니메이션
- 모바일 스크롤 흐름

#### WebView에서 특히 별도 점검이 필요한 영역
- 로그인/리디렉션
  - Firebase
  - Google / Apple 로그인
- localStorage / 세션 지속성
- safe area / status bar / 하단 제스처 영역
- 외부 링크 / 새 창 / 뒤로가기
- 오디오 자동재생 / 사용자 제스처 요구
- 파일 업로드 / 다운로드 / 공유
- 인앱결제 및 앱 스토어 정책 충돌 여부

정리하면, 현재 Puzzleletic은 이미 모바일 웹 검증이 어느 정도 되어 있으므로:

- **UI 자체보다는**
- **로그인, 저장, 결제, 외부 링크, 앱 특유 네비게이션**

을 WebView 전용 QA 포인트로 보는 것이 더 현실적입니다.

### H. 현재 결정 상태

이 문서 작성 시점 기준으로 Puzzleletic은:

- 웹 서비스는 기존 방식 유지
- 하이브리드 앱은 추가 검토 중
- 1차 방향은 **원격 URL 로드형 + 푸시 + 인앱결제**를 우선 고려
- 다만 심사 리스크와 앱다운 경험 보강 여부는 추가 숙고 필요

이라는 상태입니다.

향후 최종 결정 시 아래 항목을 기준으로 다시 판단합니다.

- 앱 심사 리스크
- 운영/배포 속도
- 오프라인 대응 필요성
- 로그인/결제/딥링크 복잡도
- 웹과 앱의 버전 동기화 전략
- Android 우선 출시 후 iOS 확대 여부

---

## 4. 주요 네이티브 기능 연동

### A. 안전 영역 (Safe Area) 처리
노치 디자인이나 제스처 바에 컨텐츠가 가리지 않도록 CSS 변수를 사용합니다.

```css
/* index.css 또는 App.css */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### B. 카메라 (Camera)
`html-to-image` 대신 네이티브 카메라를 사용하고 싶다면 플러그인을 설치합니다.

```bash
npm install @capacitor/camera
npx cap sync
```

```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  // image.webPath를 사용하여 이미지 표시
};
```

### C. 소셜 로그인 (Apple/Google)
웹에서의 리다이렉트 방식 대신 네이티브 SDK를 사용해야 UX가 매끄럽습니다.
Firebase Auth와 연동 시 `capacitor-firebase-auth` 같은 커뮤니티 플러그인을 사용하거나, 웹 SDK를 그대로 쓰되 **Custom URL Scheme** 설정을 해줘야 합니다.

---

## 5. 배포 준비 (Deployment)

### A. 앱 아이콘 및 스플래시 스크린
`capacitor-assets` 도구를 사용하면 사이즈별 이미지를 자동 생성해줍니다.

1. `assets` 폴더에 `logo.png` (1024x1024), `splash.png` (2732x2732) 준비
2. `npx capacitor-assets generate` 실행

### B. 버전 관리
`package.json`의 `version`을 올린 후 `npx cap sync`를 하면 네이티브 프로젝트의 버전 정보도 같이 업데이트됩니다.

### C. 스토어 심사 팁
- **애플**: "이 앱이 단순 웹사이트가 아니라 앱으로서의 기능(푸시, 카메라 등)을 충분히 활용하는가?"를 봅니다. 단순히 웹만 띄우면(Web Repackaging) 거절될 수 있습니다.
- **업데이트**: 앱 껍데기(네이티브 코드)가 바뀌지 않는 단순 UI/로직 수정은 **CodePush**(Live Updates) 기능을 사용하면 심사 없이 즉시 업데이트가 가능합니다. (Ionic Appflow 등 사용 시)

---

## 6. 요약

| 구분 | Web (Vercel) | App (Capacitor) |
| :--- | :--- | :--- |
| **실행 환경** | 브라우저 (Chrome/Safari) | 네이티브 WebView |
| **배포 방식** | 즉시 배포 (Git Push) | 스토어 심사 필요 (또는 CodePush) |
| **기능 접근** | 웹 표준 API 제한적 | 모든 네이티브 기능 접근 가능 |
| **성능** | 네트워크 속도 의존 | 로컬 파일 로딩이라 빠름 |

이 방식을 사용하면 **"원 소스 멀티 유즈(One Source Multi Use)"** 전략으로 적은 인력으로 웹과 앱을 동시에 운영할 수 있습니다.
