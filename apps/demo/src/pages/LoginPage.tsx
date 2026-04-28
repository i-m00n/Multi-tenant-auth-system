import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { RateLimitError, ValidationError, AuthError } from "@auth-moon/sdk";

interface DemoCredential {
  tenant: string;
  admin: string;
  password: string;
  viewers: string[];
  url: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const slug = window.location.pathname.split("/")[1];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [credentials, setCredentials] = useState<DemoCredential[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(`/${slug}/dashboard`);
    } catch (err) {
      if (err instanceof RateLimitError) {
        setError(`Too many attempts. Retry in ${err.retryAfter}s`);
      } else if (err instanceof AuthError) {
        setError("Invalid email or password");
      } else if (err instanceof ValidationError) {
        setError(err.errors.map((e) => e.message).join(", "));
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = useCallback(async () => {
    setIsSeeding(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/demo/seed`, {
        method: "POST",
      });
      const data = (await res.json()) as { credentials: DemoCredential[] };
      setCredentials(data.credentials);
    } catch {
      setError("Seeding failed — is the API running?");
    } finally {
      setIsSeeding(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-4">
          <h1 className="text-xl font-semibold text-slate-900 mb-1">Sign in</h1>
          <p className="text-sm text-slate-500 mb-6">
            Tenant: <strong>{slug}</strong>
          </p>

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
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-4 text-center">
            <Link to={`/${slug}/register`} className="text-slate-600 hover:underline">
              Create an account
            </Link>
            {" · "}
            <Link to="/platform/login" className="text-slate-600 hover:underline">
              Platform admin
            </Link>
          </p>
        </div>

        {/* demo seed */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-xs text-slate-500 mb-3">First time here? Load demo data to explore the full system.</p>
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="w-full py-2.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-md hover:bg-slate-50 disabled:opacity-50"
          >
            {isSeeding ? "Seeding..." : "⚡ Load Demo Data"}
          </button>

          {credentials && (
            <div className="mt-4 space-y-3">
              {credentials.map((cred) => (
                <div key={cred.tenant} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-semibold text-sm mb-2">{cred.tenant}</div>
                  <div className="text-xs text-slate-500 mb-1">
                    Admin: <code className="bg-slate-100 px-1 rounded">{cred.admin}</code>
                  </div>
                  <div className="text-xs text-slate-500 mb-3">
                    Password: <code className="bg-slate-100 px-1 rounded">{cred.password}</code>
                  </div>
                  <div className="text-xs text-slate-400 mb-3">Viewers: {cred.viewers.join(", ")}</div>
                  <button
                    onClick={() => {
                      window.location.href = cred.url;
                    }}
                    className="px-3 py-1.5 border border-slate-200 text-xs font-medium rounded hover:bg-slate-100"
                  >
                    Go to {cred.tenant} →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
