import { useState } from "react";
import { PERMISSION_VALUES } from "@auth-moon/sdk";
import type { RoleResponse } from "../types";

interface Props {
  roles: RoleResponse[];
  onAssignPermission: (roleId: string, permission: string) => Promise<void>;
}

export function RolesList({ roles, onAssignPermission }: Props) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleAssign = async (roleId: string, permission: string) => {
    const key = `${roleId}:${permission}`;
    setLoadingKey(key);
    try {
      await onAssignPermission(roleId, permission);
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div>
      {roles.map((role) => {
        const assignedPermissions = new Set(role.permissions.map((p) => p.name));

        return (
          <div key={role.id} style={{ border: "1px solid #eee", padding: "1rem", marginBottom: "1rem" }}>
            <h3>
              {role.name}
              {role.isSystem && (
                <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#888" }}>system</span>
              )}
            </h3>

            <p style={{ fontSize: "0.875rem", color: "#555" }}>
              Permissions: {role.permissions.length > 0 ? role.permissions.map((p) => p.name).join(", ") : "none"}
            </p>

            {/* only show permission assignment for non-system roles */}
            {!role.isSystem && (
              <div style={{ marginTop: "0.5rem" }}>
                <p style={{ fontSize: "0.875rem", fontWeight: "bold" }}>Assign permission:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {PERMISSION_VALUES.map((permission) => {
                    const alreadyAssigned = assignedPermissions.has(permission);
                    const key = `${role.id}:${permission}`;

                    return (
                      <button
                        key={permission}
                        onClick={() => handleAssign(role.id, permission)}
                        disabled={alreadyAssigned || loadingKey === key}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          background: alreadyAssigned ? "#e8f5e9" : "#fff",
                          border: "1px solid #ccc",
                          cursor: alreadyAssigned ? "default" : "pointer",
                        }}
                      >
                        {alreadyAssigned ? "✓ " : ""}
                        {permission}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
