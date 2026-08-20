import request from '@/utils/request';

export interface ProductCategory {
    id: number;
    name: string;
    parentId?: number;
    description?: string;
    imageUrl?: string;
    sortOrder?: number;
    status?: number;
}

export const getCategoryTree = () => {
    return request({
        url: '/product-categories/tree',
        method: 'get',
    });
};

export const getAllActiveCategories = () => {
    return request({
        url: '/product-categories/all',
        method: 'get',
    });
};
