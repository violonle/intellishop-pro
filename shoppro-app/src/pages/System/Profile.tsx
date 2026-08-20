import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import { analyticsService } from '../../services/analyticsService';
import {
    Edit,
    BarChart2,
    Users,
    Bell,
    ShieldCheck,
    Share2,
    HelpCircle,
    Phone,
    User,
    ChevronRight,
    LogOut,
    Settings,
    Building2,
    QrCode
} from 'lucide-react';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const [performance, setPerformance] = useState({
        revenue: '¥0',
        orders: '0',
        trendv: '暂无',
        trendo: '暂无'
    });

    const monthlyTarget = Number((user as any)?.monthlyTarget || (user as any)?.salesTargets || 0);
    const [progress, setProgress] = useState<number | null>(null);

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                const res: any = await analyticsService.getSalesDashboard();
                if (res) {
                    const rev = res.monthlyRevenue || 0;
                    const ord = res.totalOrdersThisMonth || 0;

                    setPerformance({
                        revenue: `¥${rev.toLocaleString()}`,
                        orders: String(ord),
                        trendv: res.revenueTrend ?? '暂无',
                        trendo: res.orderTrend ?? '暂无'
                    });

                    // Calculate progress
                    const prog = monthlyTarget > 0 ? Math.min(100, Math.round((rev / monthlyTarget) * 100)) : null;
                    setProgress(prog);
                }
            } catch (error) {
                console.error("Failed to load profile performance", error);
            }
        };
        fetchPerformance();
    }, []);

    const QuickAction: React.FC<{ icon: React.ReactNode; label: string; path: string }> = ({ icon, label, path }) => (
        <button
            onClick={() => navigate(path)}
            className="flex flex-col items-center justify-center p-3 hover:bg-gray-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-gray-200"
        >
            <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-2 shadow-sm">
                {icon}
            </div>
            <span className="text-xs text-gray-700 font-medium">{label}</span>
        </button>
    );

    const StatCard: React.FC<{ value: string; label: string; trend: string; isPositive: boolean }> = ({ value, label, trend, isPositive }) => (
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
            <div className={`text-xs mt-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
            </div>
        </div>
    );

    const MenuButton: React.FC<{ icon: React.ReactNode; label: string; path: string; isDestructive?: boolean }> = ({ icon, label, path, isDestructive }) => (
        <div
            onClick={() => navigate(path)}
            className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 px-3 transition-colors -mx-2"
        >
            <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDestructive ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {icon}
                </div>
                <span className={`text-sm font-medium ${isDestructive ? 'text-red-600' : 'text-gray-700'}`}>
                    {label}
                </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-24">
            {/* Integrated Blue Header with User Profile */}
            <div className="bg-primary pt-12 pb-10 px-5 relative">
                {/* Header Actions - Top Right */}
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button
                        onClick={() => navigate('/enterprise/settings')}
                        className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Building2 className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => navigate('/settings')}
                        className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Settings className="w-6 h-6" />
                    </button>
                </div>

                {/* User Info Integration */}
                <div className="flex items-center gap-5 mt-2">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-white/30 p-0.5">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.realName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-8 h-8 text-primary" />
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent border-2 border-primary rounded-full flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        </div>
                    </div>
                    <div className="flex-1 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-3">
                                    {user?.realName || user?.username || '用户'}
                                    <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded border border-white/20 backdrop-blur-sm">
                                        {user?.role === 'admin' ? '管理员' : '销售顾问'}
                                    </span>
                                </h2>
                                <p className="text-blue-100 text-sm mt-1">{user?.email || '暂无邮箱'}</p>
                            </div>
                            <button
                                onClick={() => navigate('/profile/edit')}
                                className="text-sm text-white/80 font-medium hover:text-white hover:underline flex items-center bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all"
                            >
                                编辑
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-6 space-y-4 max-w-2xl mx-auto relative z-10">

                {/* Performance Section */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <BarChart2 className="w-4 h-4 text-primary" />
                            本月业绩
                        </h3>
                        <button
                            onClick={() => navigate('/profile/performance')}
                            className="text-xs text-gray-500 hover:text-primary flex items-center"
                        >
                            详细报告 <ChevronRight className="w-3 h-3 ml-0.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <StatCard value={performance.revenue} label="销售额" trend={performance.trendv} isPositive={true} />
                        <StatCard value={performance.orders} label="成交订单" trend={performance.trendo} isPositive={true} />
                    </div>

                    {/* Progress */}
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">月度目标完成度</span>
                            <span className="text-xs font-bold text-primary">{progress == null ? '暂无' : `${progress}%`}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progress ?? 0}%` }}></div>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-2 flex justify-between">
                            <span>已完成 {performance.revenue}</span>
                            <span>{monthlyTarget > 0 ? `目标 ¥${(monthlyTarget / 1000).toFixed(0)}k` : '目标未设置'}</span>
                        </div>
                    </div>
                </div>

                {/* Channel QR Codes & Marketing Tools */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 px-1">渠道码与营销工具</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {/* 线下渠道 */}
                        <button
                            onClick={() => navigate('/acquisition/channel/offline')}
                            className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all active:scale-95"
                        >
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
                                <QrCode className="w-7 h-7 text-amber-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">线下</span>
                        </button>

                        {/* 微信渠道 */}
                        <button
                            onClick={() => navigate('/acquisition/channel/wechat')}
                            className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all active:scale-95"
                        >
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
                                <QrCode className="w-7 h-7 text-green-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">微信</span>
                        </button>

                        {/* 抖音渠道 */}
                        <button
                            onClick={() => navigate('/acquisition/channel/douyin')}
                            className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all active:scale-95"
                        >
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
                                <QrCode className="w-7 h-7 text-gray-800" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">抖音</span>
                        </button>

                        {/* 小红书渠道 */}
                        <button
                            onClick={() => navigate('/acquisition/channel/xiaohongshu')}
                            className="flex flex-col items-center p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-primary/30 transition-all active:scale-95"
                        >
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
                                <QrCode className="w-7 h-7 text-red-500" />
                            </div>
                            <span className="text-xs font-bold text-gray-700">小红书</span>
                        </button>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-2 px-1">常用功能</h3>
                    <div className="grid grid-cols-4 gap-1">
                        <QuickAction icon={<Edit className="w-5 h-5" />} label="日志" path="/profile/work-log" />
                        <QuickAction icon={<Users className="w-5 h-5" />} label="团队" path="/profile/team" />
                        <QuickAction icon={<ShieldCheck className="w-5 h-5" />} label="权限" path="/permissions-test" />
                        <QuickAction icon={<Share2 className="w-5 h-5" />} label="分享" path="/profile/share" />
                    </div>
                </div>

                {/* Settings List */}
                <div className="bg-white rounded-xl px-5 py-2 border border-gray-200 shadow-sm">
                    <MenuButton icon={<Bell className="w-4 h-4" />} label="消息通知" path="/notifications" />
                    <MenuButton icon={<ShieldCheck className="w-4 h-4" />} label="隐私设置" path="/profile/privacy" />
                    <MenuButton icon={<HelpCircle className="w-4 h-4" />} label="帮助中心" path="/help" />
                    <MenuButton icon={<Phone className="w-4 h-4" />} label="联系客服" path="/profile/support" />
                </div>

                {/* Logout */}
                <div className="bg-white rounded-xl px-5 py-2 border border-gray-200 shadow-sm">
                    <MenuButton icon={<LogOut className="w-4 h-4" />} label="退出登录" path="/login" isDestructive />
                </div>
            </div>
        </div>
    );
};

export default Profile;
