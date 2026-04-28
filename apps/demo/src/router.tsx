import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UsersPage } from "./pages/UsersPage";
import { RolesPage } from "./pages/RolesPage";
import { AuditPage } from "./pages/AuditPage";
import { PlatformLoginPage } from "./pages/PlatformLoginPage";
import { TenantsPage } from "./pages/TenantsPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/acme/login" replace /> },

  { path: "/:tenant/login", element: <LoginPage /> },
  { path: "/:tenant/register", element: <RegisterPage /> },
  {
    path: "/:tenant/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/:tenant/users",
    element: (
      <ProtectedRoute requirePermission="user:read">
        <UsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/:tenant/roles",
    element: (
      <ProtectedRoute requirePermission="role:read">
        <RolesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/:tenant/audit",
    element: (
      <ProtectedRoute requirePermission="audit:read">
        <AuditPage />
      </ProtectedRoute>
    ),
  },

  { path: "/platform/login", element: <PlatformLoginPage /> },
  { path: "/platform/tenants", element: <TenantsPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
