# Hooks

Cross-cutting React hooks that wire the UI to use cases / repositories.
Examples that will live here later:

- `useCustomers()` — wraps the customer repository with React state.
- `useSession()` — derives the current session from `useAuthStore` and
  `Supabase`'s `onAuthStateChange`.
- `useDebouncedValue(value, ms)` — generic UX helper.

Keep hooks framework-thin: they should call use cases, not contain business
logic themselves.
