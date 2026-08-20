import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { api } from '../../services/api';
import { aiService } from '../../services/aiService';

interface AIScript {
    id: string;
    title: string;
    category: 'greeting' | 'introduction' | 'objection' | 'closing' | 'followup';
    content: string;
    tags: string[];
    usageCount: number;
    successRate: number;
    lastUsed: string;
    isRecommended?: boolean;
}

const AIScripts: React.FC = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [showNewScriptModal, setShowNewScriptModal] = useState(false);
    const [showRecommendation, setShowRecommendation] = useState(false);
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);

    const categories = [
        { id: 'all', label: '全部' },
        { id: 'greeting', label: '开场白' },
        { id: 'introduction', label: '产品介绍' },
        { id: 'objection', label: '异议处理' },
        { id: 'closing', label: '成交话术' },
        { id: 'followup', label: '跟进话术' }
    ];

    const [scripts, setScripts] = useState<AIScript[]>([]);

    useEffect(() => {
        fetchScripts(activeCategory);
    }, [activeCategory]);

    const fetchScripts = async (category: string) => {
        try {
            const data = await aiService.getScripts(category === 'all' ? undefined : category);
            setScripts(data.map((s: any) => ({
                ...s,
                lastUsed: new Date(s.lastUsedAt).toLocaleDateString(), // Format date
                tags: s.tags ? s.tags.split(',') : []
            })));
        } catch (error) {
            console.error("Failed to fetch scripts", error);
        }
    };

    // const handleCreateScript = async () => {
    //     // ...
    // };

    const [recommendation, setRecommendation] = useState<{ script: string; keyPoints: string[] } | null>(null);

    const handleGetRecommendation = async () => {
        if (showRecommendation) {
            setShowRecommendation(false);
            return;
        }
        setLoadingRecommendation(true);
        try {
            const context = {
                scenario: "general"
            };
            const data = await aiService.generateScript(context);
            setRecommendation(data);
            setShowRecommendation(true);
        } catch (error) {
            console.error("Failed to generate script", error);
            setRecommendation(null);
            setShowRecommendation(true);
        } finally {
            setLoadingRecommendation(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('话术已复制到剪贴板');
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">AI话术大脑</h1>
                        </div>
                        <button
                            onClick={() => setShowNewScriptModal(true)}
                            className="bg-[#4640DE] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            新建话术
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* AI Recommendation Card */}
                <div className="bg-gradient-to-r from-[#4640DE] to-[#8B5CF6] rounded-xl p-6 text-white mb-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold mb-2 flex items-center">
                                <span className="mr-2">🤖</span> AI大脑话术推荐
                            </h2>
                            <p className="text-white/80 text-sm">基于客户画像和场景智能推荐最佳话术</p>
                        </div>
                        <button
                            onClick={handleGetRecommendation}
                            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center"
                        >
                            <svg className={`w-4 h-4 mr-1 ${loadingRecommendation ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            {showRecommendation ? '收起推荐' : '获取推荐'}
                        </button>
                    </div>

                    {showRecommendation && recommendation && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 animate-fade-in">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm">🤖</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-white/90 mb-2">根据当前场景生成的推荐话术：</p>
                                    <div className="bg-white/10 rounded-lg p-3 mb-3">
                                        <p className="text-sm text-white">"{recommendation.script}"</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => copyToClipboard(recommendation.script)} className="text-xs bg-white/20 px-3 py-1.5 rounded hover:bg-white/30 transition-colors">使用话术</button>
                                        <button className="text-xs bg-white/20 px-3 py-1.5 rounded hover:bg-white/30 transition-colors">收藏</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Categories */}
                <div className="flex space-x-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id
                                ? 'bg-[#4640DE] text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Scripts List */}
                <div className="space-y-4 pb-12">
                    {scripts.length === 0 && <div className="text-center text-gray-400 py-10">暂无话术数据</div>}
                    {scripts.map(script => (
                        <div key={script.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${script.category === 'greeting' ? 'bg-blue-100 text-blue-800' :
                                        script.category === 'introduction' ? 'bg-purple-100 text-purple-800' :
                                            script.category === 'objection' ? 'bg-orange-100 text-orange-800' :
                                                script.category === 'closing' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                        }`}>
                                        {categories.find(c => c.id === script.category)?.label}
                                    </span>
                                    {script.tags.map(tag => (
                                        <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex items-center space-x-2 text-gray-400">
                                    <button className="p-1 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                    </button>
                                    <button className="p-1 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                                    </button>
                                </div>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-2">{script.title}</h3>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                "{script.content}"
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> 使用 {script.usageCount}次</span>
                                    <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg> 成功率 {script.successRate}%</span>
                                    <span className="flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> {script.lastUsed}</span>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(script.content)}
                                    className="bg-[#4640DE] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-opacity-90 transition-colors"
                                >
                                    使用话术
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* New Script Modal */}
            {showNewScriptModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">
                        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setShowNewScriptModal(false)}></div>
                        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative z-10">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">新建话术</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">话术标题</label>
                                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4640DE] focus:border-[#4640DE] outline-none" placeholder="请输入话术标题" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">话术分类</label>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4640DE] focus:border-[#4640DE] outline-none">
                                        {categories.filter(c => c.id !== 'all').map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">话术内容</label>
                                    <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4640DE] focus:border-[#4640DE] outline-none" placeholder="请输入话术内容..."></textarea>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowNewScriptModal(false)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={async () => {
                                            // Simple implementation
                                            const titleInput = document.querySelector('input[placeholder="请输入话术标题"]') as HTMLInputElement;
                                            const categorySelect = document.querySelector('select') as HTMLSelectElement;
                                            const contentTextarea = document.querySelector('textarea') as HTMLTextAreaElement;

                                            if (!titleInput.value || !contentTextarea.value) {
                                                alert('请填写完整信息');
                                                return;
                                            }

                                            try {
                                                await aiService.createScript({
                                                    title: titleInput.value,
                                                    category: categorySelect.value,
                                                    content: contentTextarea.value,
                                                    tags: '自定义',
                                                    usageCount: 0,
                                                    successRate: 0,
                                                    isRecommended: false
                                                });
                                                alert('保存成功！');
                                                setShowNewScriptModal(false);
                                                fetchScripts(activeCategory); // Refresh
                                            } catch (e) {
                                                alert('保存失败');
                                            }
                                        }}
                                        className="px-4 py-2 bg-[#4640DE] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                                    >
                                        保存
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIScripts;
