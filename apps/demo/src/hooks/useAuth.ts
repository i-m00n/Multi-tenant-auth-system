import { useContext } from "react";
import { AuthContext } from "../contexts/authContext.types.ts";
import type { AuthState } from "../contexts/authContext.types.ts";

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
