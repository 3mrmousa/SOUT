# SOUT — Web Client (`client/`)

> **Next.js 16 (App Router) web frontend for SOUT — built with React 19, Tailwind CSS v4, TanStack React Query v5, Zustand v5, Motion, and Socket.IO.**

---

## Tech Stack

- **Framework:** Next.js `16.4.6` (App Router, Turbopack, React `19.3`)
- **Styling & Typography:** Tailwind CSS v4 (`@tailwindcss/turbopack`, shadcn/ui utilities) + Google `Geist` & custom local fonts (`FKRasterRomanCompact`, `KHInterference`, `KHTeka`)
- **Interactive UI & Shaders:**
  - `FloatingLines` — WebGL2 interactive wave shader background on landing, auth, profile, settings, and 404 pages
  - `BranchedMenu` — SVG-branched collapsible sidebar navigation
  - `SlingButton` — `motion/react` slingshot physics send button with particle burst
  - `ThoughtLine` — shimmering typing indicator
  - `VoiceMessage` & `CustomAudioPlayer` — in-chat voice note recording and playback
- **State & Data:** TanStack React Query v5 + Zustand v5 (`useConversationStore`, `useSidebarStore`)
- **Real-Time:** `socket.io-client` v4
- **Icons & Notifications:** `lucide-react`, `react-hot-toast`

---

## Pages & Routes

| Route | Access | Purpose |
| :--- | :--- | :--- |
| `/` | Public | Marketing landing page (`Header`, `Hero`, `Features`, `Footer`) with `DynamicBackground` |
| `/chat` | Protected | Main real-time chat workspace (`AppShell`, `Sidebar`, `ChatHeader`, `ChatMessages`, `ChatInput`, `VoiceMessage`, `ChatProfile`) |
| `/login` | Public (guests) | Sign in (email or lowercase username) + multi-step Forgot Password OTP modal flow |
| `/register` | Public (guests) | Two-step registration with email OTP verification |
| `/profile` | Protected | Bento-grid user profile with dynamic avatar aura & quick copy |
| `/profile/settings` | Protected | Account settings: avatar upload/remove, bio/name, username, 2-step email change, password change, sessions (`logout` / `logoutAll`), and account deletion |
| `*` (`not-found.tsx`) | Public | Standalone 404 page with `FloatingLines` background |

---

## Key Features

- **Server-Side Route Guard (`proxy.ts`):** Next.js 16 `proxy.ts` + `middleware/redirect.middleware.ts` protects private routes (`/chat`, `/profile/*`) using session cookies and redirects logged-in users away from `/login` and `/register` to `/chat`.
- **Resilient API Client (`lib/request.ts`):** Automatically sends `HttpOnly` cookies (`credentials: "include"`), detects `401` responses, deduplicates concurrent `/auth/refresh` requests with a shared `refreshPromise`, retries seamlessly, and redirects on permanent auth failure.
- **Rich Real-Time Messaging:** Instant messaging, optimistic uploads for images/videos/voice notes/documents (stored on Cloudflare R2), live online presence, `typing` (`ThoughtLine`) & `recording` indicators, date dividers, and `SENT` / `DELIVERED` / `READ` receipts.
- **Multi-Device Session Sync:** `AppShell.tsx` manages the Socket.IO connection lifecycle, keyboard shortcuts (`Ctrl+K` add chat, `Ctrl+B` toggle sidebar), and listens for `force_logout` to immediately sign out all open browser tabs when **Logout All** or a password change is triggered from another device.

---

## Folder Structure

```text
client/
├── app/
│   ├── chat/page.tsx                # Main real-time messaging workspace
│   ├── login/page.tsx               # Login + Forgot Password modal
│   ├── register/page.tsx            # Register + Email OTP modal
│   ├── profile/
│   │   ├── page.tsx                 # User profile view
│   │   └── settings/page.tsx        # Account & security settings
│   ├── not-found.tsx                # Custom 404 page
│   ├── page.tsx                     # Public landing page
│   ├── layout.tsx                   # Fonts (Geist + local fonts), metadata & QueryProvider
│   └── globals.css                  # Obsidian dark theme (#0b0d12) & custom scrollbars
├── components/
│   ├── background/                  # DynamicBackground + WebGL2 FloatingLines
│   ├── chat/                        # ChatHeader, ChatMessages, ChatInput, ChatProfile, VoiceMessage, SlingButton, ThoughtLine
│   ├── forgotPassword/              # 3-step password reset modals
│   ├── landingPage/                 # Header, Hero, Features, Footer
│   ├── modals/                      # AddModal, OtpVerificationModal
│   ├── profileSettings/             # ProfileAvatar, ChangeUsername, ChangeAbout, ChangeEmail (2-step), ChangePassword, Sessions, DeleteAccount
│   ├── ui/                          # button, CustomAudioPlayer, Skeleton
│   ├── AppShell.tsx                 # Auth guard, Socket lifecycle, force_logout listener, shortcuts
│   ├── BranchedMenu.tsx             # Collapsible SVG-branched sidebar menu
│   ├── Sidebar.tsx / SidebarNav.tsx / SidebarProfile.tsx / Contacts.tsx
│   └── Avatar.tsx / TopNav.tsx / LogoutButton.tsx
├── features/                        # Typed API clients (auth, user, conversation, message)
├── hooks/                           # React Query hooks (useCurrentUser, useContacts, useConversation, useSeachUsers)
├── lib/                             # request.ts (auto-401 refresh deduplication), socket.ts, utils.ts
├── middleware/                      # redirect.middleware.ts
├── providers/                       # QueryProvider.tsx
├── stores/                          # Zustand stores (useConversationStore, useSidebarStore)
├── utils/                           # dateTag.ts
├── proxy.ts                         # Next.js 16 proxy entrypoint
└── next.config.ts                   # Turbopack CSS loader & Next.js config
```

---

## Getting Started

```bash
cd client
npm install
cp .env.example .env.local
```

Configure `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Start the development server on `http://localhost:5001`:

```bash
npm run dev
```

### Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Next.js dev server on port `5001` |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with `tsx --test` |
