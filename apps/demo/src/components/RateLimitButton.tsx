import { useState, useEffect, useCallback } from "react";
import { RateLimitError } from "@auth-moon/sdk";

interface Props {
  onTrigger: () => Promise<void>;
  label: string;
  testLabel?: string;
}

export function RateLimitButton({ onTrigger, label, testLabel }: Props) {
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
      if (e instanceof RateLimitError) setRetryAfter(e.retryAfter);
    } finally {
      setIsTesting(false);
    }
  }, [onTrigger]);

  if (retryAfter !== null && retryAfter > 0) {
    return (
      <div className="inline-block px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium">
        Rate limited — retry in {retryAfter}s
      </div>
    );
  }

  return (
    <button
      onClick={handleTest}
      disabled={isTesting}
      className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isTesting ? "Testing..." : (testLabel ?? label)}
    </button>
  );
}
