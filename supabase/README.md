# Supabase setup for ListaPay

## 1. Create a project

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and **anon public key** into `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 2. Apply database schema

Open **SQL Editor** in the Supabase dashboard and run the **entire** script in one go:

`supabase/migrations/001_initial_schema.sql`

If you already ran an older version and see `current_store_id() does not exist`, run:

`supabase/migrations/002_fix_current_store_id.sql`

This creates tables, `setup_new_store()` for signup, and **row level security** policies scoped by `store_id`.

## 3. Auth settings

- Enable **Email** provider under Authentication → Providers.
- Under **Authentication → URL configuration**, set:
  - **Site URL:** `http://localhost:19006` (web dev — use `npm run web`, not `:8081`)
  - **Redirect URLs:** `http://localhost:19006`, `http://localhost:19006/**`, and `listapay://` (Expo Go on device)
- Add `EXPO_PUBLIC_WEB_URL=http://localhost:19006` to `.env` so sign-up emails use the correct confirm link.
- Confirmation links expire after a short time (default ~1 hour). If a link says **expired**, sign in with email/password or sign up again for a new email.
- Email confirm while only `npx expo start` is running (`:8081`) will show a database error; run `npm run web` instead.
- For development, you may disable **Confirm email** so sign-up returns a session immediately.

## 4. How sync works (offline-first)

1. All reads/writes go to **local SQLite** first.
2. Mutations enqueue rows in `sync_queue`.
3. When online and authenticated, `SyncOrchestrator` uploads pending rows to Supabase using the user JWT (RLS enforced).

Local data is never blocked waiting for the network.
