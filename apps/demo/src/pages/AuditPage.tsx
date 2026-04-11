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
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <NavBar />
      <h1 style={{ marginBottom: 4 }}>Audit Logs</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Append-only — no entry can be modified or deleted, even directly in the DB. Replay attacks are highlighted in
        red.
      </p>

      {/* filter bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 12,
        }}
      >
        <input
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by action (e.g. auth.login.failed)"
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: 4,
            fontSize: 14,
          }}
        />
        {action && (
          <button
            onClick={() => {
              setAction("");
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 4,
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ color: "#94a3b8", padding: 24, textAlign: "center" }}>Loading logs...</div>
      ) : (
        <>
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <AuditLogTable logs={result?.data ?? []} />
          </div>

          {/* pagination */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 14,
              color: "#64748b",
            }}
          >
            <span>
              Page {result?.pagination.page ?? 1} of {totalPages}
              {" · "}
              {result?.pagination.total ?? 0} total entries
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} style={paginationBtn}>
                ← Previous
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} style={paginationBtn}>
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const paginationBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 13,
};
