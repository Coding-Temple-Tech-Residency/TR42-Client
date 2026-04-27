import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function PermissionRoute({ children, resource }) {
    const { token, hasPermission, profileReady } = useAuthContext();

    if (!token) return <Navigate to="/login" replace />;

    // Wait for fresh permissions from the server before deciding
    if (!profileReady) return null;

    if (!hasPermission(resource, 'read')) return <Navigate to="/access-denied" replace />;

    return children;
}
