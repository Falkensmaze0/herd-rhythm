# Developers ChangeLog

## Debug & Config Fixes (Commit: auth-db-fix-2023)

- Resolved Hash Corruption: Manual DB insert truncated bcrypt (fixed via psql UPDATE with escaped full hash).
- Verified Bcrypt: Isolated test confirmed `compare('demo123', hash) === true` post-fix.
- Env Override: Documented `USE_MOCK_AUTH` impact—prevents unintended mock fallback.
- Runtime Tests: Curl API hits + server override confirmed endpoint/session creation.
- No Code Changes: Leveraged existing withFallback; added README tests/docs.
- Dependencies: Ensured bcryptjs consistency (salt 12); no new deps.

## Config & Runtime Fixes (Commit: mock-override-resolve)

- Confirmed env=true via behavior/logs; temp hardcoded false in useMockService for isolation.
- Enhanced login debug: Added USE_MOCK_AUTH log—visible in server console.
- Tests: Curl API + browser verified DB path (user found, password valid, JWT issued).
- Revert Plan: Remove temp override post-.env fix; preserve fallback for error resilience.
- No Deps: Leveraged existing bcrypt/Prisma; hot-reload 404s benign.