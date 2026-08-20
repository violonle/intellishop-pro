import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, getUser } from '@/utils/storage';
import { LOGIN_PATH } from '@/site';

interface ProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles?: string[];
    unauthorizedPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, unauthorizedPath }) => {
    const token = getToken();
    const location = useLocation();

    if (!token) {
        // Redirect to login but save the current location they were trying to go to
        return <Navigate to={LOGIN_PATH} state={{ from: location }} replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const user = getUser();
        const role = String(user?.role || '').toLowerCase();
        if (!allowedRoles.map(item => item.toLowerCase()).includes(role)) {
            return <Navigate to={unauthorizedPath || '/dashboard'} replace state={{ from: location }} />;
        }
    }

    return children;
};

export default ProtectedRoute;
