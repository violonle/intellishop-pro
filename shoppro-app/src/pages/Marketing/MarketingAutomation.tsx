import React, { useState, useEffect } from 'react';
import { marketingService } from '../../services/marketingService';
import type { MarketingTask } from '../../services/marketingService';

const MarketingAutomation: React.FC = () => {
    // const navigate = useNavigate(); // Removed unused
    const [activeTab, setActiveTab] = useState('all');
    const [showAIInsights, setShowAIInsights] = useState(false);
    const [campaigns, setCampaigns] = useState<MarketingTask[]>([]);
    const [, setLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const data = await marketingService.getTasks({ pageNo: 1, pageSize: 20 });
                if (data && data.records) {
                    setCampaigns(data.records);
                }
            } catch (error) {
                console.error('Failed to load campaigns', error);
            } finally {
                setLoading(false);
            }
        };
        loadTasks();
    }, []);

    // ... FeatureCard component ...

    // Filter campaigns based on activeTab
    const filteredCampaigns = campaigns.filter(c => {
        if (activeTab === 'all') return true;
        return c.type === activeTab; // e.g., 'email', 'sms'
    });

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* ... Header ... */}

            <div className="p-4 space-y-6">
                {/* ... AI Recommendations and Feature Grid ... */}

                {/* Campaigns List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">活跃活动</h3>
                        <div className="flex space-x-2">
                            {['all', 'email', 'sms'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setActiveTab(type)}
                                    className={`text-xs px-2 py-1 rounded-full border ${activeTab === type ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-500 border-gray-200'}`}
                                >
                                    {type === 'all' ? '全部' : type === 'email' ? '邮件' : '短信'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {filteredCampaigns.length > 0 ? (
                            filteredCampaigns.map(c => (
                                <div key={c.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-medium text-gray-900">{c.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{c.targetAudience || '全量用户'} · {c.type}</div>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'running' ? 'bg-green-100 text-green-700' :
                                            c.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {c.status === 'running' ? '进行中' : c.status === 'completed' ? '已完成' : c.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                                        <span>状态: <b className="text-gray-700">{c.status}</b></span>
                                        <span>创建时间: <b className="text-gray-700">{c.createdAt?.substring(0, 10)}</b></span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">暂无活动</div>
                        )}
                    </div>
                </div>
            </div>

            {/* ... AI Insights Modal ... */}
            {/* AI Insights Modal */}
            {showAIInsights && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAIInsights(false)}>
                    <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">✨ 营销洞察报告</h3>
                            <button onClick={() => setShowAIInsights(false)} className="text-gray-400">✕</button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-blue-600">15.6%</div>
                                    <div className="text-xs text-gray-600">平均转化率</div>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg text-center">
                                    <div className="text-xl font-bold text-purple-600">325%</div>
                                    <div className="text-xs text-gray-600">平均ROI</div>
                                </div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-sm mb-3">关键发现</h4>
                                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
                                    <li>邮件营销在周二上午 9-11 点效果最佳</li>
                                    <li>个性化主题行比通用主题行转化率高 28%</li>
                                    <li>短信营销对 35 岁以上用户效果更好</li>
                                </ul>
                            </div>
                            <button onClick={() => setShowAIInsights(false)} className="w-full bg-[#4640DE] text-white py-2 rounded-lg">
                                了解更多
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketingAutomation;
