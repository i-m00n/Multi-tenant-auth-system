import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getsdk } from "../sdk";
import { RateLimitError, ValidationError } from "@auth-moon/sdk";
import { RateLimitButton } from "../components/RateLimitButton";

export function RegisterPage() {
  const navigate = useNavigate();
  const slug = window.location.pathname.split("/")[1];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleRegister = useCallback(async () => {
    setFieldErrors({});
    await getsdk().auth.register(email, password);
    setSuccess(true);
    setTimeout(() => navigate(`/${slug}/login`), 1500);
  }, [email, password, navigate, slug]);

  // deliberately fires rate limit for demo purposes
  const triggerRateLimit = useCallback(async () => {
    const promises = Array.from({ length: 12 }, () =>
      getsdk()
        .auth.register(`flood-${Math.random()}@test.com`, "weak")
        .catch((e) => {
          throw e;
        }),
    );
    await Promise.any(
      promises.map((p) =>
        p.catch((e) => {
          if (e instanceof RateLimitError) throw e;
        }),
      ),
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleRegister();
    } catch (e: unknown) {
      if (e instanceof ValidationError) {
        const errors: Record<string, string> = {};
        e.errors.forEach(({ field, message }) => {
          errors[field] = message;
        });
        setFieldErrors(errors);
      }
    }
  };

  if (success) {
    return <div style={{ padding: 32 }}>✓ Registered! Redirecting to login...</div>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h1>Register — {slug}</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", width: "100%", padding: "8px", marginTop: 4 }}
            required
          />
          {fieldErrors.email && <p style={{ color: "#dc2626", fontSize: 13 }}>{fieldErrors.email}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", width: "100%", padding: "8px", marginTop: 4 }}
            required
          />
          {fieldErrors.password && <p style={{ color: "#dc2626", fontSize: 13 }}>{fieldErrors.password}</p>}
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Min 12 characters, one uppercase, one number</p>
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            background: "#0f172a",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            marginBottom: 12,
          }}
        >
          Register
        </button>
      </form>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Demo: trigger the rate limiter</p>
        <RateLimitButton label="Register" testLabel="Flood register endpoint →" onTrigger={triggerRateLimit} />
      </div>

      <p style={{ marginTop: 16, fontSize: 14 }}>
        Already have an account? <Link to={`/${slug}/login`}>Sign in</Link>
      </p>
    </div>
  );
}
