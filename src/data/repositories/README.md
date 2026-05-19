# Repository Implementations

Concrete implementations of the `domain/repositories` interfaces (ports).

## Conventions

- One file per repository, named `Xxx<Source>Repository.ts` where `<Source>`
  is the data backend (e.g. `CustomerSqliteRepository`,
  `CustomerSupabaseRepository`, `CustomerSyncRepository`).
- Implementations may depend on `@data/datasources/*` and `@core/*`. They
  must NOT depend on `@presentation/*`.
- All errors raised by data sources should be wrapped in a `DataError`
  (see `@core/errors`) before they leave the data layer.

This folder is intentionally left empty in the initial scaffold — wire up
implementations incrementally as each feature lands.
