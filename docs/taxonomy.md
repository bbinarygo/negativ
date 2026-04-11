# Negativ Error Code Taxonomy

**Filename Convention**
```
NEG-<httpStatus-or-000>-<category>-<subcode>.json
```

- Use the exact `httpStatus` number when present.
- Use `000` when `httpStatus` is `null` (non-HTTP errors like network offline).
- This keeps the folder sorted and instantly readable.

**Categories** (extensible via PR):
- `validation` → Input / form errors
- `auth` → Authentication issues
- `permission` → Authorization failures
- `resource` → 404-style missing items
- `timeout` → Time-based failures
- `rate-limit` → Throttling
- `server` → 5xx backend problems
- `network` → Connectivity
- `payment` → Financial flows

Use this taxonomy when contributing new codes.