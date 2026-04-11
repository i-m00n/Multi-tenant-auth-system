import { useTokenCountdown } from "../hooks/useTokenCountdown";
import { useAuth } from "../hooks/useAuth";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SessionStatus() {
  const { secondsLeft, justRefreshed } = useTokenCountdown();
  const { logout } = useAuth();
  const isExpiringSoon = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: 16,
        maxWidth: 320,
      }}
    >
      <h3 style={{ margin: "0 0 12px" }}>Session Status</h3>

      <div style={{ marginBottom: 8 }}>
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: secondsLeft === null ? "#94a3b8" : "#22c55e",
            marginRight: 8,
          }}
        />
        {secondsLeft === null ? "No active session" : `Token expires in `}
        {secondsLeft !== null && (
          <span
            style={{
              fontWeight: "bold",
              color: isExpiringSoon ? "#ef4444" : "#0f172a",
            }}
          >
            {formatTime(secondsLeft)}
          </span>
        )}
      </div>

      {justRefreshed && (
        <div
          style={{
            background: "#f0fdf4",
            color: "#16a34a",
            padding: "6px 10px",
            borderRadius: 4,
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          ✓ Token refreshed silently
        </div>
      )}

      {isExpiringSoon && !justRefreshed && (
        <div
          style={{
            background: "#fef9c3",
            color: "#854d0e",
            padding: "6px 10px",
            borderRadius: 4,
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          ⚡ Proactive refresh in progress...
        </div>
      )}

      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
        Tab sync: BroadcastChannel{" "}
        {typeof BroadcastChannel !== "undefined" ? (
          <span style={{ color: "#16a34a" }}>● active</span>
        ) : (
          <span style={{ color: "#ef4444" }}>● unavailable</span>
        )}
      </div>

      <button
        onClick={logout}
        style={{
          width: "100%",
          padding: "8px 12px",
          background: "#fee2e2",
          color: "#dc2626",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        Logout All Tabs
      </button>
    </div>
  );
}
