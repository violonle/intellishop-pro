import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, DollarSign, Award } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';

const PerformanceReport: React.FC = () => {
    const navigate = useNavigate();
    const [perfData, setPerfData] = useState({
        totalSales: '¥ 0',
        completionRate: 0,
        momRate: 0,
        orderCount: 0,
        avgOrderValue: '¥ 0',
        ranking: null as number | null,
        totalReps: null as number | null,
        commissionForecast: '¥ 0',
        sixMonthsTrend: [] as Array<{ month: string; value: number; amount: string }>
    });

    useEffect(() => {
        loadPerformance();
    }, []);

    const loadPerformance = async () => {
        try {
            const data: any = await analyticsService.getSalesDashboard();
            setPerfData(prev => ({
                ...prev,
                totalSales: `¥ ${(data?.monthlyRevenue || data?.totalSales || 0).toLocaleString()}`,
                orderCount: data?.totalOrdersThisMonth || data?.orderCount || 0,
                avgOrderValue: `¥ ${(data?.avgOrderValue || 0).toLocaleString()}`,
            }));
        } catch (e) {
            console.error('Failed to load performance data', e);
        }
    };

    const maxTrend = Math.max(...perfData.sixMonthsTrend.map(t => t.value), 50);

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans">
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 shadow-xs">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-xl">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-base font-bold text-gray-900 ml-2">个人销售业绩看板</h1>
                </div>
                <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
                    {perfData.ranking && perfData.totalReps ? `团队第 ${perfData.ranking} 名 / 共 ${perfData.totalReps} 人` : '暂无排名数据'}
                </span>
            </div>

            <div className="p-4 space-y-4">
                {/* Overview Card */}
                <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 rounded-3xl p-6 text-white shadow-md">
                    <div className="text-blue-200 text-xs font-medium mb-1">本月累计销售额</div>
                    <div className="text-3xl font-black font-mono tracking-tight mb-4">{perfData.totalSales}</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                            <div className="text-[11px] text-blue-100 font-medium">环比上月</div>
                            <div className="flex items-center text-xs font-bold text-emerald-300 mt-0.5">
                                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +{perfData.momRate}%
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                            <div className="text-[11px] text-blue-100 font-medium">月度目标达成率</div>
                            <div className="text-xs font-bold text-white mt-0.5">{perfData.completionRate}%</div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <Award className="w-6 h-6 text-amber-500 flex-shrink-0" strokeWidth={2.2} />
                            <div>
                                <div className="text-lg font-black text-gray-900">{perfData.orderCount} 单</div>
                                <div className="text-[11px] text-gray-400 font-medium">成交订单数</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-6 h-6 text-blue-600 flex-shrink-0" strokeWidth={2.2} />
                            <div>
                                <div className="text-lg font-black text-gray-900">{perfData.avgOrderValue}</div>
                                <div className="text-[11px] text-gray-400 font-medium">平均客单价</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Commission & Quota Sprint */}
                <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold text-gray-900">预估本月提成收入</div>
                        <div className="text-xl font-black text-emerald-600 font-mono mt-0.5">{perfData.commissionForecast}</div>
                    </div>
                    <button 
                        onClick={() => navigate('/deals')}
                        className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm shadow-blue-500/20"
                    >
                        去商机冲刺
                    </button>
                </div>

                {/* 6 Months Trend */}
                <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-900 mb-4">近 6 个月成单金额趋势</h3>
                    <div className="h-36 flex items-end justify-between gap-3 px-2">
                        {perfData.sixMonthsTrend.length === 0 ? (
                            <div className="col-span-6 flex h-36 items-center justify-center text-xs text-gray-400">暂无趋势数据</div>
                        ) : perfData.sixMonthsTrend.map((item, i) => (
                            <div key={i} className="flex flex-col items-center flex-1">
                                <span className="text-[9px] text-blue-600 font-bold mb-1">{item.amount}</span>
                                <div
                                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-md opacity-90 hover:opacity-100 transition-opacity"
                                    style={{ height: `${(item.value / maxTrend) * 100}%`, minHeight: '12px' }}
                                ></div>
                                <span className="text-[10px] text-gray-400 mt-1.5 font-medium">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerformanceReport;
