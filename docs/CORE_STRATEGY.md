# Core Development Strategy

## Vision
**"Quality Learning for Every Student"**

Our ultimate goal is to provide high-quality educational game services to **100 million students worldwide** at an affordable cost of **$1 per month**.

## Key Principles

### 1. Extreme Server Minimization
To achieve the $1/month price point for a massive user base, we must minimize per-user infrastructure costs.
- **Client-Side Heavy**: The application logic, game mechanics, and rendering should run entirely on the user's device.
- **Stateless Architecture**: Avoid maintaining persistent server connections (WebSockets) unless absolutely necessary.

### 2. Efficient Data Storage
- **Core Data Only**: We will identify and store *only* the most critical user data (e.g., account credentials, high-level progress, purchase history) on the server.
- **Local Persistence**: Granular game states (specific puzzle moves, temporary logs, detailed interactions) should be stored locally (e.g., `localStorage`, IndexedDB) and synced sparingly.
- **Low-Cost Infrastructure**: Utilize cost-effective serverless solutions (e.g., Firebase, Supabase, Cloudflare Workers) and free tiers where applicable to keep operational costs near zero per incremental user.

### 3. Traffic Optimization
- **Asset Externalization**: All heavy assets (images, sounds, models) should be served via CDNs or cached aggressively on the client to minimize bandwidth costs.
- **Offline First**: The game should remain functional even with intermittent network connectivity, syncing only when a connection is restored.

## Roadmap Alignment
This strategy drives our technical choices:
- Use of **React/Vite** for a robust client-side SPA.
- **Authentication**: Firebase Auth (Free tier, unlimited email logins).
- **Server Logic**: Cloudflare Workers (Edge computing, low cost).
- **Assets**: Cloudflare R2/Images (Already in use).
- **Data Storage**: LocalStorage + Cloud Sync (Google Drive/iCloud to be implemented).
