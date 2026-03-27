# Grogro Jello 실서비스 도메인 연결 체크리스트

마지막 업데이트: 2026-03-27

이 문서는 현재 `Vercel + Firebase Auth + Cloudflare Worker + Firebase RTDB` 구조의 프로젝트에
실제 구매 도메인 `grogrojello.com`을 연결할 때 점검 및 수정해야 하는 항목을 정리한 운영용 체크리스트입니다.

## 0. 현재 완료 상태

2026-03-27 기준 실제 반영 완료 항목:

- `grogrojello.com` 구매 완료
- Vercel 프로젝트에 `grogrojello.com` 연결 완료
- Vercel 프로젝트에 `www.grogrojello.com` 연결 완료
- Namecheap DNS를 Vercel 연결값 기준으로 수정 완료
- Vercel에서 `Valid Configuration` 확인 완료
- `https://grogrojello.com` 접속 확인 완료
- `https://www.grogrojello.com` 접속 확인 완료
- Firebase `Authorized Domains`에 `grogrojello.com` 추가 완료
- Firebase `Authorized Domains`에 `www.grogrojello.com` 추가 완료
- 이메일 회원가입 정상 확인 완료
- 이메일 로그인 정상 확인 완료
- Google 로그인 정상 확인 완료
- Cloudflare Worker CORS를 운영 도메인 기준으로 제한 완료
- Cloudflare Worker 재배포 완료

현재 남아 있는 선택 작업:

- `www.grogrojello.com -> grogrojello.com` 리다이렉트 통일
- 필요 시 `api.grogrojello.com` 도입 검토
- 필요 시 Apple 로그인 실도메인 검증

## 1. 현재 구조 요약

- 웹 프론트엔드: Vercel
- 실제 연결할 웹 도메인: `grogrojello.com`
- 권장 대표 URL: `https://grogrojello.com`
- 선택 보조 URL: `https://www.grogrojello.com`
- 인증: Firebase Authentication
- Firebase Auth 도메인: `grogro-jello-4a53a.firebaseapp.com`
- 데이터 저장: Firebase Realtime Database
- 백엔드 API: Cloudflare Worker
- 현재 API 주소: `https://api-grogrojello.grogrojello.workers.dev`

## 2. 먼저 결정할 것

도메인 연결 전에 아래 2가지를 먼저 확정해야 합니다.

1. 대표 주소를 `https://grogrojello.com`로 쓸지, `https://www.grogrojello.com`로 쓸지 결정
2. API도 나중에 `https://api.grogrojello.com` 같은 자체 서브도메인으로 바꿀지 결정

권장값:

- 대표 웹 주소: `https://grogrojello.com`
- `www.grogrojello.com`는 대표 주소로 리다이렉트
- API는 당장은 `workers.dev` 유지 가능

## 2-1. Cloudflare SSL 조언을 현재 구조에 맞게 해석하기

받은 조언 중 핵심 방향은 맞지만, 현재 프로젝트 구조에서는 아래처럼 구분해서 이해해야 합니다.

현재 구조:

- 웹 프론트엔드: Vercel
- API: Cloudflare Worker
- 자산 일부: Cloudflare R2

즉, 지금은 "사이트 전체가 Cloudflare 뒤에 있다"기보다
"API와 일부 자산은 Cloudflare를 사용하고, 웹 배포는 Vercel이 담당한다"에 가깝습니다.

### A. 웹사이트 SSL은 누가 담당하나

`grogrojello.com`을 Vercel 프로젝트에 연결하면, 웹사이트의 HTTPS 인증서는 기본적으로 Vercel이 처리합니다.

따라서 현재 구조에서 가장 중요한 것은:

1. Vercel에 도메인을 연결하는 것
2. DNS가 Vercel을 가리키게 하는 것
3. 브라우저에서 `https://grogrojello.com`이 정상 열리는지 확인하는 것

즉, 웹사이트 SSL 문제를 해결하는 주체는 지금 기준으로 Cloudflare라기보다 Vercel입니다.

### B. Cloudflare를 DNS 관리자로만 쓰는 경우

도메인 구매 후 네임서버를 Cloudflare로 옮기고 DNS만 Cloudflare에서 관리하는 방식은 가능합니다.

이 경우에도:

- 웹은 Vercel이 서빙
- API는 Cloudflare Worker가 서빙

형태가 됩니다.

즉, Cloudflare를 쓴다고 해서 웹 앱이 자동으로 Cloudflare에서 호스팅되는 것은 아닙니다.

### C. `Flexible` / `Full` SSL 설명은 언제 중요한가

이 설정은 주로 "Cloudflare가 프록시로 웹 서버 앞단에 서는 구조"에서 중요합니다.

하지만 현재처럼 Vercel을 웹 호스팅으로 쓰는 구조에서는,
이 논점보다 아래가 더 중요합니다.

- Vercel 커스텀 도메인 연결
- HTTPS 정상 발급 확인
- Firebase Authorized Domains 등록
- 실제 OAuth 로그인 테스트

즉, 지금 프로젝트에서 `Flexible` 과 `Full` 중 무엇을 고르는지가
최우선 체크포인트는 아닙니다.

### D. `Always Use HTTPS`는 개념적으로는 맞다

HTTPS 강제 자체는 좋은 설정입니다.

다만 현재 프로젝트에서는:

- 웹 도메인 `grogrojello.com`은 Vercel에서 HTTPS 응답
- API는 `https://api-grogrojello.grogrojello.workers.dev` 사용

상태이므로, 가장 먼저 볼 것은 "모든 실제 호출 URL이 이미 HTTPS인지"입니다.

현재 코드 기준으로는:

- Firebase RTDB URL: HTTPS
- Worker API URL: HTTPS
- 외부 에셋 다수: HTTPS

라서 기본 방향은 이미 맞습니다.

## 3. 필수 작업

### A. Vercel에 커스텀 도메인 연결

Vercel 프로젝트에 아래 도메인을 추가합니다.

- `grogrojello.com`
- `www.grogrojello.com`

권장 설정:

- Primary Domain: `grogrojello.com`
- `www.grogrojello.com` -> `grogrojello.com` 리다이렉트

점검 포인트:

- Vercel 프로젝트가 현재 이 저장소와 연결되어 있는지
- Production Deployment가 정상 동작 중인지
- SSL 인증서가 자동 발급되었는지

### B. DNS 설정

도메인 등록업체 또는 DNS 관리 서비스에서 Vercel이 안내하는 값으로 레코드를 연결합니다.

일반적으로 확인할 항목:

- `@` 루트 도메인 레코드
- `www` 서브도메인 레코드

주의:

- DNS 값은 Vercel 프로젝트 화면에 표시되는 현재 안내값을 그대로 써야 합니다.
- 도메인 공급자마다 `A`, `ALIAS`, `ANAME`, `CNAME flattening` 지원 방식이 다릅니다.
- 실제 레코드 타입은 Vercel 대시보드의 지시사항을 우선합니다.

### C. Firebase Authentication Authorized Domains 추가

Firebase 콘솔에서 아래 도메인이 승인되어 있어야 로그인 기능이 정상 동작합니다.

경로:

- Firebase Console
- Authentication
- Settings
- Authorized domains

추가 대상:

- `grogrojello.com`
- `www.grogrojello.com`

이미 있어야 하는 값:

- `localhost`

영향 받는 기능:

- 이메일 로그인
- Google 로그인
- Apple 로그인

### D. 실제 배포 후 로그인 동작 검증

아래 항목을 실제 도메인에서 확인합니다.

- `https://grogrojello.com` 접속 가능
- 새로고침 시 404 없이 SPA 라우팅 유지
- 회원가입 가능
- 이메일 로그인 가능
- Google 로그인 가능
- 로그아웃 후 재로그인 가능

현재 [`vercel.json`](/Users/somniavisk/Desktop/puzzleletic/vercel.json) 에 SPA rewrite가 있으므로,
도메인 연결 자체 때문에 라우팅 설정을 추가 수정할 가능성은 낮습니다.

## 4. Apple 로그인 사용 시 필수 추가 점검

Apple 로그인 사용 중이라면 Firebase만 수정해서 끝나지 않습니다.

### A. Firebase Apple Provider 설정 확인

Firebase Console > Authentication > Sign-in method > Apple에서 기존 설정이 유지되는지 확인합니다.

확인값:

- Service ID
- Team ID
- Key ID
- Private Key

### B. Apple Developer Portal 설정 확인

Apple Developer Portal의 Service ID 설정에서 아래 값을 점검합니다.

- Domains and Subdomains
- Return URLs

중요:

- 여기에는 보통 커스텀 웹 도메인보다 Firebase Auth 도메인인 `grogro-jello-4a53a.firebaseapp.com` 이 들어갑니다.
- Return URL도 일반적으로 `https://grogro-jello-4a53a.firebaseapp.com/__/auth/handler` 형식을 사용합니다.

즉, 웹사이트 도메인을 `grogrojello.com`으로 바꿔도 Apple 설정은 그대로 유지될 수 있습니다.
다만 실제 운영 도메인에서 Apple 로그인을 반드시 재테스트해야 합니다.

## 5. 현재 코드 기준으로 꼭 봐야 하는 파일

### A. Firebase 웹 설정

파일: [`src/firebase.ts`](/Users/somniavisk/Desktop/puzzleletic/src/firebase.ts)

현재 값:

- `authDomain: "grogro-jello-4a53a.firebaseapp.com"`

설명:

- 이 값은 보통 커스텀 웹 도메인으로 바꾸지 않습니다.
- Firebase 프로젝트의 Auth 도메인을 그대로 쓰는 것이 일반적입니다.
- 즉, `grogrojello.com` 연결만으로 이 파일을 수정해야 하는 것은 아닙니다.

### B. 프론트엔드 API 주소

파일: [`src/services/syncService.ts`](/Users/somniavisk/Desktop/puzzleletic/src/services/syncService.ts)

현재 값:

- `const API_BASE_URL = 'https://api-grogrojello.grogrojello.workers.dev';`

의미:

- 웹 도메인을 `grogrojello.com`으로 바꿔도 현재 API는 계속 별도 Cloudflare Worker 주소를 사용합니다.
- 이 상태로도 서비스는 동작 가능합니다.

지금 꼭 수정해야 하나:

- 아니요. 필수는 아닙니다.

언제 수정하나:

- API도 브랜드 도메인으로 맞추고 싶을 때
- 예: `https://api.grogrojello.com`

권장 개선:

- 장기적으로는 하드코딩 대신 환경변수로 분리
- 예: `VITE_API_BASE_URL`

### C. Worker CORS 정책

파일: [`backend/api-grogrojello/src/index.js`](/Users/somniavisk/Desktop/puzzleletic/backend/api-grogrojello/src/index.js)

현재 값:

- 허용 Origin 제한 적용 완료

현재 허용 목록:

- `https://grogrojello.com`
- `https://www.grogrojello.com`
- `http://localhost:5173`

상태:

- Cloudflare Worker 운영 배포 완료
- 운영 도메인에서 로그인 동작 확인 완료

## 6. 선택 작업

### A. API를 `api.grogrojello.com` 으로 브랜딩

선택 사항이지만 운영 완성도 측면에서 좋습니다.

필요 작업:

1. Cloudflare에서 Worker에 `api.grogrojello.com` 커스텀 도메인 연결
2. 프론트엔드의 API base URL 수정
3. 가능하면 환경변수로 분리
4. CORS 허용 Origin 재정리

수정 대상:

- [`src/services/syncService.ts`](/Users/somniavisk/Desktop/puzzleletic/src/services/syncService.ts)
- [`backend/api-grogrojello/src/index.js`](/Users/somniavisk/Desktop/puzzleletic/backend/api-grogrojello/src/index.js)

### B. `www` 정책 통일

아래 둘 중 하나를 고정해야 합니다.

- `grogrojello.com`를 대표 주소로 사용
- `www.grogrojello.com`를 대표 주소로 사용

대표 주소가 흔들리면 아래 문제가 생길 수 있습니다.

- OAuth 리디렉션 혼선
- canonical 중복
- 쿠키/세션 디버깅 혼선
- SEO 신호 분산

권장:

- `grogrojello.com`를 대표 주소로 사용

### C. Search Console / Analytics / 광고 픽셀 도메인 업데이트

도메인 운영 시작 후 아래 외부 서비스도 점검합니다.

- Google Search Console
- Google Analytics
- Meta Pixel
- 기타 광고/분석 스크립트

이 프로젝트 문서 기준으로는 아직 필수 설정 문서가 없으므로,
사용 중인 서비스가 있다면 별도 운영 문서로 분리하는 것이 좋습니다.

## 7. 최종 체크리스트

- Vercel에 `grogrojello.com` 추가 완료
- Vercel에 `www.grogrojello.com` 추가 완료
- 대표 도메인 결정 완료
- DNS 전파 완료
- SSL 인증서 발급 완료
- Firebase Authorized Domains에 `grogrojello.com` 추가 완료
- Firebase Authorized Domains에 `www.grogrojello.com` 추가 완료
- 실제 도메인에서 이메일 로그인 테스트 완료
- 실제 도메인에서 Google 로그인 테스트 완료
- Apple 로그인 사용 시 실제 도메인 테스트 완료
- 회원 데이터 동기화 API 호출 성공 확인
- 브라우저 콘솔에 CORS 오류 없는지 확인
- 새로고침 시 SPA 라우팅 정상 확인

## 8. 현재 프로젝트 기준 결론

`grogrojello.com` 연결 시 반드시 손봐야 하는 핵심은 아래입니다.

1. Vercel 커스텀 도메인 연결
2. DNS 연결
3. Firebase Authorized Domains 추가
4. 실제 로그인 재테스트

현재 기준으로 핵심 연결과 인증은 모두 정상 동작합니다.

실제 완료된 핵심 항목:

1. Vercel 커스텀 도메인 연결 완료
2. Namecheap DNS 연결 완료
3. Firebase Authorized Domains 추가 완료
4. 이메일 로그인 검증 완료
5. Google 로그인 검증 완료
6. Worker CORS 제한 및 재배포 완료

현재 남은 후속 개선 후보:

1. [`src/services/syncService.ts`](/Users/somniavisk/Desktop/puzzleletic/src/services/syncService.ts)의 API URL 환경변수화
2. `www.grogrojello.com`를 `grogrojello.com`으로 리다이렉트 통일
3. 필요 시 [`backend/api-grogrojello/src/index.js`](/Users/somniavisk/Desktop/puzzleletic/backend/api-grogrojello/src/index.js) 의 허용 Origin을 환경변수 기반으로 관리
