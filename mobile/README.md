# SOUT — Mobile App (`mobile/`)

> **Capacitor 8 Android (and iOS-ready) mobile app for SOUT — wrapping a statically exported Next.js 16 + React 19 + Socket.IO application.**

---

## Architecture & Differences from `client/`

`mobile/` shares the core React UI, Zustand stores, React Query hooks, and real-time messaging features of `client/`, adapted specifically for Capacitor WebViews:

- **Static Export (`next.config.ts`):** Uses `output: "export"`, `trailingSlash: true`, `images: { unoptimized: true }`, and `@tailwindcss/turbopack` so `npm run build` outputs a self-contained static bundle to `mobile/out/`.
- **No Server Middleware (`proxy.ts` removed):** Because static exports do not run a Node.js server on-device, route protection is handled client-side in `app/page.tsx`, `components/AppShell.tsx`, and `lib/request.ts` (with trailing-slash normalization for `/chat/` and `/login/`).
- **Direct Entry Routing (`app/page.tsx`):** Skips the web landing page and redirects straight to `/chat` (if authenticated) or `/login` (if unauthenticated) using `router.replace()`.
- **Native Android Integration (`android/`):**
  - Custom SOUT adaptive vector launcher icon (`android/app/src/main/res/drawable/ic_launcher_foreground.xml` over `#0B0D12`).
  - Native permissions in `AndroidManifest.xml` for `INTERNET`, `RECORD_AUDIO`, and `MODIFY_AUDIO_SETTINGS` (for in-chat voice note recording).

---

## Tech Stack

- **Native Bridge:** Capacitor `8.6` (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`)
- **Web Runtime:** Next.js `16.4.6` (Static Export), React `19.3`, Tailwind CSS v4
- **Data & Real-Time:** TanStack React Query v5, Zustand v5, `socket.io-client` v4
- **UI & Feedback:** `motion/react`, `lucide-react`, `react-hot-toast`

---

## Folder Structure

```text
mobile/
├── android/                         # Generated Android Studio / Gradle project
│   └── app/src/main/
│       ├── AndroidManifest.xml      # INTERNET, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS
│       └── res/                     # Custom SOUT adaptive icon & splash assets
├── app/
│   ├── page.tsx                     # Mobile splash redirect (/chat or /login)
│   ├── chat/page.tsx                # Real-time messaging workspace
│   ├── login/page.tsx               # Sign in + Forgot Password flow
│   ├── register/page.tsx            # Registration + Email OTP flow
│   ├── profile/                     # Profile & Settings pages
│   └── not-found.tsx
├── components/                      # Chat, VoiceMessage, AppShell (force_logout), Settings, UI
├── features/ / hooks/ / stores/     # API clients, React Query hooks, Zustand stores
├── lib/                             # request.ts (trailing-slash aware), socket.ts
├── out/                             # Static Next.js export synced into Android assets
├── capacitor.config.ts              # App ID (com.sout.app), webDir ("out"), server config
└── next.config.ts                   # output: "export", trailingSlash: true
```

---

## Getting Started (Android)

### Prerequisites
- **Node.js** v20+
- **Android Studio** (with Android SDK & Platform Tools / `adb`)
- Running **SOUT Backend** (`server/` on port `5000` or deployed HTTPS URL)

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Environment (`mobile/.env`)
For **local development** (Android Emulator or USB-connected Android phone using `adb reverse`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

> **Why `localhost:5000` + `adb reverse` locally?**
> Capacitor runs the WebView at `http://localhost` during local dev. Forwarding port `5000` over `adb reverse` keeps the app (`http://localhost`) and API (`http://localhost:5000`) **same-site**, so `HttpOnly` `SameSite=Lax` cookies work natively without HTTPS.

### 3. Build & Sync to Android
```bash
npm run build
npx cap sync android
```

### 4. Forward Port 5000 (Local Emulator or USB Phone)
While your emulator or USB-debugging phone is connected:
```powershell
adb reverse tcp:5000 tcp:5000
```

### 5. Open in Android Studio & Run / Export APK
```bash
npx cap open android
```
- **Run on Emulator or USB Phone:** Select your device in Android Studio and click **Run ▶** *(on Xiaomi/MIUI/Oppo phones, enable **Install via USB** in Developer Options)*.
- **Build Debug APK:** **Build → Build Bundle(s) / APK(s) → Build APK(s)** → `android/app/build/outputs/apk/debug/app-debug.apk`.
- **Build Release APK:** **Build → Generate Signed App Bundle / APK → APK**.
- **Debug WebView:** Open `chrome://inspect/#devices` in desktop Chrome while the app is running.

---

## Production Deployment Checklist

When pointing `mobile/` at a deployed **HTTPS** backend:
1. Update `mobile/.env` to your `https://` backend URLs (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`).
2. In `mobile/capacitor.config.ts`, switch `androidScheme: "https"` and remove `cleartext: true` / `allowMixedContent: true`.
3. In `mobile/android/app/src/main/AndroidManifest.xml`, remove `android:usesCleartextTraffic="true"`.
4. Ensure the backend allows `https://localhost` in CORS and sets production cookies with `sameSite: "none"` and `secure: true`.
5. Run `npm run build && npx cap sync android` and generate a signed release APK/AAB in Android Studio.

---

## Everyday Update Workflow

Whenever you update code inside `mobile/`:
```bash
npm run build
npx cap sync android
```
Then click **Run ▶** or **Build APK(s)** in Android Studio.
