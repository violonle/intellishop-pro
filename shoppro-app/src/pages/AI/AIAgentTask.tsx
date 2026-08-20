import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Send,
    XCircle,
    Copy,
    Edit3,
    Sparkles
} from 'lucide-react';

const AIAgentTask: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<any>(null);
    const [editedContent, setEditedContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadTask();
    }, [id]);

    const loadTask = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            const res = await fetch(`/api/ai/agents/tasks/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.data) {
                setTask(json.data);
                setEditedContent(json.data.generatedContent || '');
            }
        } catch (e) {
            console.error('Failed to load task', e);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            await fetch(`/api/ai/agents/tasks/${id}/confirm`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            navigate(-1);
        } catch (e) {
            console.error(e);
        }
    };

    const handleReject = async () => {
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            await fetch(`/api/ai/agents/tasks/${id}/reject`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedback: '话术表达已驳回' })
            });
            navigate(-1);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(editedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading || !task) {
        return <div className="p-8 text-center text-gray-400">加载任务详情中...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-gray-900">智能体任务审阅</h1>
                <button onClick={handleCopy} className="text-primary text-xs font-semibold flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? '已复制' : '复制内容'}
                </button>
            </div>

            <div className="p-4 space-y-4">
                {/* 任务基本信息卡片 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase">
                            {task.agentType}
                        </span>
                        <h2 className="font-bold text-sm text-gray-900">{task.title}</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100 mt-3">
                        <div>
                            <span>目标对象：</span>
                            <span className="font-semibold text-gray-800 ml-1">{task.targetName}</span>
                        </div>
                        <div>
                            <span>负责销售：</span>
                            <span className="font-semibold text-gray-800 ml-1">{task.assignedSalesName || '暂无'}</span>
                        </div>
                    </div>
                </div>

                {/* AI 方案内容 */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-primary" />
                            智能体生成的执行方案 / 触达话术
                        </h3>
                        <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            {isEditing ? '预览模式' : '在线微调'}
                        </button>
                    </div>

                    {isEditing ? (
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            rows={6}
                            className="w-full p-3 border border-indigo-200 rounded-xl text-xs text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    ) : (
                        <div className="bg-indigo-50/50 p-4 rounded-xl text-xs text-gray-800 leading-relaxed border border-indigo-100 whitespace-pre-wrap">
                            {editedContent}
                        </div>
                    )}

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-800 text-[11px] leading-relaxed">
                        💡 <strong>智能体执行说明：</strong> 确认后系统将自动通过企业微信/短信通道直接触达客户，并创建后续 48 小时自动跟进日程。
                    </div>
                </div>

                {/* 底部操作条 */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3 max-w-[480px] mx-auto z-40">
                    <button
                        onClick={handleReject}
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm flex items-center justify-center gap-1.5"
                    >
                        <XCircle className="w-4 h-4 text-gray-500" />
                        驳回该方案
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
                    >
                        <Send className="w-4 h-4" />
                        立即确认执行
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIAgentTask;
