# Plasmid

A sample-management web application for geological core samples (sediment cores, gravity/piston cores, etc.). Authenticated users can browse a samples database in a rich data table; admins can create, edit, and delete samples inline.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, React 19, React Compiler)
- **Database**: [Neon](https://neon.tech) serverless Postgres with [Drizzle ORM](https://orm.drizzle.team)
- **Authentication**: [Better Auth](https://better-auth.com) (email & password, password reset, admin plugin)
- **UI**: [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) components (Base UI), [next-themes](https://github.com/pacocoursey/next-themes) for dark mode
- **Data & Forms**: [TanStack Query](https://tanstack.com/query), [TanStack Table](https://tanstack.com/table), [TanStack Form](https://tanstack.com/form), [Zod](https://zod.dev) validation
- **Tooling**: [Biome](https://biomejs.dev) (lint/format), TypeScript, pnpm

## Features

- Email/password sign-up, sign-in, forgot/reset password flows (`src/app/(auth)/`)
- Session-protected dashboard with a sortable, filterable samples table
- Role-based access: admins get inline editing, row actions, and a sample creation/edit form
- Samples schema covering locality, coordinates, depth/elevation, collection metadata, ages, citations, and more (`src/db/samples-schema.ts`)
- CSV seed script that imports `sample_data.csv` into the database
- Mock email sender that logs to the console (`src/lib/email.ts`) — swap in a real provider for production

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (see `packageManager` in `package.json`)
- A Neon Postgres database

### Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env.local` in the project root:

   ```bash
   # Neon database connection
   DATABASE_URL=postgres://...      # pooled connection (app)
   DIRECT_URL=postgres://...        # direct connection (drizzle-kit)

   # Better Auth
   BETTER_AUTH_SECRET=...           # e.g. `openssl rand -base64 32`
   BETTER_AUTH_URL=http://localhost:3000
   ```

3. Push the schema and seed the database:

   ```bash
   pnpm db:push
   pnpm db:seed
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run the production server |
| `pnpm lint` | Check code with Biome |
| `pnpm format` | Format code with Biome |
| `pnpm db:push` | Push the Drizzle schema to the database |
| `pnpm db:generate` | Generate SQL migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm db:seed` | Seed the database from `sample_data.csv` |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # sign-in, sign-up, forgot/reset password pages
│   ├── api/auth/        # Better Auth API route handler
│   ├── dashboard/       # protected samples dashboard + server actions
│   ├── layout.tsx       # root layout (fonts, providers, theming)
│   └── page.tsx         # landing page
├── components/
│   ├── samples/         # samples table, columns, row actions, form sheet
│   └── ui/              # shadcn/ui components
├── db/                  # Drizzle client, auth & samples schemas, seed script
├── lib/                 # auth config, auth client, email, validation, utils
└── proxy.ts             # Next.js proxy (middleware) for route protection
```

## License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.
