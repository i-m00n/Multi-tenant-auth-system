import { useState, useEffect, useCallback } from "react";
import { getsdk } from "../sdk";
import type { MeResponse } from "../types";

let isInitializing = false;

interface AuthState {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    if (isInitializing) return;

    isInitializing = true;
    const sdk = getsdk();

    sdk.auth
      .initialize()
      .then(async (hasSession) => {
        if (hasSession) {
          try {
            const user = await sdk.users.getMe();
            setState({ user, isLoading: false, isAuthenticated: true });
          } catch {
            setState({ user: null, isLoading: false, isAuthenticated: false });
          }
        } else {
          setState({ user: null, isLoading: false, isAuthenticated: false });
        }
      })
      .finally(() => {
        isInitializing = false;
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const sdk = getsdk();
    await sdk.auth.login(email, password);
    const user = await sdk.users.getMe();
    setState({ user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    const sdk = getsdk();
    await sdk.auth.logout();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const hasPermission = useCallback(
    (permission: string) => state.user?.permissions.includes(permission) ?? false,
    [state.user],
  );

  return { ...state, login, logout, hasPermission };
}
