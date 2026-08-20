import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Users, Search, Plus, Bot, RefreshCw, ListTodo, Workflow } from 'lucide-react';
// import { api } from '../../services/api'; 

import customerService, { type Customer as ApiCustomer } from '../../services/customerService';
import { analyticsService } from '../../services/analyticsService';

// Types
interface Customer extends ApiCustomer {
    avatar?: string;
    satisfactionScore?: number;
    purchaseModel?: string; // Not in backend yet
    purchaseDate?: string; // Not in backend yet
    manager?: string; // Backend has assignedTo (ID)
}

interface AIAnalysisResult {
    risk_level?: string;
    churn_probability?: number;
    high_risk_count?: number;
    total_analyzed?: number;
    recommendations?: string[];
}

const CustomerList: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'leads' | 'customers'>('customers');
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [statsData, setStatsData] = useState({
        totalCustomers: 0,
        byLevel: { vip: 0, diamond: 0 },
        avgSatisfaction: "0%"
    });

    useEffect(() => {
        fetchCustomers();
        customerService.getStatistics().then((data: any) => setStatsData(data));
    }, [activeFilter, searchValue]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            let data;
            if (searchValue) {
                const res = await customerService.searchCustomers(searchValue);
                data = res.records;
            } else {
                // Map filter to backend status/level if possible
                let status = undefined;
                let level = undefined;

                if (activeFilter === 'vip') level = 'vip';
                if (activeFilter === 'active') status = 'active';
                if (activeFilter === 'dormant') status = 'inactive';

                // Note: unique backend statuses: active, inactive, potential, lost
                // Frontend filters: all, vip, active, dormant, high-value

                const res = await customerService.getCustomers({
                    status,
                    level,
                    pageNo: 1,
                    pageSize: 100 // Fetch more for list view for now
                });
                data = res.records;
            }

            // Transform data for UI if needed
            const transformedData: Customer[] = data.map(c => ({
                ...c,
                manager: c.ownerName || (c.assignedTo ? `User ${c.assignedTo}` : '-'),
                // Keep frontend-only fields optional/undefined if backend lacks them
                // satisfactionScore, purchaseModel, purchaseDate will be undefined
            }));

            setCustomers(transformedData);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAIAnalysis = async () => {
        setAnalyzing(true);
        try {
            // Use real API
            const churnData: any = await analyticsService.predictCustomerChurn().catch(() => []);

            if (Array.isArray(churnData)) {
                const highRisk = churnData.length;
                const sampleRecommendations = [
                    '建议对沉睡客户发送激活优惠券',
                    '检测到部分客户活跃度下降，建议立即跟进',
                    'VIP客户近期互动减少，需重点关怀',
                ];

                setAiAnalysis({
                    high_risk_count: highRisk,
                    total_analyzed: customers.length, // approximation
                    recommendations: highRisk > 0 ? [`发现 ${highRisk} 位高风险流失客户`, sampleRecommendations[0]] : ['客户群体状态健康', '继续保持当前的客户关怀策略']
                });
            } else {
                setAiAnalysis({
                    high_risk_count: 0,
                    total_analyzed: customers.length,
                    recommendations: ['暂无风险数据']
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAnalyzing(false);
        }
    };

    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible);
        if (!isSearchVisible) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 text-green-600',
            potential: 'bg-yellow-100 text-yellow-600',
            dormant: 'bg-gray-100 text-gray-600',
            inactive: 'bg-red-100 text-red-600',
            lost: 'bg-red-100 text-red-600' // Added lost
        };
        const labels: Record<string, string> = {
            active: '活跃',
            potential: '潜在',
            dormant: '沉睡',
            inactive: '流失',
            lost: '流失'
        };
        return (
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getLevelBadge = (level: string) => {
        const styles: Record<string, string> = {
            vip: 'bg-orange-100 text-orange-600 border border-orange-200',
            platinum: 'bg-gray-100 text-gray-600 border border-gray-200',
            gold: 'bg-yellow-100 text-yellow-600 border border-yellow-200',
            normal: 'bg-blue-50 text-blue-600 border border-blue-200',
            diamond: 'bg-purple-100 text-purple-600 border border-purple-200' // Added diamond
        };
        const labels: Record<string, string> = {
            vip: 'VIP客户',
            platinum: '银卫客户',
            gold: '金卫客户',
            normal: '普通客户',
            diamond: '钻石客户'
        };
        return (
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${styles[level] || styles.normal}`}>
                {labels[level] || level}
            </span>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Top Header - Consistent with LeadList - Now Blue */}
            <div className="bg-primary px-4 py-4 shadow-md sticky top-0 z-10 transition-colors">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white flex items-center">
                        <Users className="w-6 h-6 text-white mr-2" />
                        客户管理
                    </h1>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => navigate('/operation/tasks')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-sm transition-colors backdrop-blur-sm">
                            <ListTodo className="w-4 h-4 mr-1 inline" />
                            SOP待办
                        </button>
                        <button onClick={() => navigate('/customers/new')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-sm transition-colors backdrop-blur-sm">
                            <Plus className="w-4 h-4 mr-1 inline" />添加记录
                        </button>
                        <button onClick={toggleSearch} className="p-2 text-blue-100 hover:text-white transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                {/* Expandable Search Input */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSearchVisible ? 'max-h-16 mt-3' : 'max-h-0'}`}>
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="搜索客户姓名、电话、车型..."
                        className="w-full px-4 py-2 bg-white text-gray-900 border-none rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
                    />
                </div>
            </div>

            {/* Tabs - Consistent with LeadList */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
                <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                    <button
                        onClick={() => navigate('/leads')}
                        className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'leads' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ClipboardList className="w-4 h-4 mr-2" />
                        线索管理
                    </button>
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'customers' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        客户管理
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="px-4 py-3 overflow-x-auto border-b border-gray-50 bg-white">
                <div className="flex space-x-2">
                    {['all', 'vip', 'active', 'dormant', 'high-value'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeFilter === filter
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {{
                                all: '全部',
                                vip: 'VIP客户',
                                active: '活跃客户',
                                dormant: '沉睡客户',
                                'high-value': '高价值'
                            }[filter]}
                        </button>
                    ))}
                </div>
            </div>

            {/* AI Analysis Card */}
            <div className="px-4 py-4">
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-gray-900 font-semibold flex items-center">
                                <Bot className="w-5 h-5 mr-2 text-primary" />
                                AI客户价值分析
                                <span className="ml-2 px-2 py-0.5 bg-white border border-blue-100 text-primary text-[10px] rounded">智能推荐</span>
                            </h3>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                        {aiAnalysis ? (
                            <>
                                本月分析了 <strong>{aiAnalysis.total_analyzed}</strong> 位客户<br />
                                • 发现 <strong className="text-danger">{aiAnalysis.high_risk_count}</strong> 位高流失风险客户<br />
                                • 建议: {aiAnalysis.recommendations?.[0]}
                            </>
                        ) : (
                            "正在监测客户数据，点击下方按钮生成最新分析报告..."
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleAIAnalysis}
                            disabled={analyzing}
                            className="px-3 py-1.5 bg-white border border-blue-200 text-primary rounded-lg text-xs hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center shadow-sm"
                        >
                            {analyzing ? '分析中...' : '刷新分析'} <RefreshCw className="w-3 h-3 ml-1" />
                        </button>
                        <button className="px-3 py-1.5 text-gray-500 hover:text-primary text-xs transition-colors">
                            查看详细报告
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm text-center">
                        <div className="text-lg font-bold text-gray-900">{statsData.totalCustomers}</div>
                        <div className="text-xs text-gray-500">总客户数</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm text-center">
                        <div className="text-lg font-bold text-accent">{(statsData.byLevel?.vip || 0) + (statsData.byLevel?.diamond || 0)}</div>
                        <div className="text-xs text-gray-500">VIP客户</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm text-center">
                        <div className="text-lg font-bold text-success">{statsData.avgSatisfaction}</div>
                        <div className="text-xs text-gray-500">满意度</div>
                    </div>
                </div>
            </div>

            {/* Customer List */}
            <div className="px-4 space-y-3">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">加载中...</div>
                ) : customers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">暂无客户</div>
                ) : (
                    customers.map(customer => (
                        <div
                            key={customer.id}
                            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-primary/30 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <img
                                            src={customer.avatar || `https://ui-avatars.com/api/?name=${customer.name}`}
                                            alt={customer.name}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                        />
                                        {customer.level === 'vip' && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent border-2 border-white rounded-full"></span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                                            {getLevelBadge(customer.level)}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                            {getStatusBadge(customer.status)}
                                            <span className="text-gray-300">|</span>
                                            <span>{customer.purchaseModel ? '已购车' : '未购车'}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {customer.satisfactionScore ? (
                                        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
                                            价值评分: <span className="font-medium text-gray-900">{customer.satisfactionScore}</span>
                                        </div>
                                    ) : null}
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        最近: {new Date(customer.lastPurchaseAt || customer.createdAt || '').toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3 text-xs bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                <div>
                                    <span className="text-gray-500">意向车型:</span>
                                    <span className="ml-1 font-medium text-gray-900">{customer.purchaseModel || (customer.preferences as any)?.interestedModel || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">最近活跃:</span>
                                    <span className="ml-1 font-medium text-gray-900">{customer.purchaseDate || (customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : '-')}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">联系电话:</span>
                                    <span className="ml-1 font-medium text-gray-900">{customer.phone || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">所在地区:</span>
                                    <span className="ml-1 font-medium text-gray-900">{customer.address || '-'}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {Array.isArray(customer.tags) && customer.tags.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/tags/${encodeURIComponent(tag)}`);
                                        }}
                                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors cursor-pointer"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="text-xs text-gray-400 flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {customer.manager}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/operation/sop');
                                        }}
                                        className="text-blue-600 text-xs font-medium hover:text-blue-700 flex items-center"
                                    >
                                        <Workflow className="w-3 h-3 mr-1" />
                                        配置SOP
                                    </button>
                                    <button
                                        onClick={() => navigate(`/customers/${customer.id}`)}
                                        className="text-primary text-xs font-medium hover:text-primary-dark hover:underline"
                                    >
                                        查看详情
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Button */}
            <button onClick={() => navigate(`/customers/new`)} className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg border border-primary/20 flex items-center justify-center hover:bg-primary/90 transition-colors z-20">
                <Plus className="w-6 h-6" />
            </button>
        </div>
    );
};

export default CustomerList;
