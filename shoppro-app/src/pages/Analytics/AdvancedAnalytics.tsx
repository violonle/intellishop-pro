import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import {
    ChevronLeft,
    RefreshCw,
    Download,
    Bot,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    TrendingDown
} from 'lucide-react';

import { analyticsService } from '../../services/analyticsService';

const AdvancedAnalytics: React.FC = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('30');
    const [isLoading, setIsLoading] = useState(false);
    const [insightLoading, setInsightLoading] = useState(false);
    const [aiInsight, setAiInsight] = useState<string>('');

    // State
    const [salesTrendData, setSalesTrendData] = useState<any[]>([]);
    const [customerSegmentData, setCustomerSegmentData] = useState<any[]>([]);
    const [funnelData, setFunnelData] = useState<any[]>([]);
    const [tableData, setTableData] = useState<any[]>([]);
    const [kpiData, setKpiData] = useState<any>({});

    useEffect(() => {
        loadData();
        loadAiInsight();
    }, [timeRange]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await analyticsService.getAdvancedData(timeRange);
            if (data) {
                const { salesTrend, customerSegments, funnelData: fd, tableData: td, kpis } = data;
                // Transform period to date for chart with safety check
                if (Array.isArray(salesTrend)) {
                    setSalesTrendData(salesTrend.map((item: any) => ({ ...item, date: item.period })));
                }

                if (Array.isArray(customerSegments)) {
                    setCustomerSegmentData(customerSegments);
                }

                // Map funnel data to match chart expectation
                if (Array.isArray(fd)) {
                    setFunnelData(fd.map((item: any) => ({
                        name: item.stage,
                        value: item.count,
                        fill: '#' + Math.floor(Math.random() * 16777215).toString(16)
                    })));
                }

                if (Array.isArray(td)) {
                    setTableData(td);
                }

                if (kpis) {
                    setKpiData(kpis);
                }
            }
        } catch (error) {
            console.error("Failed to load advanced data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAiInsight = async () => {
        setInsightLoading(true);
        try {
            const insight = await analyticsService.getSalesAnalyticsInsight(timeRange);
            if (insight) {
                setAiInsight(insight);
            }
        } catch (error) {
            console.error("Failed to load AI insight", error);
            setAiInsight('');
        } finally {
            setInsightLoading(false);
        }
    };


    const formatCurrency = (val: number) => `¥${val.toLocaleString()}`;

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-10">
            {/* Header */}
            <div className="bg-primary shadow-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <button onClick={() => navigate(-1)} className="mr-4 p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold text-white">高级数据分析</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="form-select border-none rounded-lg text-sm bg-white/10 text-white py-1.5 pl-3 pr-8 focus:ring-2 focus:ring-white/20 [&>option]:text-gray-900 cursor-pointer"
                            >
                                <option value="7">最近7天</option>
                                <option value="30">最近30天</option>
                                <option value="90">最近90天</option>
                                <option value="365">最近1年</option>
                            </select>
                            <button onClick={loadData} className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button className="flex items-center px-3 py-1.5 bg-white text-primary text-sm rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-sm">
                                <Download className="w-4 h-4 mr-2" />
                                导出
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            title: '总销售额',
                            value: formatCurrency(kpiData.totalRevenue || 0),
                            change: '',
                            isPositive: true,
                            label: 'vs 上期'
                        },
                        {
                            title: '成交订单',
                            value: (kpiData.orderCount || 0).toLocaleString(),
                            change: '',
                            isPositive: true,
                            label: 'vs 上期'
                        },
                        {
                            title: '转化率',
                            value: kpiData.conversionRate || '0.0%',
                            change: '',
                            isPositive: true,
                            label: 'vs 上期'
                        },
                        {
                            title: '客单价',
                            value: formatCurrency(kpiData.avgOrderValue || 0),
                            change: '',
                            isPositive: false,
                            label: 'vs 上期'
                        }
                    ].map((kpi, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden group active:scale-95 transition-all cursor-pointer hover:shadow-md">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:from-blue-50 group-hover:to-blue-100"></div>
                            <div className="relative z-10">
                                <div className="text-sm text-gray-500 mb-2 font-medium">{kpi.title}</div>
                                <div className="text-2xl font-bold text-gray-900 mb-2 font-mono tracking-tight">{kpi.value}</div>
                                {kpi.change ? (
                                    <div className={`flex items-center text-xs font-medium ${kpi.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {kpi.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                        {kpi.change}
                                        <span className="text-gray-400 ml-1 font-normal">{kpi.label}</span>
                                    </div>
                                ) : <div className="text-xs text-gray-400">暂无对比数据</div>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* AI Insights - Subtle Style */}
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <Bot className={`w-5 h-5 text-blue-600 ${insightLoading ? 'animate-bounce' : ''}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-blue-900 mb-1 flex items-center">
                                AI 智能洞察
                                {insightLoading && <RefreshCw className="w-3 h-3 ml-2 animate-spin text-blue-400" />}
                            </h3>
                            {insightLoading ? (
                                <div className="space-y-2 mt-2">
                                    <div className="h-4 bg-blue-100/50 rounded animate-pulse w-3/4"></div>
                                    <div className="h-4 bg-blue-100/50 rounded animate-pulse w-1/2"></div>
                                </div>
                            ) : (
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    {aiInsight || '正在整理分析报告...'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sales Trend (2 cols) */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-base font-semibold text-gray-900">销售趋势分析</h3>
                            <select className="text-sm border-gray-200 rounded-md text-gray-500 bg-gray-50 py-1 pl-2 pr-6">
                                <option>销售额</option>
                                <option>订单量</option>
                            </select>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesTrendData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        cursor={{ stroke: '#E5E7EB' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Customer Segments (1 col) */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900 mb-6">客户细分</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={customerSegmentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {customerSegmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Section Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Funnel */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900 mb-6">销售漏斗</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={funnelData} layout="vertical" margin={{ left: 0, right: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={40} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                        {funnelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Detailed Table (2 cols) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-base font-semibold text-gray-900">详细数据</h3>
                            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">查看全部</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">销售额</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单数</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">转化率</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">趋势</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tableData.slice(0, 6).map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-3 text-sm text-gray-900">{row.date}</td>
                                            <td className="px-6 py-3 text-sm text-gray-900 font-medium">{formatCurrency(row.sales)}</td>
                                            <td className="px-6 py-3 text-sm text-gray-500">{row.orders}</td>
                                            <td className="px-6 py-3 text-sm text-gray-500">{row.conversion}%</td>
                                            <td className="px-6 py-3 text-sm">
                                                <span className={`inline-flex items-center text-xs font-medium ${row.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {row.trend === 'up' ? '上升' : '下降'}
                                                    {row.trend === 'up' ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AdvancedAnalytics;
