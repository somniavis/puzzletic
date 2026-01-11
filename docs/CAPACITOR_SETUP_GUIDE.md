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
