import type { AuditLogResponse } from "../types";

export function AuditLogTable({ logs }: { logs: AuditLogResponse[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Action</th>
          <th>User</th>
          <th>IP</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => {
          const isHighSeverity = (log.metadata as Record<string, unknown>)?.severity === "high";

          return (
            <tr key={log.id} style={{ background: isHighSeverity ? "#fff0f0" : undefined }}>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td>{log.action}</td>
              <td>{log.userId ?? "—"}</td>
              <td>{log.ipAddress ?? "—"}</td>
              <td>{isHighSeverity && <span style={{ color: "red", fontWeight: "bold" }}>⚠ Replay attack</span>}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
