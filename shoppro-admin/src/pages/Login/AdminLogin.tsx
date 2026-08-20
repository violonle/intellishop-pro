import React, { useState } from 'react';
import { Button, Input, message } from 'antd';
import { User, Lock, Shield, ShieldCheck, Layers, Cpu, CreditCard, ScrollText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import { setToken, setUser } from '@/utils/storage';
import logoImg from '@/assets/logo.png';
import { BUSINESS_SITE_URL } from '@/site';

export const AdminLoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e?: React.FormEvent, overrideUser?: string, overridePwd?: string) => {
        if (e) e.preventDefault();
        setLoading(true);

        const targetUser = overrideUser || username;
        const targetPwd = overridePwd || password;

        try {
            const res = await authService.login({ username: targetUser, password: targetPwd, sysCode: 'PC' });
            if (!res?.accessToken) throw new Error('登录响应无效');
            const userInfo = {
                id: res.userId,
                username: res.username,
                realName: res.realName || res.username,
                avatarUrl: res.avatarUrl || '',
                role: res.role,
                phone: res.phone,
                email: res.email
            };
            setToken(res.accessToken);
            setUser(userInfo);

            message.success(`登录成功，欢迎 ${userInfo.realName} 进入平台超级管理后台！`);
            setTimeout(() => {
                navigate('/tenancy/tenants');
            }, 300);

        } catch (err: any) {
            message.error(err.message || '登录失败，请检查网络或账号');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full flex flex-col bg-slate-900 text-white font-sans">
            {/* 顶栏 */}
            <header className="px-8 py-5 flex items-center gap-3 border-b border-white/10">
                <div className="flex items-center gap-1">
                    <span className="text-xl font-bold tracking-tight text-blue-400 italic leading-none">Intelli</span>
                    <span className="text-xl font-light tracking-tight text-white leading-none">Shop</span>
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 self-start mt-0.5">ADMIN</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 ml-1">
                    超级管理员后台
                </span>
                <div className="ml-auto text-xs text-slate-400">
                    <a href={`${BUSINESS_SITE_URL}/login`} className="hover:text-white transition-colors">← 返回 PC 业务主站</a>
                </div>
            </header>

            {/* 主体 */}
            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* 左侧说明 */}
                    <div className="space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 mb-4">
                                <Shield className="w-3.5 h-3.5" />
                                仅限本公司超级管理员
                            </div>
                            <h1 className="text-3xl font-black text-white leading-tight">
                                ShopPro 平台<br />
                                <span className="text-slate-400">超级管理控制台</span>
                            </h1>
                            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                                本系统专供运营团队超管人员使用，提供全平台企业租户管控、AI 大模型网关、SaaS 订阅计费与全系统安全审计能力。
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: <Layers className="w-4 h-4" />, label: '多租户管理', desc: '企业租户开通与运营' },
                                { icon: <Cpu className="w-4 h-4" />, label: 'AI 模型网关', desc: '大模型与 Agent 编排' },
                                { icon: <CreditCard className="w-4 h-4" />, label: 'SaaS 订阅计费', desc: '套餐与订单管理' },
                                { icon: <ScrollText className="w-4 h-4" />, label: '系统安全审计', desc: '全系统操作日志' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <span className="text-slate-400 mt-0.5">{item.icon}</span>
                                    <div>
                                        <div className="text-xs font-bold text-white">{item.label}</div>
                                        <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 右侧登录表单 */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <div className="text-base font-black text-white">超管身份验证</div>
                                <div className="text-[11px] text-slate-400">Admin Console Authentication</div>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">管理员账号</label>
                                <Input
                                    size="large"
                                    placeholder="请输入超管账号"
                                    prefix={<User className="w-4 h-4 text-slate-500 mr-1" />}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="!rounded-xl !bg-white/10 !border-white/20 !text-white placeholder:!text-slate-500 !text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">登录密码</label>
                                <Input.Password
                                    size="large"
                                    placeholder="请输入密码"
                                    prefix={<Lock className="w-4 h-4 text-slate-500 mr-1" />}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="!rounded-xl !bg-white/10 !border-white/20 !text-white placeholder:!text-slate-500 !text-sm"
                                />
                            </div>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={loading}
                                className="!rounded-xl !bg-red-600 hover:!bg-red-500 !border-none !font-bold !text-sm !mt-2"
                            >
                                登录超级管理后台
                            </Button>
                        </form>

                        <div className="mt-6 pt-4 border-t border-white/10 text-center">
                            <div className="text-xs text-slate-500">
                                这是本公司内部系统，未授权人员严禁访问
                            </div>
                            <a href={`${BUSINESS_SITE_URL}/login`} className="mt-2 inline-block text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                进入 PC 端销售业务主站 →
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-4 text-center text-xs text-slate-600 border-t border-white/5">
                © 2026 ShopPro 平台超级管理控制台 · 本公司内部专用
            </footer>
        </div>
    );
};

export default AdminLoginPage;
