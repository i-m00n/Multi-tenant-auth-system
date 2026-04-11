import { useState } from "react";
import { useRoles } from "../hooks/useRoles";
import { NavBar } from "../components/NavBar";
import { PERMISSION_VALUES } from "@auth-moon/sdk";

export function RolesPage() {
  const { roles, isLoading, createRole, assignPermission, removePermission } = useRoles();
  const [newRoleName, setNewRoleName] = useState("");
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loadingPerm, setLoadingPerm] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setCreating(true);
    try {
      await createRole(newRoleName.trim());
      setNewRoleName("");
    } finally {
      setCreating(false);
    }
  };

  const handleAssignPerm = async (roleId: string, permission: string) => {
    setLoadingPerm(`add-${roleId}-${permission}`);
    try {
      await assignPermission(roleId, permission);
    } finally {
      setLoadingPerm(null);
    }
  };

  const handleRemovePerm = async (roleId: string, permission: string) => {
    setLoadingPerm(`remove-${roleId}-${permission}`);
    try {
      await removePermission(roleId, permission);
    } finally {
      setLoadingPerm(null);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <NavBar />
      <h1 style={{ marginBottom: 4 }}>Roles</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        {roles.length} role{roles.length !== 1 ? "s" : ""} in this tenant. System roles cannot be modified.
      </p>

      {/* create role */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#475569" }}>Create New Role</h3>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: 8 }}>
          <input
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="e.g. billing-manager"
            pattern="^[a-z0-9-]+$"
            title="Lowercase letters, numbers, hyphens only"
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: 4,
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={creating || !newRoleName.trim()}
            style={{
              padding: "8px 16px",
              background: "#0f172a",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: creating ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#94a3b8" }}>Lowercase letters, numbers, hyphens only</p>
      </div>

      {/* roles list */}
      {isLoading ? (
        <div style={{ color: "#94a3b8" }}>Loading roles...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {roles.map((role) => {
            const isExpanded = expanded === role.id;
            const currentPerms = role.permissions?.map((p) => p.name) ?? [];
            const availablePerms = PERMISSION_VALUES.filter((p) => !currentPerms.includes(p));

            return (
              <div
                key={role.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                {/* role header */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : role.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: isExpanded ? "#f8fafc" : "white",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{role.name}</span>
                    {role.isSystem && (
                      <span
                        style={{
                          padding: "1px 8px",
                          background: "#fef9c3",
                          color: "#854d0e",
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      >
                        system
                      </span>
                    )}
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>
                      {currentPerms.length} permission{currentPerms.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span style={{ color: "#94a3b8", fontSize: 18 }}>{isExpanded ? "−" : "+"}</span>
                </div>

                {/* expanded permissions panel */}
                {isExpanded && (
                  <div
                    style={{
                      padding: 16,
                      borderTop: "1px solid #e2e8f0",
                      background: "white",
                    }}
                  >
                    {/* current permissions */}
                    <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                      Current Permissions
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                      {currentPerms.length === 0 && (
                        <span style={{ color: "#94a3b8", fontSize: 13 }}>None assigned</span>
                      )}
                      {currentPerms.map((perm) => (
                        <span
                          key={perm}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 10px",
                            background: "#f1f5f9",
                            borderRadius: 4,
                            fontSize: 12,
                            fontFamily: "monospace",
                          }}
                        >
                          {perm}
                          {!role.isSystem && (
                            <button
                              onClick={() => handleRemovePerm(role.id, perm)}
                              disabled={loadingPerm === `remove-${role.id}-${perm}`}
                              title="Remove permission"
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
                          )}
                        </span>
                      ))}
                    </div>

                    {/* add permission — only for non-system roles */}
                    {!role.isSystem && availablePerms.length > 0 && (
                      <>
                        <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#475569" }}>
                          Add Permission
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {availablePerms.map((perm) => (
                            <button
                              key={perm}
                              onClick={() => handleAssignPerm(role.id, perm)}
                              disabled={loadingPerm === `add-${role.id}-${perm}`}
                              style={{
                                padding: "3px 10px",
                                background: "white",
                                border: "1px dashed #cbd5e1",
                                borderRadius: 4,
                                fontSize: 12,
                                fontFamily: "monospace",
                                cursor: "pointer",
                                color: "#475569",
                              }}
                            >
                              + {perm}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {role.isSystem && (
                      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>System roles cannot be modified.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
