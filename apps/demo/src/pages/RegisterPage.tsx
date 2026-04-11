import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getsdk } from "../sdk";
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

  // countdown for the form's own rate limit
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
      await getsdk().auth.register(email, password);
      setSuccess(true);
      setTimeout(() => navigate(`/${tenant}/login`), 1500);
    } catch (e: unknown) {
      if (e instanceof RateLimitError) {
        setRetryAfter(e.retryAfter);
        setError(`Too many attempts. Try again in ${e.retryAfter}s.`);
      } else if (e instanceof ValidationError) {
        const errors: Record<string, string> = {};
        e.errors.forEach(({ field, message }) => {
          errors[field] = message;
        });
        setFieldErrors(errors);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // throws RateLimitError — RateLimitButton catches it and shows its own countdown
  const triggerRateLimit = useCallback(async () => {
    const attempts = Array.from({ length: 12 }, (_, i) =>
      getsdk().auth.register(`flood-${i}-${Math.random()}@test.com`, "Weakpass1!"),
    );
    await Promise.allSettled(attempts);
    // fire one more to guarantee hitting the limit and getting the error
    await getsdk().auth.register(`flood-final-${Math.random()}@test.com`, "Weakpass1!");
  }, []);

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: 32,
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
          <p style={{ margin: 0, color: "#16a34a", fontWeight: 500 }}>Registered! Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 32,
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 4,
            }}
          >
            {tenant}
          </div>
          <h1 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>Create account</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#475569",
                marginBottom: 6,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            {fieldErrors.email && (
              <p style={{ margin: "4px 0 0", color: "#dc2626", fontSize: 13 }}>{fieldErrors.email}</p>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: "#475569",
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                display: "block",
                width: "100%",
                padding: "9px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            {fieldErrors.password && (
              <p style={{ margin: "4px 0 0", color: "#dc2626", fontSize: 13 }}>{fieldErrors.password}</p>
            )}
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "#94a3b8" }}>
              Min 12 characters, one uppercase, one number
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: "10px 12px",
                background: "#fee2e2",
                color: "#dc2626",
                borderRadius: 6,
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {retryAfter !== null && retryAfter > 0 ? `Too many attempts. Try again in ${retryAfter}s.` : error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || retryAfter !== null}
            style={{
              width: "100%",
              padding: "10px",
              background: isLoading || retryAfter !== null ? "#94a3b8" : "#0f172a",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 500,
              cursor: isLoading || retryAfter !== null ? "not-allowed" : "pointer",
              marginBottom: 12,
            }}
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        {/* flood demo — uses RateLimitButton so it handles its own countdown */}
        <div
          style={{
            padding: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            marginBottom: 16,
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b" }}>
            Demo: flood the register endpoint to trigger rate limiting
          </p>
          <RateLimitButton label="Register" testLabel="Flood register endpoint →" onTrigger={triggerRateLimit} />
        </div>

        <div
          style={{
            paddingTop: 16,
            borderTop: "1px solid #f1f5f9",
            textAlign: "center",
            fontSize: 13,
            color: "#64748b",
          }}
        >
          Already have an account?{" "}
          <Link to={`/${tenant}/login`} style={{ color: "#0f172a", fontWeight: 500, textDecoration: "none" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
