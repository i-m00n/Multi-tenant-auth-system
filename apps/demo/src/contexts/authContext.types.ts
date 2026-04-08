import { createContext } from "react";
import type { MeResponse } from "@auth-moon/sdk";

export interface AuthState {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthState | null>(null);
