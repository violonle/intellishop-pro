import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    ChevronRight,
    Bot,
    BarChart2,
    BookOpen,
    MessageSquare,
    Book,
    Target,
    AlertTriangle,
    CheckCircle,
    UserMinus,
    Calendar,
    TrendingUp,
    BotMessageSquare,
    Radio,
    Sparkles
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { leadService } from '../../services/leadService';
import { authService } from '../../services/authService';

interface DashboardStats {
    totalSales: string;
    orderCount: number;
    customerCount: number;
    avgOrderValue: string;
    newLeads?: number;
    customerVisits?: number;
    pendingOrders?: number;
    dealCount?: number;
    conversionRate?: string;
    salesAmount?: number;
    revenueTrend?: string;
    highIntentCount?: number;
}

interface Lead {
    id: number;
    title: string;
    description: string;
    budgetRange: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    successProbability: number;
    ownerName: string;
}

interface DashboardAlert {
    type: string;
    message: string;
    severity?: string;
    details?: string;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'company' | 'team' | 'personal'>('personal');
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<DashboardStats>({
        newLeads: 0,
        customerVisits: 0,
        pendingOrders: 0,
        conversionRate: "0%",
        totalSales: "¥0",
        orderCount: 0,
        customerCount: 0,
        avgOrderValue: "¥0",
        revenueTrend: ""
    });
    const [leads, setLeads] = useState<Lead[]>([]);
    const [agentSummary, setAgentSummary] = useState<any>({ activeAgentsCount: 0, todayExecutedTasks: 0, pendingTasks: 0 });
    const [revenueData, setRevenueData] = useState<any>({ winRate: 0, winRateTrend: '0%' });
    const [topSignal, setTopSignal] = useState<any>(null);
    const [alerts, setAlerts] = useState<DashboardAlert[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';

                // Fetch User Profile
                const userData = await authService.getCurrentUser().catch(err => {
                    console.warn('User profile fetch failed:', err);
                    return null;
                });
                if (userData) setUser(userData);

                // Fetch Dashboard Stats
                const dashboardData: any = await analyticsService.getSalesDashboard().catch(err => {
                    console.warn('Dashboard stats failed:', err);
                    return null;
                });

                // Fetch Funnel Data (for leads and visits)
                const funnelData: any = await analyticsService.getSalesFunnelAnalysis().catch(err => {
                    console.warn('Funnel data failed:', err);
                    return null;
                });

                // Fetch Comparison Logic (for trends)
                const comparisonData: any = await analyticsService.getMonthOverMonthComparison().catch(err => {
                    console.warn('Comparison data failed:', err);
                    return null;
                });

                if (dashboardData && typeof dashboardData === 'object') {
                    setStats(prev => ({
                        ...prev,
                        pendingOrders: Number(dashboardData.pendingOrders) || 0,
                        dealCount: Number(dashboardData.totalOrdersThisMonth) || 0,
                        salesAmount: Number(dashboardData.monthlyRevenue) || 0,
                        conversionRate: dashboardData.conversionRate || '0%'
                    }));
                }

                if (funnelData && funnelData.funnel) {
                    const leads = funnelData.funnel.find((f: any) => f.stage === "Leads")?.count || 0;
                    const visits = funnelData.funnel.find((f: any) => f.stage === "Qualified")?.count || 0;

                    setStats(prev => ({
                        ...prev,
                        newLeads: leads,
                        customerVisits: visits
                    }));
                }

                if (comparisonData) {
                    setStats(prev => ({
                        ...prev,
                        revenueTrend: comparisonData.growthRate
                    }));
                }

                // 异步获取 4 大模块关键数据
                try {
                    const [agentRes, revRes, sigRes] = await Promise.all([
                        fetch('/api/ai/agents/summary', { headers: { 'Authorization': `Bearer ${token}` } }),
                        fetch('/api/ai/revenue/dashboard', { headers: { 'Authorization': `Bearer ${token}` } }),
                        fetch('/api/ai/signals', { headers: { 'Authorization': `Bearer ${token}` } })
                    ]);
                    const [agentJson, revJson, sigJson] = await Promise.all([agentRes.json(), revRes.json(), sigRes.json()]);
                    if (agentJson.data) setAgentSummary(agentJson.data);
                    if (revJson.data) setRevenueData(revJson.data);
                    if (sigJson.data && sigJson.data.length > 0) setTopSignal(sigJson.data[0]);
                } catch (e) {
                    console.warn('AI Strategic modules fetch error:', e);
                }

                // Fetch AI Leads for the "Assistant" section
                const aiLeadsData: any = await analyticsService.getAiLeads().catch(err => {
                    console.warn('AI leads fetch failed:', err);
                    return null;
                });

                if (aiLeadsData && Array.isArray(aiLeadsData)) {
                    const highIntentCount = aiLeadsData.filter((l: any) => l.score >= 80).length;
                    setStats(prev => ({
                        ...prev,
                        highIntentCount: highIntentCount
                    }));
                }

                // Fetch Recent Leads
                const leadsRes = await leadService.getLeads({ pageSize: 3, priority: 'high' }).catch(err => {
                    console.warn('Leads fetch failed:', err);
                    return null;
                });

                if (leadsRes && Array.isArray(leadsRes.items)) {
                    const validLeads = leadsRes.items
                        .filter((item: any) => item && typeof item === 'object')
                        .map((item: any) => ({
                            id: item.id || Math.random(),
                            title: item.title || item.name || '新线索',
                            description: item.description || item.car || '意向客户',
                            budgetRange: item.budgetRange || `${item.budget || 0}万`,
                            priority: item.priority || 'medium',
                            successProbability: Number(item.successProbability || item.probability) || 0,
                            ownerName: item.ownerName || '暂无'
                        }));
                    setLeads(validLeads);
                }

                // Fetch Alerts
                const alertsData = await analyticsService.getAnomalyAlerts().catch(err => {
                    console.warn('Alerts fetch failed:', err);
                    return [];
                });
                setAlerts(alertsData || []);

                // Fetch Trend Data for Chart
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const today = now.toISOString().split('T')[0];
                const trendRes: any = await analyticsService.getSalesTrend(startOfMonth, today, 'day').catch(err => {
                    console.warn('Trend fetch failed:', err);
                    return null;
                });

                if (trendRes && Array.isArray(trendRes.data)) {
                    setChartData(trendRes.data.map((item: any) => ({
                        name: item.period.substring(8),
                        revenue: item.revenue,
                        orders: item.orderCount
                    })));
                }

            } catch (error) {
                console.error('Failed to load dashboard data fully', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const getInitials = (name: string) => name.charAt(0);
    const monthlyTarget = Number(user?.monthlyTarget || user?.salesTargets || 0);

    // Add state for chart
    const [chartData, setChartData] = useState<any[]>([]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-primary font-medium">加载中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] pb-24">
            {/* 1. Enhanced Page Header - B2B Professional */}
            <div className="bg-primary pt-8 pb-20 px-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4" onClick={() => navigate('/profile')}>
                        <div>
                            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-medium text-lg overflow-hidden">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user?.realName ? user.realName.charAt(0) : 'User'
                                )}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-wide">早上好，{user?.realName ? `${user.realName}` : '经理'}</h1>
                                    <p className="text-blue-100 text-sm mt-1">查看当前租户的实时经营数据</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-lg hover:bg-white/10 transition-all text-white">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border border-primary"></span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="px-5 -mt-16 relative z-20 space-y-6">
                {/* 2. Data Overview Module - Compact & Premium */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 className="font-bold text-gray-900 text-xl tracking-tight">数据概览</h2>
                        </div>
                        {/* Compact Tabs */}
                        <div className="bg-gray-50 p-1 rounded-xl flex items-center border border-gray-100">
                            {(['company', 'team', 'personal'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 ${activeTab === tab
                                        ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {tab === 'company' ? '公司' : tab === 'team' ? '团队' : '本人'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Premium Stats Grid - 2x2 Layout */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Card 1: New Leads (Cyan) */}
                        <div onClick={() => navigate('/leads')} className="group relative min-h-[110px] overflow-hidden bg-gradient-to-br from-cyan-50/80 to-white px-5 py-5 rounded-2xl border border-cyan-100/50 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer">
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <span className="text-gray-500 text-sm font-bold tracking-wide block mb-2">新增线索</span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black text-gray-900 leading-none">{stats.newLeads}</span>
                                    <span className="text-sm text-cyan-600 font-bold">条</span>
                                </div>
                            </div>
                            <div className="absolute -right-3 -bottom-3 opacity-[0.08] group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-500">
                                <Target className="w-20 h-20 text-cyan-600" />
                            </div>
                        </div>

                        {/* Card 2: Customer Visits (Purple) */}
                        <div onClick={() => navigate('/customers')} className="group relative min-h-[110px] overflow-hidden bg-gradient-to-br from-purple-50/80 to-white px-5 py-5 rounded-2xl border border-purple-100/50 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer">
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <span className="text-gray-500 text-sm font-bold tracking-wide block mb-2">客户到访</span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black text-gray-900 leading-none">{stats.customerVisits}</span>
                                    <span className="text-sm text-purple-600 font-bold">人</span>
                                </div>
                            </div>
                            <div className="absolute -right-3 -bottom-3 opacity-[0.08] group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-500">
                                <MessageSquare className="w-20 h-20 text-purple-600" />
                            </div>
                        </div>

                        {/* Card 3: Orders (Orange) */}
                        <div onClick={() => navigate('/sales')} className="group relative min-h-[110px] overflow-hidden bg-gradient-to-br from-orange-50/80 to-white px-5 py-5 rounded-2xl border border-orange-100/50 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer">
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <span className="text-gray-500 text-sm font-bold tracking-wide block mb-2">成交订单</span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black text-gray-900 leading-none">{stats.dealCount}</span>
                                    <span className="text-sm text-orange-600 font-bold">单</span>
                                </div>
                            </div>
                            <div className="absolute -right-3 -bottom-3 opacity-[0.08] group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-500">
                                <CheckCircle className="w-20 h-20 text-orange-600" />
                            </div>
                        </div>

                        {/* Card 4: Sales Amount (Blue) - 融入收入运营前瞻胜率 */}
                        <div onClick={() => navigate('/analytics/revenue')} className="group relative min-h-[110px] overflow-hidden bg-gradient-to-br from-blue-50/80 to-white px-5 py-5 rounded-2xl border border-blue-100/50 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer">
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="mb-2">
                                    <span className="text-gray-500 text-sm font-bold tracking-wide flex items-center justify-between">
                                        <span>销售金额</span>
                                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-0.5">
                                            <TrendingUp className="w-2.5 h-2.5" /> 胜率 {(revenueData.winRate * 100).toFixed(1)}%
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-black text-gray-900 leading-none">
                                        {(Number(stats.salesAmount || 0) / 10000).toFixed(1)}
                                    </span>
                                    <span className="text-sm text-blue-600 font-bold">万</span>
                                    {stats.revenueTrend && (
                                        <span className="text-[10px] text-blue-600 font-semibold ml-1">
                                            +{stats.revenueTrend}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -right-3 -bottom-3 opacity-[0.08] group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-500">
                                <BarChart2 className="w-20 h-20 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Functional Entries (MOVED UP) */}
                <div className="grid grid-cols-3 max-[359px]:grid-cols-2 gap-3 sm:gap-4">
                    <div
                        onClick={() => navigate('/knowledge')}
                        className="relative h-32 overflow-hidden rounded-2xl shadow-sm border border-white/20 cursor-pointer group active:scale-95 transition-all duration-300"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80"
                            alt="Knowledge Base"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/60 via-blue-600/10 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4 text-white">
                            <div className="flex min-w-0 items-center gap-1 mb-0.5">
                                <BookOpen className="w-4 h-4 flex-shrink-0 text-blue-100" />
                                <span className="whitespace-nowrap font-bold text-sm leading-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">知识库</span>
                            </div>
                            <span className="text-[10px] text-blue-50 font-medium bg-blue-500/40 px-2 py-0.5 rounded backdrop-blur-[2px]">
                                业务锦囊
                            </span>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/ai/scripts')}
                        className="relative h-32 overflow-hidden rounded-2xl shadow-sm border border-white/20 cursor-pointer group active:scale-95 transition-all duration-300"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80"
                            alt="Marketing Scripts"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/60 via-purple-600/10 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4 text-white">
                            <div className="flex min-w-0 items-center gap-1 mb-0.5">
                                <MessageSquare className="w-4 h-4 flex-shrink-0 text-purple-100" />
                                <span className="whitespace-nowrap font-bold text-sm leading-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">营销话术</span>
                            </div>
                            <span className="text-[10px] text-purple-50 font-medium bg-purple-500/40 px-2 py-0.5 rounded backdrop-blur-[2px]">
                                成交秘籍
                            </span>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/products')}
                        className="relative h-32 overflow-hidden rounded-2xl shadow-sm border border-white/20 cursor-pointer group active:scale-95 transition-all duration-300"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80"
                            alt="Product Management"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-teal-600/60 via-teal-600/10 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4 text-white">
                            <div className="flex min-w-0 items-center gap-1 mb-0.5">
                                <Book className="w-4 h-4 flex-shrink-0 text-teal-100" />
                                <span className="whitespace-nowrap font-bold text-sm leading-5 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">产品管理</span>
                            </div>
                            <span className="text-[10px] text-teal-50 font-medium bg-teal-500/40 px-2 py-0.5 rounded backdrop-blur-[2px]">
                                配置图库
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. AI 智能助理 (融入 Agentic CRM 协同战报) */}
                <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-indigo-50 rounded-xl text-primary border border-indigo-100/50">
                                    <BotMessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
                                        AI 智能助理
                                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-full font-bold border border-emerald-200">
                                            {agentSummary.activeAgentsCount || 0} 个智能体在线协同
                                        </span>
                                    </h3>
                                    <p className="text-[11px] text-gray-400">SDR开发 · 智能跟进 · 停滞促成自主运行中</p>
                                </div>
                            </div>
                            <span className="text-[10px] bg-indigo-50 text-primary px-2 py-0.5 rounded-full font-bold tracking-wider border border-indigo-100">
                                AGENTIC
                            </span>
                        </div>
                        <p className="text-gray-600 text-xs mb-4 leading-relaxed bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                            🤖 今日已执行 <span className="font-semibold text-gray-800">{agentSummary.todayExecutedTasks || 0}</span> 项智能体任务；待确认方案 <span className="text-primary font-bold">{agentSummary.pendingTasks || 0}</span> 项。
                        </p>
                        <button onClick={() => navigate('/ai/agents')} className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:bg-primary-dark transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> 审阅智能体方案 ({agentSummary.pendingTasks || 0}项待办)
                        </button>
                    </div>
                </div>

                {/* 5. 今日智能日程 (融入实时行为信号与会话任务驱动) */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            今日智能日程
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">{topSignal ? '1 项待办 · 信号优先' : '暂无待办'}</span>
                    </div>
                    <div className="space-y-3">
                        {/* 实时信号驱动待办 */}
                        {topSignal ? (
                            <div className="flex items-center gap-3 p-3 bg-rose-50/30 rounded-xl border border-rose-100 cursor-pointer hover:bg-rose-50/60 transition-colors" onClick={() => navigate('/ai/signals')}>
                                <div className="flex-col flex items-center justify-center w-12 h-12 bg-rose-100/60 rounded-xl shadow-sm border border-rose-200">
                                    <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                                    <span className="text-[10px] text-rose-600 font-bold mt-0.5">实时</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="font-bold text-gray-900 text-sm">【实时信号】{topSignal.customerName || '意向客户'}</h4>
                                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-bold">&lt;15min响应</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {topSignal.content || '客户触发了关键行为'}，AI 已备妥应对方案。
                                    </p>
                                </div>
                                <button className="text-xs bg-white text-rose-600 px-2.5 py-1 rounded-lg border border-rose-200 font-bold shadow-sm hover:bg-rose-50 flex-shrink-0">
                                    立即跟进
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 text-center">
                                📡 暂无待处理的突发客户行为信号，系统正在持续监控中
                            </div>
                        )}

                    </div>
                </div>

                {/* New Module: KPI Progress */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Target className="w-5 h-5 text-primary" />
                            本月业绩目标
                        </h3>
                        <span className="text-xs text-gray-500">剩余 {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()} 天</span>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600 flex items-center gap-1.5">
                                    <BarChart2 className="w-3.5 h-3.5" /> 销售金额
                                </span>
                                <span className="font-bold text-gray-900"><span className="text-primary">{(Number(stats.salesAmount || 0) / 10000).toFixed(1)}</span> / {monthlyTarget ? `${(monthlyTarget / 10000).toFixed(1)} 万` : '未设置'}</span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 transition-all duration-1000"
                                    style={{ width: `${monthlyTarget ? Math.min((Number(stats.salesAmount || 0) / monthlyTarget) * 100, 100) : 0}%` }}
                                ></div>
                            </div>
                            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                                <span>当前进度 {monthlyTarget ? ((Number(stats.salesAmount || 0) / monthlyTarget) * 100).toFixed(0) : 0}%</span>
                                <span>{monthlyTarget ? `目标 ¥${(monthlyTarget / 10000).toFixed(1)}万` : '目标未设置'}</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600 flex items-center gap-1.5">
                                    <Target className="w-3.5 h-3.5" /> 新增有效线索
                                </span>
                                <span className="font-bold text-gray-900"><span className="text-green-600">{stats.newLeads || 0}</span></span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg shadow-green-500/30 transition-all duration-1000"
                                    style={{ width: `${stats.newLeads ? 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Important Leads List */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">今日重点线索</h3>
                        <button onClick={() => navigate('/leads')} className="text-primary text-xs font-medium px-2 py-1 bg-blue-50 rounded hover:bg-blue-100">全部</button>
                    </div>
                    <div className="space-y-4">
                        {leads.length > 0 ? leads.map((lead) => (
                            <div key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)} className="flex items-center justify-between cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border ${lead.priority === 'high' || lead.priority === 'urgent' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-blue-50 border-blue-100 text-primary'}`}>
                                        {getInitials(lead.title)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900">{lead.title}</h4>
                                            {(lead.priority === 'high' || lead.priority === 'urgent') && <span className="bg-orange-50 text-accent text-[10px] px-1.5 py-0.5 rounded font-medium border border-orange-100">高意向</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">{lead.description} · 预算 {lead.budgetRange}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-lg font-bold text-primary">{lead.successProbability}%</span>
                                    <span className="text-[10px] text-gray-400">成交概率</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-6 text-gray-400 text-sm">暂无重点线索</div>
                        )}
                    </div>
                </div>

                {/* 6. Performance Chart (REPLACED WITH DYNAMIC RECHARTS) */}
                <div onClick={() => navigate('/analytics')} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 cursor-pointer hover:border-primary/30 transition-shadow group">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">本月业绩趋势</h3>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>

                    <div className="h-40 w-full -ml-2">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenueDash" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFF0F6" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                        dy={10}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#2563EB"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenueDash)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                暂无趋势数据
                            </div>
                        )}
                    </div>
                </div>

                {/* 7. Quick Notice / Warnings (Dynamic) */}
                {alerts.length > 0 ? alerts.map((alert, idx) => (
                    <div
                        key={idx}
                        className={`mt-3 border rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-colors ${alert.severity === 'high' ? 'bg-red-50 border-red-100 hover:bg-red-100' : 'bg-orange-50 border-orange-100 hover:bg-orange-100'
                            }`}
                        onClick={() => navigate(alert.type === '库存预警' ? '/products' : '/analytics/risk')}
                    >
                        {alert.severity === 'high' ? (
                            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                        ) : (
                            <UserMinus className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">{alert.type}</h4>
                            <p className="text-xs text-gray-600 mt-1">
                                {alert.message} {alert.details && typeof alert.details === 'string' ? `(${alert.details})` : ''}
                            </p>
                        </div>
                    </div>
                )) : (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-gray-900">系统状态良好</h4>
                            <p className="text-xs text-gray-600 mt-1">目前暂无紧急预警信息。</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Floating AI Assistant Button */}
            <div className="fixed bottom-24 right-5 z-50">
                <button
                    onClick={() => navigate('/ai/chat')}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center relative group"
                >
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                    <Bot className="w-8 h-8" />
                    {/* Tooltip */}
                    <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        AI大脑
                    </span>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
