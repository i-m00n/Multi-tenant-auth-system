import { useState } from "react";
import type { UserResponse, RoleResponse } from "@auth-moon/sdk";

interface Props {
  users: UserResponse[];
  roles: RoleResponse[];
  onAssignRole: (userId: string, roleId: string) => Promise<void>;
}

export function UserTable({ users, roles, onAssignRole }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAssign = async (userId: string, roleId: string) => {
    setLoading(userId);
    try {
      await onAssignRole(userId, roleId);
    } finally {
      setLoading(null);
    }
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
          <th style={{ padding: "8px 12px" }}>Email</th>
          <th style={{ padding: "8px 12px" }}>Status</th>
          <th style={{ padding: "8px 12px" }}>Assign Role</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "8px 12px" }}>{user.email}</td>
            <td style={{ padding: "8px 12px" }}>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 9999,
                  fontSize: 12,
                  background: user.isActive ? "#dcfce7" : "#fee2e2",
                  color: user.isActive ? "#16a34a" : "#dc2626",
                }}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </td>
            <td style={{ padding: "8px 12px" }}>
              <select
                disabled={loading === user.id}
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) handleAssign(user.id, e.target.value);
                }}
                style={{ padding: "4px 8px", borderRadius: 4 }}
              >
                <option value="" disabled>
                  {loading === user.id ? "Assigning..." : "Select role..."}
                </option>
                {roles.map((role) => (
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
  );
}
