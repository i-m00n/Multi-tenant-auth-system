import { HttpClient } from "../http";
import type { RoleResponse, MessageResponse } from "../types/responses";

export class RolesModule {
  private http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }

  getRoles(): Promise<RoleResponse[]> {
    return this.http.get<RoleResponse[]>("/roles");
  }

  createRole(name: string): Promise<RoleResponse> {
    return this.http.post<RoleResponse>("/roles", { name });
  }

  assignPermission(roleId: string, permission: string): Promise<MessageResponse> {
    return this.http.post<MessageResponse>(`/roles/${roleId}/permissions`, { permission });
  }

  assignRoleToUser(userId: string, roleId: string): Promise<MessageResponse> {
    return this.http.post<MessageResponse>(`/users/${userId}/roles`, { roleId });
  }
}
