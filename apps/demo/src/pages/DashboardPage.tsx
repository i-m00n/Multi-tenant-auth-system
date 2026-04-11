import { useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { NavBar } from "../components/NavBar";
import { SessionStatus } from "../components/SessionStatus";
import { RateLimitButton } from "../components/RateLimitButton";
import { getsdk } from "../sdk";

export function DashboardPage() {
  const { user } = useAuth();

  const triggerLoginRateLimit = useCallback(async () => {
    for (let i = 0; i < 6; i++) {
      await getsdk()
        .auth.login(user?.email ?? "test@test.com", "wrongpassword")
        .catch((e) => {
          throw e;
        });
    }
  }, [user]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <NavBar />

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>Welcome, {user?.email}</h1>
          <p style={{ color: "#64748b", marginTop: 0, marginBottom: 24 }}>
            Logged into tenant <strong>{user?.tenantId}</strong>
          </p>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#475569" }}>Your Permissions</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {user?.permissions.length ? (
                user.permissions.map((p) => (
                  <span
                    key={p}
                    style={{
                      padding: "3px 10px",
                      background: "#f1f5f9",
                      borderRadius: 4,
                      fontSize: 12,
                      fontFamily: "monospace",
                      color: "#0f172a",
                    }}
                  >
                    {p}
                  </span>
                ))
              ) : (
                <span style={{ color: "#94a3b8", fontSize: 13 }}>No permissions assigned</span>
              )}
            </div>
          </div>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 14, color: "#475569" }}>Demo: Rate Limiting</h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px" }}>
              Fires 6 login attempts with wrong password — triggers Layer 2 rate limit (
              <code>
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

        <div style={{ width: 280, flexShrink: 0 }}>
          <SessionStatus />

          <div
            style={{
              marginTop: 12,
              padding: 16,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 13,
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#0f172a", display: "block", marginBottom: 4 }}>Multi-tab demo</strong>
            Open this page in another tab. Log out here — the other tab clears instantly via BroadcastChannel without
            any interaction.
          </div>
        </div>
      </div>
    </div>
  );
}
