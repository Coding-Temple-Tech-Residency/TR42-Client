// App.jsx - routes wrapped in AppShell for authenticated pages
import "./styles/forms.css";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// public pages
import Login from "./components/Login";
import Register from "./pages/Register/Register";

// app shell layout (sidebar + top bar + content area)
import AppShell from "./layouts/AppShell/AppShell";

// authenticated pages
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <Routes>
      {/* public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* all authenticated pages share the AppShell layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        {/* add new pages here — they all get sidebar + top bar automatically */}
      </Route>

      {/* catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
