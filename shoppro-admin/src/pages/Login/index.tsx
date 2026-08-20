import React, { useState } from 'react';
import { Button, Input, Checkbox, message } from 'antd';
import { User, Lock, Phone, Bot, BarChart3, Users, UserCheck, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth';
import { setToken, setUser } from '@/utils/storage';
import logoImg from '@/assets/logo.png';
import { PLATFORM_ADMIN_SITE_URL } from '@/site';

export const LoginPage: React.FC = () => {
    const [loginType, setLoginType] = useState<'account' | 'phone'>('account');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e?: React.FormEvent, overrideUser?: string, overridePwd?: string) => {
        if (e) e.preventDefault();
        setLoading(true);

        const targetUser = overrideUser || (loginType === 'account' ? username : phone);
        const targetPwd = overridePwd || (loginType === 'account' ? password : code);

        try {
            const res = await authService.login({ username: targetUser, password: targetPwd, sysCode: 'PC' });
            if (!res?.accessToken) throw new Error('登录响应无效');
            const userInfo = {
                id: res.userId,
                username: res.username,
                realName: res.realName || res.username,
                avatarUrl: res.avatarUrl,
                role: res.role,
                phone: res.phone,
                email: res.email
            };
            setToken(res.accessToken);
            setUser(userInfo);

            message.success(`登录成功，欢迎 ${userInfo.realName} 进入 ShopPro PC 端销售业务主站！`);
            setTimeout(() => {
                navigate('/dashboard');
            }, 300);

        } catch (err: any) {
            message.error(err.message || '登录失败，请检查网络或账号');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] w-full flex flex-col justify-between bg-[#F8FAFC] text-slate-900 font-sans">
            {/* 顶栏品牌 LOGO */}
            <header className="px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-3xl font-bold tracking-tight text-blue-600 italic leading-none">Intelli</span>
                    <span className="text-3xl font-light tracking-tight text-[#1D1D1F] leading-none">Shop</span>
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded ml-1 self-start mt-1">PRO</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-200/60 ml-3">
                        PC 端销售业务主站
                    </span>
                </div>
                <a
                    href={`${PLATFORM_ADMIN_SITE_URL}/admin-login`}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                    本公司超管入口 →
                </a>
            </header>

            {/* 主内容双栏栅格 */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* 左侧品牌与特性展示区 (7列) */}
                <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-8">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs">
                            <Bot className="w-3.5 h-3.5" />
                            AI 驱动的全域销售自动化与智能决策中台
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
                            用 AI 连接客户，<br className="hidden sm:inline" />用数据驱动确定性增长
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                            ShopPro AI SCRM 帮助销售团队打通获客引流、智能 SDR、商机预测、话术大脑与销售教练全链路，让每一次沟通都极具转化力。
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
                            <Bot className="w-8 h-8 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">5 大 AI 销售智能体</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    内置 SDR、画像洞察、销售教练、营销自动化与营收预测智能体，全自动处理日常繁杂跟进。
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
                            <BarChart3 className="w-8 h-8 text-cyan-600 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">360° 客户深度画像与商机预测</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    毫秒级识别意向热度，自动评分与流失预警，提供量化驱动的成单归因分析。
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-start gap-4">
                            <Users className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
                            <div>
                                <h4 className="text-sm font-bold text-slate-900">全流程 SOP 自动化落地</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    团队高效协作，任务透明可追踪，经验沉淀复用，助力销售新人快速具备销冠能力。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右侧登录表单卡片 (5列) */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)]">
                        {/* 登录卡片 Header */}
                        <div className="text-center space-y-1.5 mb-6">
                            <div className="flex items-center justify-center gap-0.5 mb-2">
                                <span className="text-2xl font-bold tracking-tight text-blue-600 italic leading-none">Intelli</span>
                                <span className="text-2xl font-light tracking-tight text-[#1D1D1F] leading-none">Shop</span>
                                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 self-start mt-0.5">PRO</span>
                            </div>
                            <h2 className="text-lg font-black tracking-tight text-slate-900">
                                PC 端销售业务主站
                            </h2>
                            <p className="text-xs text-slate-500">
                                欢迎销售团队成员登录企业智能 SCRM 系统
                            </p>
                        </div>

                        {/* 登录方式 Tab 切换 */}
                        <div className="flex border-b border-slate-200/80 mb-6">
                            <button
                                type="button"
                                onClick={() => setLoginType('account')}
                                className={`flex-1 pb-3 text-xs font-bold transition-all relative ${loginType === 'account' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                账号密码登录
                                {loginType === 'account' && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginType('phone')}
                                className={`flex-1 pb-3 text-xs font-bold transition-all relative ${loginType === 'phone' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                手机验证码登录
                                {loginType === 'phone' && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                                )}
                            </button>
                        </div>

                        {/* 登录表单 */}
                        <form onSubmit={handleLogin} className="space-y-4">
                            {loginType === 'account' ? (
                                <>
                                    <div className="space-y-1">
                                        <Input
                                            size="large"
                                            placeholder="请输入用户名（如 sales001）"
                                            prefix={<User className="w-4 h-4 text-slate-400 mr-1.5" />}
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="!rounded-xl !bg-slate-50/50 !border-slate-200 text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Input.Password
                                            size="large"
                                            placeholder="请输入密码"
                                            prefix={<Lock className="w-4 h-4 text-slate-400 mr-1.5" />}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="!rounded-xl !bg-slate-50/50 !border-slate-200 text-xs"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <Input
                                            size="large"
                                            placeholder="请输入手机号"
                                            prefix={<Phone className="w-4 h-4 text-slate-400 mr-1.5" />}
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="!rounded-xl !bg-slate-50/50 !border-slate-200 text-xs"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            size="large"
                                            placeholder="验证码"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="!rounded-xl !bg-slate-50/50 !border-slate-200 text-xs flex-1"
                                        />
                                        <Button size="large" className="!rounded-xl !text-xs !font-semibold !border-slate-200 whitespace-nowrap px-4">
                                            获取验证码
                                        </Button>
                                    </div>
                                </>
                            )}

                            <div className="flex items-center justify-between">
                                <Checkbox
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="text-xs text-slate-500"
                                >
                                    记住登录状态
                                </Checkbox>
                                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs text-blue-600 hover:underline font-medium">
                                    忘记密码
                                </a>
                            </div>

                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={loading}
                                className="!rounded-xl !bg-blue-600 hover:!bg-blue-700 !border-none !font-bold !text-sm !mt-2"
                            >
                                登录销售工作台
                            </Button>
                        </form>

                        {/* 第三方登录 */}
                        <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-4">
                            <div className="text-xs text-slate-400">或使用以下方式登录</div>
                            <div className="text-xs text-slate-500 pt-2">
                                还没有账号？{' '}
                                <a
                                    href="#register"
                                    onClick={(e) => { e.preventDefault(); navigate('/register'); }}
                                    className="text-blue-600 font-bold hover:underline"
                                >
                                    立即注册
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 底部版权与条款 */}
            <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                <span>© 2026 ShopPro AI SCRM PC 端. 保留所有权利。</span>
                <span className="hidden sm:inline">|</span>
                <div className="flex gap-4">
                    <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">隐私政策</a>
                    <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-600">用户协议</a>
                </div>
            </footer>
        </div>
    );
};

export default LoginPage;
