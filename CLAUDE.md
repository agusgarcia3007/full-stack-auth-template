---
description: Full-stack authentication template standards and guidelines
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

# Project Standards

## Runtime & Package Manager

Use **Bun** as the default runtime and package manager:

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install`, `yarn install`, or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or equivalent
- Bun automatically loads `.env` files - do NOT use `dotenv` package

## Stack

### Backend
- **Runtime**: Bun
- **Framework**: Hono (lightweight, fast web framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based with access (15min) and refresh tokens (30d)
- **Password Hashing**: Argon2id via `Bun.password.hash()`
- **Email**: Resend API for transactional emails
- **Validation**: Zod for runtime type validation
- **Security**: Rate limiting, security headers, CORS

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite (exception to Bun.serve - for HMR and dev experience)
- **Routing**: TanStack Router (file-based routing)
- **State Management**: TanStack Query for server state
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: i18next with react-i18next

## Architecture

### Monorepo Structure
```
/
├── apps/
│   ├── client/          # React frontend (Vite)
│   └── server/          # Hono backend (Bun)
├── packages/            # (Future) Shared code
│   └── shared/          # Shared types, schemas, constants
├── CLAUDE.md
├── README.md
└── package.json         # Workspace root
```

### Database Schema Standards

**Always include these fields in tables:**
- `id`: UUID primary key with `.defaultRandom()`
- `createdAt`: timestamp with `.defaultNow()`
- `updatedAt`: timestamp with `.defaultNow()` (update manually on modifications)

**Always add indexes for:**
- Foreign keys
- Fields used in WHERE clauses frequently
- Email, username, and other unique identifiers
- Composite indexes for common query patterns

Example:
```ts
export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
}));
```

## Code Standards

### TypeScript

**Strict Mode**: Always enabled
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true
}
```

**Never use `any`**. Use `unknown` and type guards instead.

### Zod Validation

Use modern Zod v4+ syntax:

```ts
const schema = z.object({
  email: z.email(),
  userId: z.uuid(),
  website: z.url(),
  birthdate: z.date(),
  port: z.coerce.number(),
});
```

**Password Validation Standard:**
```ts
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain special character");
```

### Authentication

**Token Storage:**
- Access tokens: Short-lived (15 minutes), stored in memory/state
- Refresh tokens: Long-lived (30 days), stored securely
- All tokens hashed (SHA-256) before storing in database

**JWT Payload:**
```ts
{
  sub: userId,      // Subject (user ID)
  role: userRole,   // User role for RBAC
  exp: timestamp,   // Expiration
  iat: timestamp,   // Issued at
}
```

**Endpoints Always Protected:**
- All admin routes: `/admin/*`
- User data routes: `/account/*`, `/sessions/*`
- Use `authMiddleware` and `requireRole` middleware

### Security Headers

Security headers are automatically applied via `securityHeaders` middleware in `src/middleware/security.ts`:

```ts
"X-Content-Type-Options": "nosniff"                      // Prevent MIME sniffing
"X-Frame-Options": "DENY"                                // Prevent clickjacking
"X-XSS-Protection": "1; mode=block"                      // Enable XSS filter
"Strict-Transport-Security": "max-age=31536000; includeSubDomains"  // Force HTTPS
"Content-Security-Policy": "default-src 'self'; ..."     // Restrict resource loading
"Referrer-Policy": "strict-origin-when-cross-origin"     // Control referrer info
"Permissions-Policy": "geolocation=(), microphone=(), camera=()"  // Disable features
```

**The middleware is already integrated in `src/index.ts`** - no additional setup needed.

### CSRF Protection

**This template does NOT require CSRF protection** because:

- ✅ Uses JWT tokens in `Authorization: Bearer <token>` headers (not cookies)
- ✅ Tokens are not automatically sent by the browser
- ✅ Attackers cannot force the browser to send auth tokens

**CSRF protection would be needed ONLY if:**
- ❌ Storing tokens in cookies with `SameSite=None`
- ❌ Using session-based authentication

If you modify this template to use cookie-based authentication, implement CSRF protection using:
```ts
import { csrf } from "hono/csrf";
app.use(csrf({ origin: env.CLIENT_URL }));
```

### Rate Limiting

**Global Default**: 100 requests per 15 minutes

**Endpoint-Specific:**
- Auth endpoints (login, signup, password reset): 5 requests per 15 minutes per IP
- Email sending: 3 requests per hour per email

### Error Handling

**Always use error codes** from `@/constants/error-codes`:
```ts
return c.json({
  error: "Email already registered",
  code: ERROR_CODES.EMAIL_ALREADY_EXISTS
}, 400);
```

**Never expose sensitive information** in error messages:
- ✅ "Invalid credentials"
- ❌ "Password incorrect" or "User not found"

**Structured Logging:**
```ts
console.error("[CONTEXT] Error description:", {
  userId,
  action: "login",
  error: error.message,
});
```

## Development Guidelines

### Code Style

**NEVER include inline comments** in code. If documentation is needed, use JSDoc:
```ts
/**
 * Verifies a JWT token and returns the user ID if valid
 */
export async function verifyToken(token: string): Promise<string | null> {
  // Implementation
}
```

**File naming:**
- React components: PascalCase (`UserProfile.tsx`)
- Utilities/hooks: camelCase (`useAuth.ts`, `formatDate.ts`)
- Routes: kebab-case (`forgot-password.tsx`)
- Constants: UPPER_SNAKE_CASE (`ERROR_CODES.ts`)

### Internationalization

When adding user-facing text, **ALWAYS add translations** to all locale files:
- `apps/client/src/i18n/locales/en.json`
- `apps/client/src/i18n/locales/es.json`
- `apps/client/src/i18n/locales/pt.json`

Example:
```json
{
  "auth": {
    "login": {
      "title": "Sign In",
      "submit": "Log In"
    }
  }
}
```

Usage:
```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
return <h1>{t("auth.login.title")}</h1>;
```

### Testing

Use `bun test` for all tests:

```ts
import { test, expect, describe } from "bun:test";

describe("Authentication", () => {
  test("should hash password correctly", async () => {
    const password = "SecurePass123!";
    const hash = await hashPassword(password);
    expect(await verifyPassword(password, hash)).toBe(true);
  });
});
```

**Test files**: Co-locate with source files using `.test.ts` suffix

### Environment Variables

**Server** (`apps/server/.env`):
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=3000
JWT_SECRET=your-secret-key-min-32-chars
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CLIENT_URL=http://localhost:5173
EMAIL_FROM=noreply@yourdomain.com
```

**Client** (`apps/client/.env`):
```bash
VITE_API_URL=http://localhost:3000
```

**Always validate environment variables** with Zod schemas in `lib/env.ts`

### Database Migrations

**Never edit migration files directly**. Always use Drizzle Kit:

```bash
# Generate migration from schema changes
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Open Drizzle Studio for visual editing
bun run db:studio
```

## Project-Specific Rules

### DO NOT

- ❌ Run the project manually (`bun run dev` or similar) - it's already running
- ❌ Use `console.log` for debugging - use proper logging with context
- ❌ Store passwords in plain text anywhere
- ❌ Return different error messages for "user not found" vs "wrong password"
- ❌ Skip validation on API endpoints
- ❌ Use HTTP in production (always HTTPS)
- ❌ Commit `.env` files (only `.env.example`)

### ALWAYS DO

- ✅ Use TypeScript strict mode
- ✅ Validate all user input with Zod
- ✅ Hash tokens before storing in database
- ✅ Use transactions for multi-step database operations
- ✅ Add indexes for frequently queried fields
- ✅ Implement rate limiting on sensitive endpoints
- ✅ Return consistent error formats with error codes
- ✅ Update `updatedAt` timestamp on record modifications
- ✅ Use `authMiddleware` for protected routes
- ✅ Translate all user-facing text

## API Response Formats

**Success:**
```ts
{
  data: T,
  message?: string
}
```

**Error:**
```ts
{
  error: string,
  code: string,
  details?: unknown
}
```

**Pagination:**
```ts
{
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

---

# Important Reminders

Do what has been asked; nothing more, nothing less.

**NEVER create files** unless they're absolutely necessary for achieving your goal.

**ALWAYS prefer editing** an existing file to creating a new one.

**NEVER proactively create documentation files** (*.md) or README files. Only create documentation files if explicitly requested by the User.
