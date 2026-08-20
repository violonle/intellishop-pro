import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Wrench,
    AlertTriangle,
    MessageSquare,
    Megaphone,
    Inbox,
    ChevronLeft
} from 'lucide-react';

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');

    const [notifications, setNotifications] = useState<any[]>([]);

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const filteredNotifications = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

    const getIcon = (type: string) => {
        switch (type) {
            case 'system': return <Wrench className="w-5 h-5 text-gray-500" />;
            case 'alert': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'message': return <MessageSquare className="w-5 h-5 text-blue-500" />;
            default: return <Megaphone className="w-5 h-5 text-purple-500" />;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">消息通知</h1>
                    </div>
                </div>
                <div className="px-4 pb-3 flex items-center justify-between">
                    <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                        {['all', 'system', 'alert', 'message'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${filter === t
                                    ? 'bg-[#4640DE] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {{ all: '全部', system: '系统通知', alert: '预警提醒', message: '消息' }[t]}
                            </button>
                        ))}
                    </div>
                    <button onClick={markAllAsRead} className="text-xs text-gray-500 whitespace-nowrap hover:text-[#4640DE]">
                        全部已读
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="p-4 space-y-3">
                {filteredNotifications.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <div className="flex justify-center mb-2">
                            <Inbox className="w-10 h-10 text-gray-300" />
                        </div>
                        <p>暂无消息</p>
                    </div>
                ) : (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`bg-white p-4 rounded-xl shadow-sm border transition-all ${notification.read ? 'border-gray-100 opacity-70' : 'border-blue-100 border-l-4 border-l-[#4640DE]'
                                } hover:shadow-md cursor-pointer`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg">{getIcon(notification.type)}</span>
                                    <h3 className={`font-medium text-gray-900 ${!notification.read && 'font-bold'}`}>
                                        {notification.title}
                                    </h3>
                                </div>
                                <span className="text-xs text-gray-400">{notification.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 ml-8 leading-relaxed">
                                {notification.content}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
