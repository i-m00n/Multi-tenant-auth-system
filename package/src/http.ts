import { AuthError, ForbiddenError, NotFoundError, RateLimitError, SdkError, ValidationError } from "./types/errors";
import { TokenManager } from "./token-manager";

export interface HttpClientOptions {
  baseUrl: string;
  tenantSlug: string;
  tokenManager: TokenManager;
  onLogout: () => void;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly tenantSlug: string;
  private readonly tokenManager: TokenManager;
  private readonly onLogout: () => void;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.tenantSlug = options.tenantSlug;
    this.tokenManager = options.tokenManager;
    this.onLogout = options.onLogout;
  }

  private url(path: string, tenantScoped = true): string {
    if (tenantScoped) {
      return `${this.baseUrl}/${this.tenantSlug}/api${path}`;
    }
    return `${this.baseUrl}${path}`;
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const url = new URL(this.url(path));
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          url.searchParams.set(k, String(v));
        }
      });
    }
    return this.request<T>(url.toString(), { method: "GET" });
  }

  async post<T>(path: string, body?: unknown, tenantScoped = true): Promise<T> {
    return this.request<T>(this.url(path, tenantScoped), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async postPublic<T>(path: string, body?: unknown): Promise<T> {
    return this.requestRaw<T>(this.url(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
  }

  private async request<T>(url: string, init: RequestInit): Promise<T> {
    const token = await this.tokenManager.ensureFresh(() => this.refreshToken(), this.onLogout);

    if (!token) {
      throw new AuthError({ message: "No valid session" });
    }

    const response = await fetch(url, {
      ...init,
      credentials: "include", // always send cookies
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      this.tokenManager.clear();
      this.onLogout();
      throw new AuthError(await response.json().catch(() => ({})));
    }

    return this.handleResponse<T>(response);
  }

  private async requestRaw<T>(url: string, init: RequestInit): Promise<T> {
    const response = await fetch(url, init);
    return this.handleResponse<T>(response);
  }

  private async refreshToken(): Promise<string> {
    const response = await fetch(this.url("/auth/refresh"), {
      method: "POST",
      credentials: "include", // sends httpOnly refresh token cookie
    });

    if (!response.ok) {
      throw new AuthError(await response.json().catch(() => ({})));
    }

    const data = (await response.json()) as { accessToken: string };
    return data.accessToken;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      if (response.status === 204) return {} as T;
      return response.json() as Promise<T>;
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = { message: response.statusText };
    }

    switch (response.status) {
      case 400: {
        const b = body as {
          message?: string;
          errors?: {
            properties?: Record<string, { errors: string[] }>;
          };
        };

        const errors = Object.entries(b.errors?.properties ?? {}).flatMap(([field, value]) =>
          (value.errors ?? []).map((msg) => ({ field, message: msg })),
        );

        throw new ValidationError(errors, body);
      }
      case 401:
        throw new AuthError(body);
      case 403:
        throw new ForbiddenError(body);
      case 404:
        throw new NotFoundError(body);
      case 429: {
        const retryAfter = parseInt(response.headers.get("retry-after") ?? "60", 10);
        throw new RateLimitError(retryAfter, body);
      }
      default:
        throw new SdkError(`Request failed with status ${response.status}`, response.status, body);
    }
  }
}
