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
    <div className="border border-slate-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Session Status</h3>

      <div className="flex items-center gap-2 mb-2 text-sm">
        <span className={`w-2 h-2 rounded-full ${secondsLeft === null ? "bg-slate-400" : "bg-green-500"}`} />
        {secondsLeft === null ? (
          <span className="text-slate-500">No active session</span>
        ) : (
          <span className="text-slate-600">
            Token expires in{" "}
            <span className={`font-mono font-bold ${isExpiringSoon ? "text-red-500" : "text-slate-900"}`}>
              {formatTime(secondsLeft)}
            </span>
          </span>
        )}
      </div>

      {justRefreshed && (
        <div className="text-xs px-2 py-1.5 rounded bg-green-50 text-green-700 mb-2">✓ Token refreshed silently</div>
      )}

      {isExpiringSoon && !justRefreshed && (
        <div className="text-xs px-2 py-1.5 rounded bg-yellow-50 text-yellow-800 mb-2">
          ⚡ Proactive refresh in progress...
        </div>
      )}

      <div className="text-xs text-slate-400 mb-3">
        Tab sync: BroadcastChannel{" "}
        {typeof BroadcastChannel !== "undefined" ? (
          <span className="text-green-600">● active</span>
        ) : (
          <span className="text-red-500">● unavailable</span>
        )}
      </div>

      <button
        onClick={logout}
        className="w-full py-2 px-3 bg-red-50 text-red-600 text-sm font-medium rounded-md hover:bg-red-100"
      >
        Logout All Tabs
      </button>
    </div>
  );
}
