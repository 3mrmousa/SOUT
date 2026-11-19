# SOUT — Client (`client/`)

> **Next.js 16 (App Router) frontend for SOUT — built with React 19, Tailwind CSS v4, TanStack React Query v5, Zustand, Motion, and Socket.IO.**

---

## Tech Stack

- **Framework:** Next.js `16.4.6` (App Router, Turbopack, React `19.3`)
- **Styling & Typography:** Tailwind CSS v4 + custom local fonts (`FKRasterRomanCompact`, `KHInterference`, `KHTeka`)
- **Interactive UI & Shaders:**
  - `FloatingLines` (WebGL2 interactive wave background on auth, profile, settings, and 404 pages)
  - `BranchedMenu` (SVG-branched collapsible sidebar navigation)
  - `SlingButton` (`motion/react` slingshot physics send button with particle burst)
  - `ThoughtLine` (shimmering typing indicator)
- **State & Data:** TanStack React Query v5 + Zustand v5
- **Real-Time:** `socket.io-client` v4
- **Icons & Feedback:** `lucide-react`, `react-hot-toast`

---

## Pages & Routes

| Route | Purpose |
| :--- | :--- |
| `/` | Main chat workspace (`AppShell`, `Sidebar`, `ChatHeader`, `ChatMessages`, `ChatInput`, `ChatProfile`) |
| `/login` | Sign in + Forgot Password OTP modal flow |
| `/register` | Two-step registration with email OTP verification |
| `/profile` | Bento-grid user profile with dynamic avatar aura & quick copy |
| `/profile/settings` | Account settings (avatar upload, bio/name, username, 2-step email change, password, active sessions) |
| `*` (`not-found.tsx`) | Standalone 404 page with `FloatingLines` background |

---

## Folder Structure

```text
client/
├── app/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── profile/
│   │   ├── page.tsx
│   │   └── settings/page.tsx
│   ├── not-found.tsx
│   ├── page.tsx
│   ├── layout.tsx               # Local fonts, metadata, favicon & QueryProvider
│   └── globals.css              # Dark obsidian theme (#0b0d12) & custom scrollbars
├── components/
│   ├── background/              # DynamicBackground + WebGL2 FloatingLines
│   ├── chat/                    # ChatHeader, ChatMessages, ChatInput, ChatProfile, SlingButton, ThoughtLine
│   ├── forgotPassword/          # Multi-step password reset modals
│   ├── modals/                  # AddModal, OtpVerificationModal
│   ├── profileSettings/         # ProfileAvatar, ChangeUsername, ChangeAbout, ChangeEmail (2-step), ChangePassword, Sessions
│   ├── ui/                      # shadcn/ui primitives
│   ├── AppShell.tsx             # Auth guard, Socket lifecycle, Ctrl+B / Ctrl+K shortcuts
│   ├── BranchedMenu.tsx         # Collapsible SVG-branched sidebar menu
│   ├── Sidebar.tsx / SidebarNav.tsx / SidebarProfile.tsx
│   └── Avatar.tsx / TopNav.tsx / LogoutButton.tsx
├── features/                    # API client modules (auth, user, conversation, message)
├── hooks/                       # React Query hooks (useCurrentUser, useContacts, etc.)
├── stores/                      # Zustand stores (useConversationStore, useSidebarStore)
└── lib/                         # request.ts (auto-401 refresh with deduplication), socket.ts
```

---

## Getting Started

```bash
cd client
npm install
cp .env.example .env.local
```

Set your environment variables in `.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
```

Run the development server on `http://localhost:5001`:

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
