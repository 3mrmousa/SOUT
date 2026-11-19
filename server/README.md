# SOUT — Server (`server/`)

> **Express 5 + Socket.IO + Prisma 8 + PostgreSQL + Redis backend for SOUT.**

---

## Tech Stack

- **Runtime & Framework:** Node.js (ES Modules), Express `5.3`, TypeScript `6` (`tsx`)
- **Database & ORM:** PostgreSQL 15+ with Prisma 8 (`@prisma/orm-postgres` contract runtime)
- **Cache & OTP Store:** Redis (`ioredis`) for timed OTP codes & verification sessions
- **Real-Time Gateway:** Socket.IO `4.8` with JWT cookie handshake authentication & online presence
- **Auth & Security:**
  - `bcryptjs` password hashing
  - Dual-token cookies (`HttpOnly`, `SameSite=Lax`): short-lived JWT access token + single-use SHA-256 hashed refresh token
  - PostgreSQL `FOR NO KEY UPDATE` row-level locks during token rotation & `logoutAll`
- **Validation:** Zod v4 (`validate.middleware.ts`)
- **Media & Mail:** Multer (`memoryStorage`) + Cloudinary SDK, Nodemailer

---

## API Modules (`/api`)

| Prefix | Module | Responsibilities |
| :--- | :--- | :--- |
| `/api/auth` | `modules/auth` | Register + OTP verify, Login, Refresh token rotation, Logout / Logout all, Forgot & Reset password |
| `/api/users` | `modules/user` | Current user profile, username/bio/name update, 2-step email change (current & new OTP), password change, avatar upload/remove, active sessions |
| `/api/conversations` | `modules/conversation` | List & open/create direct conversations |
| `/api/messages` | `modules/message` | Send, fetch, and mark messages as `SENT` / `DELIVERED` / `READ` |

---

## Folder Structure

```text
server/
├── src/
│   ├── config/                  # cloudinary.config.ts, mail.config.ts, redis.config.ts
│   ├── middlewares/             # auth, multer (memoryStorage), validate (Zod), global error handler
│   ├── modules/                 # auth, user, conversation, message (controller, routes, schema, service)
│   ├── prisma/                  # contract.prisma & db.ts (Prisma 8 contract runtime)
│   ├── types/                   # Shared TypeScript interfaces (SafeUser, ProfileImageJson, AuthRequest)
│   ├── utils/                   # cloudinary/, errors/, mail/, otp/, password/, redis/, tokens/
│   ├── socket.ts                # Socket.IO server, cookie auth, typing & presence events
│   └── index.ts                 # Express + HTTP + Socket.IO entrypoint
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

Configure `server/.env` (PostgreSQL `DATABASE_URL`, `REDIS_URL`, `JWT_*`, `CLOUDINARY_*`, and SMTP/Gmail credentials), then push/migrate the database and start dev mode on `http://localhost:5000`:

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

