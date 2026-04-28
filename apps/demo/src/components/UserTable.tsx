import { useState } from "react";
import type { UserResponse, RoleResponse } from "@auth-moon/sdk";

interface Props {
  users: UserResponse[];
  roles: RoleResponse[];
  onAssignRole: (userId: string, roleId: string) => Promise<void>;
  onRemoveRole: (userId: string, roleId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
}

export function UserTable({ users, roles, onAssignRole, onRemoveRole, onDeleteUser }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const handle = async (fn: () => Promise<void>, key: string) => {
    setLoading(key);
    try {
      await fn();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 border-b-2 border-slate-200">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Email</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Status</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Current Roles</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Add Role</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-slate-100">
              <td className="px-4 py-3 text-slate-700">{user.email}</td>

              <td className="px-4 py-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {user.roles?.length ? (
                    user.roles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-xs font-mono"
                      >
                        {role.name}
                        <button
                          onClick={() => handle(() => onRemoveRole(user.id, role.id), `remove-${user.id}-${role.id}`)}
                          disabled={loading === `remove-${user.id}-${role.id}`}
                          className="text-slate-400 hover:text-red-500 leading-none"
                          title="Remove role"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">No roles</span>
                  )}
                </div>
              </td>

              <td className="px-4 py-3">
                <select
                  value=""
                  disabled={!!loading}
                  onChange={(e) => {
                    if (e.target.value) {
                      handle(() => onAssignRole(user.id, e.target.value), `assign-${user.id}`);
                      e.target.value = "";
                    }
                  }}
                  className="px-2 py-1.5 border border-slate-200 rounded text-xs text-slate-500 bg-white"
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

              <td className="px-4 py-3">
                {user.isActive &&
                  (confirming === user.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Sure?</span>
                      <button
                        onClick={() => {
                          setConfirming(null);
                          handle(() => onDeleteUser(user.id), `delete-${user.id}`);
                        }}
                        className="text-xs text-red-600 font-medium hover:underline"
                      >
                        Yes
                      </button>
                      <button onClick={() => setConfirming(null)} className="text-xs text-slate-400 hover:underline">
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirming(user.id)}
                      disabled={loading === `delete-${user.id}`}
                      className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40"
                    >
                      Deactivate
                    </button>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
