# Use Cases

Application-specific business rules. Each use case orchestrates one or more
repositories (via their `domain/repositories` interfaces) to fulfill a single
intent of the user, e.g. `RecordSaleUseCase`, `RecordPaymentUseCase`,
`AddDebtEntryUseCase`.

## Conventions

- One file per use case, named in `PascalCase` (e.g. `RecordSale.ts`).
- Default export is a class with a single `execute(input): Promise<Result<T>>`
  method, or a factory function returning `{ execute }`.
- Depend only on interfaces from `@domain/repositories`. Never import from
  `@data/*` or `@presentation/*`.
- Return `Result<T, DomainError>` (see `@core/utils/result`) — do not throw
  for expected failure modes.

This folder is intentionally left empty in the initial scaffold.
