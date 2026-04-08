import { useState, useEffect, useCallback, type ReactNode } from "react";
import { AuthContext } from "./authContext.types";
import { getsdk } from "../sdk";
import type { MeResponse } from "@auth-moon/sdk";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sdk = getsdk();
    sdk.auth
      .initialize()
      .then(async (hasSession) => {
        if (hasSession) {
          const me = await sdk.users.getMe();
          setUser(me);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const sdk = getsdk();
    await sdk.auth.login(email, password);
    const me = await sdk.users.getMe();
    setUser(me);
  }, []);

  const logout = useCallback(async () => {
    await getsdk().auth.logout();
    setUser(null);
  }, []);

  const hasPermission = useCallback((permission: string) => user?.permissions.includes(permission) ?? false, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
