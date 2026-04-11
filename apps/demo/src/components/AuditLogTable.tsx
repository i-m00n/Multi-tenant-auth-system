import type { AuditLogResponse } from "../types";

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  "auth.login.success": { bg: "#dcfce7", color: "#16a34a" },
  "auth.login.failed": { bg: "#fee2e2", color: "#dc2626" },
  "auth.logout": { bg: "#f1f5f9", color: "#475569" },
  "auth.token.replay": { bg: "#fee2e2", color: "#dc2626" },
  "auth.token.refreshed": { bg: "#eff6ff", color: "#2563eb" },
  "user.registered": { bg: "#f0fdf4", color: "#16a34a" },
  "rbac.role.assigned": { bg: "#faf5ff", color: "#7c3aed" },
  "rbac.role.removed": { bg: "#fff7ed", color: "#c2410c" },
  "rbac.role.created": { bg: "#faf5ff", color: "#7c3aed" },
};

export function AuditLogTable({ logs }: { logs: AuditLogResponse[] }) {
  if (logs.length === 0) {
    return <div style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No audit logs found.</div>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
      <thead>
        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
          <th style={th}>Time</th>
          <th style={th}>Action</th>
          <th style={th}>User</th>
          <th style={th}>IP</th>
          <th style={th}>Details</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => {
          const isReplay = (log.metadata as Record<string, unknown>)?.severity === "high";
          const colors = ACTION_COLORS[log.action] ?? { bg: "white", color: "#0f172a" };

          return (
            <tr
              key={log.id}
              style={{
                borderBottom: "1px solid #f1f5f9",
                background: isReplay ? "#fff0f0" : "white",
              }}
            >
              <td style={{ ...td, color: "#64748b", whiteSpace: "nowrap" }}>
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td style={td}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 12,
                    fontFamily: "monospace",
                    fontWeight: 500,
                    background: colors.bg,
                    color: colors.color,
                  }}
                >
                  {log.action}
                </span>
              </td>
              <td style={{ ...td, color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>
                {log.userId ? log.userId.slice(0, 8) + "..." : "—"}
              </td>
              <td style={{ ...td, color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>{log.ipAddress ?? "—"}</td>
              <td style={td}>
                {isReplay && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "2px 8px",
                      background: "#fee2e2",
                      color: "#dc2626",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    ⚠ Replay attack detected
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const th: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 13,
  color: "#475569",
};

const td: React.CSSProperties = {
  padding: "10px 16px",
  verticalAlign: "middle",
};
