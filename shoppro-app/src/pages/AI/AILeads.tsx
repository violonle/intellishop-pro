import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronLeft, TrendingUp, DollarSign, Calendar } from 'lucide-react';

const AILeads: React.FC = () => {
    const navigate = useNavigate();

    const [leads, setLeads] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState({
        total: 0,
        highIntentRate: '0%',
        projectedValue: '¥0'
    });

    React.useEffect(() => {
        const fetchAiLeads = async () => {
            try {
                // Fetch AI scored leads
                // We added getAiLeads to analyticsService (mapped to /api/ai/leads)
                // Note: Ideally moving to aiService but usage here is fine for now
                const res: any = await import('../../services/analyticsService').then(m => m.analyticsService.getAiLeads());
                if (Array.isArray(res)) {
                    setLeads(res);

                    // Calculate stats from real data
                    const total = res.length;
                    const highIntent = res.filter((l: any) => l.score >= 80).length;
                    const rate = total > 0 ? ((highIntent / total) * 100).toFixed(1) + '%' : '0%';

                    // Sum potential value
                    const value = res.reduce((sum: number, l: any) => {
                        const val = parseFloat(String(l.potential).replace(/[^0-9.]/g, '')) || 0;
                        return sum + val;
                    }, 0);
                    const formattedValue = value > 10000 ? `¥${(value / 10000).toFixed(1)}万` : `¥${value}`;

                    setStats({
                        total,
                        highIntentRate: rate,
                        projectedValue: formattedValue
                    });
                }
            } catch (err) {
                console.error("Failed to fetch AI leads", err);
            }
        };
        fetchAiLeads();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header - White Style */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                            <Target className="w-6 h-6" /> 线索评估模型
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards - Clean White - Compact Single Row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-gray-500 mb-1 flex items-center gap-1.5 text-xs">
                            <TrendingUp className="w-4 h-4 text-[#4640DE]" /> 今日评估
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-gray-500 mb-1 flex items-center gap-1.5 text-xs">
                            <Target className="w-4 h-4 text-green-600" /> 高意向率
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.highIntentRate}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-gray-500 mb-1 flex items-center gap-1.5 text-xs">
                            <DollarSign className="w-4 h-4 text-blue-600" /> 预测成交
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.projectedValue}</div>
                    </div>
                </div>

                {/* Leads List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">高价值线索列表</h3>
                        <button className="text-[#4640DE] text-sm font-medium hover:text-[#3733b5] transition-colors">查看全部</button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {leads.map((lead) => (
                            <div
                                key={lead.id}
                                onClick={() => navigate(`/ai/leads/${lead.id}`)}
                                className="p-5 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer relative"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${lead.score >= 90 ? 'bg-[#4640DE]' : lead.score >= 80 ? 'bg-blue-500' : 'bg-gray-400'}`}>
                                        {lead.score}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-[#4640DE] transition-colors">{lead.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {lead.date}</span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-100">{lead.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900 font-mono">{lead.potential}</div>
                                        <div className="text-xs text-gray-500">预测价值</div>
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

export default AILeads;
