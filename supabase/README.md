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
- For development, you may disable **Confirm email** so sign-up returns a session immediately.

## 4. How sync works (offline-first)

1. All reads/writes go to **local SQLite** first.
2. Mutations enqueue rows in `sync_queue`.
3. When online and authenticated, `SyncOrchestrator` uploads pending rows to Supabase using the user JWT (RLS enforced).

Local data is never blocked waiting for the network.
