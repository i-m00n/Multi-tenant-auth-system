import "./index.css";
import ReactDOM from "react-dom/client";
import { AppRouter } from "./router";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AppRouter />
  </AuthProvider>,
);
