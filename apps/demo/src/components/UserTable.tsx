import { useState } from "react";
import type { UserResponse, RoleResponse } from "../types";

interface Props {
  users: UserResponse[];
  roles: RoleResponse[];
  onAssignRole: (userId: string, roleId: string) => Promise<void>;
  onRemoveRole: (userId: string, roleId: string) => Promise<void>;
}

export function UserTable({ users, roles, onAssignRole, onRemoveRole }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handle = async (fn: () => Promise<void>, key: string) => {
    setLoading(key);
    try {
      await fn();
    } catch (e: unknown) {
      console.error("Action failed:", e);
      alert(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
            <th style={th}>Email</th>
            <th style={th}>Status</th>
            <th style={th}>Current Roles</th>
            <th style={th}>Add Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={td}>{user.email}</td>

              <td style={td}>
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 500,
                    background: user.isActive ? "#dcfce7" : "#fee2e2",
                    color: user.isActive ? "#16a34a" : "#dc2626",
                  }}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td style={td}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {user.roles?.length ? (
                    user.roles.map((role) => (
                      <span
                        key={role.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          background: "#f1f5f9",
                          borderRadius: 4,
                          fontSize: 12,
                          fontFamily: "monospace",
                        }}
                      >
                        {role.name}
                        <button
                          onClick={() => handle(() => onRemoveRole(user.id, role.id), `remove-${user.id}-${role.id}`)}
                          disabled={loading === `remove-${user.id}-${role.id}`}
                          title="Remove role"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            padding: "0 2px",
                            fontSize: 14,
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>No roles</span>
                  )}
                </div>
              </td>

              <td style={td}>
                <select
                  value=""
                  disabled={!!loading}
                  onChange={(e) => {
                    if (e.target.value) {
                      handle(() => onAssignRole(user.id, e.target.value), `assign-${user.id}`);
                      e.target.value = "";
                    }
                  }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  <option value="" disabled>
                    Add role...
                  </option>
                  {roles
                    .filter((r) => !user.roles?.some((ur) => ur.id === r.id))
                    .map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
  padding: "12px 16px",
  verticalAlign: "middle",
};
