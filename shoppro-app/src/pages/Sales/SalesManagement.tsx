import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import type { Order } from '../../services/orderService';

const SalesManagement: React.FC = () => {
    const navigate = useNavigate();
    // const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sales, setSales] = useState<Order[]>([]);
    const [totalSales, setTotalSales] = useState(0);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const data = await orderService.getOrders({ pageNo: 1, pageSize: 20 });
            setSales(data.items);

            // Calculate the visible page total; the backend remains the source of truth for full totals.
            const total = data.items.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
            setTotalSales(total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statusMap: Record<number, { text: string; color: string; key: string }> = {
        0: { text: '待支付', color: 'bg-yellow-100 text-yellow-700', key: 'pending' },
        1: { text: '已支付', color: 'bg-blue-100 text-blue-700', key: 'paid' },
        2: { text: '已发货', color: 'bg-purple-100 text-purple-700', key: 'shipped' },
        3: { text: '已完成', color: 'bg-green-100 text-green-700', key: 'completed' },
        4: { text: '已取消', color: 'bg-red-100 text-red-700', key: 'cancelled' },
        5: { text: '退款中', color: 'bg-orange-100 text-orange-700', key: 'refunding' },
        6: { text: '已退款', color: 'bg-gray-100 text-gray-700', key: 'refunded' },
    };

    const getStatusInfo = (status: number) => statusMap[status] || { text: '未知', color: 'bg-gray-100 text-gray-700' };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <span className="text-gray-600 text-lg">←</span>
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">销售管理</h1>
                    </div>
                    {/* 
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-3 py-1.5 bg-[#4640DE] text-white rounded-lg text-sm flex items-center shadow-sm"
                    >
                        <span>+ 新增记录</span>
                    </button>
                    */}
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">本月销售额</div>
                        <div className="text-lg font-bold text-gray-900">¥{totalSales.toLocaleString()}</div>
                        <div className="text-xs text-green-600 mt-1">统计自当前页</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">订单数量</div>
                        <div className="text-lg font-bold text-gray-900">{sales.length}</div>
                        <div className="text-xs text-green-600 mt-1">+0%</div>
                    </div>
                </div>

                {/* Sales List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">订单列表</h3>
                        <div className="text-xs text-gray-500">共 {sales.length} 条</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">加载中...</div>
                        ) : sales.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">暂无订单</div>
                        ) : (
                            sales.map((sale) => (
                                <div key={sale.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/sales/orders/${sale.id}`)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 mr-4">
                                            <div className="font-medium text-gray-900 line-clamp-1">订单号: {sale.orderNo}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">客户ID: {sale.customerId} (需要关联)</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900">¥{sale.totalAmount.toLocaleString()}</div>
                                            <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full ${getStatusInfo(sale.status).color}`}>
                                                {getStatusInfo(sale.status).text}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50 border-dashed">
                                        <div className="flex space-x-3">
                                            <span>ID: {sale.id}</span>
                                            <span>{sale.createdAt}</span>
                                        </div>
                                        <span>销售: {sale.userId}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesManagement;
