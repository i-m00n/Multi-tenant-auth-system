import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPlatformSdk } from "../sdk";
import { ValidationError, ConflictError } from "@auth-moon/sdk";
import type { TenantResponse } from "@auth-moon/sdk";

export function TenantsPage() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    slug: "",
    adminEmail: "",
    adminPassword: "",
  });

  useEffect(() => {
    if (!getPlatformSdk().isAuthenticated) {
      navigate("/platform/login");
      return;
    }
    getPlatformSdk()
      .tenants.list()
      .then(setTenants)
      .catch(() => navigate("/platform/login"))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setCreating(true);
    try {
      const result = await getPlatformSdk().tenants.create(form);
      setTenants((prev) => [
        ...prev,
        {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ]);
      setForm({ name: "", slug: "", adminEmail: "", adminPassword: "" });
    } catch (err) {
      if (err instanceof ValidationError) {
        const errs: Record<string, string> = {};
        err.errors.forEach(({ field, message }) => {
          errs[field] = message;
        });
        setFieldErrors(errs);
      } else if (err instanceof ConflictError) {
        setError("Slug already taken — choose a different one");
      } else {
        setError("Failed to create tenant");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    await getPlatformSdk().tenants.deactivate(id);
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: false } : t)));
  };

  const handleReactivate = async (id: string) => {
    await getPlatformSdk().tenants.reactivate(id);
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, isActive: true } : t)));
  };

  const handleLogout = async () => {
    await getPlatformSdk().auth.logout();
    navigate("/platform/login");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tenants</h1>
          <p className="text-sm text-slate-500 mt-1">Platform Admin — manage all tenants on this instance</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100"
        >
          Logout
        </button>
      </div>

      {/* create form */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-8">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Create New Tenant</h3>
        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Company Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Acme Corp"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
                placeholder="acme-corp"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {fieldErrors.slug && <p className="text-xs text-red-600 mt-1">{fieldErrors.slug}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Admin Email</label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
                placeholder="admin@acme-corp.com"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {fieldErrors.adminEmail && <p className="text-xs text-red-600 mt-1">{fieldErrors.adminEmail}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Admin Password</label>
              <input
                type="password"
                value={form.adminPassword}
                onChange={(e) => setForm((f) => ({ ...f, adminPassword: e.target.value }))}
                placeholder="Min 12 chars, uppercase, number"
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              {fieldErrors.adminPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.adminPassword}</p>}
            </div>
          </div>

          {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="mt-4 px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Tenant"}
          </button>
        </form>
      </div>

      {/* tenants table */}
      {isLoading ? (
        <div className="text-slate-400 text-sm">Loading tenants...</div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Slug</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Created</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{tenant.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{tenant.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tenant.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tenant.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Added the missing '<a' here */}
                      <a
                        href={`/${tenant.slug}/login`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline font-medium"
                      >
                        Open App →
                      </a>
                      {tenant.slug !== "platform" &&
                        (tenant.isActive ? (
                          <button
                            onClick={() => handleDeactivate(tenant.id)}
                            className="text-xs text-red-600 hover:underline font-medium"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(tenant.id)}
                            className="text-xs text-green-600 hover:underline font-medium"
                          >
                            Reactivate
                          </button>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
