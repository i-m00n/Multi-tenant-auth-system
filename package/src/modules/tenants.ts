import { HttpClient } from "../http";
import type { TenantResponse, CreateTenantResponse } from "../types/responses";
import type { CreateTenantDto } from "../types/schemas";

export class TenantsModule {
  constructor(private http: HttpClient) {}

  create(dto: CreateTenantDto): Promise<CreateTenantResponse> {
    return this.http.post<CreateTenantResponse>("/tenants", dto, false);
  }

  list(): Promise<TenantResponse[]> {
    return this.http.get<TenantResponse[]>("/tenants", undefined, false);
  }

  deactivate(id: string): Promise<void> {
    return this.http.patch<void>(`/tenants/${id}/deactivate`, undefined, false);
  }

  reactivate(id: string): Promise<void> {
    return this.http.patch<void>(`/tenants/${id}/reactivate`, undefined, false);
  }
}
