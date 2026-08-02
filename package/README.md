# @auth-moon/sdk

TypeScript SDK for the [Multi-Tenant Auth System](../README.md). It handles
authentication, automatic token refresh, tenant-aware routing, typed
responses, and typed errors, so an application can talk to the API without
managing session state by hand.

**Features**

- Automatic refresh-token rotation, coordinated across browser tabs
- In-memory access tokens (never `localStorage`/`sessionStorage`)
- Cross-tab session sync via `BroadcastChannel` + Web Locks
- Typed API responses and a typed error hierarchy (`AuthError`,
  `ValidationError`, `RateLimitError`, etc.)
- Tenant-aware routing — the SDK builds `/{tenantSlug}/api/...` for you
- Separate clients for tenant users and the platform (super-admin) account

> **Note:** this package is part of the monorepo workspace (`package/`) and
> is not yet published to npm — consume it via the workspace (`apps/demo`
> does this) or copy the `src/` directory into your project.

## Install (within this workspace)

```json
{
  "dependencies": {
    "@auth-moon/sdk": "*"
  }
}
```

## Quick start

```ts
import { createAuthClient } from "@auth-moon/sdk";

const sdk = createAuthClient({ baseUrl: "https://your-auth-server.com", tenantSlug: "acme" });

await sdk.auth.initialize();               // restore a session if one exists
await sdk.auth.login("user@acme.com", "password123");
const me = await sdk.users.getMe();
```

That's the whole lifecycle — token storage, refresh, and headers are all
handled internally. See below for the full picture.

## Client types

The API has two distinct actors, so the SDK has two entry points:

- **`AuthClient`** (`createAuthClient`) — for tenant users/admins. All
  requests are scoped to a tenant slug (`/{tenantSlug}/api/...`).
- **`PlatformClient`** (`createPlatformClient`) — for the platform
  (super-admin) account. Manages tenants themselves
  (`/platform/api/tenants/...`), not users within a tenant.

They share the same `HttpClient`/`TokenManager` internals but expose
different module sets, so a platform-authenticated session can't
accidentally call tenant-user endpoints and vice versa.

### AuthClient

```ts
import { createAuthClient } from "@auth-moon/sdk";

const sdk = createAuthClient({
  baseUrl: "https://your-auth-server.com",
  tenantSlug: "acme",
  onLogout: () => (window.location.href = "/login"),
});

// call once on app boot — attempts a silent refresh using the httpOnly
// refresh cookie, returns true if a session was restored
const hasSession = await sdk.auth.initialize();

const { user, accessToken } = await sdk.auth.login("user@acme.com", "password123");

const me = await sdk.users.getMe();          // MeResponse (includes permissions[])
const allUsers = await sdk.users.getAll();   // UserResponse[]

const roles = await sdk.roles.getRoles();
await sdk.roles.assignRoleToUser(userId, roleId);

const logs = await sdk.audit.getLogs({ page: 1, limit: 20 });

await sdk.auth.logout();       // revokes the current refresh-token family
await sdk.auth.logoutAll();    // revokes every session for the user
```

### PlatformClient

```ts
import { createPlatformClient } from "@auth-moon/sdk";

const platform = createPlatformClient({
  baseUrl: "https://your-auth-server.com",
  onLogout: () => (window.location.href = "/platform/login"),
});

await platform.auth.login("admin@platform.local", "...");

const tenants = await platform.tenants.list();
const created = await platform.tenants.create({
  name: "Acme Corp",
  slug: "acme",
  adminEmail: "admin@acme.com",
  adminPassword: "SecurePass123!",
});

await platform.tenants.deactivate(created.tenant.id);
await platform.tenants.reactivate(created.tenant.id);
```

## Token lifecycle

### Session storage

The access token lives **in memory only** (never `localStorage`/
`sessionStorage`) — an XSS payload cannot read it off disk. It's lost on a
hard page reload; `sdk.auth.initialize()` recovers it by calling
`/auth/refresh`, which relies on the `httpOnly` refresh cookie the browser
sends automatically.

### Automatic refresh

`TokenManager` schedules a proactive refresh 60 seconds before the access
token's `exp` claim, and dispatches a `sdk:token:expiring` `CustomEvent` on
`window` at that point, so a UI can react to an about-to-expire session.
Concurrent requests that all hit an expired token share a single in-flight
refresh call (`ensureFresh`) rather than each firing their own
`/auth/refresh`, and use the Web Locks API (`navigator.locks`) where
available to serialize refreshes across browser tabs on the same origin —
this avoids multiple tabs each rotating the refresh token and triggering the
API's replay-detection logic against each other.

### Cross-tab synchronization

`TokenManager` also broadcasts token/logout state across tabs via a
`BroadcastChannel` scoped to the client (`access_token_sync:{tenantSlug}` for
`AuthClient`, `access_token_sync:platform` for `PlatformClient`), so a
refresh or logout in one tab is reflected in others without a network call —
and so an `AuthClient` and a `PlatformClient` open in the same browser at
once never overwrite each other's tokens.

## Error handling

Every non-2xx response is thrown as a typed subclass of `SdkError`:

```ts
import { AuthError, ForbiddenError, RateLimitError, ValidationError, ConflictError } from "@auth-moon/sdk";

try {
  await sdk.auth.login(email, password);
} catch (e) {
  if (e instanceof RateLimitError) {
    console.log(`Try again in ${e.retryAfter}s`);
  } else if (e instanceof ValidationError) {
    e.errors.forEach(({ field, message }) => setFieldError(field, message));
  } else if (e instanceof AuthError) {
    setError("Invalid credentials");
  } else if (e instanceof ForbiddenError) {
    setError("You don't have permission to do that");
  }
}
```

| Class              | HTTP status | Notes                                   |
| ------------------ | ----------- | ---------------------------------------- |
| `AuthError`        | 401         | invalid/expired credentials or token     |
| `ForbiddenError`    | 403         | authenticated, but missing permission    |
| `NotFoundError`     | 404         |                                          |
| `ConflictError`     | 409         | e.g. duplicate email/tenant slug         |
| `ValidationError`   | 400         | `.errors: { field, message }[]`          |
| `RateLimitError`    | 429         | `.retryAfter` in seconds                 |
| `SdkError`          | other       | fallback for anything else               |

## Module reference

### `sdk.auth`

| Method | Description |
| --- | --- |
| `login(email, password)` | Returns `{ accessToken, user }`; sets the refresh cookie server-side. |
| `register(email, password)` | Creates a user in the current tenant. |
| `logout()` | Revokes the current session's refresh-token family. |
| `logoutAll()` | Revokes every refresh token for the user. |
| `refresh()` | Manually rotate the refresh token; usually not called directly — `initialize()` and the internal `ensureFresh` flow handle this. |
| `initialize()` | Attempts silent session restore on app boot. Returns `boolean`. |

### `sdk.users`

| Method | Description |
| --- | --- |
| `getMe()` | Current user, including `permissions: string[]`. |
| `getAll()` | All users in the tenant. |
| `create(dto)` | Create a user (admin operation). |
| `delete(userId)` | Delete a user. |

### `sdk.roles`

| Method | Description |
| --- | --- |
| `getRoles()` | All roles in the tenant, with their permissions. |
| `createRole(name)` | Creates a new role in the tenant. |
| `assignPermission(roleId, permission)` | `permission` is one of the strings in `PERMISSION_VALUES`. |
| `removePermissionFromRole(roleId, permission)` | Revokes a permission from a role. |
| `assignRoleToUser(userId, roleId)` | Assigns an existing role to a user. |
| `removeRoleFromUser(userId, roleId)` | Removes a role from a user. |

### `sdk.audit`

| Method | Description |
| --- | --- |
| `getLogs({ userId?, action?, from?, to?, page?, limit? })` | Returns `PaginatedResponse<AuditLogResponse>`. |

### `platform.tenants`

| Method | Description |
| --- | --- |
| `create(dto)` | `{ name, slug, adminEmail, adminPassword }` → creates the tenant and its first admin user. |
| `list()` | All tenants. |
| `deactivate(id)` / `reactivate(id)` | Soft enable/disable — does not delete data. |

## Exported types

Response shapes (`UserResponse`, `MeResponse`, `TokenResponse`, `RoleResponse`,
`PermissionResponse`, `AuditLogResponse`, `PaginatedResponse<T>`,
`MessageResponse`, `TenantResponse`, `CreateTenantResponse`), request schemas
(`LoginSchema`, `RegisterUserSchema`, `CreateRoleSchema`, `AuditQuerySchema`,
`CreateTenantSchema` — all Zod schemas, plus their inferred `*Dto` types), and
`PERMISSION_VALUES` (the list of valid permission strings) are all exported
from the package root — see [`src/index.ts`](src/index.ts) for the full list.

## Known gaps

- See the root README's "Known limitations" for the system-wide gaps (no
  MFA, in-memory rate limiter, etc.) that apply to what this SDK talks to.
- `PERMISSION_VALUES` in `types/schemas.ts` is currently a second, manually
  maintained copy of the permission strings defined in the API's
  `permissions.constants.ts` — keep them in sync by hand until this is
  generated/shared.
