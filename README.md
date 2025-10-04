# Reely

A modern full-stack TypeScript template with authentication and user management.

## Stack

### Backend
- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Hono](https://hono.dev)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: JWT-based with refresh tokens
- **Email**: [Resend](https://resend.com)
- **Validation**: [Zod](https://zod.dev)

### Frontend
- **Framework**: [React](https://react.dev) with TypeScript
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Internationalization**: [i18next](https://www.i18next.com) (English, Spanish, Portuguese)
- **Forms**: [React Hook Form](https://react-hook-form.com) with Zod validation

## Features

- 🔐 Complete authentication system (login, signup, password reset)
- 👥 User management with role-based access control (admin/user)
- 🌍 Multi-language support (EN, ES, PT)
- 📊 Data tables with advanced filtering and sorting
- 🎨 Modern, responsive UI with dark mode support
- 🔒 Protected routes and API endpoints
- ✉️ Email notifications for password reset
- 🚀 Rate limiting and security middleware

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd reely
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:

**Server** (`apps/server/.env`):
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
PORT=4444
JWT_SECRET="your-secret-key"
RESEND_API_KEY="your-resend-api-key"
CLIENT_URL=http://localhost:5173
```

**Client** (`apps/client/.env`):
```bash
VITE_API_URL=http://localhost:4444
```

4. Run database migrations:
```bash
cd apps/server
bun run db:push
```

5. Start the development servers:

**Server**:
```bash
cd apps/server
bun run dev
```

**Client**:
```bash
cd apps/client
bun run dev
```

The client will be available at `http://localhost:5173` and the server at `http://localhost:4444`.

## Project Structure

```
reely/
├── apps/
│   ├── client/          # React frontend
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── routes/      # TanStack Router routes
│   │   │   ├── services/    # API client
│   │   │   ├── lib/         # Utilities
│   │   │   └── i18n/        # Translations
│   │   └── package.json
│   └── server/          # Hono backend
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── db/          # Database schema
│       │   ├── lib/         # Utilities
│       │   └── middleware/  # Auth & security
│       └── package.json
└── package.json
```

## Available Scripts

### Server
- `bun run dev` - Start development server with hot reload
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio

### Client
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build

## License

MIT
