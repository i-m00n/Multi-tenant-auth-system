import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { RateLimitError, ValidationError, AuthError } from "@auth-moon/sdk";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const slug = window.location.pathname.split("/")[1];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRetryAfter(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(`/${slug}/dashboard`);
    } catch (err) {
      if (err instanceof RateLimitError) {
        setRetryAfter(err.retryAfter);
        setError(`Too many attempts. Try again in ${err.retryAfter} seconds.`);
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
    <div>
      <h1>Sign in to {slug}</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={isLoading || retryAfter !== null}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
