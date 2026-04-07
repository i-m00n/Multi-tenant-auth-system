import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RolesPage } from "./pages/RolesPage";
import { AuditPage } from "./pages/AuditPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/acme/login" replace />,
  },
  {
    path: "/:tenant/login",
    element: <LoginPage />,
  },
  {
    path: "/:tenant/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
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
  {
    path: "*",
    element: <Navigate to="/acme/login" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
