import React, { useState, useEffect } from 'react';
import { Button, Tag, Select, Empty, Spin } from 'antd';
import {
    BarChart3,
    TrendingUp,
    ShoppingBag,
    Users,
    Percent,
    Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getSalesDashboard, getSalesTrend, getSalesPersonRanking } from '@/services/analytics';

export const AnalyticsOverviewPage: React.FC = () => {
    const navigate = useNavigate();
    const { themeMode } = useTheme();
    const isDark = themeMode === 'dark';

    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        revenue: '¥ 0',
        dealCount: 0,
        customerCount: 0,
        conversionRate: '0.0%'
    });
    const [trendData, setTrendData] = useState<{ dates: string[]; values: number[] }>({
        dates: [],
        values: []
    });
    const [teamRank, setTeamRank] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const today = new Date();
            const past30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const formatDate = (d: Date) => d.toISOString().split('T')[0];

            const [dashRes, trendRes, rankRes] = await Promise.allSettled([
                getSalesDashboard(),
                getSalesTrend({ startDate: formatDate(past30), endDate: formatDate(today), granularity: 'day' }),
                getSalesPersonRanking({ limit: 5 })
            ]);

            if (dashRes.status === 'fulfilled' && dashRes.value) {
                const d = (dashRes.value as any).data || dashRes.value as any;
                setStats({
                    revenue: d.monthlyRevenue ? `¥ ${Number(d.monthlyRevenue).toLocaleString()}` : (d.totalSalesAmount ? `¥ ${Number(d.totalSalesAmount).toLocaleString()}` : '¥ 0'),
                    dealCount: Number(d.totalOrdersThisMonth || d.dealCount || 0),
                    customerCount: Number(d.totalCustomers || d.customerCount || 0),
                    conversionRate: d.conversionRate || '0.0%'
                });
            }

            if (trendRes.status === 'fulfilled' && trendRes.value) {
                const t = (trendRes.value as any).data || trendRes.value as any;
                if (t.dates && t.values && t.dates.length > 0) {
                    setTrendData({ dates: t.dates, values: t.values });
                } else if (Array.isArray(t) && t.length > 0) {
                    setTrendData({
                        dates: t.map((i: any) => i.period || i.date || i.day),
                        values: t.map((i: any) => Number(i.revenue ?? i.amount ?? i.value ?? 0))
                    });
                }
            }

            if (rankRes.status === 'fulfilled' && rankRes.value) {
                const ranks = (rankRes.value as any).data || rankRes.value as any;
                if (Array.isArray(ranks) && ranks.length > 0) {
                    setTeamRank(ranks.map((r: any, idx: number) => ({
                        rank: idx + 1,
                        name: r.userName || r.realName || r.name || '销售顾问',
                        amount: r.salesAmount != null
                            ? `¥ ${Number(r.salesAmount).toLocaleString()}`
                            : (r.performance != null ? `¥ ${Number(r.performance).toLocaleString()}` : (r.amount || '¥ 0')),
                        orders: r.orderCount || r.ordersCount || r.dealCount || 0,
                        convRate: r.conversionRate ? `${r.conversionRate}%` : '0%',
                        targetRate: r.targetRate || 0
                    })));
                } else {
                    setTeamRank([]);
                }
            }
        } catch (error) {
            console.error('Failed to load analytics overview', error);
        } finally {
            setLoading(false);
        }
    };

    const trendOption = {
        grid: { top: 20, right: 20, bottom: 20, left: 40 },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: trendData.dates.length > 0 ? trendData.dates : ['近30天无成交数据'],
            axisLine: { lineStyle: { color: isDark ? '#334155' : '#E2E8F0' } },
            axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, formatter: (v: number) => `${v / 10000}万` },
            splitLine: { lineStyle: { color: isDark ? '#1E293B' : '#F1F5F9' } }
        },
        series: [
            {
                name: '销售额',
                type: 'line',
                smooth: true,
                data: trendData.values.length > 0 ? trendData.values : [0],
                itemStyle: { color: '#2563EB' },
                lineStyle: { width: 3 },
            }
        ]
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            {/* 顶栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        数据概览总览
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        核心销售业绩汇总、实时转化漏斗与全团队成单排行榜（真实后端数据）
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        icon={<BarChart3 className="w-3.5 h-3.5 text-blue-600" />}
                        onClick={() => navigate('/analytics/custom-bi')}
                        className="!rounded-xl !text-xs !h-9 !border-blue-200"
                    >
                        高级多维 BI
                    </Button>
                </div>
            </div>

            {/* 4 大核心指标 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400 font-semibold">本期总销售额</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.revenue}</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400 font-semibold">成交订单数</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.dealCount} 单</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400 font-semibold">服务企业客户数</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.customerCount} 家</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400 font-semibold">综合转化率</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.conversionRate}</div>
                </div>
            </div>

            {/* 图表与团队排行 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">业绩达成与趋势分析</h3>
                    <div className="h-64 w-full">
                        <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>

                <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-4">团队销冠排行榜</h3>
                        {teamRank.length === 0 ? (
                            <Empty description="暂无销售人员业绩排名" className="py-8" />
                        ) : (
                            <div className="space-y-3">
                                {teamRank.map((t) => (
                                    <div key={t.rank} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${t.rank === 1 ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-700'}`}>{t.rank}</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
                                        </div>
                                        <span className="font-bold text-blue-600">{t.amount}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <Button size="small" type="text" onClick={() => navigate('/analytics/team')} className="text-xs text-blue-600 font-bold mt-4">
                        查看完整团队绩效 →
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsOverviewPage;
