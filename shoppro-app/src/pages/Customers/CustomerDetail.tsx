import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Edit2, Trash2, Plus, Phone, Mail, ShoppingBag } from 'lucide-react';
import { type Customer, customerService } from '../../services/customerService';
import { followUpService, type FollowUpRecord } from '../../services/followUpService';
// import { useAuth } from '../../store/hooks'; 

// Types
interface ContactRecord {
    id: number;
    method: 'phone' | 'email' | 'meeting' | 'wechat';
    content: string;
    date: string;
    followUpDate?: string;
}

interface Order {
    id: string;
    date: string;
    amount: number;
    status: 'completed' | 'processing' | 'cancelled';
}

interface CustomerDetailData extends Customer {
    display_name?: string;
    type?: string;
    avatar?: string;
    orders: Order[];
    contacts: ContactRecord[];
    related: { id: number; name: string; company: string; avatar: string }[];
    stats: {
        totalOrders: number;
        totalAmount: number;
        avgAmount: number;
        lastOrder: string;
        value: string;
    };
}

const CustomerDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [customer, setCustomer] = useState<CustomerDetailData | null>(null);
    const [followUps, setFollowUps] = useState<FollowUpRecord[]>([]);

    // Form state
    const [formData, setFormData] = useState<Partial<CustomerDetailData>>({});

    useEffect(() => {
        if (id) {
            fetchCustomerDetail(Number(id));
        }
    }, [id]);

    const fetchCustomerDetail = async (customerId: number) => {
        setLoading(true);
        try {
            const [data, history] = await Promise.all([
                customerService.getCustomerDetail(customerId),
                followUpService.listByCustomer(customerId).catch(() => [])
            ]);
            setFollowUps(Array.isArray(history) ? history : []);

            // Transform to UI model
            const uiData: CustomerDetailData = {
                ...data,
                type: 'enterprise', // Default or derived
                avatar: `https://ui-avatars.com/api/?name=${data.name}&background=4640DE&color=fff&rounded=true`,
                orders: [], // Backend doesn't support yet
                contacts: [], // Backend doesn't support yet
                related: [],
                stats: {
                    totalOrders: 0,
                    totalAmount: 0,
                    avgAmount: 0,
                    lastOrder: '-',
                    value: data.level // Use level as value proxy
                }
            };

            setCustomer(uiData);
            setFormData(uiData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!customer || !id) return;

            await customerService.updateCustomer(Number(id), {
                ...formData,
                tags: formData.tags || []
            });

            // Refresh
            setIsEditing(false);
            fetchCustomerDetail(Number(id));
        } catch (error) {
            console.error('Failed to update customer', error);
        }
    };

    const handleDelete = async () => {
        if (!customer) return;
        if (window.confirm('确定要删除这个客户吗？此操作不可恢复。')) {
            try {
                await customerService.deleteCustomer(customer.id);
                navigate('/customers');
            } catch (error) {
                console.error('Failed to delete customer', error);
            }
        }
    };

    // Tabs state
    const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'orders' | 'history'>('overview');

    if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;
    if (!customer) return <div className="p-8 text-center text-gray-500">客户不存在</div>;

    const getStatusBadge = (status: string) => {
        const map: any = {
            active: 'bg-green-100 text-green-600',
            potential: 'bg-blue-100 text-blue-600',
            inactive: 'bg-gray-100 text-gray-600'
        };
        const labels: any = { active: '活跃', potential: '潜在', inactive: '流失' };
        return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* 1. Page Header (Sticky) */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Top Bar: Back & Title */}
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate(-1)} className="p-1 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg font-bold text-gray-900">{customer.name}</h1>
                                {getStatusBadge(customer.status)}
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                                    {customer.type === 'enterprise' ? '企业客户' : '个人客户'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleDelete}
                                className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                                title="删除客户"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark shadow-sm transition-colors flex items-center">
                                <Plus className="w-4 h-4 mr-1" /> 新建订单
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Hero Profile Section (Simplified B2B Style) */}
            <div className="bg-white border-b border-gray-200 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        {/* Identity */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="h-20 w-20 rounded-full border border-gray-200 shadow-sm overflow-hidden bg-gray-100">
                                    <img src={customer.avatar} alt={customer.name} className="h-full w-full object-cover" />
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col gap-1 mb-3">
                                    <div className="text-sm text-gray-500 font-medium">客户ID: {customer.id}</div>
                                    <div className="flex items-center gap-4 text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                                            {customer.company || '无公司信息'}
                                        </div>
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                            {customer.phone}
                                        </div>
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            {customer.email}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Metrics */}
                        <div className="flex gap-4">
                            <div className="px-6 py-3 bg-gray-50 rounded-lg border border-gray-100 text-center min-w-[120px]">
                                <div className="text-xs text-gray-500 mb-1">总消费金额</div>
                                <div className="text-lg font-bold text-gray-900">¥{customer.stats?.totalAmount?.toLocaleString() || 0}</div>
                            </div>
                            <div className="px-6 py-3 bg-gray-50 rounded-lg border border-gray-100 text-center min-w-[120px]">
                                <div className="text-xs text-gray-500 mb-1">订单数</div>
                                <div className="text-lg font-bold text-gray-900">{customer.stats?.totalOrders || 0}</div>
                            </div>
                            <div className="px-6 py-3 bg-gray-50 rounded-lg border border-gray-100 text-center min-w-[120px]">
                                <div className="text-xs text-gray-500 mb-1">客户价值</div>
                                <div className="text-lg font-bold text-primary">{customer.stats?.value || customer.level || 'Unknown'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Tabs Navigation */}
            <div className="border-b border-gray-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {[
                            { id: 'overview', label: '客户概览' },
                            { id: 'details', label: '详细资料' },
                            { id: 'orders', label: `订单历史 (${customer.orders.length})` },
                            { id: 'history', label: '跟进记录' }
                        ].map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 text-sm font-medium border-b-2 transition-all ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. Tab Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab: Overview */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Recent Activity Card */}
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-bold text-gray-900">最近动态</h3>
                                    <button className="text-xs text-indigo-600 font-medium hover:underline">查看全部</button>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {customer.contacts.slice(0, 3).map(contact => (
                                        <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${contact.method === 'phone' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    {contact.method === 'phone' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-900 font-medium mb-1">{contact.content}</p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span>{contact.date}</span>
                                                        {contact.followUpDate && (
                                                            <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                                                下次跟进: {contact.followUpDate}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* AI Insights (Simplified for Overview) */}
                            <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                                <h3 className="font-bold text-indigo-900 mb-3 flex items-center">
                                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                                    AI 智能分析
                                </h3>
                                <p className="text-sm text-indigo-800 leading-relaxed mb-4">
                                    {customer.name} 是高价值活跃客户，近期对高端产品线表现出浓厚兴趣。建议在下次沟通中重点推介新品，并提供VIP专属折扣。
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-indigo-700">流失风险</span>
                                        <span className="font-bold text-green-600">低 (5%)</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-indigo-700">预计下次购买</span>
                                        <span className="font-bold text-indigo-900">7天内</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Details */}
                {activeTab === 'details' && (
                    <div className="max-w-4xl">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">客户详细资料</h3>
                                    <p className="text-sm text-gray-500 mt-1">管理客户的基础联系信息和备注</p>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center"
                                    >
                                        <Edit2 className="w-4 h-4 mr-2" /> 编辑资料
                                    </button>
                                )}
                            </div>
                            <div className="p-8">
                                {isEditing ? (
                                    <form onSubmit={handleSave}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Reuse existing inputs style */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">客户姓名</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">公司名称</label>
                                                <input
                                                    type="text"
                                                    name="company"
                                                    value={formData.company || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">邮箱地址</label>
                                                <input
                                                    type="text"
                                                    name="email"
                                                    value={formData.email || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">通讯地址</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">备注信息</label>
                                                <textarea
                                                    rows={4}
                                                    name="notes"
                                                    value={formData.notes || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-gray-900 resize-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-end space-x-4 border-t border-gray-100 pt-6">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                            >
                                                取消
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-colors"
                                            >
                                                保存更改
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                        <div className="group">
                                            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">客户姓名</h4>
                                            <p className="text-lg font-medium text-gray-900 border-b border-transparent group-hover:border-gray-100 pb-1 transition-colors">{customer.name}</p>
                                        </div>
                                        <div className="group">
                                            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">公司名称</h4>
                                            <p className="text-lg font-medium text-gray-900 border-b border-transparent group-hover:border-gray-100 pb-1 transition-colors">{customer.company}</p>
                                        </div>
                                        <div className="group">
                                            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">联系电话</h4>
                                            <p className="text-lg font-medium text-gray-900 flex items-center border-b border-transparent group-hover:border-gray-100 pb-1 transition-colors">
                                                <span className="font-mono text-gray-600 bg-gray-100 px-2 rounded mr-2">+86</span> {customer.phone}
                                            </p>
                                        </div>
                                        <div className="group">
                                            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">邮箱地址</h4>
                                            <p className="text-lg font-medium text-indigo-600 border-b border-transparent group-hover:border-gray-100 pb-1 transition-colors">{customer.email}</p>
                                        </div>
                                        <div className="md:col-span-2 group">
                                            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">通讯地址</h4>
                                            <p className="text-lg font-medium text-gray-900 border-b border-transparent group-hover:border-gray-100 pb-1 transition-colors">{customer.address}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">备注信息</h4>
                                            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-100 text-sm leading-relaxed">
                                                {customer.notes}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Orders */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">订单号</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">日期</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">金额</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">状态</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customer.orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">¥{order.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {order.status === 'completed' ? '已完成' : order.status === 'processing' ? '处理中' : '已取消'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-indigo-600 hover:text-indigo-900">查看</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab: History (Placeholder) */}
                {activeTab === 'history' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        {followUps.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">暂无跟进记录</div>
                        ) : (
                            <div className="space-y-4">
                                {followUps.map(record => (
                                    <div key={record.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="font-medium text-gray-900">{record.title || '跟进记录'}</span>
                                            <span className="text-xs text-gray-400">{record.createdAt || '暂无时间'}</span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{record.content || '暂无内容'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDetail;
