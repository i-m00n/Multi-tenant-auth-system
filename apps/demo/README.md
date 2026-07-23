# Demo

React + Vite reference client built on `@auth-moon/sdk`. Exercises every API
feature (login/register, RBAC, audit log, rate limiting, tenant management)
against a running instance of `apps/api`. See the [root README](../../README.md)
for setup instructions — the whole stack is normally started with
`docker compose up` from the repo root.

## Scripts

```bash
npm run dev        # dev server on :5173, expects the API on :3000
npm run build
```

Set `VITE_API_URL` to point at a non-default API URL.
