import React, { useState } from 'react';
import { Button, Tag, Input, Select, Progress, message } from 'antd';
import { Share2, Plus, Users, Gift, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FissionPage: React.FC = () => {
    const navigate = useNavigate();

    const fissionList = [
        { id: 1, name: '2026 夏季数字化转型裂变拉新营', status: '进行中', participants: 4280, leadsGenerated: 856, convRate: '20.0%', reward: '免费赠送大模型私有化部署试用一个月', time: '2026-08-01 至 2026-08-31' },
        { id: 2, name: '老客转介绍赢 Apple 硬件大礼包', status: '进行中', participants: 1250, leadsGenerated: 420, convRate: '33.6%', reward: '转介绍成功签约返还 15% 佣金', time: '2026-07-15 至 2026-09-15' },
        { id: 3, name: '《企业 SCRM 实施指南》转发裂变', status: '已结束', participants: 8900, leadsGenerated: 1650, convRate: '18.5%', reward: '行业深度白皮书完整版 PDF', time: '2026-06-01 至 2026-06-30' },
    ];

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        裂变获客活动管理
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        基于企微裂变、任务宝与老客转介绍搭建自动化获客飞轮
                    </p>
                </div>

                <Button
                    type="primary"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => message.info('新建裂变活动')}
                    className="!rounded-xl !bg-blue-600 !font-bold !text-xs !h-9 !px-5"
                >
                    新建裂变活动
                </Button>
            </div>

            {/* 4 大核心指标 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">累计参与人次</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">14,430 人</div>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">带来新线索</div>
                    <div className="text-2xl font-black text-blue-600 font-mono mt-0.5">2,926 条</div>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">裂变系数 (K-Factor)</div>
                    <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">1.85</div>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">平均获客单价</div>
                    <div className="text-2xl font-black text-purple-600 font-mono mt-0.5">¥ 18.2</div>
                </div>
            </div>

            {/* 活动列表 */}
            <div className="space-y-4">
                {fissionList.map(item => (
                    <div key={item.id} className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                        <div className="space-y-2 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.name}</h3>
                                <Tag color={item.status === '进行中' ? 'processing' : 'default'} className="!rounded-md !m-0 !text-[10px]">{item.status}</Tag>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-slate-500">
                                <span>有效周期: <b className="text-slate-700 dark:text-slate-300 font-mono">{item.time}</b></span>
                                <span>激励规则: <span className="text-amber-600 dark:text-amber-400">{item.reward}</span></span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <div className="text-[11px] text-slate-400">新线索产生</div>
                                <div className="text-lg font-black font-mono text-blue-600">{item.leadsGenerated} 条</div>
                            </div>
                            <Button size="small" type="primary" onClick={() => message.info('查看活动裂变拓扑图')} className="!rounded-xl !bg-blue-600 !text-xs !font-bold !h-8 !px-4">
                                监控数据
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FissionPage;
