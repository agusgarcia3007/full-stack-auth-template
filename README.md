# Full-Stack Authentication Template

A production-ready, modern full-stack TypeScript template with complete authentication, user management, and role-based access control.

## ✨ Features

### Authentication & Security
- 🔐 Complete JWT-based authentication system
  - Secure signup with email verification
  - Login with credentials
  - Password reset flow
  - Email verification and resend functionality
  - Access tokens (15 min) + Refresh tokens (30 days)
- 🔒 Password hashing with Argon2id
- 🛡️ Security headers (CSP, HSTS, X-Frame-Options, etc.)
- 🚦 Rate limiting (global + endpoint-specific)
- 👮 Role-based access control (RBAC)
- 📧 Transactional emails with Resend

### User Management
- 👥 Admin dashboard with user management
- 📊 Advanced data tables (sorting, filtering, pagination)
- 🔍 User search and filtering
- ✏️ User profile editing
- 🔄 Session management (view/revoke active sessions)
- 🗑️ User deactivation

### Developer Experience
- 🌍 Multi-language support (EN, ES, PT)
- 🎨 Modern, responsive UI with dark mode
- 🔧 TypeScript strict mode
- ⚡ Bun for blazing-fast runtime and package management
- 🏗️ Monorepo architecture
- 📝 Zod validation on client and server
- 🎯 Type-safe API client with TanStack Query

## 🚀 Tech Stack

### Backend
- **Runtime**: [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- **Framework**: [Hono](https://hono.dev) - Ultrafast web framework
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: JWT with hashed tokens
- **Email**: [Resend](https://resend.com) - Modern email API
- **Validation**: [Zod](https://zod.dev) - TypeScript-first schema validation
- **Security**: Rate limiting, CORS, security headers

### Frontend
- **Framework**: [React 19](https://react.dev) with TypeScript
- **Build Tool**: [Vite](https://vitejs.dev)
- **Routing**: [TanStack Router](https://tanstack.com/router) - Type-safe routing
- **State**: [TanStack Query](https://tanstack.com/query) - Async state management
- **UI**: [shadcn/ui](https://ui.shadcn.com) - Beautiful, accessible components
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **i18n**: [react-i18next](https://react.i18next.com)
- **Forms**: [React Hook Form](https://react-hook-form.com) + Zod

## 📋 Prerequisites

- [Bun](https://bun.sh) >= 1.3.1
- PostgreSQL >= 14
- [Resend](https://resend.com) account (for emails)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd full-stack-auth-template
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up environment variables

Create `.env` files in both apps:

**Server** (`apps/server/.env`):
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CLIENT_URL=http://localhost:5173
EMAIL_FROM=noreply@yourdomain.com
```

**Client** (`apps/client/.env`):
```bash
VITE_API_URL=http://localhost:3000
```

### 4. Set up the database

```bash
cd apps/server

# Generate migration files from schema
bun run db:generate

# Apply migrations to database
bun run db:migrate

# (Optional) Open Drizzle Studio to view/edit data
bun run db:studio
```

### 5. Start development servers

**Option A: Start both servers (from root)**
```bash
bun run dev
```

**Option B: Start individually**
```bash
# Terminal 1 - Server
cd apps/server
bun run dev

# Terminal 2 - Client
cd apps/client
bun run dev
```

The client will be available at `http://localhost:5173` and the API at `http://localhost:3000`.

## 📁 Project Structure

```
/
├── apps/
│   ├── client/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/        # Reusable UI components
│   │   │   │   ├── ui/           # shadcn/ui components
│   │   │   │   └── ...           # Feature components
│   │   │   ├── routes/           # File-based routing
│   │   │   │   ├── __auth/       # Auth routes (login, signup, etc.)
│   │   │   │   ├── __app/        # Protected app routes
│   │   │   │   └── admin/        # Admin-only routes
│   │   │   ├── services/         # API client & React Query hooks
│   │   │   ├── i18n/             # Translations (en, es, pt)
│   │   │   ├── lib/              # Utilities and helpers
│   │   │   └── hooks/            # Custom React hooks
│   │   ├── index.html
│   │   └── package.json
│   │
│   └── server/                    # Hono backend
│       ├── src/
│       │   ├── routes/           # API endpoints
│       │   │   ├── auth.ts       # Authentication endpoints
│       │   │   ├── account.ts    # User account management
│       │   │   ├── sessions.ts   # Session management
│       │   │   └── admin/        # Admin-only endpoints
│       │   ├── db/
│       │   │   ├── schema.ts     # Drizzle schema definitions
│       │   │   └── index.ts      # Database connection
│       │   ├── middleware/       # Hono middleware
│       │   │   ├── auth.ts       # JWT authentication
│       │   │   └── role.ts       # Role-based access control
│       │   ├── lib/              # Utilities
│       │   │   ├── auth.ts       # Auth helpers (hash, verify, tokens)
│       │   │   ├── env.ts        # Environment validation
│       │   │   └── limiter.ts    # Rate limiting
│       │   ├── emails/           # Email templates
│       │   ├── constants/        # Constants and enums
│       │   └── types/            # TypeScript types
│       ├── drizzle/              # Generated migrations
│       ├── drizzle.config.ts     # Drizzle Kit configuration
│       └── package.json
│
├── packages/                      # (Future) Shared packages
│   └── shared/                    # Shared types, schemas, utils
│
├── CLAUDE.md                      # AI assistant guidelines
├── README.md                      # This file
├── tsconfig.json                  # Root TypeScript config
└── package.json                   # Workspace root
```

## 📜 Available Scripts

### Root
```bash
bun install              # Install all dependencies
bun run dev              # Start both client and server
bun run dev:client       # Start only client
bun run dev:server       # Start only server
bun run build            # Build both apps
```

### Server (`apps/server`)
```bash
bun run dev              # Start dev server with hot reload
bun run start            # Start production server
bun run build            # Build for production
bun run db:generate      # Generate migrations from schema
bun run db:migrate       # Apply migrations to database
bun run db:studio        # Open Drizzle Studio (visual DB editor)
```

### Client (`apps/client`)
```bash
bun run dev              # Start Vite dev server
bun run build            # Build for production
bun run preview          # Preview production build
bun run lint             # Run ESLint
```

## 🔐 Authentication Flow

### Signup
1. User submits email, password, and name
2. Server validates input and checks for existing email
3. Password is hashed with Argon2id
4. User record created, verification token generated
5. Verification email sent
6. Access and refresh tokens returned

### Login
1. User submits credentials
2. Server validates email and password
3. Access and refresh tokens generated and returned

### Token Refresh
1. Client sends refresh token
2. Server verifies token and checks if revoked
3. Old refresh token revoked
4. New access and refresh tokens generated

### Password Reset
1. User requests password reset with email
2. Server generates reset token (1 hour expiry)
3. Reset email sent with token link
4. User submits new password with token
5. Password updated, token revoked

### Email Verification
1. User receives verification email after signup
2. User clicks verification link
3. Server verifies token and marks email as verified
4. Token revoked

## 🗄️ Database Schema

### Users Table
- `id` (UUID, PK)
- `email` (Unique, Indexed)
- `passwordHash` (Argon2id)
- `name`
- `role` (Enum: admin, student)
- `emailVerified` (Boolean)
- `createdAt`, `updatedAt`

### Tokens Table
- `id` (UUID, PK)
- `userId` (FK → users.id)
- `token` (SHA-256 hash, Unique)
- `type` (Enum: access, refresh, password_reset, email_verification)
- `expiresAt` (Indexed)
- `revoked` (Boolean)
- `revokedAt`
- `createdAt`

**Indexes:**
- Composite index on `(userId, type, revoked)` for fast session queries
- Index on `expiresAt` for cleanup queries
- Index on `email` in users table

## 🔒 Security Features

- **Password Requirements**: Minimum 8 characters (extendable to require uppercase, lowercase, numbers, special chars)
- **Token Security**: All tokens SHA-256 hashed before database storage
- **Rate Limiting**:
  - Global: 100 requests per 15 minutes
  - Auth endpoints: 5 requests per 15 minutes per IP
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **SQL Injection Protection**: Drizzle ORM with parameterized queries
- **XSS Protection**: React's built-in escaping + CSP headers
- **CORS**: Configured for client origin only
- **Timing Attack Prevention**: Consistent error messages for auth failures

## 🌍 Internationalization

The app supports three languages out of the box:
- 🇺🇸 English (en)
- 🇪🇸 Spanish (es)
- 🇧🇷 Portuguese (pt)

### Adding Translations

1. Add keys to all locale files:
```json
// apps/client/src/i18n/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

2. Use in components:
```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  return <button>{t("common.save")}</button>;
}
```

## 🧪 Testing

This template uses Bun's built-in test runner:

```bash
bun test                 # Run all tests
bun test --watch         # Watch mode
bun test auth.test.ts    # Run specific file
```

Example test:
```ts
import { test, expect, describe } from "bun:test";
import { hashPassword, verifyPassword } from "./lib/auth";

describe("Password hashing", () => {
  test("should hash and verify password", async () => {
    const password = "SecurePass123!";
    const hash = await hashPassword(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
```

## 🚀 Deployment

### Environment Variables (Production)

Ensure these are set in production:
- `NODE_ENV=production`
- Strong `JWT_SECRET` (min 32 characters, cryptographically random)
- `DATABASE_URL` pointing to production database
- Valid `RESEND_API_KEY`
- `CLIENT_URL` with production frontend URL
- `EMAIL_FROM` with verified domain

### Build

```bash
# Build server
cd apps/server
bun run build

# Build client
cd apps/client
bun run build
```

### Server Deployment
The server can be deployed to any platform supporting Bun:
- Railway
- Fly.io
- AWS (with Bun layer)
- DigitalOcean App Platform

### Client Deployment
The client is a static SPA that can be deployed to:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login with credentials |
| POST | `/auth/logout` | Logout (revoke token) |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| POST | `/auth/verify-email` | Verify email with token |
| POST | `/auth/resend-verification` | Resend verification email |

### Protected Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/account` | User | Get current user |
| PATCH | `/account` | User | Update profile |
| GET | `/sessions` | User | List active sessions |
| DELETE | `/sessions/:id` | User | Revoke session |
| GET | `/admin/users` | Admin | List all users |
| GET | `/admin/users/:id` | Admin | Get user details |
| PATCH | `/admin/users/:id` | Admin | Update user |
| DELETE | `/admin/users/:id` | Admin | Delete user |
| GET | `/admin/dashboard` | Admin | Dashboard metrics |

## 🤝 Contributing

See [CLAUDE.md](./CLAUDE.md) for project standards and guidelines.

## 📄 License

MIT

---

**Built with ❤️ using Bun, Hono, Drizzle, React, and TypeScript**
