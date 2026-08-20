import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, Target, MessageCircle, Phone, Copy, MessageSquare } from 'lucide-react';

const AIPersona: React.FC = () => {
    const navigate = useNavigate();

    const [personas, setPersonas] = React.useState<any[]>([]);

    const [stats, setStats] = React.useState({ newToday: 0 });

    React.useEffect(() => {
        const fetchPersonas = async () => {
            try {
                // Parallel fetch for list and stats
                const [listData, statsData] = await Promise.all([
                    import('../../services/aiService').then(m => m.aiService.getPersonas()),
                    import('../../services/aiService').then(m => m.aiService.getBrainStats())
                ]);

                if (listData && Array.isArray(listData)) {
                    setPersonas(listData);
                }
                if (statsData) {
                    setStats({ newToday: statsData.newPersonasCount || 0 });
                }
            } catch (error) {
                console.error("Failed to fetch personas", error);
            }
        };
        fetchPersonas();
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
                            用户画像引擎
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Stats / Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="搜索客户画像..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4640DE]" />
                        </div>
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-sm text-gray-500">
                        今日新增 <span className="text-gray-900 font-bold">{stats.newToday}</span> 个
                    </div>
                </div>

                {/* Persona List - Compact & Rich */}
                <div className="flex flex-col gap-5">
                    {personas.map((p) => (
                        <div
                            key={p.id}
                            onClick={() => navigate(`/ai/persona/${p.id}`)}
                            className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            {/* 1. Header: Avatar, Name, Actions */}
                            <div className="flex justify-between items-start mb-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${p.avatar} font-bold text-xl shadow-sm`}>
                                        {p.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                                            <span className="text-xs text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100 font-bold">画像完善度 {p.score}%</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {p.tags.map((tag: string) => (
                                                <span key={tag} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded font-medium border border-gray-200">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200" title="微信联系">
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200" title="电话联系">
                                        <Phone className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* 2. Compact Grid for Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 mb-2">家庭 / 工作</h4>
                                    <div className="space-y-2">
                                        <p className="text-xs text-gray-700 line-clamp-2"><span className="font-semibold text-gray-400">家:</span> {p.family}</p>
                                        <p className="text-xs text-gray-700 line-clamp-2"><span className="font-semibold text-gray-400">工:</span> {p.work}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 mb-2">经济与消费</h4>
                                    <p className="text-xs text-gray-700 leading-relaxed">{p.economics}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 mb-2">性格与决策</h4>
                                    <p className="text-xs text-gray-700 leading-relaxed">{p.personality}</p>
                                </div>
                                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                    <h4 className="text-xs font-bold text-[#4640DE] mb-2 flex items-center"><Target className="w-3 h-3 mr-1" /> 目标产品</h4>
                                    <p className="text-xs text-gray-700 leading-relaxed">{p.productTarget}</p>
                                </div>
                            </div>

                            {/* 3. Suggested Script Module */}
                            <div
                                className="bg-white rounded-lg px-4 py-3 border border-gray-200 flex items-start justify-between gap-4 cursor-default hover:border-[#4640DE]/50 transition-colors"
                                onClick={(e) => { e.stopPropagation(); navigate(`/ai/persona/${p.id}/analysis`); }}
                            >
                                <div>
                                    <h4 className="text-xs font-bold text-[#4640DE] mb-1 flex items-center">
                                        <MessageSquare className="w-3 h-3 mr-1.5" /> 建议话术 & AI分析
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">"{p.suggestedScript}"</p>
                                </div>
                                <button className="p-1.5 text-gray-400 hover:text-[#4640DE] hover:bg-indigo-50 rounded-md transition-colors mt-1" title="复制话术" onClick={(e) => { e.stopPropagation(); /* Copy logic */ }}>
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AIPersona;
