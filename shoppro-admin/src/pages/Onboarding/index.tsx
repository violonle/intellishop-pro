import React, { useState } from 'react';
import { Button, Input, Select, Steps, message } from 'antd';
import { Building2, Layers, Users, TrendingUp, Bot, Eye, GraduationCap, Send, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateCurrentEnterprise } from '@/services/enterprise';

export const OnboardingPage: React.FC = () => {
    const [step, setStep] = useState(0);
    const [companyName, setCompanyName] = useState('');
    const [industry, setIndustry] = useState('it');
    const [scale, setScale] = useState('50-200');
    const [salesModel, setSalesModel] = useState('b2b');
    const [contactName, setContactName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleNext = async () => {
        if (step === 0) {
            if (!companyName) {
                message.warning('请输入企业名称');
                return;
            }
            setStep(1);
        } else if (step === 1) {
            setStep(2);
        } else {
            setLoading(true);
            try {
                await updateCurrentEnterprise({
                    name: companyName,
                    contact: contactName,
                    phone
                });
                message.success('企业信息已保存，欢迎进入系统。');
                navigate('/dashboard');
            } catch (error) {
                message.error(error instanceof Error ? error.message : '企业信息保存失败');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-[100dvh] w-full flex flex-col justify-between bg-[#080E1E] text-white font-sans">
            {/* 顶栏 */}
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

            {/* 主内容 */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex items-center justify-center">
                <div className="w-full bg-white text-slate-900 rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-2xl">
                    <div className="text-center space-y-2 mb-8">
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                            欢迎使用 ShopPro AI SCRM
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                            先完成工作空间设置，马上开始智能销售
                        </p>
                    </div>

                    {/* 步骤条 */}
                    <div className="mb-10 max-w-xl mx-auto">
                        <Steps
                            current={step}
                            items={[
                                { title: '企业信息' },
                                { title: '业务偏好' },
                                { title: '邀请团队' },
                            ]}
                        />
                    </div>

                    {/* 步骤 1：企业信息 */}
                    {step === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                            {/* 左侧表单 */}
                            <div className="md:col-span-7 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        企业名称 <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        size="large"
                                        placeholder="请输入企业名称"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="!rounded-xl !bg-slate-50/50 !border-slate-200 text-xs"
                                        prefix={<Building2 className="w-4 h-4 text-slate-400 mr-1" />}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            所属行业 <span className="text-rose-500">*</span>
                                        </label>
                                        <Select
                                            size="large"
                                            value={industry}
                                            onChange={setIndustry}
                                            className="w-full !rounded-xl"
                                            options={[
                                                { value: 'it', label: '软件与信息技术' },
                                                { value: 'manufacturing', label: '精密制造' },
                                                { value: 'finance', label: '金融/企业服务' },
                                                { value: 'retail', label: '品牌零售与电商' },
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            企业规模 <span className="text-rose-500">*</span>
                                        </label>
                                        <Select
                                            size="large"
                                            value={scale}
                                            onChange={setScale}
                                            className="w-full !rounded-xl"
                                            options={[
                                                { value: '1-50', label: '1 - 50 人' },
                                                { value: '50-200', label: '50 - 200 人' },
                                                { value: '200-500', label: '200 - 500 人' },
                                                { value: '500+', label: '500 人以上' },
                                            ]}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        主要销售模式 <span className="text-rose-500">*</span>
                                    </label>
                                    <Select
                                        size="large"
                                        value={salesModel}
                                        onChange={setSalesModel}
                                        className="w-full !rounded-xl"
                                        options={[
                                            { value: 'b2b', label: 'B2B 大客户直销与项目型销售' },
                                            { value: 'channel', label: '渠道分销与代理网络' },
                                            { value: 'inside', label: 'Inside Sales 电话网络直销' },
                                        ]}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            联系人姓名 <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            size="large"
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            className="!rounded-xl !bg-slate-50/50 !border-slate-200 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            手机号 <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            size="large"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="!rounded-xl !bg-slate-50/50 !border-slate-200 text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 右侧工作空间预览 */}
                            <div className="md:col-span-5 p-5 rounded-2xl bg-blue-50/50 border border-blue-100/80 space-y-4">
                                <div className="flex items-center gap-3 pb-3 border-b border-blue-200/40">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400">您的工作空间预览</div>
                                        <div className="text-sm font-black text-slate-900 truncate">
                                            {companyName || '待填写企业名称'}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs font-bold text-slate-600">为您推荐的 AI 能力</div>

                                <div className="space-y-2 text-xs">
                                    <div className="p-2.5 rounded-xl bg-white border border-blue-100 flex items-center gap-2.5">
                                        <Bot className="w-4 h-4 text-blue-600" />
                                        <div>
                                            <div className="font-bold text-slate-800">线索预测</div>
                                            <div className="text-[11px] text-slate-400">AI 识别高价值线索，提升转化率</div>
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-white border border-blue-100 flex items-center gap-2.5">
                                        <Eye className="w-4 h-4 text-cyan-600" />
                                        <div>
                                            <div className="font-bold text-slate-800">客户洞察</div>
                                            <div className="text-[11px] text-slate-400">多维客户画像，洞察需求与行为</div>
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-white border border-blue-100 flex items-center gap-2.5">
                                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                                        <div>
                                            <div className="font-bold text-slate-800">销售辅导</div>
                                            <div className="text-[11px] text-slate-400">AI 陪练与话术建议，提升销售能力</div>
                                        </div>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-white border border-blue-100 flex items-center gap-2.5">
                                        <Send className="w-4 h-4 text-amber-600" />
                                        <div>
                                            <div className="font-bold text-slate-800">营销自动化</div>
                                            <div className="text-[11px] text-slate-400">自动化营销触达，提高营销效率</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="max-w-xl mx-auto space-y-4 py-4">
                            <h3 className="text-sm font-bold text-slate-800">配置业务流程偏好</h3>
                            <p className="text-xs text-slate-500">选择您企业日常业务重点推进节奏与智能体协同模式：</p>
                            <div className="space-y-3 pt-2">
                                <div className="p-4 rounded-2xl border border-blue-600 bg-blue-50/40 cursor-pointer">
                                    <div className="font-bold text-xs text-blue-600">标准化 B2B 漏斗流程 (推荐)</div>
                                    <div className="text-[11px] text-slate-500 mt-1">包含线索初触、方案建立、商务谈判到回款闭环。</div>
                                </div>
                                <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-400 cursor-pointer">
                                    <div className="font-bold text-xs text-slate-800">高频电销与极速转化流</div>
                                    <div className="text-[11px] text-slate-500 mt-1">专为短周期、高频次线索跟进设计，智能体快速生成首触话术。</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-xl mx-auto space-y-4 py-4 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">邀请团队成员协作</h3>
                            <p className="text-xs text-slate-500">输入销售顾问手机号或邮箱，批量发送加入邀请：</p>
                            <Input.TextArea
                                rows={3}
                                placeholder="输入手机号或邮箱，用换行或逗号分隔..."
                                className="!rounded-xl text-xs"
                            />
                        </div>
                    )}

                    {/* 底部按钮栏 */}
                    <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <Button
                            size="large"
                            onClick={() => navigate('/dashboard')}
                            className="!rounded-xl !text-xs"
                        >
                            稍后设置
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            loading={loading}
                            onClick={handleNext}
                            className="!rounded-xl !bg-blue-600 !font-bold !text-xs !px-8 !h-10"
                        >
                            {step === 2 ? '完成并进入系统' : '下一步'}
                        </Button>
                    </div>

                    <div className="text-center text-[11px] text-slate-400 mt-4">
                        ℹ️ 可在系统设置中随时修改
                    </div>
                </div>
            </main>

            {/* 底部 */}
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

export default OnboardingPage;
