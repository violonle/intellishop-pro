import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Award, TrendingUp, Users } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';

const SalesTeamAnalysis: React.FC = () => {
    const navigate = useNavigate();
    const [ranking, setRanking] = useState<any[]>([]);
    const [, setLoading] = useState(true);
    const [insight, setInsight] = useState<string>('');
    const [insightLoading, setInsightLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await analyticsService.getSalesPersonRanking(10).catch(() => []);
                if (data && Array.isArray(data)) {
                    setRanking(data.map((item: any, index: number) => ({
                        rank: index + 1,
                        name: item.name || item.username || 'Unknown',
                        amount: `¥${(item.value || 0).toLocaleString()}`,
                        leads: item.leadsCount || 0,
                        conversion: `${item.conversionRate || 0}%`,
                        score: item.score || 80
                    })));
                }

                // Load AI Insight
                setInsightLoading(true);
                try {
                    const insightData = await analyticsService.getSalesTeamInsight();
                    setInsight(insightData as unknown as string);
                } catch (e) {
                    console.error('Failed to load insight', e);
                } finally {
                    setInsightLoading(false);
                }

            } catch (error) {
                console.error('Failed to load ranking', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 ml-2">团队销售分析</h1>
            </div>

            <div className="p-4 space-y-4">
                {/* AI Insight Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400 opacity-5 rounded-full -mr-8 -mt-8"></div>
                    <div className="flex items-start gap-3 relative z-10">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1 flex items-center">
                                AI 智能洞察
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">BETA</span>
                            </h3>
                            {insightLoading ? (
                                <div className="space-y-2 animate-pulse">
                                    <div className="h-3 bg-indigo-100 rounded w-3/4"></div>
                                    <div className="h-3 bg-indigo-100 rounded w-full"></div>
                                    <div className="h-3 bg-indigo-100 rounded w-5/6"></div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                    {insight || "暂无足够数据生成洞察建议。"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-50 rounded-lg text-primary">
                                <Users className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">团队总人数</span>
                        </div>
                        <div className="text-2xl font-bold font-mono text-gray-900">{ranking.length}<span className="text-sm font-normal ml-1 text-gray-400">人</span></div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                                <Award className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">人均产出(万)</span>
                        </div>
                        <div className="text-2xl font-bold font-mono text-gray-900">
                            {ranking.length > 0
                                ? (ranking.reduce((acc, curr) => acc + parseFloat(curr.amount.replace(/[^0-9.-]+/g, "")), 0) / ranking.length / 10000).toFixed(1)
                                : '0'}
                            <span className="text-sm font-normal ml-1 text-gray-400">w</span>
                        </div>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">业绩排行榜</h3>
                        <span className="text-xs text-gray-400">本月</span>
                    </div>
                    <div>
                        {ranking.map((item) => (
                            <div key={item.rank} className="p-4 border-b border-gray-50 last:border-0 flex items-center">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-3 font-mono ${item.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                                    item.rank === 2 ? 'bg-gray-100 text-gray-600' :
                                        item.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-transparent text-gray-400'
                                    }`}>
                                    {item.rank}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-gray-900">{item.name}</span>
                                        <span className="font-bold font-mono text-gray-900">{item.amount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>转化率 {item.conversion}</span>
                                        <span className="flex items-center text-green-600">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            {item.score}分
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesTeamAnalysis;
