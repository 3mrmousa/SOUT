# SOUT — Server (`server/`)

> **Express 5 + Socket.IO 4 + Prisma 8 + PostgreSQL + Redis + Cloudflare R2 backend for SOUT.**

---

## Tech Stack

- **Runtime & Framework:** Node.js (ES Modules), Express `5.3`, TypeScript `6` (`tsx`)
- **Database & ORM:** PostgreSQL 15+ with Prisma 8 (`@prisma/orm-postgres` contract runtime)
- **Cache & OTP Store:** Redis (`ioredis` v6) for timed OTP codes and multi-step verification sessions
- **Real-Time Gateway:** Socket.IO `4.8` with JWT cookie handshake authentication, multi-session user rooms (`user:<userId>`), online presence, typing/recording indicators, catch-up delivery, and `force_logout`
- **Authentication & Security:**
  - `bcryptjs` password hashing
  - Dual `HttpOnly` cookies: short-lived JWT `access_token` (`15m`, includes `tokenVersion`) + single-use SHA-256 hashed `refresh_token` (`7d`)
  - PostgreSQL `FOR NO KEY UPDATE` row-level locks during token rotation, `logoutAll`, `resetPassword`, and `changePassword`
  - Instant cross-device session revocation via `User.tokenVersion` (validated in both `auth.middleware.ts` and `socket.ts`) + real-time Socket.IO `forceLogoutAllSessions`
  - Strict Zod v4 validation (`validate.middleware.ts`) with automatic email normalization (`.trim().toLowerCase()`) and lowercase-only usernames (`/^[a-z0-9_]+$/`)
- **Media Storage & Processing:** Multer (`memoryStorage`), `sharp`, and **Cloudflare R2** (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) for profile avatars and chat attachments (`IMAGE`, `VIDEO`, `AUDIO`/voice notes, `DOCUMENT`)
- **Email:** Nodemailer (`auth.mail.ts`) for registration OTP, welcome emails, forgot-password OTP, password-changed alerts, and 2-step email change verification

---

## API Modules (`/api`)

| Prefix | Module | Key Endpoints & Responsibilities |
| :--- | :--- | :--- |
| `/api/health` | `index.ts` | Health check (`GET /api/health`) |
| `/api/auth` | `modules/auth` | `POST /register/request`, `POST /register/verify`, `POST /login`, `POST /refresh`, `POST /logout`, `POST /logout-all`, `POST /password/forgot`, `POST /password/verify-otp`, `POST /password/reset`, `GET /me` |
| `/api/users` | `modules/user` | `GET /check-username`, `GET /search`, `GET /:id`, `PATCH /profile`, `DELETE /profile`, `PATCH /profile/image`, `DELETE /profile/image`, `PATCH /profile/username`, `PATCH /profile/password`, `POST /profile/email/request`, `POST /profile/email/verify-current`, `POST /profile/email/change` |
| `/api/conversations` | `modules/conversation` | `GET /`, `GET /contacts`, `GET /recipient/:recipientUsername`, `POST /`, `GET /:id` |
| `/api/messages` | `modules/message` | `GET /:conversationId`, `POST /:conversationId` (text + multi-file media/voice upload to R2) |

---

## Real-Time Socket.IO Events (`src/socket.ts`)

Every authenticated connection verifies the `access_token` cookie (including `tokenVersion`), adds `socket.id` to `onlineUsers` (`Map<userId, Set<socketId>>`), and joins room `user:<userId>`.

| Direction | Event | Purpose |
| :--- | :--- | :--- |
| Server → Client | `get_online_users`, `user_online`, `user_offline` | Multi-session aware presence (offline emitted only when last socket closes) |
| Server → Client | `new_conversation` | Real-time notification when another user starts a chat |
| Server → Client | `new_message`, `message_sent`, `message_delivered`, `messages_read` | Live message delivery, catch-up delivery on reconnect, and read receipts |
| Bidirectional | `typing` / `stop_typing` → `user_typing` / `user_stop_typing` | Live typing indicator |
| Bidirectional | `recording` / `stop_recording` → `user_recording` / `user_stop_recording` | Live voice-note recording indicator |
| Client → Server | `mark_as_read`, `ping` | Mark conversation messages as `READ` and latency check |
| Server → Client | `force_logout` | Instant real-time kick across all devices on `logoutAll` / password change / reset |

---

## Folder Structure

```text
server/
├── src/
│   ├── config/                  # mail.config.ts, r2.config.ts, redis.config.ts
│   ├── middlewares/             # auth.middleware.ts, multer.middleware.ts, validate.middleware.ts, error.middleware.ts
│   ├── modules/                 # auth, user, conversation, message (controller, routes, schema, service)
│   ├── prisma/                  # contract.prisma, contract.json, contract.d.ts, db.ts
│   ├── types/                   # Shared interfaces (SafeUser, ProfileImageJson, ChatMediaItem, JWTPayload, AuthRequest)
│   ├── utils/                   # errors/, mail/, otp/, password/, r2/, redis/, tokens/
│   ├── socket.ts                # Socket.IO server, cookie + tokenVersion auth, rooms, forceLogoutAllSessions
│   └── index.ts                 # Express + HTTP + CORS (web & mobile) + Socket.IO entrypoint
├── migrations/                  # PostgreSQL migrations
├── tests/                       # Node/tsx test suite
├── prisma.config.ts
└── package.json
```

---

## Getting Started

```bash
cd server
npm install
cp .env.example .env
```

Fill in `server/.env`:
- **Server & CORS:** `NODE_ENV`, `PORT` (`5000`), `CLIENT_URL` (`http://localhost:5001`), `MOBILE_URL` (`http://localhost` for local dev / `https://localhost` for prod)
- **Database & Cache:** `DATABASE_URL` (PostgreSQL 15+), `REDIS_URL`
- **Auth:** `JWT_SECRET`
- **Email (Nodemailer):** `MAIL_USER`, `MAIL_PASSWORD`
- **Cloudflare R2:** `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

Push the database schema and start the dev server on `http://localhost:5000`:

```bash
npx prisma db push
npm run dev
```

### Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start dev server with `tsx watch src/index.ts` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build (`node dist/index.js`) |
| `npm test` | Run tests with `tsx --test` |
