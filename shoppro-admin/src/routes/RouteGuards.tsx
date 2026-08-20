import React from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

export const PLATFORM_ADMIN_ROLES = ['admin', 'super_admin', 'platform_admin'];

export const RoleRoute: React.FC<{
    roles: string[];
    children: React.ReactElement;
}> = ({ roles, children }) => (
    <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>
);

export const BusinessRootRedirect: React.FC = () => (
    <Navigate to="/dashboard" replace />
);

export const PlatformAdminRootRedirect: React.FC = () => (
    <Navigate to="/tenancy/tenants" replace />
);
