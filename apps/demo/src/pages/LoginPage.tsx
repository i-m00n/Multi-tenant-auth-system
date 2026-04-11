import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { RateLimitError, ValidationError, AuthError } from "@auth-moon/sdk";

export function LoginPage() {
  const { tenant } = useParams<{ tenant: string }>();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(`/${tenant}/dashboard`);
    } catch (err) {
      if (err instanceof RateLimitError) {
        setRetryAfter(err.retryAfter);
        setError(`Too many attempts. Try again in ${err.retryAfter}s.`);
      } else if (err instanceof ValidationError) {
        setError(err.errors.map((e) => e.message).join(", "));
      } else if (err instanceof AuthError) {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* header */}
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
          <h1 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>Sign in</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 6 }}>
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
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 6 }}>
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
              {error}
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
            }}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div
          style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: "1px solid #f1f5f9",
            textAlign: "center",
            fontSize: 13,
            color: "#64748b",
          }}
        >
          Don't have an account?{" "}
          <Link to={`/${tenant}/register`} style={{ color: "#0f172a", fontWeight: 500, textDecoration: "none" }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
