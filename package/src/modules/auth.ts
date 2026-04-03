import { HttpClient } from "../http";
import { TokenManager } from "../token-manager";
import type { TokenResponse, RefreshResponse, MessageResponse } from "../types/responses";

export class AuthModule {
  constructor(
    private http: HttpClient,
    private tokenManager: TokenManager,
  ) {}

  async login(email: string, password: string): Promise<TokenResponse> {
    const data = await this.http.postPublic<TokenResponse>("/auth/login", {
      email,
      password,
    });

    this.tokenManager.setToken(data.accessToken);
    return data;
  }

  async register(email: string, password: string) {
    return this.http.postPublic("/auth/register", { email, password });
  }

  async logout(): Promise<MessageResponse> {
    const result = await this.http.post<MessageResponse>("/auth/logout");
    this.tokenManager.clear();
    return result;
  }

  async logoutAll(): Promise<MessageResponse> {
    const result = await this.http.post<MessageResponse>("/auth/logout-all");
    this.tokenManager.clear();
    return result;
  }

  async refresh(): Promise<RefreshResponse> {
    return this.http.postPublic<RefreshResponse>("/auth/refresh");
  }

  async initialize(): Promise<boolean> {
    try {
      const data = await this.http.postPublic<RefreshResponse>("/auth/refresh");
      this.tokenManager.setToken(data.accessToken);
      return true;
    } catch {
      return false;
    }
  }
}
