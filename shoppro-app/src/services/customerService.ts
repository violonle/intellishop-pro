import { http } from './http';

export interface Customer {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    level: string; // 'vip', 'high', 'medium', 'low'
    status: string; // 'active', 'inactive'
    tags?: string[]; // Backend returns list
    address?: string;
    company?: string;
    ownerId?: number; // Legacy or alternative
    assignedTo?: number; // Backend field
    ownerName?: string; // Optional if joined
    lastPurchaseAt?: string;
    createdAt?: string;
    updatedAt?: string;
    preferences?: Record<string, any>; // Backend field
    notes?: string; // Backend field
    totalOrders?: number; // From stats
    totalAmount?: number; // From stats
    satisfactionScore?: number;
    purchaseModel?: string;
    purchaseDate?: string;
    manager?: string;
}

export const customerService = {
    // List Customers
    getCustomers: (params: { pageNo?: number; pageSize?: number; status?: string; level?: string }) => {
        return http.get<{ records: Customer[], total: number }>('/customers/list', { params });
    },

    // Search Customers
    searchCustomers: (keyword: string, pageNo = 1, pageSize = 10) => {
        return http.get<{ records: Customer[], total: number }>('/customers/search', {
            params: { keyword, pageNo, pageSize }
        });
    },

    // Get Customer Detail
    getCustomerDetail: (id: number) => {
        return http.get<Customer>(`/customers/${id}`);
    },

    // Create Customer
    createCustomer: (data: Partial<Customer>) => {
        return http.post<Customer>('/customers', data);
    },

    // Update Customer
    updateCustomer: (id: number, data: Partial<Customer>) => {
        return http.put<Customer>(`/customers/${id}`, data);
    },

    // Delete Customer
    deleteCustomer: (id: number) => {
        return http.delete(`/customers/${id}`);
    },

    // Get Customer Statistics
    getStatistics: () => {
        return http.get<any>('/customers/statistics');
    }
};

export default customerService;
