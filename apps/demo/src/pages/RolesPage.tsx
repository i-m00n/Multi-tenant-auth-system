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
    <div className="max-w-5xl mx-auto px-6 py-8">
      <NavBar />
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Roles</h1>
      <p className="text-sm text-slate-500 mb-6">
        {roles.length} role{roles.length !== 1 ? "s" : ""} in this tenant. System roles cannot be modified.
      </p>

      {/* create role */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Create New Role</h3>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            placeholder="e.g. billing-manager"
            pattern="^[a-z0-9-]+$"
            title="Lowercase letters, numbers, hyphens only"
            className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            disabled={creating || !newRoleName.trim()}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-2">Lowercase letters, numbers, hyphens only</p>
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-sm">Loading roles...</div>
      ) : (
        <div className="space-y-3">
          {roles.map((role) => {
            const isExpanded = expanded === role.id;
            const currentPerms = role.permissions?.map((p) => p.name) ?? [];
            const availablePerms = PERMISSION_VALUES.filter((p) => !currentPerms.includes(p));

            return (
              <div key={role.id} className="border border-slate-200 rounded-lg overflow-hidden">
                {/* header */}
                <div
                  onClick={() => setExpanded(isExpanded ? null : role.id)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none ${
                    isExpanded ? "bg-slate-50" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{role.name}</span>
                    {role.isSystem && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        system
                      </span>
                    )}
                    <span className="text-slate-400 text-xs">
                      {currentPerms.length} permission{currentPerms.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-slate-400 text-lg">{isExpanded ? "−" : "+"}</span>
                </div>

                {/* expanded panel */}
                {isExpanded && (
                  <div className="px-4 py-4 border-t border-slate-200 bg-white">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Current Permissions
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {currentPerms.length === 0 && <span className="text-slate-400 text-xs">None assigned</span>}
                      {currentPerms.map((perm) => (
                        <span
                          key={perm}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-xs font-mono"
                        >
                          {perm}
                          {!role.isSystem && (
                            <button
                              onClick={() => handleRemovePerm(role.id, perm)}
                              disabled={loadingPerm === `remove-${role.id}-${perm}`}
                              className="text-slate-400 hover:text-red-500 leading-none"
                              title="Remove permission"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>

                    {!role.isSystem && availablePerms.length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Add Permission
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {availablePerms.map((perm) => (
                            <button
                              key={perm}
                              onClick={() => handleAssignPerm(role.id, perm)}
                              disabled={loadingPerm === `add-${role.id}-${perm}`}
                              className="px-2 py-0.5 border border-dashed border-slate-300 rounded text-xs font-mono text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                            >
                              + {perm}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {role.isSystem && <p className="text-xs text-slate-400">System roles cannot be modified.</p>}
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
