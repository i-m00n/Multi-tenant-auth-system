import { useState, useEffect } from "react";
import { getsdk } from "../sdk";
import type { RoleResponse } from "../types";

export function useRoles() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getsdk()
      .roles.getRoles()
      .then(setRoles)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  const createRole = async (name: string) => {
    const role = await getsdk().roles.createRole(name);
    setRoles((prev) => [...prev, role]);
    return role;
  };

  const assignPermission = async (roleId: string, permission: string) => {
    await getsdk().roles.assignPermission(roleId, permission);
    const updated = await getsdk().roles.getRoles();
    setRoles(updated);
  };

  const assignRoleToUser = async (userId: string, roleId: string) => {
    await getsdk().roles.assignRoleToUser(userId, roleId);
  };

  return { roles, isLoading, error, createRole, assignPermission, assignRoleToUser };
}
