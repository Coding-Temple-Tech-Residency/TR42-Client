import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'

import Login from './components/Login'

import AppShell from './layouts/AppShell/AppShell'

import Dashboard from './pages/Dashboard/Dashboard'
import VendorDirectory from './pages/Vendors/VendorDirectory'
import VendorDetail from './pages/Vendors/VendorDetail'
import AddVendor from './pages/Vendors/AddVendor'
import WorkOrderCreate from './pages/WorkOrders/WorkOrderCreate'

const App = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route
                element={
                    <ProtectedRoute>
                        <AppShell />
                    </ProtectedRoute>
                }
            >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vendors" element={<VendorDirectory />} />
                <Route path="/vendors/:vendorId" element={<VendorDetail />} />
                <Route path="/vendors/add" element={<AddVendor />} />
                <Route path="/work-orders/create" element={<WorkOrderCreate />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

export default App
