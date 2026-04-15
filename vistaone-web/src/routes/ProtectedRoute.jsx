import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const VERIFY_TOKEN_ENDPOINT = '/api/users/verify-token';

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('authToken');

    // null = still checking, true = valid, false = invalid or no token
    // Previously set to true as a local-dev bypass - reverted so auth is enforced
    const [isValid, setIsValid] = useState(null);

    useEffect(() => {
        // If there is no token at all, mark as invalid immediately (no need to hit the API)
        if (!token) {
            setIsValid(false);
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch(VERIFY_TOKEN_ENDPOINT, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                setIsValid(res.ok);
            } catch {
                // Network error or server down - treat as invalid to prevent access
                setIsValid(false);
            }
        };

        verifyToken();
    }, [token]);

    if (isValid === null) {
        return <div>Checking authentication...</div>;
    }
    if (!isValid) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
