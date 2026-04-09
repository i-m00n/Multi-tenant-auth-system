interface TokenData {
  accessToken: string;
  expiresAt: number;
}

type RefreshFn = () => Promise<string>;
type LogoutFn = () => void;

type BroadcastMessage = { type: "TOKEN_REFRESHED"; accessToken: string } | { type: "LOGGED_OUT" };

export class TokenManager {
  private tokenData: TokenData | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshPromise: Promise<string> | null = null;
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel("access_token_sync");

      this.channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
        const msg = event.data;

        if (msg.type === "TOKEN_REFRESHED") {
          this.setTokenSilent(msg.accessToken);
          this.refreshPromise = null;
        }

        if (msg.type === "LOGGED_OUT") {
          this.clearSilent();
        }
      };
    }
  }

  setToken(accessToken: string): void {
    this.setTokenSilent(accessToken);
    this.channel?.postMessage({
      type: "TOKEN_REFRESHED",
      accessToken,
    } satisfies BroadcastMessage);
  }

  private setTokenSilent(accessToken: string): void {
    const payload = this.parseJwtPayload(accessToken);
    const expiresAt = payload.exp * 1000;
    this.tokenData = { accessToken, expiresAt };
    this.scheduleRefresh(expiresAt);
  }

  getToken(): string | null {
    return this.tokenData?.accessToken ?? null;
  }

  isExpired(): boolean {
    if (!this.tokenData) return true;
    return Date.now() >= this.tokenData.expiresAt - 30_000;
  }

  clear(): void {
    this.clearSilent();
    this.channel?.postMessage({ type: "LOGGED_OUT" } satisfies BroadcastMessage);
  }

  private clearSilent(): void {
    this.tokenData = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.refreshPromise = null;
  }

  async ensureFresh(refreshFn: RefreshFn, onLogout: LogoutFn): Promise<string | null> {
    if (!this.isExpired() && this.tokenData) {
      return this.tokenData.accessToken;
    }

    if (typeof navigator !== "undefined" && navigator.locks) {
      return navigator.locks.request("auth_refresh_lock", async () => {
        if (!this.isExpired() && this.tokenData) {
          return this.tokenData.accessToken;
        }

        return this.doRefresh(refreshFn, onLogout);
      });
    }

    // fallback for SSR / environments without Web Locks (e.g. React Native)
    return this.doRefresh(refreshFn, onLogout);
  }

  private doRefresh(refreshFn: RefreshFn, onLogout: LogoutFn): Promise<string | null> {
    if (!this.refreshPromise) {
      this.refreshPromise = refreshFn()
        .then((token) => {
          this.setToken(token);
          this.refreshPromise = null;
          return token;
        })
        .catch(() => {
          this.clear();
          onLogout();
          this.refreshPromise = null;
          return null as unknown as string;
        });
    }

    return this.refreshPromise;
  }

  destroy(): void {
    this.clearSilent();
    this.channel?.close();
    this.channel = null;
  }

  private scheduleRefresh(expiresAt: number): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);

    const delay = expiresAt - Date.now() - 60_000;
    if (delay <= 0) return;

    this.refreshTimer = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sdk:token:expiring"));
      }
    }, delay);
  }

  private parseJwtPayload(token: string): { exp: number; [key: string]: unknown } {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT format");

    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as { exp: number };
  }
}
