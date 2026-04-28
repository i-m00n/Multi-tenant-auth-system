import type { AuditLogResponse } from "@auth-moon/sdk";

const ACTION_COLORS: Record<string, string> = {
  "auth.login.success": "bg-green-100 text-green-700",
  "auth.login.failed": "bg-red-100 text-red-700",
  "auth.logout": "bg-slate-100 text-slate-600",
  "auth.token.replay": "bg-red-100 text-red-700",
  "auth.token.refreshed": "bg-blue-100 text-blue-700",
  "user.registered": "bg-emerald-100 text-emerald-700",
  "rbac.role.assigned": "bg-purple-100 text-purple-700",
  "rbac.role.removed": "bg-orange-100 text-orange-700",
  "rbac.role.created": "bg-purple-100 text-purple-700",
  "rbac.permission.removed": "bg-orange-100 text-orange-700",
};

export function AuditLogTable({ logs }: { logs: AuditLogResponse[] }) {
  if (logs.length === 0) {
    return <div className="py-12 text-center text-slate-400 text-sm">No audit logs found.</div>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-slate-50 border-b-2 border-slate-200">
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Time</th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Action</th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">User</th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">IP</th>
          <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Details</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => {
          const isReplay = (log.metadata as Record<string, unknown>)?.severity === "high";
          const colorClass = ACTION_COLORS[log.action] ?? "bg-slate-100 text-slate-700";

          return (
            <tr key={log.id} className={`border-b border-slate-100 ${isReplay ? "bg-red-50" : "bg-white"}`}>
              <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap text-xs">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2.5">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${colorClass}`}>{log.action}</span>
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-slate-500">
                {log.userId ? log.userId.slice(0, 8) + "..." : "—"}
              </td>
              <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{log.ipAddress ?? "—"}</td>
              <td className="px-4 py-2.5">
                {isReplay && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-semibold">
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
