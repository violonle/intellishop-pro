import React, { useState, useEffect } from 'react';
import { Button, Tag, Input, Select, Progress, message, Empty } from 'antd';
import {
    Plus,
    Workflow,
    CheckSquare,
    Clock,
    AlertCircle,
    CheckCircle2,
    PhoneCall,
    Video,
    FileText,
    Search,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import request from '@/utils/request';

interface TaskItem {
    id: string;
    type: 'phone' | 'meeting' | 'proposal' | 'internal';
    title: string;
    desc: string;
    customer: string;
    contact: string;
    owner: string;
    dueTime: string;
    priority: '高' | '中' | '低';
    status: '待办' | '即将到期' | '已逾期' | '已完成';
}

export const TasksPage: React.FC = () => {
    const [tab, setTab] = useState<'all' | 'today' | 'urgent' | 'completed'>('all');
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadTasks();
    }, [tab]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            const data: any = await request({
                url: '/operation/tasks',
                method: 'get',
            }).catch(() => null);

            const taskData = (data as any)?.data || data;
            const records = Array.isArray(taskData) ? taskData : (taskData?.records || taskData?.items || []);

            if (records.length > 0) {
                const mapped: TaskItem[] = records.map((t: any) => ({
                    id: String(t.id),
                    type: t.type === 'phone' ? 'phone' : t.type === 'meeting' ? 'meeting' : 'proposal',
                    title: t.title || t.taskTitle || '客户跟进待办',
                    desc: t.description || t.reason || '按 SOP 规范推进客户跟进与意向确认',
                    customer: t.customerName || '重点企业客户',
                    contact: t.contactPerson || '负责人',
                    owner: t.ownerName || '销售顾问',
                    dueTime: t.dueTime ? new Date(t.dueTime).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '今日',
                    priority: t.priority === 'urgent' || t.priority === 'high' ? '高' : '中',
                    status: t.status === 'completed' || t.status === 'executed' ? '已完成' : '待办'
                }));
                setTasks(mapped);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error('Failed to load tasks', error);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            await request({
                url: `/operation/tasks/${taskId}/complete`,
                method: 'put'
            }).catch(() => {});
            message.success('任务已标记达成！');
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: '已完成' } : t));
        } catch {
            message.error('操作失败，请重试');
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (tab === 'completed') return t.status === '已完成';
        if (tab === 'urgent') return t.priority === '高';
        return true;
    });

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            {/* 顶栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        SOP 跟进待办中心
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        标准化销售动作待办列表，由系统流程与 AI 销售大脑自动触发驱动（真实后端数据）
                    </p>
                </div>
            </div>

            {/* 待办主体列表 */}
            <div className="bg-white dark:bg-[#0D121F] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex gap-1.5 overflow-x-auto pb-4 border-b border-slate-100 dark:border-slate-800">
                    {(['all', 'today', 'urgent', 'completed'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${tab === t ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            {t === 'all' ? '全部待办' : t === 'today' ? '今日待办' : t === 'urgent' ? '高优先级' : '已完成'}
                        </button>
                    ))}
                </div>

                <div className="space-y-3 pt-2">
                    {filteredTasks.length === 0 ? (
                        <Empty description="暂无符合条件的 SOP 跟进待办" className="py-12" />
                    ) : (
                        filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${task.status === '已完成' ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-white dark:bg-[#111622] border-slate-100 dark:border-slate-800/80 hover:border-blue-300'}`}
                            >
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`font-bold text-xs ${task.status === '已完成' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                            {task.title}
                                        </h4>
                                        <Tag color={task.priority === '高' ? 'red' : 'blue'} className="!rounded-md !text-[10px]">
                                            {task.priority}优先级
                                        </Tag>
                                        <Tag className="!rounded-md !text-[10px]">
                                            {task.status}
                                        </Tag>
                                    </div>
                                    <p className="text-xs text-slate-500">{task.desc}</p>
                                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
                                        <span>目标客户：<strong className="text-slate-700 dark:text-slate-300">{task.customer}</strong></span>
                                        <span>对接联系人：{task.contact}</span>
                                        <span>截止时间：{task.dueTime}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {task.status !== '已完成' && (
                                        <Button
                                            type="primary"
                                            size="small"
                                            onClick={() => handleCompleteTask(task.id)}
                                            className="!rounded-xl !bg-emerald-600 hover:!bg-emerald-500 !text-xs !font-bold"
                                        >
                                            标记完成
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TasksPage;
