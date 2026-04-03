interface TokenData {
  accessToken: string;
  expiresAt: number;
}

type RefreshFn = () => Promise<string>;
type LogoutFn = () => void;

export class TokenManager {
  private tokenData: TokenData | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshPromise: Promise<string> | null = null;

  setToken(accessToken: string): void {
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
