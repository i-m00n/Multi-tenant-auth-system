import { useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { NavBar } from "../components/NavBar";
import { SessionStatus } from "../components/SessionStatus";
import { RateLimitButton } from "../components/RateLimitButton";
import { getSdk } from "../sdk";

export function DashboardPage() {
  const { user } = useAuth();

  const triggerLoginRateLimit = useCallback(async () => {
    for (let i = 0; i < 6; i++) {
      await getSdk()
        .auth.login(user?.email ?? "test@test.com", "wrongpassword")
        .catch((e) => {
          throw e;
        });
    }
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <NavBar />

      <div className="flex gap-6 items-start">
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome, {user?.email}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Logged into tenant <strong>{user?.tenantId}</strong>
            </p>
          </div>

          {/* permissions */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Your Permissions</h3>
            <div className="flex flex-wrap gap-1.5">
              {user?.permissions.length ? (
                user.permissions.map((p) => (
                  <span key={p} className="px-2 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-700">
                    {p}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-xs">No permissions assigned</span>
              )}
            </div>
          </div>

          {/* rate limit demo */}
          <div className="border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Demo: Rate Limiting</h3>
            <p className="text-xs text-slate-500 mb-3">
              Fires 6 login attempts with wrong password — triggers Layer 2 rate limit (
              <code className="bg-slate-100 px-1 rounded">
                login:{"{tenantId}"}:{"{email}"}
              </code>
              , 5/15min).
            </p>
            <RateLimitButton
              label="Fire login rate limit"
              testLabel="Fire login rate limit →"
              onTrigger={triggerLoginRateLimit}
            />
          </div>
        </div>

        {/* sidebar */}
        <div className="w-72 shrink-0 space-y-3">
          <SessionStatus />
          <div className="border border-slate-200 rounded-lg p-4 text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-700 block mb-1">Multi-tab demo</strong>
            Open this page in another tab. Log out here — the other tab clears instantly via BroadcastChannel without
            any interaction.
          </div>
        </div>
      </div>
    </div>
  );
}
