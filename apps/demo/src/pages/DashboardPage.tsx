import { useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { PermissionGate } from "../components/PermissionGate";
import { NavBar } from "../components/NavBar";
import { SessionStatus } from "../components/SessionStatus";
import { RateLimitButton } from "../components/RateLimitButton";
import { getsdk } from "../sdk";

export function DashboardPage() {
  const { user } = useAuth();
  const slug = window.location.pathname.split("/")[1];

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
          <h1>Welcome, {user?.email}</h1>

          <div style={{ marginBottom: 24 }}>
            <h3>Your Permissions</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {user?.permissions.map((p) => (
                <span
                  key={p}
                  style={{
                    padding: "2px 10px",
                    background: "#f1f5f9",
                    borderRadius: 9999,
                    fontSize: 13,
                    fontFamily: "monospace",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
            <PermissionGate permission="user:read">
              <a href={`/${slug}/users`} style={linkStyle}>
                👥 Manage Users →
              </a>
            </PermissionGate>

            <PermissionGate permission="role:read">
              <a href={`/${slug}/roles`} style={linkStyle}>
                🔑 Manage Roles →
              </a>
            </PermissionGate>

            <PermissionGate permission="audit:read">
              <a href={`/${slug}/audit`} style={linkStyle}>
                📋 Audit Logs →
              </a>
            </PermissionGate>
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 24 }}>
            <h3>Demo: Rate Limiting</h3>
            <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
              Fire 6 login attempts with wrong password to trigger Layer 2 rate limiting (login:{"{tenantId}"}:
              {"{email}"}, 5/15min).
            </p>
            <RateLimitButton
              label="Trigger rate limit"
              testLabel="Fire login rate limit →"
              onTrigger={triggerLoginRateLimit}
            />
          </div>
        </div>

        <div style={{ width: 280, flexShrink: 0 }}>
          <SessionStatus />

          <div
            style={{
              marginTop: 16,
              padding: 16,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 13,
              color: "#64748b",
            }}
          >
            <strong style={{ color: "#0f172a" }}>Multi-tab demo</strong>
            <p style={{ margin: "8px 0 0" }}>
              Open this page in another tab. Log out here — the other tab clears instantly via BroadcastChannel without
              any interaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 16px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 6,
  textDecoration: "none",
  color: "#0f172a",
  fontWeight: 500,
};
