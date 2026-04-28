import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getSdk } from "../sdk";
import { RateLimitError, ValidationError } from "@auth-moon/sdk";
import { RateLimitButton } from "../components/RateLimitButton";

export function RegisterPage() {
  const { tenant } = useParams<{ tenant: string }>();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) {
      if (retryAfter === 0) setRetryAfter(null);
      return;
    }
    const timer = setTimeout(() => setRetryAfter((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [retryAfter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsLoading(true);
    try {
      await getSdk().auth.register(email, password);
      setSuccess(true);
      setTimeout(() => navigate(`/${tenant}/login`), 1500);
    } catch (e: unknown) {
      if (e instanceof RateLimitError) {
        setRetryAfter(e.retryAfter);
      } else if (e instanceof ValidationError) {
        const errs: Record<string, string> = {};
        e.errors.forEach(({ field, message }) => {
          errs[field] = message;
        });
        setFieldErrors(errs);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const triggerRateLimit = useCallback(async () => {
    const attempts = Array.from({ length: 12 }, (_, i) =>
      getSdk().auth.register(`flood-${i}-${Math.random()}@test.com`, "Weakpass1!"),
    );
    await Promise.allSettled(attempts);
    await getSdk().auth.register(`flood-final-${Math.random()}@test.com`, "Weakpass1!");
  }, []);

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white border border-slate-200 rounded-xl">
          <div className="text-3xl mb-3">✓</div>
          <p className="text-green-600 font-medium">Registered! Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-8">
        <div className="mb-6">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{tenant}</div>
          <h1 className="text-xl font-semibold text-slate-900">Create account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
            <p className="text-xs text-slate-400 mt-1">Min 12 characters, one uppercase, one number</p>
          </div>

          {(error || retryAfter) && (
            <div className="px-3 py-2 bg-red-50 text-red-600 rounded-md text-xs">
              {retryAfter ? `Too many attempts. Try again in ${retryAfter}s.` : error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !!retryAfter}
            className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs text-slate-500 mb-2">Demo: flood the register endpoint to trigger rate limiting</p>
          <RateLimitButton label="Register" testLabel="Flood register endpoint →" onTrigger={triggerRateLimit} />
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link to={`/${tenant}/login`} className="text-slate-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
