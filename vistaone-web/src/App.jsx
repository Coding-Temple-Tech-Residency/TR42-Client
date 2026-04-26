import "./styles/forms.css";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import WorkOrders from "./pages/WorkOrders";
import Wells from "./pages/Wells";
import Vendors from "./pages/Vendors";
import VendorMarketplace from "./pages/VendorMarketplace";
import VendorFavorites from "./pages/VendorFavorites";
import VendorDetail from "./pages/VendorDetail";
import Contracts from "./pages/Contracts";
import Invoices from "./pages/Invoices";
import Tickets from "./pages/Tickets";
import Analytics from "./pages/Analytics";
import Fraud from "./pages/Fraud";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import RegisterUser from "./pages/RegisterUser";
import RegisterClient from "./pages/RegisterClient";
import VerifyEmail from "./pages/VerifyEmail";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import RoleManagement from "./pages/RoleManagement";
import Profile from "./pages/UserProfile";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterUser />} />
            <Route path="/register-client" element={<RegisterClient />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/workorders"
                element={
                    <ProtectedRoute>
                        <WorkOrders />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/wells"
                element={
                    <ProtectedRoute>
                        <Wells />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendors"
                element={
                    <ProtectedRoute>
                        <Vendors />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendor-marketplace"
                element={
                    <ProtectedRoute>
                        <VendorMarketplace />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendor-favorites"
                element={
                    <ProtectedRoute>
                        <VendorFavorites />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/vendors/:vendorId"
                element={
                    <ProtectedRoute>
                        <VendorDetail />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/contracts"
                element={
                    <ProtectedRoute>
                        <Contracts />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/invoices"
                element={
                    <ProtectedRoute>
                        <Invoices />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <RoleProtectedRoute roles={["MASTER", "ADMIN"]}>
                        <UserManagement />
                    </RoleProtectedRoute>
                }
            />
            <Route
                path="/admin/roles"
                element={
                    <RoleProtectedRoute roles={["MASTER"]}>
                        <RoleManagement />
                    </RoleProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <RoleProtectedRoute roles={["MASTER"]}>
                        <Settings />
                    </RoleProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />

            <Route
                 path="/tickets"
                 element={
                    <ProtectedRoute>
                       <Tickets />
                    </ProtectedRoute>
                  }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
                  
              <Route
                path="/fraud"
                element={
                  <ProtectedRoute>
                    <Fraud />
                  </ProtectedRoute>
                }
              />
                  
              <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
    );
}

export default App;
