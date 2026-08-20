import React, { useState } from 'react';
import { Button, Input, Checkbox, message, Steps } from 'antd';
import { Phone, ShieldCheck, Lock, Bot, BarChart2, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RegisterPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agree, setAgree] = useState(true);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!agree) {
            message.warning('请阅读并同意用户协议与隐私政策');
            return;
        }
        if (!phone) {
            message.warning('请输入手机号码');
            return;
        }
        if (password !== confirmPassword) {
            message.error('两次输入的密码不一致');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            message.success('账号创建成功，正在进入企业信息配置...');
            navigate('/onboarding');
        }, 800);
    };

    return (
        <div className="min-h-[100dvh] w-full flex flex-col justify-between bg-[#080E1E] text-white font-sans">
            {/* 顶栏品牌 LOGO */}
            <header className="px-8 py-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                        <span className="tracking-tighter">S</span>
                    </div>
                    <span className="text-xl font-black tracking-tight text-white">
                        ShopPro
                    </span>
                </div>
            </header>

            {/* 主内容双栏栅格 */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* 左侧品牌展示区 (7列) */}
                <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-8">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/80 shadow-xs">
                            <Bot className="w-3.5 h-3.5" />
                            AI 驱动的 SCRM 解决方案
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
                            用 AI 连接客户，<br className="hidden sm:inline" />用数据驱动增长
                        </h1>
                        <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                            ShopPro AI SCRM 帮助企业构建以客户为中心的增长体系，提升销售效率，驱动业绩持续增长。
                        </p>
                    </div>

                    {/* 三大特性卡片 */}
                    <div className="space-y-3.5">
                        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xs flex items-start gap-4">
                            <Bot className="w-8 h-8 text-blue-400 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                            <div>
                                <h4 className="text-sm font-bold text-white">AI智能跟进</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    智能识别客户意图，自动推荐最佳跟进策略，不错过每一次成交机会。
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xs flex items-start gap-4">
                            <BarChart2 className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
                            <div>
                                <h4 className="text-sm font-bold text-white">客户洞察</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    360°客户画像与行为分析，洞察需求，精准触达，提升转化率。
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xs flex items-start gap-4">
                            <Users2 className="w-8 h-8 text-indigo-400 flex-shrink-0 mt-0.5" strokeWidth={2.2} />
                            <div>
                                <h4 className="text-sm font-bold text-white">销售协同</h4>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                    团队高效协作，任务透明可追踪，经验沉淀复用，整体战斗力持续提升。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右侧注册卡片 (5列) */}
                <div className="lg:col-span-5">
                    <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-2xl">
                        {/* 头部信息 */}
                        <div className="text-center space-y-1.5 mb-6">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-600 text-white font-black text-xl shadow-sm mb-1">
                                S
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900">
                                ShopPro AI SCRM
                            </h2>
                            <p className="text-xs text-slate-500">
                                开启智能客户增长
                            </p>
                        </div>

                        {/* 步骤条 */}
                        <div className="mb-6">
                            <Steps
                                current={currentStep}
                                size="small"
                                items={[
                                    { title: '创建账号' },
                                    { title: '完善企业信息' },
                                    { title: '完成' },
                                ]}
                            />
                        </div>

                        {/* 表单 */}
                        <form onSubmit={handleRegister} className="space-y-3.5">
                            <div className="space-y-1">
                                <Input
                                    size="large"
                                    placeholder="手机号"
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
                                    prefix={<ShieldCheck className="w-4 h-4 text-slate-400 mr-1.5" />}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="!rounded-xl !bg-slate-50/50 !border-slate-200 text-xs flex-1"
                                />
                                <Button size="large" className="!rounded-xl !text-xs !font-semibold">
                                    获取验证码
                                </Button>
                            </div>

                            <div className="space-y-1">
                                <Input.Password
                                    size="large"
                                    placeholder="设置密码 (不少于8位字符)"
                                    prefix={<Lock className="w-4 h-4 text-slate-400 mr-1.5" />}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="!rounded-xl !bg-slate-50/50 !border-slate-200 text-xs"
                                />
                            </div>

                            <div className="space-y-1">
                                <Input.Password
                                    size="large"
                                    placeholder="确认密码"
                                    prefix={<Lock className="w-4 h-4 text-slate-400 mr-1.5" />}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="!rounded-xl !bg-slate-50/50 !border-slate-200 text-xs"
                                />
                            </div>

                            <div className="pt-1">
                                <Checkbox
                                    checked={agree}
                                    onChange={(e) => setAgree(e.target.checked)}
                                    className="text-xs text-slate-600"
                                >
                                    我已阅读并同意 <a href="#terms" onClick={(e) => e.preventDefault()} className="text-blue-600 font-medium hover:underline">用户协议</a> 与 <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-blue-600 font-medium hover:underline">隐私政策</a>
                                </Checkbox>
                            </div>

                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                                className="!h-11 !rounded-xl !bg-blue-600 !font-bold !text-sm !shadow-md !shadow-blue-500/20 hover:!bg-blue-700 mt-2"
                            >
                                注册并继续
                            </Button>
                        </form>

                        <div className="mt-5 text-center space-y-3 pt-3 border-t border-slate-100">
                            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                数据加密存储，保障信息安全
                            </div>
                            <div className="text-xs text-slate-500">
                                已有账号？{' '}
                                <a
                                    href="#login"
                                    onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                                    className="text-blue-600 font-bold hover:underline"
                                >
                                    立即登录
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* 底部版权 */}
            <footer className="py-6 text-center text-xs text-slate-500 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                <span>© 2026 ShopPro AI SCRM. 保留所有权利。</span>
                <span className="hidden sm:inline">|</span>
                <div className="flex gap-4">
                    <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-400">隐私政策</a>
                    <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-400">用户协议</a>
                </div>
            </footer>
        </div>
    );
};

export default RegisterPage;
