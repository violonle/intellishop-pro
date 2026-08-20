import React, { useState } from 'react';
import { Button, Input, Collapse, Tag, message } from 'antd';
import {
    Search,
    Rocket,
    Users,
    Filter,
    Bot,
    Megaphone,
    BookOpen,
    Settings,
    Headphones,
    MessageSquare,
    FileText,
    PhoneCall,
    CheckCircle2
} from 'lucide-react';

export const HelpCenterPage: React.FC = () => {
    const [searchVal, setSearchVal] = useState('');

    const categories = [
        { title: '快速入门', count: 12, icon: <Rocket className="w-8 h-8 text-blue-600 flex-shrink-0" strokeWidth={2.2} /> },
        { title: '线索与客户', count: 28, icon: <Users className="w-8 h-8 text-cyan-600 flex-shrink-0" strokeWidth={2.2} /> },
        { title: '销售流程', count: 35, icon: <Filter className="w-8 h-8 text-emerald-600 flex-shrink-0" strokeWidth={2.2} /> },
        { title: 'AI智能体', count: 26, icon: <Bot className="w-8 h-8 text-purple-600 flex-shrink-0" strokeWidth={2.2} /> },
        { title: '营销获客', count: 24, icon: <Megaphone className="w-8 h-8 text-orange-600 flex-shrink-0" strokeWidth={2.2} /> },
        { title: '产品与知识库', count: 18, icon: <BookOpen className="w-8 h-8 text-indigo-600 flex-shrink-0" strokeWidth={2.2} /> },
        { title: '系统设置', count: 16, icon: <Settings className="w-8 h-8 text-slate-600 flex-shrink-0" strokeWidth={2.2} /> },
    ];

    const faqItems = [
        {
            key: '1',
            label: '线索如何分配给成员？',
            children: (
                <p className="text-xs text-slate-500 leading-relaxed">
                    在【线索管理】中可设置线索分配规则，支持按地区、行业、来源或自定义规则进行自动分配；也可手动将线索分配给指定成员或团队。
                </p>
            ),
        },
        {
            key: '2',
            label: '如何创建和管理 SOP 流程？',
            children: (
                <p className="text-xs text-slate-500 leading-relaxed">
                    进入【SOP运营】模块，点击右上角“新建 SOP 流程”，选择触发条件（如新线索进入、阶段停留超时等），并编排对应的触达动作与提醒规则。
                </p>
            ),
        },
        {
            key: '3',
            label: 'AI 智能体如何帮助提升销售效率？',
            children: (
                <p className="text-xs text-slate-500 leading-relaxed">
                    ShopPro 具备 5 大销售智能体：SDR 智能体自动在 15 分钟内完成新线索首触并撰写话术；成单教练智能体实时预警卡单并提供异议攻坚策略；收益分析智能体实时预测未来 90 天业绩。
                </p>
            ),
        },
        {
            key: '4',
            label: '如何查看销售数据分析报表？',
            children: (
                <p className="text-xs text-slate-500 leading-relaxed">
                    在左侧【工作台】下点击【数据分析】，可查看漏斗转化、管道流速、销售行为排行榜与高级多维交叉分析。
                </p>
            ),
        },
        {
            key: '5',
            label: '企业微信授权失败怎么办？',
            children: (
                <p className="text-xs text-slate-500 leading-relaxed">
                    请确保企业微信管理员具备“第三方应用管理”权限，并检查企业微信后台中的“可信任域名”与回调 URL 是否已正确配置 ShopPro 服务器地址。
                </p>
            ),
        },
    ];

    const announcements = [
        { title: 'ShopPro AI SCRM 2026.08 版本更新说明', desc: '新增 AI 跟进建议、智能标签升级等能力', date: '08-19' },
        { title: '关于企业微信接口升级的通知', desc: '为保障使用稳定性，请尽快完成更新', date: '08-19' },
        { title: '智能体能力上新：客户洞察智能体', desc: '自动识别客户需求，生成洞察报告', date: '08-19' },
        { title: '营销活动 ROI 分析模板上线', desc: '支持多维度归因分析，优化投放效果', date: '08-19' },
        { title: '系统维护通知 (8月22日 02:00-04:00)', desc: '维护期间部分功能将受影响', date: '08-19' },
    ];

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            {/* 顶栏与搜索区 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 sm:p-10 shadow-sm text-center max-w-4xl mx-auto space-y-4">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    帮助中心
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    快速找到使用答案，或联系 ShopPro 专属支持
                </p>

                <div className="flex gap-2 max-w-xl mx-auto pt-2">
                    <Input
                        size="large"
                        placeholder="搜索问题、功能或关键词..."
                        prefix={<Search className="w-4 h-4 text-slate-400 mr-1.5" />}
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        className="!rounded-2xl !bg-slate-50 dark:!bg-slate-900 !border-slate-200 dark:!border-slate-700 text-xs flex-1"
                    />
                    <Button
                        type="primary"
                        size="large"
                        className="!rounded-2xl !bg-blue-600 !font-bold !px-6 !text-xs"
                    >
                        搜 索
                    </Button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                    <span>常见搜索:</span>
                    {['线索如何分配', '如何创建SOP', 'AI智能体怎么用', '企业微信授权'].map((k) => (
                        <span
                            key={k}
                            onClick={() => setSearchVal(k)}
                            className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer transition-all text-[11px]"
                        >
                            {k}
                        </span>
                    ))}
                </div>
            </div>

            {/* 知识分类网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((cat) => (
                    <div
                        key={cat.title}
                        className="p-5 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-blue-500/50 transition-all cursor-pointer flex items-center gap-4"
                    >
                        {cat.icon}
                        <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">{cat.title}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{cat.count} 篇文章</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 常见问题与公告客服双栏 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 常见问题 (7列) */}
                <div className="lg:col-span-7 bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        常见问题
                    </h3>
                    <Collapse
                        ghost
                        defaultActiveKey={['1']}
                        items={faqItems}
                        className="font-medium text-xs text-slate-800 dark:text-slate-200"
                    />
                </div>

                {/* 右侧公告与联系客服 (5列) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* 最新公告 */}
                    <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-900 dark:text-white">最新公告</span>
                            <span className="text-blue-600 font-semibold cursor-pointer hover:underline text-[11px]">查看全部 &gt;</span>
                        </div>
                        <div className="space-y-3">
                            {announcements.map((item, i) => (
                                <div key={i} className="pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                                            • {item.title}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 ml-2">{item.date}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-2 mt-0.5">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 联系客服卡片 */}
                    <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <Headphones className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white">联系客服</div>
                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    服务渠道未配置
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-slate-500">
                            服务时间：未配置
                        </div>

                        <Button
                            type="primary"
                            block
                            icon={<MessageSquare className="w-4 h-4" />}
                            onClick={() => message.info('当前环境尚未配置在线客服渠道')}
                            className="!rounded-xl !bg-blue-600 !h-10 !text-xs !font-bold"
                        >
                            在线咨询
                        </Button>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <Button
                                icon={<FileText className="w-3.5 h-3.5" />}
                                onClick={() => message.info('当前环境尚未配置工单渠道')}
                                className="!rounded-xl !text-xs"
                            >
                                提交工单
                            </Button>
                            <Button
                                icon={<PhoneCall className="w-3.5 h-3.5" />}
                                onClick={() => message.info('当前环境尚未配置电话支持渠道')}
                                className="!rounded-xl !text-xs"
                            >
                                电话支持
                            </Button>
                        </div>
                        <div className="text-center text-[11px] text-slate-400 font-mono">
                            客服联系方式：未配置
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;
