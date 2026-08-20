import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BotMessageSquare,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowLeft,
    Sparkles,
    Send,
    ThumbsDown
} from 'lucide-react';

interface AgentTask {
    id: number;
    agentType: string;
    title: string;
    targetType: string;
    targetName: string;
    assignedSalesName: string;
    generatedContent: string;
    status: string;
    createdAt: string;
}

const AIAgents: React.FC = () => {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<'all' | 'sdr' | 'follow_up' | 'deal_coach'>('all');
    const [tasks, setTasks] = useState<AgentTask[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            const taskRes = await fetch(`/api/ai/agents/tasks?agentType=${selectedTab}&status=all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const taskJson = await taskRes.json();
            if (taskJson.data) setTasks(taskJson.data);
        } catch (e) {
            console.error('Failed to load agent tasks', e);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            await fetch(`/api/ai/agents/tasks/${id}/confirm`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            await fetch(`/api/ai/agents/tasks/${id}/reject`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback: '话术表达需要微调' })
            });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const getAgentBadge = (type: string) => {
        switch (type) {
            case 'sdr': return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">SDR 开发</span>;
            case 'follow_up': return <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-semibold">智能跟进</span>;
            case 'deal_coach': return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">成单教练</span>;
            default: return <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-semibold">通用智能体</span>;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-primary text-white px-4 pt-6 pb-6 sticky top-0 z-30 shadow-md">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold">AI 销售智能体工作台</h1>
                    <div className="w-8"></div>
                </div>

                {/* 智能体卡片概览 */}
                <div className="grid grid-cols-3 gap-2">
                    <div 
                        onClick={() => setSelectedTab('sdr')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${selectedTab === 'sdr' ? 'bg-white text-primary font-bold shadow-md border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                    >
                        <div className="text-xs font-medium">SDR 智能体</div>
                        <div className="text-sm font-bold mt-0.5">自动首触</div>
                    </div>
                    <div 
                        onClick={() => setSelectedTab('follow_up')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${selectedTab === 'follow_up' ? 'bg-white text-primary font-bold shadow-md border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                    >
                        <div className="text-xs font-medium">跟进智能体</div>
                        <div className="text-sm font-bold mt-0.5">逾期预警</div>
                    </div>
                    <div 
                        onClick={() => setSelectedTab('deal_coach')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${selectedTab === 'deal_coach' ? 'bg-white text-primary font-bold shadow-md border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                    >
                        <div className="text-xs font-medium">成单教练</div>
                        <div className="text-sm font-bold mt-0.5">停滞促成</div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="px-4 py-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-primary" />
                        智能体任务流水线 ({tasks.length})
                    </h2>
                    <span className="text-xs text-gray-400">已启用人工审阅模式</span>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-400 text-sm">加载智能体任务中...</div>
                ) : tasks.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-400">
                        <BotMessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        暂无待处理的智能体任务
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            onClick={() => navigate(`/ai/agents/task/${task.id}`)}
                            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:border-primary/40 transition-all cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-2.5">
                                {getAgentBadge(task.agentType)}
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {task.createdAt ? task.createdAt.substring(11, 16) : '刚刚'}
                                </span>
                            </div>

                            <h3 className="font-bold text-gray-900 text-sm mb-1.5">{task.title}</h3>
                            
                            <div className="bg-slate-50 rounded-xl p-3 text-xs text-gray-700 leading-relaxed mb-3 border border-slate-100">
                                <span className="font-semibold text-indigo-600 mr-1">AI 生成方案:</span>
                                {task.generatedContent}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-500">
                                    目标: <span className="font-medium text-gray-800">{task.targetName}</span>
                                </span>

                                {task.status === 'pending' ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleReject(task.id, e)}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold flex items-center gap-1"
                                        >
                                            <ThumbsDown className="w-3 h-3" /> 驳回
                                        </button>
                                        <button
                                            onClick={(e) => handleConfirm(task.id, e)}
                                            className="px-3 py-1 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                                        >
                                            <Send className="w-3 h-3" /> 确认发送
                                        </button>
                                    </div>
                                ) : task.status === 'confirmed' ? (
                                    <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> 已确认执行
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                        <XCircle className="w-3.5 h-3.5" /> 已驳回
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AIAgents;
