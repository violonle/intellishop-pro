import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain,
    Sparkles,
    MessageSquare,
    User,
    Target,
    AlertTriangle,
    Zap,
    RotateCw,
    ChevronRight,
    Bot,
    Headphones,
    BotMessageSquare,
    TrendingUp,
    Radio,
    Clock
} from 'lucide-react';
import { aiService } from '../../services/aiService';

const QuickAction: React.FC<{ icon: React.ReactNode; label: string; tag?: string; onClick: () => void }> = ({ icon, label, tag, onClick }) => {
    return (
        <button onClick={onClick} className="group relative flex flex-col items-center p-3 rounded-xl shadow-sm border border-gray-200 bg-white hover:border-primary/50 hover:shadow-md transition-all duration-300 w-full active:scale-95">
            {tag && (
                <span className="absolute -top-1.5 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-sm">
                    {tag}
                </span>
            )}
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 bg-blue-50 text-primary group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <span className="text-xs font-bold text-gray-700 tracking-wide whitespace-nowrap group-hover:text-primary transition-colors">{label}</span>
        </button>
    );
};

const AIBrain: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [aiInsights, setAiInsights] = useState<string[]>([]);
    const [recommendedScripts, setRecommendedScripts] = useState<any[]>([]);
    const [agentSummary, setAgentSummary] = useState<any>({ activeAgentsCount: 0, todayExecutedTasks: 0, pendingTasks: 0 });

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsData, insightsData, scriptsData] = await Promise.all([
                aiService.getBrainStats(),
                aiService.getInsights(),
                aiService.getScripts()
            ]);

            setStats(statsData);
            setAiInsights(insightsData || []);

            const rec = scriptsData.filter((s: any) => s.isRecommended).slice(0, 2);
            setRecommendedScripts(rec.length > 0 ? rec : scriptsData.slice(0, 2));

            // 获取 Agent 汇总
            try {
                const res = await fetch('/api/ai/agents/summary', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token') || ''}` }
                });
                const json = await res.json();
                if (json.data) setAgentSummary(json.data);
            } catch (e) { console.error('Failed to load agent summary', e); }

        } catch (error) {
            console.error("Failed to fetch AI Brain data", error);
        } finally {
            setLoading(false);
        }
    };

    const EngineCard: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; color: string; metrics: { label: string; value: string; color?: string }[]; onClick?: () => void }> = ({ icon, title, subtitle, color, metrics, onClick }) => (
        <div onClick={onClick} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all duration-300 group cursor-pointer">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-primary transition-colors">{title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
            <div className="space-y-3 pt-2">
                {metrics.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-gray-500">{m.label}</span>
                        <span className={`font-semibold font-mono ${m.color || 'text-gray-900'}`}>{m.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50/50 min-h-screen pb-24">
            {/* Header - Primary Blue */}
            <div className="bg-gradient-to-r from-blue-700 via-primary to-indigo-700 px-4 py-8 pb-16 shadow-none relative">
                <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        ShopPro AI 智能中枢
                    </h1>
                    <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/30 backdrop-blur-sm flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                        双模弹性大脑
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-10 space-y-6 relative z-20">

                {/* 🤖 顶部智能体 Agent 全景 Banner - 清爽浅色风格 */}
                <div 
                    onClick={() => navigate('/ai/agents')}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:border-indigo-400/50 hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                <BotMessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5 group-hover:text-indigo-700 transition-colors">
                                    AI 销售智能体中枢
                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded-full border border-indigo-200">
                                        Agentic CRM
                                    </span>
                                </h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">SDR开发 · 智能跟进 · 成单教练自主协同</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-xs text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                            工作台 <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center">
                        <div className="bg-indigo-50/40 rounded-xl p-2 border border-indigo-100/60">
                            <div className="text-[10px] text-gray-500 mb-0.5">活跃智能体</div>
                            <div className="font-bold text-sm text-indigo-700">{agentSummary.activeAgentsCount ?? 0} 个在线</div>
                        </div>
                        <div className="bg-emerald-50/40 rounded-xl p-2 border border-emerald-100/60">
                            <div className="text-[10px] text-gray-500 mb-0.5">今日自主任务</div>
                            <div className="font-bold text-sm text-emerald-700">{agentSummary.todayExecutedTasks || 0} 项</div>
                        </div>
                        <div className="bg-amber-50/40 rounded-xl p-2 border border-amber-100/60">
                            <div className="text-[10px] text-gray-500 mb-0.5">待确认方案</div>
                            <div className="font-bold text-sm text-amber-700 flex items-center justify-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                {agentSummary.pendingTasks || 0} 待审
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2 行 × 4 列 核心 8 大功能矩阵 */}
                <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-primary" />
                            AI 业务功能矩阵 (8大引擎)
                        </h3>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2.5">
                        {/* 第一行：原有4项 */}
                        <QuickAction
                            icon={<MessageSquare className="w-5 h-5" />}
                            label="话术推荐"
                            onClick={() => navigate('/ai/scripts')}
                        />
                        <QuickAction
                            icon={<User className="w-5 h-5" />}
                            label="用户画像"
                            onClick={() => navigate('/ai/persona')}
                        />
                        <QuickAction
                            icon={<Target className="w-5 h-5" />}
                            label="线索评估"
                            onClick={() => navigate('/ai/leads')}
                        />
                        <QuickAction
                            icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
                            label="智能预警"
                            onClick={() => navigate('/ai/alerts')}
                        />

                        {/* 第二行：战略新增4项 */}
                        <QuickAction
                            icon={<BotMessageSquare className="w-5 h-5 text-indigo-600" />}
                            label="智能体工作台"
                            tag="NEW"
                            onClick={() => navigate('/ai/agents')}
                        />
                        <QuickAction
                            icon={<Headphones className="w-5 h-5 text-emerald-600" />}
                            label="会话智能"
                            tag="NEW"
                            onClick={() => navigate('/ai/conversations')}
                        />
                        <QuickAction
                            icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
                            label="收入运营"
                            tag="HOT"
                            onClick={() => navigate('/analytics/revenue')}
                        />
                        <QuickAction
                            icon={<Radio className="w-5 h-5 text-rose-600" />}
                            label="信号中心"
                            tag="NEW"
                            onClick={() => navigate('/ai/signals')}
                        />
                    </div>
                </div>

                {/* Real-time Insights */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center text-base">
                            <Zap className="w-5 h-5 text-primary mr-2" />
                            实时决策建议流
                        </h3>
                        <button onClick={fetchData} className={`text-gray-400 hover:text-primary transition-colors ${loading ? 'animate-spin' : ''}`}>
                            <RotateCw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {aiInsights.map((insight, idx) => (
                                <div key={idx} className="p-4 text-sm text-gray-700 flex items-start hover:bg-gray-50 transition-colors group cursor-default">
                                    <div className="mt-0.5 mr-3 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-3.5 h-3.5 text-primary" />
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                        <span className="leading-relaxed font-medium text-gray-800">{insight}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recommended Scripts */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            推荐促成话术库
                        </h3>
                        <button onClick={() => navigate('/ai/scripts')} className="text-gray-500 text-xs hover:text-primary flex items-center transition-colors">
                            查看全部 <ChevronRight className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {recommendedScripts.map((script: any) => (
                            <div key={script.id} onClick={() => navigate('/ai/scripts')} className="border border-gray-100 bg-gray-50 rounded-xl p-4 hover:border-primary/30 hover:bg-white transition-all cursor-pointer group">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">{script.title}</h4>
                                    {script.isRecommended && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-medium">推荐</span>}
                                </div>
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">{script.content}</p>
                                <div className="flex justify-between items-center text-xs text-gray-400">
                                    <span>成功率 <span className="text-green-600 font-bold ml-1">{script.successRate}%</span></span>
                                    <span className="group-hover:text-primary transition-colors">使用话术 &rarr;</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Engines Grid */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                            核心能力监控看板
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <EngineCard
                            icon={<User className="w-6 h-6 text-blue-600" />}
                            title="用户画像引擎"
                            subtitle="多维特征 · 行为自动聚类"
                            color="text-blue-600 bg-blue-50"
                            metrics={[
                                { label: '画像总数', value: `${stats?.personaCount ?? 0} 人` },
                                { label: '标签类型', value: stats?.tagTypeCount == null ? '暂无数据' : `${stats.tagTypeCount} 种` },
                                { label: '准确率', value: stats?.personaAccuracy || '暂无数据', color: 'text-green-600' }
                            ]}
                            onClick={() => navigate('/ai/persona')}
                        />
                        <EngineCard
                            icon={<Target className="w-6 h-6 text-indigo-600" />}
                            title="线索评估与预测模型"
                            subtitle="价值打分 · 动态成单率计算"
                            color="text-indigo-600 bg-indigo-50"
                            metrics={[
                                { label: '已评估线索', value: `${stats?.leadsEvaluated ?? 0} 条` },
                                { label: '高意向商机', value: `${stats?.leadsHighIntent ?? 0} 个` },
                                { label: '模型置信度', value: stats?.leadsAccuracy || '暂无数据', color: 'text-green-600' }
                            ]}
                            onClick={() => navigate('/ai/leads')}
                        />
                        <EngineCard
                            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
                            title="智能流失预警引擎"
                            subtitle="流失预测 · 异动实时监控"
                            color="text-orange-600 bg-orange-50"
                            metrics={[
                                { label: '预警事件', value: `${stats?.alertRisks ?? 0} 项`, color: 'text-red-600' },
                                { label: '重点关注客户', value: `${stats?.alertHighRiskCustomers ?? 0} 位` },
                                { label: '风险拦截率', value: stats?.alertRecall || '暂无数据', color: 'text-green-600' }
                            ]}
                            onClick={() => navigate('/ai/alerts')}
                        />
                    </div>
                </div>

            </div>

            {/* Floating AI Assistant Button */}
            <div className="fixed bottom-24 right-5 z-50">
                <button
                    onClick={() => navigate('/ai/chat')}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center relative group"
                >
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                    <Bot className="w-7 h-7" />
                    <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        AI 对话
                    </span>
                </button>
            </div>
        </div>
    );
};

export default AIBrain;
