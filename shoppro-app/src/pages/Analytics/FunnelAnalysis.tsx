import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter, RefreshCw } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';

const FunnelAnalysis: React.FC = () => {
    const navigate = useNavigate();
    const [funnelSteps, setFunnelSteps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ conversionRate: '暂无', avgCycle: '暂无', dropRate: '暂无' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await analyticsService.getSalesFunnelAnalysis();
            if (data && data.funnel) {
                const mapColor = (idx: number) => {
                    const colors = ['bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-purple-400', 'bg-purple-500'];
                    return colors[idx] || 'bg-gray-400';
                };

                const mapLabel = (stage: string) => {
                    const labels: Record<string, string> = {
                        'Leads': '线索总量',
                        'Contacted': '初步触达',
                        'Qualified': '意向确认',
                        'Converted': '成交签约'
                    };
                    return labels[stage] || stage;
                };

                const transformed = data.funnel.map((item: any, index: number) => ({
                    label: mapLabel(item.stage),
                    count: item.count,
                    rate: item.percentage,
                    drop: index > 0 ? (100 - parseFloat(item.percentage.replace('%', ''))).toFixed(1) : 0,
                    color: mapColor(index)
                }));
                setFunnelSteps(transformed);

                // Calculate top-level stats
                if (transformed.length > 0) {
                    const first = transformed[0].count;
                    const last = transformed[transformed.length - 1].count;
                    const rate = first > 0 ? ((last / first) * 100).toFixed(1) : 0;
                    setStats({
                        conversionRate: `${rate}%`,
                        avgCycle: '暂无',
                        dropRate: `${(100 - parseFloat(rate as string)).toFixed(1)}%`
                    });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const maxCount = Math.max(...funnelSteps.map(step => step.count), 1);

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900 ml-2">销售漏斗分析</h1>
                </div>
                <button className="p-2 text-gray-500">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="text-xs text-gray-500 mb-1">总转化率</div>
                        <div className="text-xl font-bold text-gray-900">{stats.conversionRate}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="text-xs text-gray-500 mb-1">平均周期</div>
                        <div className="text-xl font-bold text-gray-900">{stats.avgCycle}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center">
                        <div className="text-xs text-gray-500 mb-1">流失率</div>
                        <div className="text-xl font-bold text-gray-900">{stats.dropRate}</div>
                    </div>
                </div>

                {/* Funnel Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-gray-900">线索全生命周期漏斗</h3>
                        <div className="flex items-center text-xs text-blue-600 cursor-pointer" onClick={loadData}>
                            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> 更新
                        </div>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">加载中...</div>
                        ) : funnelSteps.length > 0 ? (
                            funnelSteps.map((step, index) => (
                                <div key={index} className="relative">
                                    {/* Funnel Bar */}
                                    <div className="flex items-center">
                                        <div className="w-24 text-sm font-medium text-gray-600">{step.label}</div>
                                        <div className="flex-1 relative h-10 mx-2">
                                            <div
                                                className={`absolute left-0 top-0 h-full ${step.color} rounded-r-lg opacity-90 transition-all duration-500`}
                                                style={{ width: `${(step.count / maxCount) * 100}%` }}
                                            >
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold">
                                                    {step.count}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-12 text-sm font-bold text-gray-900 text-right">{step.rate}</div>
                                    </div>
                                    {index < funnelSteps.length - 1 && (
                                        <div className="ml-24 pl-2 h-6 border-l-2 border-dashed border-gray-200 flex items-center">
                                            <span className="text-xs text-gray-400 ml-2">流失 {step.drop}%</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500">暂无数据</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FunnelAnalysis;
