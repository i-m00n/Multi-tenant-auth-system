import { useState, useEffect, useCallback } from "react";
import { getsdk } from "../sdk";
import { ConflictError, type UserResponse } from "@auth-moon/sdk";

export function useUsers() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getsdk().users.getAll();
      setUsers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const assignRole = useCallback(
    async (userId: string, roleId: string) => {
      try {
        await getsdk().roles.assignRoleToUser(userId, roleId);
      } catch (e: unknown) {
        if (!(e instanceof ConflictError)) throw e;
      } finally {
        await fetchUsers();
      }
    },
    [fetchUsers],
  );

  const removeRole = useCallback(
    async (userId: string, roleId: string) => {
      await getsdk().roles.removeRoleFromUser(userId, roleId);
      await fetchUsers();
    },
    [fetchUsers],
  );

  return { users, isLoading, error, assignRole, removeRole, refetch: fetchUsers };
}
