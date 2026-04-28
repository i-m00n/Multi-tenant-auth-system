import { HttpClient } from "./http";
import { TokenManager } from "./token-manager";
import { AuthModule } from "./modules/auth";
import { TenantsModule } from "./modules/tenants";

export interface PlatformClientOptions {
  baseUrl: string;
  onLogout?: () => void;
}

export class PlatformClient {
  readonly auth: AuthModule;
  readonly tenants: TenantsModule;

  private readonly tokenManager: TokenManager;

  constructor(options: PlatformClientOptions) {
    const onLogout = options.onLogout ?? (() => {});

    this.tokenManager = new TokenManager();

    const http = new HttpClient({
      baseUrl: options.baseUrl,
      tenantSlug: "platform",
      tokenManager: this.tokenManager,
      onLogout,
    });

    this.auth = new AuthModule(http, this.tokenManager);
    this.tenants = new TenantsModule(http);
  }

  get isAuthenticated(): boolean {
    return this.tokenManager.getToken() !== null;
  }

  async initialize(): Promise<boolean> {
    return this.auth.initialize();
  }
}

export function createPlatformClient(options: PlatformClientOptions): PlatformClient {
  return new PlatformClient(options);
}
