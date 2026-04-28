import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlatformSdk } from "../sdk";
import { AuthError, RateLimitError } from "@auth-moon/sdk";

export function PlatformLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await getPlatformSdk().auth.login(email, password);
      navigate("/platform/tenants");
    } catch (err) {
      if (err instanceof RateLimitError) {
        setError(`Too many attempts. Retry in ${err.retryAfter}s`);
      } else if (err instanceof AuthError) {
        setError("Invalid credentials");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-8">
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Platform</div>
          <h1 className="text-xl font-semibold text-slate-900">Platform Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Manage tenants across your instance</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign in as Platform Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
