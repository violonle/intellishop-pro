import React, { useMemo, useState } from 'react';
import { Button, Empty, Tabs, message } from 'antd';
import { Bell, Check, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
    id: string;
    type: 'ai' | 'lead' | 'task' | 'order' | 'system';
    title: string;
    summary: string;
    time: string;
    isRead: boolean;
}

export const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<NotificationItem[]>([]);
    const [activeTab, setActiveTab] = useState('all');

    const filtered = useMemo(() => {
        if (activeTab === 'unread') return list.filter(item => !item.isRead);
        if (activeTab === 'ai') return list.filter(item => item.type === 'ai');
        if (activeTab === 'customer') return list.filter(item => item.type === 'lead' || item.type === 'order');
        if (activeTab === 'system') return list.filter(item => item.type === 'task' || item.type === 'system');
        return list;
    }, [activeTab, list]);

    const markAllRead = () => {
        setList(current => current.map(item => ({ ...item, isRead: true })));
        message.success('已全部标记为已读');
    };

    const tabs = [
        { key: 'all', label: `全部 ${list.length}` },
        { key: 'unread', label: `未读 ${list.filter(item => !item.isRead).length}` },
        { key: 'ai', label: 'AI建议' },
        { key: 'customer', label: '客户动态' },
        { key: 'system', label: '系统' },
    ];

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">消息通知</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">查看系统提醒、客户动态与智能体建议</p>
                </div>
                <div className="flex gap-2.5">
                    <Button type="primary" onClick={markAllRead} icon={<Check className="w-3.5 h-3.5" />} className="!rounded-xl !bg-blue-600 !text-xs !font-bold !h-9">全部已读</Button>
                    <Button onClick={() => navigate('/settings/notifications')} icon={<Sliders className="w-3.5 h-3.5" />} className="!rounded-xl !text-xs !h-9">通知设置</Button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs.map(tab => ({ key: tab.key, label: tab.label }))} />
                {filtered.length === 0 ? (
                    <Empty image={<Bell className="mx-auto h-10 w-10 text-slate-300" />} description="暂无通知数据" />
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.map(item => (
                            <div key={item.id} className="py-4 flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{item.summary}</p>
                                </div>
                                <span className="text-[11px] text-slate-400 whitespace-nowrap">{item.time}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
