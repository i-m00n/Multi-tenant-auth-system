import { HttpClient } from "../http";
import type { AuditLogResponse, PaginatedResponse } from "../types/responses";

export interface AuditQueryParams {
  userId?: string;
  action?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

export class AuditModule {
  constructor(private http: HttpClient) {}

  getLogs(params?: AuditQueryParams): Promise<PaginatedResponse<AuditLogResponse>> {
    return this.http.get<PaginatedResponse<AuditLogResponse>>("/audit", {
      ...params,
      from: params?.from?.toISOString(),
      to: params?.to?.toISOString(),
    });
  }
}
