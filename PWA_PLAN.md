# PWA + Time Tracking Notifications

## Context
The app is a fully client-side React/Vite project management dashboard with a working time-tracker (start/stop per task, active timer state in `TimeTrackingContext`). Currently there is no PWA support (no service worker, no manifest, no push notifications). The goal is to:
1. Make the app installable as a PWA
2. Send native push notifications reminding the user to start time tracking at the start of their working hours — **even when the browser is closed**, via the Web Push API
3. Automatically stop the running timer at the end of configured working hours (frontend + backend scheduled job)

---

## Implementation Plan

### Phase 1 — PWA Infrastructure

**1.1 Install package**
```
npm install -D vite-plugin-pwa@^0.21.0
```

**1.2 `vite.config.ts`** — add `VitePWA` plugin (last in plugins array):
- `strategies: 'injectManifest'`, `srcDir: 'src'`, `filename: 'sw.ts'`
- `registerType: 'autoUpdate'`, `injectRegister: 'auto'`
- `devOptions: { enabled: true }` for local SW testing
- Manifest: name, short_name, theme_color `#1e40af`, display `standalone`, icons at `/icons/pwa-192x192.png` and `/icons/pwa-512x512.png`
- Workbox: `navigateFallback: 'index.html'`, deny `/api/` from fallback, `NetworkOnly` for `/api/` runtime cache

**1.3 `src/sw.ts`** — custom service worker (new file):
- Import from `workbox-precaching` and `workbox-core`
- `skipWaiting()`, `clientsClaim()`, `precacheAndRoute(__WB_MANIFEST)`
- `push` event handler: parse `event.data.json()` → `self.registration.showNotification(title, options)` with `waitUntil`
- `notificationclick` event handler: `notification.close()` → `clients.matchAll()` → focus existing window or `openWindow(data.url ?? '/')`

**1.4 `index.html`** — add PWA meta tags:
- `theme-color`, `apple-mobile-web-app-capable`, `apple-touch-icon`

**1.5 `src/vite-env.d.ts`** — add `/// <reference types="vite-plugin-pwa/client" />`

**1.6 `src/main.tsx`** — add `import { registerSW } from 'virtual:pwa-register'; registerSW({ immediate: true });`

**1.7 `public/icons/`** — create `pwa-192x192.png` and `pwa-512x512.png` (simple placeholder icons)

---

### Phase 2 — Working Hours Logic (no React)

**2.1 `src/types/domain.ts`** — append:
```ts
export interface WorkingHoursSchedule {
  enabled: boolean;
  startTime: string;              // "HH:mm" 24h local, e.g. "09:00"
  endTime: string;                // "HH:mm" 24h local, e.g. "18:00"
  daysOfWeek: number[];           // 0=Sun…6=Sat
  reminderDelayMinutes: number;   // re-remind after N minutes of not tracking
}
```

**2.2 `src/lib/working-hours.ts`** — new pure utility (no React imports):
- `DEFAULT_SCHEDULE` constant (Mon–Fri, 09:00–18:00, 15 min reminder delay)
- `loadSchedule()` / `saveSchedule(s)` — read/write `'pmd:working_hours'` in localStorage
- `isWithinWorkingHours(schedule, now?)` — check day-of-week + HH:mm range
- `msUntilWorkEnd(schedule, now?)` — ms until `endTime` today (returns `Infinity` if past or not working day)
- `minutesSinceWorkStart(schedule, now?)` — minutes elapsed since `startTime` today (returns -1 if not a working day/before start)

---

### Phase 3 — React Hooks

**3.1 `src/hooks/useWorkingHours.ts`** — new hook:
```ts
function useWorkingHours() {
  const [schedule, setScheduleState] = useState<WorkingHoursSchedule>(loadSchedule);
  function updateSchedule(patch: Partial<WorkingHoursSchedule>) { /* merge + saveSchedule */ }
  return { schedule, updateSchedule };
}
```

**3.2 `src/hooks/usePWANotifications.ts`** — new hook:
- State: `permission` (reads `Notification.permission` on init, guarded by `typeof Notification !== 'undefined'`)
- `requestPermission()` async fn → `Notification.requestPermission()` → update state
- On `permission === 'granted'`: call `subscribeToPush()` to register/refresh Push subscription with backend
- `useEffect` (deps: `schedule`, `permission`, `activeEntry?.id`): sets up `setInterval(checkAndNotify, 60_000)` as **local fallback** when browser is open
- `checkAndNotify()`: same as before (local scheduling guard for when browser is open)
- `showSWNotification(title, body)`: `navigator.serviceWorker.ready` → `reg.showNotification()` with `tag: 'time-tracking-reminder'`; falls back to `new Notification()`
- Returns `{ permission, requestPermission, pushSubscribed }`

**3.2a `src/lib/push-subscription.ts`** — new pure utility:
- `urlBase64ToUint8Array(base64String)` — converts VAPID public key from base64url to `Uint8Array` (required by `PushManager.subscribe`)
- `subscribeToPush(publicKey: string): Promise<PushSubscription>` — calls `reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) })`
- `VAPID_PUBLIC_KEY` — reads from `import.meta.env.VITE_VAPID_PUBLIC_KEY`

**3.2b `src/services/notification.service.ts`** — add two new methods:
- `savePushSubscription(sub: PushSubscription): Promise<void>` → `POST /push-subscriptions` with `{ endpoint, keys: { p256dh, auth } }`
- `deletePushSubscription(endpoint: string): Promise<void>` → `DELETE /push-subscriptions` with `{ endpoint }`

These are called from `usePWANotifications` when subscribing/unsubscribing.

**3.3 `src/hooks/useAutoStopTimer.ts`** — new hook:
```ts
function useAutoStopTimer() {
  const { schedule } = useWorkingHours();
  const { activeEntry, stopTracking } = useTimeTracking();
  useEffect(() => {
    if (!schedule.enabled || !activeEntry) return;
    const ms = msUntilWorkEnd(schedule);
    if (ms <= 0 || ms === Infinity) return;
    const taskId = activeEntry.taskId;
    const id = setTimeout(() => stopTracking(taskId), ms);
    return () => clearTimeout(id);
  }, [schedule, activeEntry?.id]);
}
```

---

### Phase 3b — Environment Variable

**`.env` / `.env.local`** — add:
```
VITE_VAPID_PUBLIC_KEY=<base64url public key from backend setup>
```
This key is generated once on the backend (see Phase 5) and is safe to expose publicly.

---

### Phase 4 — Wiring

**4.1 `src/app/AppLayout.tsx`** — add two hook calls:
```ts
useAutoStopTimer();
usePWANotifications();
```

**4.2 `src/app/pages/SettingsPage.tsx`** — fill in two placeholder sections:

*Notifications category* (`activeCategory === 'notifications'`):
- "Notification Permission" row: shows current status badge + "Request Permission" button (calls `requestPermission()` from `usePWANotifications()`)
- Working Hours section built from `useWorkingHours()`:
  - Enable/disable toggle
  - `<input type="time">` for start and end times
  - Day-of-week checkboxes (Mon–Sun)
  - Number input for reminder delay (minutes)
  - All changes call `updateSchedule(patch)` — auto-saved to localStorage

*PWA tab* (`activeTab === 'pwa'`):
- "Install App" button wired to `beforeinstallprompt` event (store in `useRef`, expose via local `usePWAInstall` helper inline in the file)
- Show SW status (online/offline)
- Show Push Subscription status ("Push notifications active" / "Not subscribed") from `pushSubscribed` returned by `usePWANotifications()`

---

### Phase 5 — Backend Implementation

> The backend is a separate Node.js/NestJS (or Express) server. This phase documents the required additions. No files in this frontend repo are modified here.

**5.1 Generate VAPID keys (one-time)**
```bash
npx web-push generate-vapid-keys
```
Store in backend `.env`:
```
VAPID_PUBLIC_KEY=<base64url>
VAPID_PRIVATE_KEY=<base64url>
VAPID_SUBJECT=mailto:admin@yourdomain.com
```
Expose `VAPID_PUBLIC_KEY` to the frontend via `GET /api/config` or hardcode it in the frontend `.env`.

**5.2 Install `web-push` on the backend**
```bash
npm install web-push
npm install -D @types/web-push
```

**5.3 Database: `PushSubscription` table**
```
push_subscriptions
  id          uuid PK
  user_id     uuid FK → users.id
  endpoint    text UNIQUE
  p256dh      text   (encryption key)
  auth        text   (auth secret)
  created_at  timestamp
  updated_at  timestamp
```

**5.4 REST endpoints on the backend**
- `POST /push-subscriptions` — authenticated; upsert subscription row for current user (unique on `endpoint`)
- `DELETE /push-subscriptions` — authenticated; delete by `{ endpoint }` in body

**5.5 `WorkingHoursSchedule` on the backend**
The user's schedule must be stored server-side so the backend scheduler knows when to send push events. Options:
- Persist in `users.preferences` JSON column (already exists as `preferences?: Record<string, unknown>`)
- Or a dedicated `working_hours` table

Add endpoint: `PUT /users/me/working-hours` — saves `{ enabled, startTime, endTime, daysOfWeek, reminderDelayMinutes, timezone }`.  
The frontend should POST to this when the user saves settings (in addition to localStorage).  
**Important**: store `timezone` (IANA string, e.g. `"Asia/Tashkent"`) — the backend must convert local `startTime` to UTC for scheduling.

**5.6 Scheduled push job**
Use a cron library (`node-cron` or `@nestjs/schedule`) to run **every minute**:
```ts
// Pseudocode — runs every minute on the backend
cron.schedule('* * * * *', async () => {
  const nowUtc = new Date();

  // Find all users whose working hours are starting now (±1 min tolerance)
  // and who have no active time entry
  const candidates = await db.query(`
    SELECT u.id, u.working_hours, ps.endpoint, ps.p256dh, ps.auth
    FROM users u
    JOIN push_subscriptions ps ON ps.user_id = u.id
    WHERE u.working_hours->>'enabled' = 'true'
      AND /* startTime in user timezone matches nowUtc within 1 min */
      AND /* today is in daysOfWeek */
      AND NOT EXISTS (SELECT 1 FROM time_entries WHERE user_id = u.id AND end_time IS NULL)
  `);

  for (const user of candidates) {
    await webpush.sendNotification(
      { endpoint: user.endpoint, keys: { p256dh: user.p256dh, auth: user.auth } },
      JSON.stringify({
        title: 'Time to start tracking',
        body: 'Your work day has started. Tap to open the tracker.',
        icon: '/icons/pwa-192x192.png',
        tag: 'time-tracking-start',
        url: '/tasks',
      }),
    );
  }
});
```

Run a **second pass** at `startTime + reminderDelayMinutes` for users still not tracking.

**5.7 End-of-day auto-stop push + server-side timer stop**
Second cron job (also every minute):
```ts
// Find users whose endTime is now AND have an active time entry
// Stop the time entry in DB: UPDATE time_entries SET end_time = NOW() WHERE user_id = ? AND end_time IS NULL
// Send push notification: "Your work day has ended — timer stopped automatically"
```
This is the **true backend auto-stop** that works even when the browser is closed.

**5.8 `web-push` configuration (one-time at server startup)**
```ts
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);
```

**5.9 Push payload shape** (agreed contract between backend and `src/sw.ts`):
```ts
interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;       // replaces existing notification with same tag
  url?: string;       // opened on notificationclick
}
```
The SW `push` event handler parses this JSON and calls `self.registration.showNotification(title, { body, icon, tag, data: { url } })`.

---

## Critical Files

| File | Action |
|------|--------|
| `vite.config.ts` | Add VitePWA plugin |
| `index.html` | Add PWA meta tags |
| `src/vite-env.d.ts` | Add pwa-client type reference |
| `src/main.tsx` | Register SW |
| `src/sw.ts` | **New** — custom service worker |
| `public/icons/pwa-192x192.png` | **New** — 192px icon |
| `public/icons/pwa-512x512.png` | **New** — 512px icon |
| `src/types/domain.ts` | Add `WorkingHoursSchedule` |
| `src/lib/working-hours.ts` | **New** — pure schedule utilities |
| `src/hooks/useWorkingHours.ts` | **New** — schedule state hook |
| `src/hooks/usePWANotifications.ts` | **New** — notification scheduling hook + push subscribe |
| `src/hooks/useAutoStopTimer.ts` | **New** — auto-stop hook (frontend fallback) |
| `src/lib/push-subscription.ts` | **New** — VAPID key conversion + PushManager.subscribe |
| `src/services/notification.service.ts` | Add `savePushSubscription` + `deletePushSubscription` |
| `src/app/AppLayout.tsx` | Mount hooks |
| `src/app/pages/SettingsPage.tsx` | Fill Notifications + PWA tab |
| `.env.local` | Add `VITE_VAPID_PUBLIC_KEY` |

**Backend (separate repo):**
| Artifact | Action |
|----------|--------|
| `web-push` npm package | Install |
| `push_subscriptions` DB table | Create |
| `POST /push-subscriptions` | New endpoint |
| `DELETE /push-subscriptions` | New endpoint |
| `PUT /users/me/working-hours` | New endpoint |
| Cron job: start-of-day reminders | New scheduled task |
| Cron job: end-of-day auto-stop | New scheduled task |
| VAPID env vars | Generate + configure |

**Reuse existing:**
- `src/contexts/TimeTrackingContext.tsx` — `activeEntry`, `stopTracking()`
- `src/app/components/NotificationBell.tsx` — unchanged, handles in-app notifications
- `src/services/notification.service.ts` — extended, not replaced

---

## Known Limitations / Notes

- **Auto-stop fallback**: The frontend `useAutoStopTimer` fires when the tab is open. The backend cron job (Phase 5.7) is the reliable path and covers closed browsers.
- **Push delivery when browser is fully closed**: Works on Android Chrome/Edge and desktop Chrome/Edge. On iOS requires Safari 16.4+ with the app added to Home Screen. Firefox supports it but must have the browser process running.
- **Timezone handling**: The backend must store and use the user's IANA timezone (e.g. `Asia/Tashkent`) when scheduling the cron-based push. The frontend should send `Intl.DateTimeFormat().resolvedOptions().timeZone` when saving working hours.
- **Duplicate pushes**: The backend cron fires every minute; use a `daily_push_log` table or a Redis key `notif:{userId}:{date}:{type}` to ensure each reminder fires at most once per day.
- **Icon creation**: Placeholder PNG icons need to be created (solid color). For production, real branded icons should replace them.
- **Safari**: `apple-touch-icon` and `apple-mobile-web-app-capable` meta tags cover iOS "Add to Home Screen".

---

## Verification

**PWA + SW:**
1. `npm run build && npx serve dist` — Chrome DevTools → Application → Manifest: no errors, icons show
2. DevTools → Application → Service Workers — SW shows "Activated and running"
3. Offline: DevTools Network → Offline → reload → app shell loads from cache

**Local fallback notifications (browser open):**
4. Settings → Notifications → request permission → accept browser prompt
5. Set working hours to start 1 min from now, `reminderDelayMinutes: 2`, no active timer → wait → two notifications should fire via SW `showNotification`
6. Start a timer, set endTime to 1 min from now → frontend `useAutoStopTimer` stops it

**Push API (browser closed):**
7. Confirm `VITE_VAPID_PUBLIC_KEY` is set and matches the backend's `VAPID_PUBLIC_KEY`
8. Settings → Notifications → grant permission → check DevTools → Application → Push Messaging: subscription endpoint is shown
9. Backend: verify `push_subscriptions` table has a row for the user
10. Trigger test push from backend (e.g. a test route `POST /push-subscriptions/test`) → close the browser → notification appears via OS
11. Set `endTime` to 1 min from now, close browser → backend cron stops the timer entry in DB and sends "timer stopped" push notification

**Timezone:**
12. Set working hours start to 1 min from now in local time; verify backend receives the correct IANA timezone and the cron fires at the right UTC moment
