import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { knowledgeService } from '../../services/knowledgeService';
import type { Knowledge } from '../../services/knowledgeService';

const KnowledgeBase: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState({ id: 'all', label: '全部' });
    const [loadingAI, setLoadingAI] = useState(false);
    const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
    const [knowledgeItems, setKnowledgeItems] = useState<Knowledge[]>([]);
    const [loading, setLoading] = useState(true);
    if (loading && knowledgeItems.length === 0) return <div>加载中...</div>;

    const categories = [
        { id: 'all', label: '全部' },
        { id: 'vehicles', label: '车型介绍' },
        { id: 'product', label: '产品资料' },
        { id: 'sales', label: '销售技巧' },
        { id: 'faq', label: '常见问题' },
        { id: 'policy', label: '政策法规' }
    ];

    useEffect(() => {
        const loadArticles = async () => {
            setLoading(true);
            try {
                // Fetch all initially, filter client side for now as backend might not support string category IDs perfectly
                // Or map frontend categories to backend IDs if needed.
                // Assuming backend keyword search works
                const data = await knowledgeService.getKnowledgeList({ pageNo: 1, pageSize: 20 });
                if (data && data.records) {
                    setKnowledgeItems(data.records);
                }
            } catch (error) {
                console.error('Failed to load knowledge', error);
            } finally {
                setLoading(false);
            }
        };
        loadArticles();
        refreshKnowledgeAI();
    }, []);

    useEffect(() => {
        refreshKnowledgeAI();
    }, []);

    const refreshKnowledgeAI = async () => {
        setLoadingAI(true);
        try {
            const recs = await knowledgeService.getRecommendations();
            if (Array.isArray(recs) && recs.length > 0) {
                setAiRecommendations(recs);
            } else {
                setAiRecommendations([]);
            }
        } catch (error) {
            console.error(error);
            setAiRecommendations([]);
        } finally {
            setLoadingAI(false);
        }
    };

    const handleSearch = () => {
        if (!searchTerm) return;
        alert('AI智能搜索正在开发中...');
    };

    const filteredItems = knowledgeItems.filter((item: any) => { // Use any for loose matching until backend types are strict
        // Simple client-side filter simulation
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">知识库</h1>
                                <p className="text-sm text-gray-500">产品资料与销售知识</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* AI Recommendations */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#4640DE] text-white rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                            </div>
                            <h3 className="font-semibold text-gray-900">AI智能推荐</h3>
                            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full font-medium">实时</span>
                        </div>
                        <button onClick={refreshKnowledgeAI} className="p-2 text-[#4640DE] hover:bg-indigo-100 rounded-lg transition-colors">
                            <svg className={`w-5 h-5 ${loadingAI ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </button>
                    </div>
                    <div>
                        {loadingAI ? (
                            <div className="flex items-center text-sm text-gray-600">
                                正在分析您的需求，生成个性化推荐...
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {aiRecommendations.length === 0 ? <div className="text-sm text-gray-500">暂无推荐内容</div> : aiRecommendations.map((rec, idx) => (
                                    <div key={idx} className="flex items-start text-sm text-gray-700 bg-white/60 p-2 rounded-lg">
                                        <span className="mr-2">•</span>
                                        <span>{rec}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="搜索知识库内容..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-20 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4640DE]/20 focus:border-[#4640DE] shadow-sm"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <button onClick={handleSearch} className="absolute right-2 top-2 px-3 py-1.5 bg-[#4640DE] text-white text-xs rounded-lg hover:bg-opacity-90 transition-colors">
                        AI搜索
                    </button>
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex space-x-2">
                            <button className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 flex items-center">
                                知识洞察
                            </button>
                            <button className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 flex items-center">
                                推荐内容
                            </button>
                        </div>
                        <button className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 flex items-center">
                            知识图谱
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat as any)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory.id === cat.id
                                ? 'bg-[#4640DE] text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="space-y-4">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/knowledge/${item.id}`)}
                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex">
                                        {/* {item.image && (
                                            <img src={item.image} alt={item.title} className="w-8 h-8 rounded-lg mr-3 object-cover" />
                                        )} */}
                                        <div><h4 className="font-medium text-gray-900 group-hover:text-[#4640DE] transition-colors">{item.title}</h4></div>
                                        {/* {item.isHot && (
                                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">热门</span>
                                        )} */}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{item.content ? item.content.substring(0, 60) + '...' : ''}</p>
                                    <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500">
                                        {item.tags ? (typeof item.tags === 'string' ? item.tags.split(',') : item.tags).map((tag: string) => (
                                            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{tag}</span>
                                        )) : null}
                                        {item.viewCount && (
                                            <span className="flex items-center ml-2">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                {item.viewCount} 浏览
                                            </span>
                                        )}
                                        {item.updatedAt && (
                                            <span className="flex items-center ml-2">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                {item.updatedAt.substring(0, 10)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4 p-2 text-gray-400 group-hover:text-[#4640DE] transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default KnowledgeBase;
