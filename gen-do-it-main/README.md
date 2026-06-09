# TaskFlow — Task Management System

A production-ready task management system with authentication and role-based access control (RBAC), built with TanStack Start and Supabase.

## Features

- Email/password authentication with secure password hashing and JWT sessions
- Role-based access control (`user` / `admin`) with a separate `user_roles` table
- Full task CRUD (title, description, status, priority)
- Personal dashboard — users only see and manage their own tasks
- Admin panel — view all users, view all tasks, delete any task, delete any user
- Row-Level Security on every table (defense in depth)
- Modern responsive UI with toast notifications, loading states, and form validation
- Server-side input validation via Zod
- Leaked-password protection (HIBP) enabled at the auth layer

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, TanStack Router, TanStack Query, Tailwind CSS v4, shadcn/ui, sonner |
| Backend  | TanStack Start server functions (typed RPC) + Supabase (Postgres + Auth) |
| Database | Postgres with Row-Level Security policies |
| Auth     | Supabase Auth (email/password, JWT) |
| Validation | Zod (client + server) |

> Note: this project runs locally with Vite and uses Supabase for database/auth. App-internal logic uses `createServerFn` (typed RPCs), not Express routes.

## Database Schema

- `profiles` — `id` (FK → auth.users), `name`, `email`, `created_at`. Auto-created on signup via trigger.
- `user_roles` — `user_id`, `role` (enum: `user` | `admin`). Default `user` assigned on signup.
- `tasks` — `title`, `description`, `status` (pending/in_progress/completed), `priority` (low/medium/high), `created_by`, timestamps.

### Access rules (RLS)

- **Users** can read/create/update/delete only tasks where `created_by = auth.uid()`.
- **Admins** (via `has_role(uid, 'admin')` security-definer function) can read all profiles, all tasks, and delete any task.
- Only admins can mutate the `user_roles` table.

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx                  # root layout (Query provider, toaster)
│   ├── index.tsx                   # landing page
│   ├── auth.tsx                    # sign in / register
│   └── _authenticated/
│       ├── route.tsx               # auth gate (managed by Supabase authentication)
│       ├── dashboard.tsx           # user dashboard — task CRUD
│       └── admin.tsx               # admin panel
├── components/
│   ├── app-shell.tsx               # header, nav, sign out
│   └── ui/                         # shadcn primitives
├── hooks/
│   └── use-auth.ts                 # session + role hooks
├── lib/
│   └── admin.functions.ts          # server functions (admin delete-user)
└── integrations/supabase/          # auto-generated clients & types
```

## Routes / API

| Path | Type | Description |
|------|------|-------------|
| `/` | page | Public landing |
| `/auth` | page | Login + registration |
| `/dashboard` | protected | User task CRUD |
| `/admin` | protected + admin | All users & tasks |
| `adminDeleteUser` | server fn (RPC) | Admin-only, deletes auth user |

Task CRUD goes through the browser Supabase client; RLS policies enforce ownership. Admin-only mutations that need to bypass RLS (e.g. deleting an `auth.users` row) go through a `createServerFn` that re-verifies admin role server-side before using the service-role client.

## Becoming an Admin

By default, every new signup is a `user`. To promote yourself to `admin`, open the backend (Cloud → SQL) and run:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com';
```

Then refresh the app — the **Admin** tab will appear.

## Deployment

Build the app with `npm run build` and deploy to any host that supports Vite and a Node-compatible SSR environment. Configure Supabase environment variables in your target deployment so database/auth work correctly.

## Future Improvements

- Pagination & search/filter on task and admin lists
- Realtime task updates via Postgres replication
- File attachments on tasks (Supabase storage)
- Email notifications on task assignment
- Audit log of admin actions
