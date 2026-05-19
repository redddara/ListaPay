# Data Models / DTOs

Row shapes and remote DTOs that mirror the underlying storage. Mappers in
this folder are responsible for translating between these wire/row formats
and the pure `@domain/entities` types.

Example layout (to be filled in alongside features):

```
models/
├── customer/
│   ├── CustomerRow.ts        # SQLite row shape
│   ├── CustomerDto.ts        # Supabase REST shape
│   └── mappers.ts            # rowToEntity / dtoToEntity / entityToRow
└── …
```
