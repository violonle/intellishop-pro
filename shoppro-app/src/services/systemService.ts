import { http } from './http';
import type { User } from './authService';

// Enterprise Interfaces
export interface Enterprise {
    id: number;
    name: string;
    shortName: string;
    isCertified: boolean;
    socialCode?: string;
    legalPerson?: string;
    contactName?: string;
    contactPhone?: string;
    email?: string;
    address?: string;
}

// Role/Position Interfaces
export interface Role {
    id: number;
    name: string;
    level: number;
    levelName: string;
    description?: string;
}

// Permission Interfaces
export interface Permission {
    id: number;
    name: string;
    code: string;
    resource: string;
    status: number;
}

// System Service
export const systemService = {
    // --- Enterprise ---
    getEnterpriseInfo: () => {
        // Assuming single enterprise for now, or get ID from context
        // If backend doesn't support 'current', we might need to fetch by known ID or user's enterpriseId
        return http.get<Enterprise>('/enterprise/current');
    },

    updateEnterpriseInfo: (data: Partial<Enterprise>) => {
        return http.put<Enterprise>('/enterprise/current', data);
    },

    submitCertification: (data: Partial<Enterprise>) => {
        return http.post<Enterprise>('/enterprise/certification', data);
    },

    getCertificationStatus: (id: number) => {
        return http.get<Enterprise>(`/enterprise/certification/${id}`);
    },

    // --- Roles (Positions) ---
    getRoles: () => {
        return http.get<Role[]>('/roles');
    },

    createRole: (data: Partial<Role>) => {
        return http.post<Role>('/roles', data);
    },

    updateRole: (id: number, data: Partial<Role>) => {
        return http.put<Role>(`/roles/${id}`, data);
    },

    deleteRole: (id: number) => {
        return http.delete(`/roles/${id}`);
    },

    // --- Staff (Users) ---
    getStaffList: (page = 1, pageSize = 10, roleId?: number) => {
        return http.get<{ records: User[], total: number }>('/users/list', {
            params: { pageNo: page, pageSize, roleFilter: roleId }
        });
    },

    addStaff: (data: Partial<User>) => {
        // Usually creating a user/staff member
        return http.post<User>('/users', data);
    },

    updateStaff: (id: number | string, data: Partial<User>) => {
        return http.put<User>(`/users/${id}`, data);
    },

    deleteStaff: (id: number | string) => {
        return http.delete(`/users/${id}`);
    },

    // --- Permissions ---
    getAllPermissions: () => {
        return http.get<Permission[]>('/permissions/enabled');
    },

    getAllResources: () => {
        return http.get<string[]>('/permissions/resources');
    },

    countEnabledPermissions: () => {
        return http.get<number>('/permissions/count/enabled');
    },

    getUserPermissions: (userId: number | string) => {
        return http.get<Permission[]>(`/permissions/user/${userId}`);
    },

    getRolePermissions: (roleId: number) => {
        return http.get<Permission[]>(`/permissions/role/${roleId}`);
    },

    assignPermissionsToRole: (roleId: number, permissionIds: number[]) => {
        return http.post(`/roles/${roleId}/permissions`, permissionIds);
    }
};

export default systemService;
