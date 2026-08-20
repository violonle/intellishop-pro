import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import type { Order, OrderItem } from '../../services/orderService';

const SalesDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);

    useEffect(() => {
        fetchOrderDetail();
    }, [id]);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            if (!id) return;
            const data = await orderService.getOrderDetail(Number(id));
            setOrder(data.order);
            setItems(data.items);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const statusMap: any = {
        0: { text: '待支付', class: 'bg-yellow-100 text-yellow-800' },
        1: { text: '已支付', class: 'bg-blue-100 text-blue-800' },
        2: { text: '已发货', class: 'bg-purple-100 text-purple-800' },
        3: { text: '已完成', class: 'bg-green-100 text-green-800' },
        4: { text: '已取消', class: 'bg-red-100 text-red-800' },
        5: { text: '退款中', class: 'bg-orange-100 text-orange-800' },
        6: { text: '已退款', class: 'bg-gray-100 text-gray-800' },
    };

    const getStatusInfo = (status: number) => statusMap[status] || { text: '未知', class: 'bg-gray-100 text-gray-800' };

    if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;
    if (!order) return <div className="p-8 text-center text-gray-500">订单不存在</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-10 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button onClick={() => navigate(-1)} className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                <span className="text-xl">←</span>
                            </button>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">销售详情</h1>
                                <p className="text-xs text-gray-500">订单号: {order.orderNo}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex items-center">
                                <span className="mr-1">✎</span> 编辑
                            </button>
                            <button className="px-3 py-1.5 bg-[#4640DE] text-white rounded-lg text-sm hover:bg-[#3b36db] flex items-center shadow-sm">
                                <span className="mr-1">🖨</span> 打印订单
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-l-4 border-[#4640DE] pl-3">基本信息</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                <div>
                                    <label className="block text-gray-500 mb-1">订单号</label>
                                    <p className="text-gray-900 font-medium">{order.orderNo}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1">订单状态</label>
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusInfo(order.status).class}`}>
                                        {getStatusInfo(order.status).text}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1">创建日期</label>
                                    <p className="text-gray-900">{order.createdAt}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1">更新日期</label>
                                    <p className="text-gray-900">{order.updatedAt}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1">销售员ID</label>
                                    <p className="text-gray-900">{order.userId}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1">客户ID</label>
                                    <p className="text-gray-900">{order.customerId}</p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info (Placeholder as backend doesn't return full customer details in current API) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-l-4 border-[#4640DE] pl-3">客户信息</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                <div>
                                    <label className="block text-gray-500 mb-1">客户ID</label>
                                    <p className="text-gray-900 font-medium">{order.customerId}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1">备注</label>
                                    <p className="text-gray-900">需从客户管理模块关联查询详情</p>
                                </div>
                            </div>
                        </div>

                        {/* Product Detail */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-l-4 border-[#4640DE] pl-3">产品明细</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">产品名称</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数量</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">单价</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">小计</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.productName}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">¥{item.productPrice.toLocaleString()}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">¥{item.totalPrice.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-l-4 border-[#4640DE] pl-3">备注信息</h3>
                            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                                {order.remark || '无备注'}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-l-4 border-[#4640DE] pl-3">订单摘要</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">商品小计</span>
                                    <span className="text-gray-900">¥{order.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">运费</span>
                                    <span className="text-gray-900">¥0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">优惠金额</span>
                                    <span className="text-red-500">-¥0</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 mt-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base font-medium text-gray-900">订单总额</span>
                                        <span className="text-xl font-bold text-[#4640DE]">¥{order.totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-l-4 border-[#4640DE] pl-3">支付信息</h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <label className="block text-gray-500 mb-1">支付方式</label>
                                    <p className="text-gray-900">{order.paymentMethod || '未支付'}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1">支付状态</label>
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusInfo(order.status).class}`}>
                                        {getStatusInfo(order.status).text}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1">支付时间</label>
                                    <p className="text-gray-900">{order.payTime || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-gray-500 mb-1">实付金额</label>
                                    <p className="text-gray-900 font-mono text-xs">¥{order.payAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Logistics Info (Placeholder) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-l-4 border-[#4640DE] pl-3">物流信息</h3>
                            <div className="p-4 text-center text-gray-500 text-sm">
                                暂无物流信息
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-l-4 border-[#4640DE] pl-3">快速操作</h3>
                            <div className="space-y-3">
                                <button className="w-full py-2 bg-[#4640DE] text-white rounded-lg text-sm hover:bg-[#3b36db] shadow-sm flex justify-center items-center">
                                    <span className="mr-2">📄</span> 复制订单
                                </button>
                                <button className="w-full py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex justify-center items-center">
                                    <span className="mr-2">✉️</span> 发送邮件
                                </button>
                                <button className="w-full py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 flex justify-center items-center">
                                    <span className="mr-2">📞</span> 联系客户
                                </button>
                                <button className="w-full py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 flex justify-center items-center mt-4">
                                    <span className="mr-2">🗑</span> 删除订单
                                </button>
                            </div>
                        </div>

                    </div>
                </div>


            </main>
        </div>
    );
};

export default SalesDetail;
