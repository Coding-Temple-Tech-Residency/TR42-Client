// main app component - sets up routing between pages
import "./styles/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Sidebar from "./layouts/Sidebar/Sidebar";
import Dashboard from "./pages/Dashboard/Dashboard";
import { sidebarNav } from "./data/dashboardData";

function App() {
  return (
    // BrowserRouter wraps the whole app so we can use routes
    <BrowserRouter>
      <Routes>
        {/* login is the default page users see first */}
        <Route path="/" element={<Login />} />

        {/* registration page */}
        <Route path="/register" element={<Register />} />

        {/* dashboard has the sidebar layout wrapping it */}
        <Route
          path="/dashboard"
          element={
            <div className="app-layout">
              <Sidebar navData={sidebarNav} />
              <Dashboard />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
