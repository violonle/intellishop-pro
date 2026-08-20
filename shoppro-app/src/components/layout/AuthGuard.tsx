import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        console.log('[AuthGuard] Checking auth state:', { isAuthenticated, path: location.pathname });
        if (!isAuthenticated) {
            console.warn('[AuthGuard] Not authenticated, redirecting to login from:', location.pathname);
            // Redirect to login page, but save the location they were trying to access
            navigate('/login', { state: { from: location }, replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    if (!isAuthenticated) {
        return null; // Or a loading spinner
    }

    return <>{children}</>;
};

export default AuthGuard;
