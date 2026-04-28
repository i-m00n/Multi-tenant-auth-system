import { createAuthClient, createPlatformClient, AuthClient, PlatformClient } from "@auth-moon/sdk";

function getTenantSlug(): string {
  const segments = window.location.pathname.split("/").filter(Boolean);
  return segments[0] ?? "acme";
}

let _client: AuthClient | null = null;
let _initPromise: Promise<boolean> | null = null;
let _platformClient: PlatformClient | null = null;

export function getSdk(): AuthClient {
  if (!_client) {
    _client = createAuthClient({
      baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
      tenantSlug: getTenantSlug(),
      onLogout: () => {
        window.location.href = `/${getTenantSlug()}/login`;
      },
    });
  }
  return _client;
}

export function initializeSession(): Promise<boolean> {
  if (!_initPromise) {
    _initPromise = getSdk().auth.initialize();
  }
  return _initPromise;
}

export function resetSession(): void {
  _client = null;
  _initPromise = null;
}

export function getPlatformSdk(): PlatformClient {
  if (!_platformClient) {
    _platformClient = createPlatformClient({
      baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
      onLogout: () => {
        window.location.href = "/platform/login";
      },
    });
  }
  return _platformClient;
}
