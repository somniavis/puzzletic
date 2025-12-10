# Grogro Jello 파이어베이스(Firebase) 설정 가이드

권한 문제로 인해 자동 생성이 불가능하므로, 아래 단계에 따라 **구글 계정(grogrojello@gmail.com)**으로 직접 프로젝트를 생성해주세요.

## 1단계: 프로젝트 만들기
1.  [Firebase 콘솔](https://console.firebase.google.com/)에 접속합니다.
2.  **"프로젝트 만들기"** (또는 "프로젝트 추가")를 클릭합니다.
3.  프로젝트 이름에 **`Grogro Jello`**를 입력합니다.
4.  (선택 사항) Google Analytics(애널리틱스)는 지금은 **사용 안 함**으로 설정하셔도 됩니다.
5.  **"프로젝트 만들기"**를 클릭하고 잠시 기다립니다.
6.  **"계속"**을 클릭합니다.

## 2단계: 인증(로그인) 기능 켜기
1.  왼쪽 메뉴에서 **"빌드"** -> **"Authentication"**을 클릭합니다.
2.  **"시작하기"** 버튼을 클릭합니다.
3.  **"Sign-in method"** 탭에서 **"이메일/비밀번호"**를 클릭합니다.
4.  **"사용 설정"** 스위치를 켜서(ON) 활성화합니다.
5.  **"저장"**을 클릭합니다.

## 3단계: 웹 앱 등록하고 키 발급받기
1.  왼쪽 메뉴 상단의 **"프로젝트 개요"** 옆의 **설정(톱니바퀴 ⚙️)** 아이콘 -> **"프로젝트 설정"**을 클릭합니다.
2.  화면 아래쪽으로 스크롤하여 "내 앱" 섹션으로 이동합니다.
3.  **웹(Web)** 아이콘 (`</>`)을 클릭합니다.
4.  앱 닉네임에 **`Grogro Jello Web`**이라고 입력합니다.
5.  **"앱 등록"**을 클릭합니다.
6.  화면에 `const firebaseConfig = { ... };` 로 시작하는 코드 뭉치가 나옵니다.

## ⚠️ 중요: 저에게 알려주셔야 할 것
**화면에 나온 `firebaseConfig` 코드 전체를 복사해서 채팅창에 붙여넣어 주세요.**
아래와 같이 생긴 코드입니다:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 4단계: 보안 설정 (Authorized Domains) 🛡️

Firebase는 **승인된 도메인(Authorized Domains)** 목록에 있는 주소에서 오는 로그인 요청만 허용합니다.

1.  **Firebase 콘솔** > **Authentication** > **Settings** (또는 Sign-in method 탭의 아래쪽)로 이동합니다.
2.  **Authorized Domains** (승인된 도메인) 섹션을 찾습니다.
3.  **`localhost`**가 목록에 있는지 확인합니다.
    -   `localhost`는 "내 컴퓨터"를 의미하며, 개발 중에는 꼭 필요합니다.
4.  (나중에) 실제 웹사이트를 배포하면, 그 도메인(예: `www.myapp.com`)을 여기에 **도메인 추가** 버튼을 눌러 꼭 등록해야 합니다.

> ⚠️ 이 설정이 없으면 "Google Sign-In failed" 같은 오류가 발생하며 로그인이 차단됩니다.
