import { useState, useEffect, useCallback } from "react";
import { getSdk } from "../sdk";
import type { RoleResponse } from "../types";

export function useRoles() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await getSdk().roles.getRoles();
      setRoles(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load roles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const createRole = useCallback(async (name: string) => {
    const role = await getSdk().roles.createRole(name);
    setRoles((prev) => [...prev, role]);
    return role;
  }, []);

  const assignPermission = useCallback(
    async (roleId: string, permission: string) => {
      await getSdk().roles.assignPermission(roleId, permission);
      await fetchRoles();
    },
    [fetchRoles],
  );

  const removePermission = useCallback(
    async (roleId: string, permission: string) => {
      await getSdk().roles.removePermissionFromRole(roleId, permission);
      await fetchRoles();
    },
    [fetchRoles],
  );

  return { roles, isLoading, error, createRole, assignPermission, removePermission };
}
