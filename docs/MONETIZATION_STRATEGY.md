# Monetization Strategy Proposal: "Puzzleletic" Premium
# 수익화 전략 제안서: "Puzzleletic" 프리미엄

> [!IMPORTANT]
> **Selected Strategy: Option C (The Grind Wall)**
> **결정된 전략: 옵션 C (노가다 장벽 모델)**
>
> This strategy allows free users to access all content (Stages 1-5) but significantly throttles their progression speed by restricting high-efficiency games compared to Premium users.
> 무료 유저는 모든 성장 콘텐츠를 이용할 수 있지만, 효율적인 게임이 제한되어 프리미엄 유저에 비해 성장이 4배 이상 느립니다.

---

## 1. Selected Model: "The Soft Paywall" (Option C)
## 1. 선정 모델: "소프트 페이월" (옵션 C)

*Core Philosophy: "Time is Money." (시간은 금이다)*

### Mechanism (메커니즘)
*   **Full Evolution Access:** Free users *can* evolve to Stage 5 (Adult). "No Hard Cap".
    *   **전체 성장 가능:** 성장 단계에 제한을 두지 않습니다. 무료 유저도 최종 단계까지 키울 수 있습니다.
*   **Restricted Minigames:** Free users can only play **"Basic Games" (Low XP)**.
    *   **미니게임 제한:** 무료 유저는 효율이 낮은 '기초 게임' (난이도 1~2)만 무제한 플레이 가능합니다.
*   **Premium Advantage:** Unlocks **"Pro Games" (High XP/GLO)**.
    *   **프리미엄 혜택:** 고효율(High XP) 미니게임을 해금하여 성장을 4배 이상 가속화합니다.

### The "Grind Gap" Analysis (노가다 격차 분석)
Why users will convert: To save time. (결제 이유: 시간 절약)

| Goal (목표) | Metric | Free User (Basic Games Only) | Premium User (Pro Games Unlocked) |
| :--- | :--- | :--- | :--- |
| **Reach Stage 4**<br>(청소년기 진입) | 판당 XP (Avg) | **~5 XP** | **~20 XP** |
| | 필요 판수 | **~700 판** | **~180 판** |
| | **소요 시간** | **약 20시간** 🐢 | **약 5시간** 🚀 |
| **Reach Stage 5**<br>(성체/졸업) | 소요 시간 | **약 66시간** | **약 16시간** |

> **Result:** Free users face a massive "Grind Wall" (20+ hours) to hit key milestones, creating a natural desire to upgrade without forcing them to quit.

---

## 2. Complementary Feature: "Vacation Mode"
## 2. 보완 기능: "휴가 모드" (유기 방지)

To sweeten the deal, Premium also solves the "Loss Aversion" problem.

*   **Problem:** High-level Jellos decay faster. Free users risk losing their 20-hour investment if they miss a week.
*   **Solution:** Premium includes **"Vacation Mode"** (Pause Decay).
    *   "You worked hard for 20 hours. Don't let it die. Protect your Jello forever."

---

## 3. Implementation Plan (Future)
## 3. 추후 개발 계획

This feature is currently **PLANNED** but **NOT IMPLEMENTED**.

1.  **Game Selection UI Update:**
    *   Add "Lock" icons 🔒 to Difficulty 3, 4, 5 buttons for Free users.
    *   Add label: "Premium Only (High XP)".
2.  **Upsell Modal:**
    *   Trigger when clicking a locked difficulty.
    *   Show the comparison: "Reaching Level 4 takes 20 hours... or 5 hours with Premium."
3.  **Vacation Mode Logic:**
    *   Update `gameTickService` to skip decay if `isPremium && isVacationMode`.

---

## 4. Current Pass Offering Segmentation (Temporary)
## 4. 현재 패스 상품 노출 분기 (임시)

> [!NOTE]
> The current implementation does **not** segment by billing country yet.
> For now, the app switches the offer display by the user's selected **language locale**.
> 현재 구현은 아직 **실제 결제 국가 기준 분기**가 아닙니다.
> 우선은 사용자의 **선택 언어 로케일**에 따라 상품 표시 형태를 나눕니다.

### Offer Types (상품 타입)

*   **Subscription Offer (구독형)**
    *   Annual Angel Pass
    *   Quarterly Jello Pass
*   **Duration Offer (기간형)**
    *   12-Month Angel Pass
    *   3-Month Jello Pass

### Current Locale Groups (현재 로케일 그룹)

#### Duration Offer Locales (기간형 노출 로케일)

*   `vi`, `vi-VN`
*   `id`, `id-ID`

#### Subscription Offer Locales (구독형 노출 로케일)

*   `en`, `en-US`, `en-UK`
*   `ko`
*   `es`, `es-ES`
*   `fr`, `fr-FR`
*   `ja`, `ja-JP`
*   `pt`, `pt-PT`
*   Any other locale not included in the duration list defaults to subscription.
    *   기간형 목록에 포함되지 않은 나머지 로케일은 기본적으로 구독형으로 처리합니다.

### Display Priority Rule (카드 우선 노출 규칙)

*   **Subscription Offer UI (구독형 UI)**
    *   The `Annual Angel Pass` card is shown first as the featured card.
    *   The `Quarterly Jello Pass` card is shown second as the secondary card.
*   **Duration Offer UI (기간형 UI)**
    *   The `3-Month Jello Pass` card is shown first as the featured card.
    *   The `12-Month Angel Pass` card is shown second as the secondary card.
*   In duration-offer locales, the two cards do not just swap order.
    *   The featured color treatment, CTA emphasis, and visual priority are also reversed.
    *   기간형 로케일에서는 카드 순서만 바뀌는 것이 아니라,
    *   강조 색상, CTA 스타일, 시각적 우선순위도 함께 반전됩니다.

### Implementation Reference (구현 위치)

*   `src/pages/ProfilePage.tsx`
    *   `durationOfferLanguages`
    *   `passOfferType`
    *   conditional card order / featured card rendering
*   `src/i18n/locales/*`
    *   `profile.subscription.yearly.subscriptionTitle`
    *   `profile.subscription.yearly.durationTitle`
    *   `profile.subscription.quarterly.subscriptionTitle`
    *   `profile.subscription.quarterly.durationTitle`
    *   `profile.oneTimePurchaseNote`
*   `src/pages/ProfilePage.css`
    *   featured / secondary card visual styling

### Intent (의도)

*   This is a lightweight first step to adapt pricing presentation by market.
*   It is intended for **UI exposure only** at this stage.
*   Actual store product / billing-country based segmentation should be added later if needed.
    *   현재는 **UI 노출 기준의 1차 분기**입니다.
    *   추후 필요 시 실제 스토어 상품 또는 결제 국가 기준으로 고도화합니다.

---

## Appendix: Rejected Options
## 부록: 보류된 옵션들

*   **Option A (Convenience Only):** Too weak. Users just endure the inconvenience.
*   **Option B (Hard Paywall):** Too harsh. Blocking evolution at Stage 3 risks users quitting early due to frustration.
