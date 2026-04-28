import { useEffect, useState } from "react";
import { useAudit } from "../hooks/useAudit";
import { NavBar } from "../components/NavBar";
import { AuditLogTable } from "../components/AuditLogTable";

export function AuditPage() {
  const { result, isLoading, fetchLogs } = useAudit();
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs({ action: action || undefined, page, limit: 20 });
  }, [page, action, fetchLogs]);

  const totalPages = result?.pagination.totalPages ?? 1;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <NavBar />
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Audit Logs</h1>
      <p className="text-sm text-slate-500 mb-6">
        Append-only — no entry can be modified or deleted, even directly in the DB. Replay attacks are highlighted in
        red.
      </p>

      {/* filter */}
      <div className="flex gap-3 mb-5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <input
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by action (e.g. auth.login.failed)"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        {action && (
          <button
            onClick={() => {
              setAction("");
              setPage(1);
            }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-500 hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading logs...</div>
      ) : (
        <>
          <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
            <AuditLogTable logs={result?.data ?? []} />
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              Page {result?.pagination.page ?? 1} of {totalPages}
              {" · "}
              {result?.pagination.total ?? 0} total entries
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs hover:bg-slate-50 disabled:opacity-40"
              >
                ← Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs hover:bg-slate-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
