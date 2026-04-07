import { useState, useCallback } from "react";
import { getsdk } from "../sdk";
import type { AuditLogResponse, PaginatedResponse, AuditQueryParams } from "../types";

export function useAudit() {
  const [result, setResult] = useState<PaginatedResponse<AuditLogResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = useCallback(async (params?: AuditQueryParams) => {
    setIsLoading(true);
    try {
      const data = await getsdk().audit.getLogs(params);
      setResult(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { result, isLoading, fetchLogs };
}
