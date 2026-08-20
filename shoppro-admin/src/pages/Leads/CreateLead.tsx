import React, { useState } from 'react';
import { Button, Input, Select, DatePicker, Radio, message, Progress } from 'antd';
import {
    ArrowLeft,
    Bot,
    CheckCircle2,
    Save,
    Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import leadService from '../../services/lead';

export const CreateLeadPage: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [source, setSource] = useState('');
    const [region, setRegion] = useState('');
    const [product, setProduct] = useState('');
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [priority, setPriority] = useState('high');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const completedFields = [name, contact, phone, company, source, product, notes].filter(Boolean).length;
    const completion = Math.round((completedFields / 7) * 100);

    const handleAiAutoFill = () => {
        message.info('AI 自动补全需要先配置可用的模型服务，当前不会填充演示数据。');
    };

    const handleCreate = async () => {
        if (!name || !phone) {
            message.warning('请填写线索名称和手机号码');
            return;
        }
        setLoading(true);
        try {
            const budget = Number(maxBudget || minBudget || 0);
            await leadService.createLead({
                title: name,
                description: [
                    contact && `联系人：${contact}`,
                    phone && `电话：${phone}`,
                    company && `公司：${company}`,
                    region && `地区：${region}`,
                    notes
                ].filter(Boolean).join('；'),
                source: source || undefined,
                priority,
                estimatedValue: budget > 0 ? budget : undefined,
                budgetRange: minBudget || maxBudget ? `${minBudget || 0}-${maxBudget || 0}` : undefined,
                interestedProducts: product ? [product] : undefined
            });
            message.success('线索创建成功');
            navigate('/leads');
        } catch (error) {
            message.error(error instanceof Error ? error.message : '线索创建失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans max-w-7xl mx-auto">
            {/* 顶栏 */}
            <div className="flex items-center justify-between pb-2">
                <button
                    type="button"
                    onClick={() => navigate('/leads')}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    返回线索列表
                </button>
                <div className="flex gap-2.5">
                    <Button disabled className="!rounded-xl !text-xs !h-9">
                        草稿功能未接入
                    </Button>
                    <Button
                        type="primary"
                        loading={loading}
                        onClick={handleCreate}
                        className="!rounded-xl !bg-blue-600 !font-bold !text-xs !h-9 !px-6"
                    >
                        创建线索
                    </Button>
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    新建线索
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    录入潜在客户信息并创建跟进机会
                </p>
            </div>

            {/* 双栏表单布局 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 左侧表单主体 (8列) */}
                <div className="lg:col-span-8 bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
                    {/* 基本信息 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                            基本信息
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    线索名称 <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    placeholder="请输入线索名称"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="!rounded-xl !bg-slate-50 dark:!bg-slate-900 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    联系人姓名
                                </label>
                                <Input
                                    placeholder="请输入联系人姓名"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    className="!rounded-xl !bg-slate-50 dark:!bg-slate-900 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    手机号码 <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    placeholder="请输入手机号码"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="!rounded-xl !bg-slate-50 dark:!bg-slate-900 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    公司名称
                                </label>
                                <Input
                                    placeholder="请输入公司名称"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="!rounded-xl !bg-slate-50 dark:!bg-slate-900 text-xs"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    线索来源 <span className="text-rose-500">*</span>
                                </label>
                                <Select
                                    value={source}
                                    onChange={setSource}
                                    className="w-full !rounded-xl"
                                    options={[
                                        { value: 'official', label: '官网注册与留资' },
                                        { value: 'event', label: '市场营销活动' },
                                        { value: 'referral', label: '老客户转介绍' },
                                    ]}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    所在地区 <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    placeholder="请输入所在地区"
                                    className="!rounded-xl !bg-slate-50 dark:!bg-slate-900 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    负责人 <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    value="自动分配给当前用户"
                                    disabled
                                    className="!rounded-xl !bg-slate-50 dark:!bg-slate-900 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 商机信息 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
                            商机信息
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    意向产品 <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    value={product}
                                    onChange={(e) => setProduct(e.target.value)}
                                    placeholder="请输入意向产品"
                                    className="!rounded-xl !bg-slate-50 dark:!bg-slate-900 text-xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    预算范围 (元)
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="最低金额"
                                        value={minBudget}
                                        onChange={(e) => setMinBudget(e.target.value)}
                                        className="!rounded-xl text-xs font-mono"
                                    />
                                    <span className="text-slate-400">-</span>
                                    <Input
                                        placeholder="最高金额"
                                        value={maxBudget}
                                        onChange={(e) => setMaxBudget(e.target.value)}
                                        className="!rounded-xl text-xs font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                优先级 <span className="text-rose-500">*</span>
                            </label>
                            <Radio.Group
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                buttonStyle="solid"
                            >
                                <Radio.Button value="high" className="!rounded-l-xl text-xs">高 (优先响应)</Radio.Button>
                                <Radio.Button value="medium" className="text-xs">中</Radio.Button>
                                <Radio.Button value="low" className="!rounded-r-xl text-xs">低</Radio.Button>
                            </Radio.Group>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                备注与客户诉求
                            </label>
                            <Input.TextArea
                                rows={4}
                                placeholder="请输入客户核心诉求、决策链背景或技术对接细节..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="!rounded-xl text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* 右侧 AI 辅助录入与完善度 (4列) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* AI 辅助录入卡片 */}
                    <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <Bot className="w-4 h-4" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white">AI 辅助录入</h3>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            根据输入文本自动识别客户意向、推荐优先级和跟进策略。
                        </p>

                        <Button
                            type="primary"
                            block
                            icon={<Bot className="w-4 h-4" />}
                            onClick={handleAiAutoFill}
                            className="!rounded-xl !bg-blue-600 !h-10 !text-xs !font-bold"
                        >
                            智能补全
                        </Button>
                    </div>

                    {/* 信息完善度 */}
                    <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">信息完善度</span>
                            <span className="text-blue-600 font-mono font-bold">
                                {completedFields} / 7 ({completion}%)
                            </span>
                        </div>

                        <Progress percent={completion} strokeColor="#2563EB" showInfo={false} />

                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-3.5 h-3.5 ${name ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <span>线索名称</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-3.5 h-3.5 ${contact ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <span>联系人</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-3.5 h-3.5 ${phone ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <span>手机号码</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className={`w-3.5 h-3.5 ${company ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <span>公司名称</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span>意向产品与预算</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateLeadPage;
