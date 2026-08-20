import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { ChevronRight, ArrowUpRight, ArrowDownRight, TrendingUp, AlertTriangle, Users, Filter } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';

const AnalyticsDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('month');
    const [stats, setStats] = useState({
        revenue: '¥0',
        orders: '0',
        conversion: '0%',
        avgTicket: '¥0'
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [teamRanking, setTeamRanking] = useState<any[]>([]);
    const [funnelData, setFunnelData] = useState<any[]>([]);
    const [riskAlerts, setRiskAlerts] = useState<any[]>([]);

    useEffect(() => {
        const loadRealData = async () => {
            try {
                // 1. Dashboard Stats
                const dashboardRes: any = await analyticsService.getSalesDashboard();
                if (dashboardRes) {
                    setStats({
                        revenue: `¥${dashboardRes.monthlyRevenue?.toLocaleString() || '0'}`,
                        orders: String(dashboardRes.totalOrdersThisMonth || 0),
                        conversion: '0%', // Not provided by this API yet
                        avgTicket: `¥${dashboardRes.avgOrderPrice?.toLocaleString() || '0'}`
                    });
                }

                // 2. Sales Trend
                const now = new Date();
                const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const endDate = now.toISOString().split('T')[0];
                const trendRes: any = await analyticsService.getSalesTrend(startDate, endDate, 'day');

                if (trendRes && Array.isArray(trendRes.data)) {
                    setChartData(trendRes.data.map((item: any) => ({
                        name: item.period.substring(5), // Remove year "MM-DD"
                        revenue: item.revenue,
                        leads: item.orderCount // Mapping orderCount to "leads" for chart reuse mostly
                    })));
                }

                // 3. Team Ranking
                const rankingRes: any = await analyticsService.getSalesPersonRanking(5);
                if (Array.isArray(rankingRes)) {
                    setTeamRanking(rankingRes);
                }

                // 4. Funnel Analysis
                const funnelRes: any = await analyticsService.getSalesFunnelAnalysis();
                if (funnelRes) {
                    const funnelArray = [
                        { label: '线索触达', val: funnelRes.totalLeads?.percentage || '0%', w: funnelRes.totalLeads?.percentage || '0%', color: 'bg-blue-500' },
                        { label: '意向确认', val: funnelRes.qualifiedLeads?.percentage || '0%', w: funnelRes.qualifiedLeads?.percentage || '0%', color: 'bg-blue-400' },
                        { label: '到店试驾', val: funnelRes.storeVisits?.percentage || '0%', w: funnelRes.storeVisits?.percentage || '0%', color: 'bg-indigo-400' },
                        { label: '成交签约', val: funnelRes.convertedLeads?.percentage || '0%', w: funnelRes.convertedLeads?.percentage || '0%', color: 'bg-indigo-600' },
                    ];
                    setFunnelData(funnelArray);
                }

                // 5. Risk Alerts
                const riskRes: any = await analyticsService.predictCustomerChurn();
                if (Array.isArray(riskRes)) {
                    setRiskAlerts(riskRes);
                }

            } catch (err) {
                console.error("Failed to load analytics data", err);
            }
        };

        loadRealData();
    }, [timeRange]); // Currently strictly loading "month" logic for simplicity, can expand later

    const StatCard = ({ title, value, change, isPositive, label, onClick }: any) => (
        <div
            onClick={onClick}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 relative overflow-hidden group active:scale-95 transition-all cursor-pointer hover:border-primary/30"
        >
            <div className="relative z-10">
                <div className="text-sm text-gray-500 mb-2 font-medium">{title}</div>
                <div className="text-2xl font-bold text-gray-900 mb-2 font-mono tracking-tight">{value}</div>
                {change ? (
                    <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {change}
                        <span className="text-gray-400 ml-1 font-normal">{label || 'vs 上期'}</span>
                    </div>
                ) : <div className="text-xs text-gray-400">暂无对比数据</div>}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-20 font-sans">
            {/* Header */}
            <div className="bg-primary text-white px-4 pt-6 pb-6 relative overflow-hidden rounded-b-[2rem] shadow-xl">
                {/* Decorative circles removed for consistency */}

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold tracking-tight">数据统计</h1>
                        <button className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Time Filter */}
                    <div className="bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/10 inline-flex w-full">
                        {['week', 'month', 'quarter', 'year'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeRange(t)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${timeRange === t
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {{
                                    week: '本周',
                                    month: '本月',
                                    quarter: '季度',
                                    year: '本年'
                                }[t]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-4 relative z-20 space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        title="总销售额"
                        value={stats.revenue}
                        change=""
                        isPositive={true}
                        onClick={() => navigate('/analytics/advanced')}
                    />
                    <StatCard
                        title="成交订单"
                        value={stats.orders}
                        change=""
                        isPositive={true}
                        onClick={() => navigate('/analytics/advanced')}
                    />
                    <StatCard
                        title="转化率"
                        value={stats.conversion}
                        change=""
                        isPositive={false}
                        onClick={() => navigate('/analytics/funnel')}
                    />
                    <StatCard
                        title="客单价"
                        value={stats.avgTicket}
                        change=""
                        isPositive={true}
                        onClick={() => navigate('/analytics/advanced')}
                    />
                </div>

                {/* 💰 AI 收入运营引擎 (Revenue Intel) 卡片 - 清爽浅色风格 */}
                <div
                    onClick={() => navigate('/analytics/revenue')}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:border-amber-400/50 hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5 group-hover:text-amber-700 transition-colors">
                                    AI 收入运营引擎 (Revenue Intel)
                                    <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.2 rounded-full border border-amber-200">
                                        HOT
                                    </span>
                                </h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">动态成单率 · 管道流速热力图 · 卡单诊断</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
                        <div className="bg-amber-50/40 rounded-xl p-2 border border-amber-100/60">
                            <div className="text-[10px] text-gray-500 mb-0.5">Q3 预测营收</div>
                            <div className="font-bold text-sm text-amber-700 font-mono">¥128.0万</div>
                        </div>
                        <div className="bg-emerald-50/40 rounded-xl p-2 border border-emerald-100/60">
                            <div className="text-[10px] text-gray-500 mb-0.5">动态成单率</div>
                            <div className="font-bold text-sm text-emerald-700 font-mono">32.4% ↑</div>
                        </div>
                        <div className="bg-blue-50/40 rounded-xl p-2 border border-blue-100/60">
                            <div className="text-[10px] text-gray-500 mb-0.5">管道健康度</div>
                            <div className="font-bold text-sm text-blue-700">🟢 良好</div>
                        </div>
                    </div>
                </div>

                {/* Sales Chart */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100" onClick={() => navigate('/analytics/advanced')}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                销售趋势
                            </div>
                            <div className="text-gray-500 text-xs mt-1">数据实时更新中</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-56 w-full -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#2563EB"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Funnel & Alerts */}
                <div className="grid grid-cols-1 gap-4">
                    {/* Funnel */}
                    <div
                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                        onClick={() => navigate('/analytics/funnel')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">漏斗分析</h3>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-3">
                            {funnelData.length > 0 ? funnelData.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-16 text-xs text-gray-500 font-medium">{item.label}</div>
                                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${item.color}`} style={{ width: item.w }}></div>
                                    </div>
                                    <div className="w-8 text-xs font-bold text-gray-900 text-right">{item.val}</div>
                                </div>
                            )) : (
                                <div className="text-center py-4 text-gray-400 text-sm">暂无漏斗数据</div>
                            )}
                        </div>
                    </div>

                    {/* Alerts */}
                    <div
                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                        onClick={() => navigate('/analytics/risk')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900">风险预警</h3>
                                {riskAlerts.length > 0 && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">{riskAlerts.length}</span>
                                )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-3">
                            {riskAlerts.length > 0 ? riskAlerts.map((alert: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">客户流失风险</h4>
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{alert.customerName}: {alert.reason}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-4 text-gray-400 text-sm">暂无风险预警</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Team Ranking */}
                <div
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
                    onClick={() => navigate('/analytics/team')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-900">团队排行</h3>
                        </div>
                        <div className="text-sm text-purple-600 flex items-center">
                            查看全部 <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        {teamRanking.length > 0 ? teamRanking.map((item: any, index: number) => (
                            <div key={item.userId} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-100 text-gray-600' :
                                            'bg-orange-50 text-orange-600'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{item.userName || item.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold font-mono text-gray-900">¥{item.performance?.toLocaleString()}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-4 text-gray-400 text-sm">暂无排名数据</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
