import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserCog,
    Settings as SettingsIcon,
    Bell,
    LogOut,
    CheckCircle,
    ArrowLeft
} from 'lucide-react';
import { authService, type User } from '../../services/authService';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState(14);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        authService.getCurrentUser().then(setUser).catch(() => setUser(null));
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; color: string }> = ({ icon, title, color }) => (
        <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center">
                <span className={`mr-2 ${color}`}>{icon}</span>
                {title}
            </h3>
        </div>
    );

    const Toast = () => (
        <div id="successToast" className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-[#10B981] text-white px-6 py-3 rounded-lg shadow-lg z-50 hidden">
            <CheckCircle className="w-5 h-5 mr-2 inline-block" />
            <span>设置已保存！</span>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <Toast />
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="flex items-center px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">系统设置</h1>
                    </div>
                </div>
            </div>

            {/* User Card */}
            <div className="p-4">
                <div className="bg-gradient-to-r from-[#4640DE] to-[#8B5CF6] rounded-xl p-6 text-white mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                            <UserCog className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-1">{user?.realName || user?.username || '当前用户'}</h2>
                            <p className="text-white/80 text-sm mb-2">{user?.role || '未设置角色'}</p>
                            <div className="flex items-center space-x-4 text-sm">
                                <span className="bg-white/20 px-2 py-1 rounded-full">{user?.phone || user?.email || '未设置联系方式'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-4">


                {/* App Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <SectionHeader icon={<SettingsIcon className="w-5 h-5" />} title="应用设置" color="text-[#4640DE]" />
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900 text-sm">深色模式</div>
                                <div className="text-gray-500 text-xs">开启后界面将使用深色主题</div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-11 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-[#4640DE]' : 'bg-gray-200'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${theme === 'dark' ? 'left-[22px]' : 'left-0.5'}`}></div>
                            </button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">字体大小</label>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500">小</span>
                                <input
                                    type="range" min="12" max="18"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4640DE]"
                                />
                                <span className="text-sm text-gray-500">大</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <SectionHeader icon={<Bell className="w-5 h-5" />} title="通知设置" color="text-[#4640DE]" />
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-gray-900 text-sm">推送通知</div>
                                <div className="text-gray-500 text-xs">接收系统推送的重要消息</div>
                            </div>
                            <div className="w-11 h-6 bg-[#4640DE] rounded-full relative"><div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-[22px]"></div></div>
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-4">
                        <button
                            onClick={() => setShowLogoutModal(true)}
                            className="w-full bg-[#EF4444] text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                        >
                            退出登录
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowLogoutModal(false)}></div>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm relative z-10 p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#EF4444]">
                            <LogOut className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">确认退出</h3>
                        <p className="text-gray-600 text-sm mb-6">确定要退出当前账户吗？退出后需要重新登录。</p>
                        <div className="flex space-x-3">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200">
                                取消
                            </button>
                            <button onClick={handleLogout} className="flex-1 bg-[#EF4444] text-white py-3 rounded-lg font-medium hover:bg-opacity-90">
                                确认退出
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
