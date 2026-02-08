# Premium Features Documentation
# 프리미엄 기능 기술 문서

This document outlines the technical implementation of specific features available to Premium users.
이 문서는 프리미엄 유저에게 제공되는 특정 기능의 기술적 구현 내용을 다룹니다.

---

## 1. Duplicate Login Prevention (중복 로그인 방지)

### Overview (개요)
Prevents multiple devices from using the same Premium account simultaneously to ensure account security and prevent subscription abuse.
프리미엄 계정의 동시 접속을 차단하여 계정 보안을 강화하고 구독 악용을 방지합니다.

### Mechanism (작동 원리)
The system uses **Firebase Realtime Database (RTDB)** to track active sessions.
시스템은 **Firebase Realtime Database**를 사용하여 활성 세션을 추적합니다.

1.  **Session Creation (로그인 시):**
    *   When a user logs in (or refreshes and restores a session), a unique `sessionId` (timestamp + random string) is generated.
    *   This ID is saved to `/sessions/{uid}` in RTDB.
    *   *Note:* Free users skip this step to reduce database usage.

2.  **Session Monitoring (감시):**
    *   The client sets up a realtime listener on `/sessions/{uid}`.
    *   If the value in the database changes and does not match the local `sessionId`, it means another device has logged in.

3.  **Conflict Resolution (충돌 처리):**
    *   The `duplicateLoginAlert` is triggered.
    *   The user is forcibly logged out (`logout()`) on the current device.
    *   They are redirected to the Login page.

### Configuration (설정)

*   **Database Path:** `/sessions/{userId}`
*   **Target Users:** Premium Users Only (`subscription.isPremium === true`)
*   **Cost Efficiency:**
    *   Free users do NOT read/write to RTDB.
    *   RTDB usage scales linearly only with concurrent *Premium* users.

### Code Locations (관련 코드)

*   **`src/contexts/AuthContext.tsx`**:
    *   `generateSessionId()`: Creates unique session token.
    *   `monitorSession()`: Listens for remote changes.
    *   `handleDuplicateLogin()`: Executes logout and alert.
*   **`src/firebase.ts`**:
    *   Initializes `realtimeDb`.
*   **`src/i18n/locales/*.ts`**:
    *   Key `auth.duplicateLoginAlert`: "다른 기기에서 접속하여 로그아웃되었습니다."

### Troubleshooting (문제 해결)
*   **"Logged out immediately upon login":**
    *   Check if the user is clicking "Login" twice rapidly (race condition creating two sessions).
    *   Verify RTDB write permissions in Firebase Console.
*   **"Alert not showing":**
    *   Ensure the user is actually Premium.
    *   Check console for "🔥 RTDB Connection failed" errors.

---

## 2. Cloud Save Reliability (클라우드 저장 안정성)

### Overview
Premium users (and standard users) rely on Cloudflare Workers D1 for data persistence. To handle "Cold Starts" of Serverless functions, we implemented robust retry logic.

### Mechanism
*   **Timeout:** Increased from 5s to **15s** to allow Worker startup time.
*   **Retry Logic:** If sync fails, the client automatically retries up to **2 times** with a 1s delay.
*   **Hybrid Storage**: Feature uses both D1 (SQL) for analytics and formatted JSON text for full game state state preservation.

### Code Locations
*   **`src/services/syncService.ts`**: `syncUserData` function contains the retry loop and AbortController timeout logic.
