import { http } from './http';

export interface Product {
    id: number;
    name: string;
    sku: string;
    categoryId?: number;
    categoryName?: string; // Optional if backend joins it, otherwise might need separate fetch
    brand?: string;
    model?: string;
    price: number;
    marketPrice?: number;
    costPrice?: number;
    description?: string;
    specifications?: string;
    features?: string;
    images?: string;
    stockQuantity: number;
    minStock?: number;
    salesCount?: number;
    status: 'active' | 'inactive' | 'archived'; // Align with backend
    isFeatured?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductStatistics {
    totalProducts: number;
    activeProducts: number;
    lowStockCount: number;
    categoryCount: number;
    totalStock: number;
    totalSales: number;
}

export const productService = {
    // List products with pagination and filters
    getProducts: async (params: {
        pageNo?: number;
        pageSize?: number;
        categoryId?: number;
        brand?: string;
        status?: string;
        featured?: boolean;
        search?: string; // Custom adaptation for frontend unified search
    }) => {
        // If there is a search term, use the search endpoint, otherwise list
        if (params.search) {
            const response = await http.get<any>('/products/search', {
                params: {
                    keyword: params.search,
                    pageNo: params.pageNo,
                    pageSize: params.pageSize
                }
            });
            return {
                items: response.records || [],
                total: response.total
            };
        } else {
            const response = await http.get<any>('/products/list', { params });
            return {
                items: response.records || [],
                total: response.total
            };
        }
    },

    getProductDetail: async (id: number) => {
        return await http.get<Product>(`/products/${id}`);
    },

    createProduct: async (data: Partial<Product>) => {
        return await http.post<Product>('/products', data);
    },

    updateProduct: async (id: number, data: Partial<Product>) => {
        return await http.put<Product>(`/products/${id}`, data);
    },

    deleteProduct: async (id: number) => {
        return await http.delete(`/products/${id}`);
    },

    updateStock: async (id: number, quantity: number, operation: 'in' | 'out' | 'set') => {
        // Backend expects 'operation' param likely as string description or enum?
        // Checking controller: @RequestParam String operation
        return await http.post(`/products/${id}/stock/update`, null, {
            params: { quantity, operation }
        });
    },

    getProductStatistics: async () => {
        return await http.get<ProductStatistics>('/products/statistics');
    }
};
