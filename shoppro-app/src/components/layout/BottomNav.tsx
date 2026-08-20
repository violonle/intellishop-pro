import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Brain, BarChart3, User } from 'lucide-react';

const AppBottomNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        {
            path: '/dashboard',
            label: '首页',
            icon: Home,
            prefixes: ['/dashboard', '/notifications']
        },
        {
            path: '/leads',
            label: '线索/客户',
            icon: Users,
            prefixes: ['/leads', '/customers', '/operation/tasks', '/sales', '/tags']
        },
        {
            path: '/ai/brain',
            label: 'AI大脑',
            icon: Brain,
            prefixes: ['/ai']
        },
        {
            path: '/analytics',
            label: '数据',
            icon: BarChart3,
            prefixes: ['/analytics', '/marketing']
        },
        {
            path: '/profile',
            label: '我的',
            icon: User,
            prefixes: ['/profile', '/settings', '/help', '/acquisition', '/operation/sop', '/enterprise']
        },
    ];

    const isItemActive = (prefixes: string[]) => {
        return prefixes.some(prefix =>
            location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
        );
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] z-50 h-[80px]">
            {/* Gradient Accent Line at Top */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            <div className="flex items-center justify-around h-full max-w-[480px] mx-auto w-full px-2">
                {navItems.map((item) => {
                    const active = isItemActive(item.prefixes);
                    const Icon = item.icon;

                    // Special styling for AI Button
                    if (item.label === 'AI大脑') {
                        return (
                            <button
                                key={item.path}
                                className="relative flex flex-col items-center justify-center -mt-6 group"
                                onClick={() => navigate(item.path)}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${active
                                    ? 'bg-primary text-white shadow-primary/30 scale-110'
                                    : 'bg-white text-gray-400 border border-gray-200 group-hover:text-primary group-hover:border-primary/50'
                                    }`}>
                                    <Icon className={`w-7 h-7 transition-all ${active ? 'fill-white' : 'fill-none'}`} strokeWidth={active ? 2 : 1.5} />
                                </div>
                                <span className={`text-[11px] font-medium mt-1 ${active ? 'text-primary' : 'text-gray-500'}`}>{item.label}</span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.path}
                            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all group ${active ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            onClick={() => navigate(item.path)}
                        >
                            <div className={`transition-all duration-300 ${active ? 'transform -translate-y-1' : ''}`}>
                                <Icon
                                    className={`w-6 h-6 mb-1 ${active ? 'fill-primary/20 text-primary' : 'fill-none text-gray-400'}`}
                                    strokeWidth={active ? 2.5 : 1.5}
                                />
                            </div>
                            <span className={`text-[11px] font-medium transition-opacity ${active ? 'opacity-100 font-bold' : 'opacity-80'}`}>
                                {item.label}
                            </span>
                            {/* Active Indicator Dot */}
                            {active && <div className="w-1 h-1 bg-primary rounded-full mt-0.5"></div>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AppBottomNav;
