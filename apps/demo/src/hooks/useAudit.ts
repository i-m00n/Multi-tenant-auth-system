import { useState, useCallback } from "react";
import { getSdk } from "../sdk";
import type { AuditLogResponse, PaginatedResponse, AuditQueryParams } from "../types";

export function useAudit() {
  const [result, setResult] = useState<PaginatedResponse<AuditLogResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async (params?: AuditQueryParams) => {
    setIsLoading(true);
    try {
      const data = await getSdk().audit.getLogs(params);
      setResult(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { result, isLoading, fetchLogs };
}
