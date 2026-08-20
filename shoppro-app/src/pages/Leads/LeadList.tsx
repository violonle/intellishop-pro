import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ClipboardList, Users, Search, Plus, Bot, RefreshCw, ListTodo, Workflow } from 'lucide-react';
import { leadService } from '../../services/leadService';
import { analyticsService } from '../../services/analyticsService';

// Types
interface Lead {
    id: number;
    name: string;
    source: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
    probability: string; // e.g., "85%"
    car: string;
    budget: number;
    phone: string;
    location: string;
    tags: string[];
    avatar: string;
    assignee: string;
}

const LeadList: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'leads' | 'customers'>('leads');
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        loadLeads();
    }, [activeFilter, searchValue]);

    const loadLeads = async () => {
        setLoading(true);
        try {
            let data;
            if (searchValue) {
                // Use search API if keyword exists
                data = await leadService.searchLeads(searchValue);
            } else {
                // Use list API with filters
                const params: any = { pageNo: 1, pageSize: 20 };
                if (activeFilter === 'high-priority') params.priority = 'high';
                // Note: 'today-followup', 'unassigned', 'closed' mapping needs backend support or extra logic
                // For now, map simple ones:
                if (activeFilter === 'closed') params.status = 'won';

                data = await leadService.getLeads(params);
            }

            // Backend: title, description, estimatedValue, successProbability, interestedProducts
            // Frontend: name, car, budget, probability, tags
            const records = data.items || [];
            const mappedLeads = records.map((item: any) => ({
                id: item.id,
                name: item.title || '未知线索', // Use title as name for now
                source: item.source || '未知来源',
                time: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '刚刚',
                priority: item.priority || 'medium',
                probability: item.successProbability ? `${item.successProbability}%` : '0%',
                car: item.interestedProducts?.[0] || '意向未定',
                budget: item.estimatedValue ? item.estimatedValue / 10000 : 0, // Assuming estimatedValue is raw number, converting to Wan if needed. Or just display raw. Frontend uses 'budget' number.
                phone: 'N/A', // Lead entity doesn't have phone. 
                location: 'N/A', // Lead entity doesn't have address.
                tags: item.interestedProducts || [],
                avatar: `https://ui-avatars.com/api/?name=${item.title}&background=random`,
                assignee: item.ownerName || '未分配'
            }));

            setLeads(mappedLeads);
        } catch (error) {
            console.error('Failed to load leads', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            // Use real AI API
            const aiLeads: any = await analyticsService.getAiLeads().catch(() => null);

            if (aiLeads && Array.isArray(aiLeads) && aiLeads.length > 0) {
                const highIntentCount = aiLeads.filter((l: any) => l.score >= 80).length;
                const topLead = aiLeads[0];
                setAnalysisResult(`AI分析完成：本周发现高意向线索 ${highIntentCount} 条。建议优先跟进 ${topLead.customerName || '客户'}（${topLead.intentProduct || '意向车型未知'}），成交概率 ${topLead.score}%。`);
            } else {
                setAnalysisResult("AI分析完成：暂未发现极高意向的新增线索，建议维护现有潜在客户。");
            }
        } catch (error) {
            console.error('AI analyze failed', error);
            setAnalysisResult("AI分析服务暂时不可用，请稍后再试。");
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



    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Top Header */}
            <div className="bg-primary px-4 py-4 shadow-md sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white flex items-center">
                        <Target className="w-6 h-6 text-white mr-2" />
                        线索客户
                    </h1>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => navigate('/operation/tasks')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-sm transition-colors backdrop-blur-sm">
                            <ListTodo className="w-4 h-4 mr-1 inline" />
                            SOP待办
                        </button>
                        <button onClick={() => navigate('/leads/new')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-sm transition-colors backdrop-blur-sm">
                            <Plus className="w-4 h-4 mr-1 inline" />
                            添加记录
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
                        placeholder="搜索姓名、电话、车型..."
                        className="w-full px-4 py-2 bg-white text-gray-900 border-none rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white px-4 py-3 border-b border-gray-200">
                <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                    <button
                        onClick={() => setActiveTab('leads')}
                        className={`flex-1 flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'leads' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ClipboardList className="w-4 h-4 mr-2" />
                        线索管理
                    </button>
                    <button
                        onClick={() => navigate('/customers')}
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
                    {[
                        { id: 'all', label: '全部' },
                        { id: 'high-priority', label: '高优先级' },
                        { id: 'today-followup', label: '今日跟进' },
                        { id: 'unassigned', label: '待分配' },
                        { id: 'closed', label: '已成交' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${activeFilter === filter.id
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* AI Insight Card */}
            <div className="px-4 py-4">
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-primary font-semibold">
                            <Bot className="w-5 h-5 mr-2" /> AI线索分析
                        </div>
                        <div className="text-xs bg-white border border-blue-100 text-primary px-2 py-1 rounded">实时分析</div>
                    </div>
                    <div className="text-sm text-gray-700 min-h-[40px]">
                        {analyzing ? (
                            <span className="animate-pulse">正在分析线索数据...</span>
                        ) : (
                            analysisResult || "点击刷新按钮获取今日线索分析报告..."
                        )}
                    </div>
                    <div className="mt-3 flex space-x-2">
                        <button onClick={handleAnalyze} className="px-3 py-1.5 bg-white border border-blue-200 text-primary rounded-lg text-xs hover:bg-blue-50 transition-colors flex items-center shadow-sm">
                            刷新分析 <RefreshCw className="w-3 h-3 ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Leads List */}
            <div className="px-4 pb-4 space-y-3">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">加载中...</div>
                ) : (
                    leads.map(lead => (
                        <div key={lead.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:border-primary/30 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <img src={lead.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                                        {lead.priority === 'high' && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                                            <span className={`inline-block px-1.5 py-0.5 text-[10px] rounded border ${lead.priority === 'high' ? 'bg-orange-50 text-accent border-orange-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                {lead.priority === 'high' ? '高优先级' : lead.priority === 'medium' ? '中优先级' : '低优先级'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">来源：{lead.source} · {lead.time}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">{lead.probability}</p>
                                    <p className="text-xs text-gray-400">成交概率</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3 text-xs bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                <div><span className="text-gray-500">意向车型:</span> <span className="font-medium text-gray-900 ml-1">{lead.car}</span></div>
                                <div><span className="text-gray-500">预算范围:</span> <span className="font-medium text-gray-900 ml-1">{lead.budget}万</span></div>
                                <div><span className="text-gray-500">联系电话:</span> <span className="font-medium text-gray-900 ml-1">{lead.phone}</span></div>
                                <div><span className="text-gray-500">所在地区:</span> <span className="font-medium text-gray-900 ml-1">{lead.location}</span></div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                                {lead.tags.map(tag => (
                                    <span
                                        key={tag}
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
                                    {lead.assignee}
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
                                    <button onClick={() => navigate(`/leads/${lead.id}`)} className="text-primary text-xs font-medium hover:text-primary-dark hover:underline">
                                        查看详情
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Button */}
            <button onClick={() => navigate(`/leads/new`)} className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg border border-primary/20 flex items-center justify-center hover:bg-primary/90 transition-colors z-20">
                <Plus className="w-6 h-6" />
            </button>
        </div>
    );
};

export default LeadList;
