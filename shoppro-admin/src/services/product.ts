import request from '@/utils/request';

export interface Product {
    id?: number;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    cost?: number;
    stock: number;
    sku?: string;
    categoryId?: number;
    brand?: string;
    status: number; // 1: On Sale, 0: Off Sale
    images?: string[];
    company?: string;
}

export const getProductPage = (params: any) => {
    return request({
        url: '/products/list',
        method: 'get',
        params,
    });
};

export const getProductById = (id: number) => {
    return request({
        url: `/products/${id}`,
        method: 'get',
    });
};

export const createProduct = (data: any) => {
    return request({
        url: '/products',
        method: 'post',
        data,
    });
};

export const updateProduct = (id: number, data: any) => {
    return request({
        url: `/products/${id}`,
        method: 'put',
        data,
    });
};

export const deleteProduct = (id: number) => {
    return request({
        url: `/products/${id}`,
        method: 'delete',
    });
};
