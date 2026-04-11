import { useUsers } from "../hooks/useUsers";
import { useRoles } from "../hooks/useRoles";
import { NavBar } from "../components/NavBar";
import { UserTable } from "../components/UserTable";

export function UsersPage() {
  const { users, isLoading: usersLoading, assignRole } = useUsers();
  const { roles, isLoading: rolesLoading } = useRoles();

  const isLoading = usersLoading || rolesLoading;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <NavBar />
      <h1>Users</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        {users.length} user{users.length !== 1 ? "s" : ""} in this tenant. Role changes take effect on the user's next
        request.
      </p>

      {isLoading ? <div>Loading...</div> : <UserTable users={users} roles={roles} onAssignRole={assignRole} />}
    </div>
  );
}
