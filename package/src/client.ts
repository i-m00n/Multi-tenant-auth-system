import { HttpClient } from "./http";
import { TokenManager } from "./token-manager";
import { AuthModule } from "./modules/auth";
import { UsersModule } from "./modules/users";
import { RolesModule } from "./modules/roles";
import { AuditModule } from "./modules/audit";

export interface AuthClientOptions {
  baseUrl: string;
  tenantSlug: string;
  onLogout?: () => void;
}

export class AuthClient {
  readonly auth: AuthModule;
  readonly users: UsersModule;
  readonly roles: RolesModule;
  readonly audit: AuditModule;

  private readonly tokenManager: TokenManager;

  constructor(options: AuthClientOptions) {
    const onLogout = options.onLogout ?? (() => {});

    this.tokenManager = new TokenManager();

    const http = new HttpClient({
      baseUrl: options.baseUrl,
      tenantSlug: options.tenantSlug,
      tokenManager: this.tokenManager,
      onLogout,
    });

    this.auth = new AuthModule(http, this.tokenManager);
    this.users = new UsersModule(http);
    this.roles = new RolesModule(http);
    this.audit = new AuditModule(http);
  }

  get isAuthenticated(): boolean {
    return this.tokenManager.getToken() !== null;
  }

  get tokenExpiresAt(): number | null {
    return this.tokenManager.getExpiresAt();
  }
}

export function createAuthClient(options: AuthClientOptions): AuthClient {
  return new AuthClient(options);
}
