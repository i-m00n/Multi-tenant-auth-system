import { createAuthClient, AuthClient } from "@auth-moon/sdk";

function getTenantSlug(): string {
  const segments = window.location.pathname.split("/").filter(Boolean);
  return segments[0] ?? "default";
}

let _client: AuthClient | null = null;

export function getsdk(): AuthClient {
  if (!_client) {
    _client = createAuthClient({
      baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
      tenantSlug: getTenantSlug(),
      onLogout: () => {
        _client = null;
        window.location.href = `/${getTenantSlug()}/login`;
      },
    });
  }
  return _client;
}
