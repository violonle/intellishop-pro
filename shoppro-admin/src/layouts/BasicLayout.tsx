import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Space, Badge, type MenuProps } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    FileTextOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import {
    Bot,
    LayoutDashboard,
    Bell,
    Building2,
    HelpCircle,
    BookOpen,
    Headphones,
    Moon,
    Sun,
    ChevronDown
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getMenuByRole } from '@/config/menu';
import CompanySelector from '@/components/CompanySelector';
import { useCompany } from '@/contexts/CompanyContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getUser } from '@/utils/storage';
import { LOGIN_PATH } from '@/site';

import logoImg from '@/assets/logo.png';

const { Header, Sider, Content } = Layout;

export const BasicLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { themeMode, toggleTheme } = useTheme();
    const isDark = themeMode === 'dark';
    const { isSuperAdmin } = useCompany();
    const user = getUser();
    const navigate = useNavigate();
    const location = useLocation();

    const isSuperAdminRole = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'platform_admin';
    const currentMenuItems = getMenuByRole(user?.role);
    const homePath = isSuperAdminRole ? '/tenancy/tenants' : '/dashboard';

    const handleMenuClick = (info: any) => {
        navigate(info.key);
    };

    const userDropdownMenu: MenuProps = {
        items: [
            {
                key: 'profile',
                label: '编辑个人资料',
                icon: <UserOutlined />,
                onClick: () => navigate('/profile/edit'),
            },
            {
                key: 'worklog',
                label: '工作日志',
                icon: <FileTextOutlined />,
                onClick: () => navigate('/profile/worklog'),
            },
            {
                key: 'performance',
                label: '我的业绩',
                icon: <TrophyOutlined />,
                onClick: () => navigate('/profile/performance'),
            },
            {
                key: 'settings',
                label: '系统设置',
                icon: <SettingOutlined />,
                onClick: () => navigate('/settings/certification'),
            },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                label: '退出登录',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: () => {
                    localStorage.removeItem('shoppro_admin_token');
                    localStorage.removeItem('shoppro_admin_user');
                    navigate(LOGIN_PATH);
                }
            },
        ],
    };

    const enterpriseMenu: MenuProps = {
        items: [
            {
                key: 'ent1',
                label: '上海总部·企业空间',
                icon: <Building2 className="w-4 h-4 text-blue-500" />,
            },
            {
                key: 'ent2',
                label: '北京研发中心',
                icon: <Building2 className="w-4 h-4 text-slate-400" />,
            },
            {
                key: 'ent3',
                label: '深圳华南运营中心',
                icon: <Building2 className="w-4 h-4 text-slate-400" />,
            },
        ],
    };

    return (
        <Layout style={{ height: '100vh', overflow: 'hidden' }} className={isDark ? 'dark bg-[#0B0F17]' : 'bg-[#F8FAFC]'}>
            {/* 侧边栏 (Sidebar) */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={280}
                collapsedWidth={72}
                className={`transition-all duration-300 z-30 shadow-sm border-r ${isDark ? '!bg-[#0D121F] !border-slate-800' : '!bg-white !border-slate-200/80'}`}
            >
                {/* 品牌 LOGO 区域 */}
                <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer overflow-hidden" onClick={() => navigate(homePath)}>
                    {collapsed ? (
                        <div className="flex items-center justify-center w-full">
                            <span className="text-base font-bold italic text-blue-600">I</span><span className="text-base font-light text-slate-900 dark:text-white">S</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 animate-fade-in">
                            <span className="text-lg font-bold tracking-tight text-blue-600 italic">Intelli</span>
                            <span className="text-lg font-light tracking-tight text-[#1D1D1F] dark:text-white">Shop</span>
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-0.5 leading-none self-start mt-0.5">
                                {isSuperAdminRole ? 'ADMIN' : 'PRO'}
                            </span>
                        </div>
                    )}
                </div>

                {/* 菜单树 */}
                <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar p-2">
                    <Menu
                        theme={isDark ? 'dark' : 'light'}
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        defaultOpenKeys={isSuperAdminRole ? ['grp-tenancy', 'grp-models', 'grp-subscription'] : ['grp-sales-workbench', 'grp-sales-agents']}
                        items={currentMenuItems}
                        onClick={handleMenuClick}
                        className="shoppro-side-menu !bg-transparent !border-none font-medium text-xs space-y-0.5"
                    />
                </div>
            </Sider>

            {/* 主工作区 Layout */}
            <Layout className={`h-full flex flex-col ${isDark ? 'bg-[#0B0F17]' : 'bg-[#F8FAFC]'}`}>
                {/* 全局顶部 Header */}
                <Header
                    className={`h-16 px-6 flex items-center justify-between border-b sticky top-0 z-20 transition-colors duration-300 ${isDark ? '!bg-[#0D121F] !border-slate-800 text-slate-100' : '!bg-white !border-slate-200/80 text-slate-800'}`}
                >
                    {/* 左侧：折叠按钮 + 快捷导航 (产品 / 帮助 / 支持) */}
                    <div className="flex items-center gap-6">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="!w-9 !h-9 !flex !items-center !justify-center text-slate-500 hover:!text-blue-600 hover:!bg-blue-50 dark:hover:!bg-slate-800 transition-all !rounded-lg"
                        />

                        <div className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span
                                className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1.5"
                                onClick={() => navigate('/products')}
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                产品
                            </span>
                            <span
                                className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1.5"
                                onClick={() => navigate('/help')}
                            >
                                <HelpCircle className="w-3.5 h-3.5" />
                                帮助
                            </span>
                            <span
                                className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1.5"
                                onClick={() => navigate('/help')}
                            >
                                <Headphones className="w-3.5 h-3.5" />
                                支持
                            </span>
                        </div>
                    </div>

                    {/* 右侧：AI 智能运营 / 工作台 / 通知 / 企业空间 / 主题切换 / 用户头像 */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/agents/marketing')}
                            className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-full border border-blue-200/60 dark:border-blue-800/80 transition-all shadow-xs"
                        >
                            <Bot className="w-3.5 h-3.5 text-blue-500" />
                            AI智能运营
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 transition-colors px-2 py-1"
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            工作台
                        </button>

                        <span className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:inline-block"></span>

                        {/* 消息通知 (Badge 12) */}
                        <div
                            onClick={() => navigate('/notifications')}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 cursor-pointer transition-all relative flex items-center justify-center"
                        >
                            <Badge count={12} size="small" offset={[2, -2]}>
                                <Bell className="w-4 h-4" />
                            </Badge>
                        </div>

                        {/* 企业空间切换下拉 */}
                        <Dropdown menu={enterpriseMenu} placement="bottomRight" trigger={['click']}>
                            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 cursor-pointer transition-all">
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>企业空间</span>
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                            </div>
                        </Dropdown>

                        {isSuperAdmin && <CompanySelector />}

                        {/* ☀️ / 🌙 深浅主题切换胶囊 */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-500 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-xs flex items-center justify-center"
                            title="切换深浅主题"
                        >
                            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                        </button>

                        {/* 用户头像与个人中心下拉 */}
                        <Dropdown menu={userDropdownMenu} placement="bottomRight" trigger={['click']}>
                            <Space className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/80 px-2.5 py-1 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                <Avatar
                                    style={{ backgroundColor: '#2563EB', verticalAlign: 'middle' }}
                                    icon={<UserOutlined />}
                                    size="small"
                                />
                                <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs hidden md:inline-block">
                                    {user?.realName || user?.username || '未登录用户'}
                                </span>
                            </Space>
                        </Dropdown>
                    </div>
                </Header>

                {/* 主页面路由渲染区 */}
                <Content className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default BasicLayout;
