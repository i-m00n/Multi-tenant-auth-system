import { useState, useEffect, useCallback } from "react";
import { RateLimitError } from "@auth-moon/sdk";

interface Props {
  onTrigger: () => Promise<void>;
  label: string;
  testLabel?: string;
}

export function RateLimitButton({ onTrigger, label, testLabel = "Test Rate Limit" }: Props) {
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (retryAfter === null || retryAfter <= 0) return;
    const timer = setTimeout(() => setRetryAfter((s) => (s ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [retryAfter]);

  const handleTest = useCallback(async () => {
    setIsTesting(true);
    try {
      await onTrigger();
    } catch (e: unknown) {
      if (e instanceof RateLimitError) {
        setRetryAfter(e.retryAfter);
      }
    } finally {
      setIsTesting(false);
    }
  }, [onTrigger]);

  if (retryAfter !== null && retryAfter > 0) {
    return (
      <div
        style={{
          padding: "8px 16px",
          background: "#fee2e2",
          color: "#dc2626",
          borderRadius: 4,
          display: "inline-block",
          fontWeight: 500,
        }}
      >
        Rate limited — retry in {retryAfter}s
      </div>
    );
  }

  return (
    <button
      onClick={handleTest}
      disabled={isTesting}
      style={{
        padding: "8px 16px",
        background: "#f1f5f9",
        border: "1px solid #cbd5e1",
        borderRadius: 4,
        cursor: isTesting ? "not-allowed" : "pointer",
      }}
    >
      {isTesting ? "Testing..." : testLabel || label}
    </button>
  );
}
