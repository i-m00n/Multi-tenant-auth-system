import { useState } from "react";
import { useRoles } from "../hooks/useRoles";
import { NavBar } from "../components/NavBar";
import { RolesList } from "../components/RolesList";

export function RolesPage() {
  const { roles, isLoading, createRole, assignPermission } = useRoles();
  const [newRoleName, setNewRoleName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRole(newRoleName);
    setNewRoleName("");
  };

  if (isLoading) return <div>Loading roles...</div>;

  return (
    <div>
      <NavBar />
      <h1>Roles</h1>
      <form onSubmit={handleCreate}>
        <input
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="new-role-name"
          required
        />
        <button type="submit">Create Role</button>
      </form>
      <RolesList roles={roles} onAssignPermission={assignPermission} />
    </div>
  );
}
