import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    UserPlus,
    Flame,
    Calendar,
    Cake,
    Bot,
    Clock,
    AlertTriangle,
    CheckCircle,
    Phone,
    MessageCircle,
    Plus
} from 'lucide-react';
import { operationService, type WorkTask } from '../../services/operationService';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';

type TaskType = 'new_customer' | 'high_intent' | 'regular_followup' | 'birthday' | 'ai_suggestion' | 'quote_followup' | 'churn_alert';
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

interface SOPTask {
    id: number;
    customerId?: number;
    type: TaskType;
    customerName: string;
    description: string;
    suggestedAction: string;
    priority: 'urgent' | 'high' | 'normal' | 'low';
    status: TaskStatus;
    dueTime?: string;
    createdAt: string;
}

const TASK_CONFIG: Record<TaskType, { label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string }> = {
    new_customer: { label: '新客首次跟进', icon: <UserPlus className="w-4 h-4" />, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    high_intent: { label: '高意向跟进', icon: <Flame className="w-4 h-4" />, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    regular_followup: { label: '定期回访', icon: <Calendar className="w-4 h-4" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' },
    birthday: { label: '生日关怀', icon: <Cake className="w-4 h-4" />, color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    ai_suggestion: { label: 'AI智能建议', icon: <Bot className="w-4 h-4" />, color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
    quote_followup: { label: '报价跟进', icon: <Clock className="w-4 h-4" />, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
    churn_alert: { label: '流失预警', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' }
};

const TaskList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<'today' | 'week' | 'completed'>('today');
    const [tasks, setTasks] = useState<SOPTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTasks();
    }, [user?.id]);

    const loadTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!user?.id) {
                setTasks([]);
                return;
            }
            const remoteTasks = await operationService.listWorkTasks(Number(user.id));
            const mapped: SOPTask[] = remoteTasks.map((t: WorkTask) => ({
                    id: t.id,
                    customerId: t.customerId,
                    type: t.type === 'ai_suggestion' ? 'ai_suggestion' : 'regular_followup',
                    customerName: t.title.split('：')[1] || t.title.split(':')[1] || '重点客户',
                    description: t.description || t.title,
                    suggestedAction: '请在今天内完成企微或电话跟进，并更新商机进度',
                    priority: t.type === 'ai_suggestion' ? 'high' : 'normal',
                    status: t.status === 'completed' ? 'completed' : 'pending',
                    dueTime: t.dueTime ? new Date(t.dueTime).toLocaleDateString() : '今天 18:00',
                    createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '刚刚'
            }));
            setTasks(mapped);
        } catch (error) {
            console.error('Failed to load tasks', error);
            setError(error instanceof Error ? error.message : '任务加载失败');
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'completed') return task.status === 'completed';
        if (activeTab === 'today') return task.status !== 'completed' && (task.dueTime?.includes('今天') || task.status === 'overdue');
        return task.status !== 'completed';
    });

    const handleComplete = async (taskId: number) => {
        try {
            await operationService.completeWorkTask(taskId);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' as TaskStatus } : t));
        } catch (error) {
            console.error('Failed to complete task', error);
            alert(error instanceof Error ? error.message : '任务完成状态更新失败');
        }
    };

    const getPriorityBadge = (priority: SOPTask['priority']) => {
        const config = {
            urgent: { label: '紧急', cls: 'bg-rose-50 text-rose-600 border-rose-200' },
            high: { label: '重要', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
            normal: { label: '常规', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
            low: { label: '低', cls: 'bg-gray-100 text-gray-600 border-gray-200' }
        };
        return config[priority];
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans">
            <div className="bg-white shadow-xs sticky top-0 z-10 border-b border-gray-100">
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft className="w-5 h-5 text-gray-700" /></button>
                    <h1 className="text-base font-bold text-gray-900">SOP 销售跟进待办</h1>
                    <button onClick={() => navigate('/tasks/create')} className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="flex border-b border-gray-100 px-4">
                    {[
                        { key: 'today', label: '今日待办', count: tasks.filter(t => t.status !== 'completed' && (t.dueTime?.includes('今天') || t.status === 'overdue')).length },
                        { key: 'week', label: '本周计划', count: tasks.filter(t => t.status !== 'completed').length },
                        { key: 'completed', label: '已完成', count: tasks.filter(t => t.status === 'completed').length }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as 'today' | 'week' | 'completed')}
                            className={`flex-1 py-3 text-xs font-bold relative transition-colors ${activeTab === tab.key ? 'text-blue-600' : 'text-gray-500'}`}
                        >
                            {tab.label}
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{tab.count}</span>
                            {activeTab === tab.key && <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-blue-600 rounded-full" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">正在加载任务...</div>
                ) : error ? (
                    <div className="text-center py-12 text-rose-500">{error}</div>
                ) : filteredTasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-300" />
                        <p className="text-xs">暂无待办任务</p>
                    </div>
                ) : (
                    filteredTasks.map(task => {
                        const config = TASK_CONFIG[task.type] || TASK_CONFIG.regular_followup;
                        const priorityBadge = getPriorityBadge(task.priority);
                        return (
                            <div key={task.id} className={`bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs hover:border-blue-500/30 transition-all ${task.status === 'completed' ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 border border-blue-100 text-xs">
                                                {task.customerName[0]}
                                            </div>
                                            {task.priority === 'urgent' && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-xs text-gray-900">{task.customerName}</h4>
                                                <span className={`inline-block px-1.5 py-0.2 text-[10px] font-bold rounded border ${priorityBadge.cls}`}>
                                                    {priorityBadge.label}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">创建于：{task.createdAt}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`flex items-center gap-1 justify-end text-[10px] font-bold ${config.color} mb-1`}>
                                            <div className={`p-0.5 rounded ${config.bgColor}`}>
                                                {config.icon}
                                            </div>
                                            {config.label}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-3">
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">📋 {task.description}</p>
                                    <div className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-100">
                                        <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wider font-bold">AI建议动作</p>
                                        <p className="text-xs text-gray-800 font-semibold leading-relaxed">{task.suggestedAction}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className={`text-[10px] font-bold flex items-center gap-1.5 ${task.status === 'overdue' ? 'text-rose-500' : 'text-gray-400'}`}>
                                        <Clock className="w-3 h-3" />
                                        <span>截止：{task.dueTime}</span>
                                    </div>

                                    {task.status !== 'completed' ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => task.customerId ? navigate(`/customers/${task.customerId}`) : undefined}
                                                disabled={!task.customerId}
                                                title={task.customerId ? '请在客户详情发起联系' : '任务未关联客户'}
                                                className="p-1.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 border border-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => task.customerId ? navigate(`/customers/${task.customerId}`) : undefined}
                                                disabled={!task.customerId}
                                                title={task.customerId ? '请在客户详情发起联系' : '任务未关联客户'}
                                                className="p-1.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleComplete(task.id)}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-bold rounded-xl hover:bg-blue-700 flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                                标记完成
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                            <CheckCircle className="w-3 h-3" />
                                            任务已达成
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default TaskList;
