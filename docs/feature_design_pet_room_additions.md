# Pet Room Enhancement Design: Camera & Jello House

> **Goal**: Add social sharing (Camera) and sleep/upgrade mechanics (Jello House) to the Pet Room.

---

## 📍 UI Placement Strategy

To maintain a clean interface while adding "ground" elements as requested, we will utilize the `RoomBackground` depth.

### Current Layout Analysis
*   **Header**: Stats & Profile (Top)
*   **Floating UI**: Shop/Premium Buttons (Bottom Right)
*   **Ground**: Occupies bottom 80% of screen.
*   **Character**: Moves randomly in the center area.

### Proposed Placement
We will add two physical objects to the room scene (rendered behind the character but in front of the background wall).

```
+--------------------------------------------------+
|      [Header: Stats & Profile]                   |
|                                                  |
| [Wall Area]                                      |
|                                                  |
|--------------------------------------------------| <-- Horizon Line
| [Floor Area]                                     |
|                                     [Shop Btn]   |
|   [Jello House]                                  |
|   (Bottom Left)                    [Premium]     |
|   📍 left: 10%                                   |
|   📍 bottom: 40%                                 |
|                                                  |
|                  [Character]                     |
|                                                  |
|   [Camera Tripod]                                |
|   (Bottom Right Corner)                          |
|   📍 right: 5%                                   |
|   📍 bottom: 5%                                  |
|                                                  |
+--------------------------------------------------+
```

1.  **Jello House (⛺)**: Placed on the **Left** side, resting on the "floor" near the horizon. It acts as a permanent fixture.
2.  **Camera Tripod (📷)**: Placed on the **Bottom Right** (or Bottom Left if House is too big), acting as an interactive toy/tool on the floor.

---

## 📸 Feature 1: Pet Room Camera

### Functionality
*   **Trigger**: Clicking the Camera Tripod object on the floor.
*   **Action**: Captures the current state of the `PetRoom` using `html-to-image`.
*   **Output**: Opens a modal showing the snapshot with options.

### Snapshot Modal UI
*   **Preview**: Large display of the captured image.
*   **Branding Overlay**: Automatically adds "Puzzletic" logo/watermark to the image during capture.
*   **Buttons**:
    *   `📥 Download`: Saves image to device.
    *   `🔗 Share`: Uses Web Share API (mobile native share) if available, or copies link.
    *   `🏠 Close`: Returns to game.

### Technical Implementation
*   **Library**: `html-to-image` (Already in dependencies).
*   **Component**: `<CameraObject />` in `PetRoom.tsx`.
*   **Logic**:
    *   Hide UI elements (buttons, menus) temporarily during capture.
    *   Capture `#pet-room-container`.
    *   Restore UI.

---

## ⛺ Feature 2: Jello House & Sleep System

### Functionality
*   **State**: Jello can be `Active` or `Sleeping`.
*   **Interaction**: Text/Click the House to toggle state.
    *   If **Active**: Jello walks to house -> Disappears inside -> State becomes `Sleeping`.
    *   If **Sleeping**: House shakes -> Jello pops out -> State becomes `Active`.
*   **Effect**:
    *   **Sleeping**: Hunger & Happiness decay rate reduced by **50%** (1/2 speed).
    *   **Visual**: Zzz animation over the house.

### Upgrade System
*   **Shop Integration**: "House" category in the Shop.
*   **Currency**: GLO.
*   **Tiers**:

| Icon | Name | Price (GLO) | Description |
| :--- | :--- | :--- | :--- |
| ⛺ | **Tent** | Free | Basic shelter. Cozy! |
| ⛪ | **Church** | 1,000 | Peaceful sanctuary. |
| 🕌 | **Mosque** | 2,500 | Beautiful dome. |
| 🛕 | **Hindu Temple** | 5,000 | Ancient decorative temple. |
| 🕍 | **Synagogue** | 5,000 | Historic gathering place. |
| 🏯 | **Japanese Castle** | 10,000 | Majestic eastern fortress. |
| 🏰 | **European Castle** | 15,000 | Royal western fortress. |
| 🏢 | **Skyscraper** | 30,000 | Modern luxury living. |
| 🎪 | **Circus Tent** | 50,000 | Fun never ends! |

### Technical Implementation

#### 1. NurturingContext Updates
*   **State**: Add `isSleeping` (boolean) and `currentHouseId` (string) to `NurturingPersistentState`.
*   **Tick Logic**:
    *   In `runGameTick` (or `executeGameTick`), apply modifier:
    ```typescript
    // Pseudo-code
    const decayMultiplier = state.isSleeping ? 0.5 : 1.0;
    newStats.fullness -= (DECAY_RATE * decayMultiplier);
    ```
*   **Actions**:
    *   `toggleSleep()`: Handles transition logic.
    *   `upgradeHouse(houseId)`: Deducts GLO, updates `currentHouseId`.

#### 2. Visual Implementation
*   **Component**: `<JelloHouse type={currentHouseId} isSleeping={isSleeping} />`
*   **Animation**:
    *   **Enter**: CSS transition `transform: scale(0)` or opacity fade when moving to house coordinates.
    *   **Sleep**: Animated `Zzz` bubbles rising from the house.

---

## 🗓️ Execution Plan

1.  **Phase 1: Logic Core**
    *   Update `NurturingContext` with `isSleeping` state and tick modifiers.
    *   Mock interaction to test decay rate.

2.  **Phase 2: Jello House UI**
    *   Implement `<JelloHouse>` component.
    *   Add House assets (emojis for now).
    *   Implement "Enter/Exit" animations.
    *   Add "House" tab to Shop Menu.

3.  **Phase 3: Camera Feature**
    *   Implement `<CameraObject>` component.
    *   Implement `html-to-image` capture logic.
    *   Create Snapshot Preview Modal.

