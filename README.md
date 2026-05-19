# ListaPay

A React Native (Expo + TypeScript) app for Filipino sari-sari store owners.
ListaPay handles **inventory**, **point-of-sale**, **utang (debt) tracking**,
and **payment collection** — all with offline-first local storage and a
Supabase-backed cloud sync layer.

> Status: **scaffolding only**. No business features yet; this repo sets up
> the architecture, navigation, theming, state management, and data-layer
> placeholders.

---

## Stack

| Concern              | Choice                                                    |
| -------------------- | --------------------------------------------------------- |
| Runtime              | Expo SDK 54 (React Native 0.81, React 19)                 |
| Language             | TypeScript (strict, `noUncheckedIndexedAccess`)           |
| Navigation           | `@react-navigation/native` + native-stack + bottom-tabs   |
| State management     | [Zustand](https://github.com/pmndrs/zustand)              |
| Remote backend       | [Supabase](https://supabase.com) (`@supabase/supabase-js`)|
| Local database       | `expo-sqlite` (WAL, FK on, migration runner included)     |
| Secure key storage   | `expo-secure-store`                                       |
| Async storage        | `@react-native-async-storage/async-storage`               |

### Why Zustand?

For a POS / debt-tracking app, most domain state belongs in the local
database; the UI store mostly tracks **session**, **theme preference**, and
**bootstrap status**. Zustand gives us:

- ~1 KB runtime, TS-first API
- No providers/reducers/boilerplate
- Excellent React Native compatibility
- Selector-based subscriptions (no needless re-renders)

Redux Toolkit and Jotai are great too, but they bring more ceremony than we
need at this scale.

---

## Clean Architecture

```
src/
├── core/                       # Framework-agnostic primitives
│   ├── config/                 # env vars
│   ├── constants/              # app-wide constants
│   ├── errors/                 # AppError, DomainError, DataError, …
│   ├── types/                  # Result<T>, ID, Money, ISODateString …
│   └── utils/                  # currency, result, logger
│
├── domain/                     # Pure business model
│   ├── entities/               # Customer, Product, Sale, DebtEntry, …
│   ├── repositories/           # Repository INTERFACES (ports)
│   └── usecases/               # Application-specific orchestrations
│
├── data/                       # Adapters that implement the ports
│   ├── datasources/
│   │   ├── local/              # SQLite handle + migration runner
│   │   └── remote/             # Supabase client
│   ├── models/                 # Row / DTO shapes + mappers
│   └── repositories/           # Repository IMPLEMENTATIONS
│
└── presentation/               # UI
    ├── navigation/             # Root, Auth, Main tab navigators
    ├── theme/                  # Tokens + provider + useTheme()
    ├── stores/                 # Zustand stores
    ├── components/             # Themed primitives (Screen, Text, Button)
    ├── screens/                # Screen-level views
    └── hooks/                  # UI hooks
```

### Dependency rule

```
presentation ──▶ domain ◀── data
        \\                    /
         └──▶ core ◀─────────┘
```

- `domain/` depends on **nothing** but `core/`.
- `data/` depends on `domain/` (to implement repository ports) and `core/`.
- `presentation/` depends on `domain/`, `presentation/`-internal, and `core/`.
  It must **never** import from `data/*` directly — only through hooks/use
  cases that receive a repository via DI.

> The only intentional exception is `App.tsx`, which wires concrete
> implementations to interfaces at the composition root.

### TypeScript path aliases

| Alias              | Resolves to             |
| ------------------ | ----------------------- |
| `@/*`              | `src/*`                 |
| `@core/*`          | `src/core/*`            |
| `@domain/*`        | `src/domain/*`          |
| `@data/*`          | `src/data/*`            |
| `@presentation/*`  | `src/presentation/*`    |

Enabled via `experiments.tsconfigPaths: true` in `app.json`.

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Then edit .env and fill in your Supabase URL + anon key.
```

The Supabase client falls back to empty values if these are unset — the app
will still boot, but any remote calls will fail. Use `isSupabaseConfigured()`
from `@core/config/env` to guard remote-only code paths.

### 3. Run the app

```bash
npm run start        # Metro bundler + QR code
npm run android      # build/run on Android
npm run ios          # build/run on iOS (macOS only)
npm run web          # preview in browser
```

---

## Conventions

- **Errors**: throw the closest `AppError` subclass at layer boundaries; do
  not leak provider-specific errors (Supabase, SQLite) past `data/`.
- **Money**: persist as integer centavos (`Money` brand). Use `toMoney`,
  `fromMoney`, `formatMoney` from `@core/utils`.
- **IDs**: branded `ID` strings (UUID v4 in practice). Cast via
  `as ID` only at the data boundary.
- **Migrations**: append-only files in `src/data/datasources/local/migrations/`
  named `NNN_description.ts`. Never rewrite an applied migration; add a
  new one instead.
- **Imports**: prefer the `@…` path aliases over deep relative imports.

---

## Roadmap (post-scaffolding)

Each item should land as: domain entities (if new) → repository interface
→ data-layer implementation → use case → presentation hook → UI.

- [ ] Auth (Supabase email/password + biometric unlock)
- [ ] Customers (suki) CRUD
- [ ] Products / inventory CRUD
- [ ] POS sales ticket
- [ ] Utang ledger + payments
- [ ] Background sync (SQLite ↔ Supabase)
- [ ] Reports / dashboard KPIs
