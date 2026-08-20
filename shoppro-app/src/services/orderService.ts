import { http } from './http';

export interface Order {
    id: number;
    orderNo: string;
    customerId: number;
    userId: number; // Salesperson
    totalAmount: number;
    payAmount: number;
    paymentMethod: string;
    status: number; // 0-待支付, 1-已按支付, 2-已发货, 3-已完成, 4-已取消, 5-退款中, 6-已退款
    payTime?: string;
    remark?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    productName: string;
    productPic?: string;
    productPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface OrderDetail extends Order {
    items: OrderItem[];
    customerName?: string; // Optional, might need to fetch separately or if backend adapts
    salespersonName?: string;
}

export const orderService = {
    // Page orders
    getOrders: async (params: {
        pageNo?: number;
        pageSize?: number;
        customerId?: number;
        status?: number;
    }) => {
        const response = await http.get<any>('/orders', { params });
        return {
            items: response.records || [],
            total: response.total
        };
    },

    // Get order details
    getOrderDetail: async (id: number) => {
        // Backend returns Map<String, Object> with "order" and "items"
        return await http.get<{ order: Order; items: OrderItem[] }>(`/orders/${id}`);
    },

    // Create order
    createOrder: async (data: {
        customerId: number;
        items: { productId: number; quantity: number }[];
        remark?: string;
        paymentMethod?: string;
    }) => {
        return await http.post<Order>('/orders', data);
    },

    // Update status
    updateStatus: async (id: number, status: number) => {
        return await http.put(`/orders/${id}/status`, null, {
            params: { status }
        });
    }
};
