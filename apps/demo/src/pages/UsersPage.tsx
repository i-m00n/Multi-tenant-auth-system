import { useState } from "react";
import { useUsers } from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";
import { NavBar } from "../components/NavBar";
import { UserTable } from "../components/UserTable";
import { ValidationError, ConflictError } from "@auth-moon/sdk";

export function UsersPage() {
  const { users, isLoading: usersLoading, assignRole, removeRole, createUser, deleteUser } = useUsers();
  const { roles, isLoading: rolesLoading } = useRoles();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isLoading = usersLoading || rolesLoading;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setCreating(true);
    try {
      await createUser(form.email, form.password);
      setForm({ email: "", password: "" });
      setShowCreate(false);
    } catch (err) {
      if (err instanceof ValidationError) {
        const errs: Record<string, string> = {};
        err.errors.forEach(({ field, message }) => {
          errs[field] = message;
        });
        setFieldErrors(errs);
      } else if (err instanceof ConflictError) {
        setFormError("Email already registered in this tenant");
      } else {
        setFormError("Failed to create user");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <NavBar />

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <button
          onClick={() => {
            setShowCreate(!showCreate);
            setFormError(null);
            setFieldErrors({});
          }}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800"
        >
          {showCreate ? "Cancel" : "+ Add User"}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {users.length} user{users.length !== 1 ? "s" : ""} in this tenant. Role changes take effect on the user's next
        request.
      </p>

      {/* create user form */}
      {showCreate && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Create New User</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="user@example.com"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min 12 chars, uppercase, number"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
            </div>
            <div className="col-span-2">
              {formError && <p className="text-xs text-red-600 mb-3">{formError}</p>}
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-slate-400 text-sm">Loading...</div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <UserTable
            users={users}
            roles={roles}
            onAssignRole={assignRole}
            onRemoveRole={removeRole}
            onDeleteUser={deleteUser}
          />
        </div>
      )}
    </div>
  );
}
