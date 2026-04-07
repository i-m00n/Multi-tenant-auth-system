import { useEffect, useState } from "react";
import { useAudit } from "../hooks/useAudit";
import { AuditLogTable } from "../components/AuditLogTable";
import { NavBar } from "../components/NavBar";

export function AuditPage() {
  const { result, isLoading, fetchLogs } = useAudit();
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchLogs({ action: action || undefined, page, limit: 20 });
  }, [page, action, fetchLogs]);

  return (
    <div>
      <NavBar />
      <h1>Audit Logs</h1>
      <input
        value={action}
        onChange={(e) => {
          setAction(e.target.value);
          setPage(1);
        }}
        placeholder="Filter by action (e.g. auth.login.failed)"
      />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <AuditLogTable logs={result?.data ?? []} />
          <div>
            Page {result?.pagination.page} of {result?.pagination.totalPages}
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
              Previous
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page === result?.pagination.totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
