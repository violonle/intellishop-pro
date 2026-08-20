import React, { useState } from 'react';
import { Button, Tag, Input, Table, message } from 'antd';
import { Package, Plus, CheckCircle2, ShieldCheck, ArrowLeft, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProductDetailPage: React.FC = () => {
    const navigate = useNavigate();

    const tiers = [
        { name: '标准版 (Standard)', seats: '5 销售坐席', price: '¥ 29,800 / 年', features: '基础 CRM + SDR 线索预测智能体 + 企微欢迎语' },
        { name: '专业版 (Professional)', seats: '20 销售坐席', price: '¥ 68,000 / 年', features: '全套 5 大智能体 + 团队行为报表 + 漏斗健康预警' },
        { name: '旗舰版 (Enterprise)', seats: '50 销售坐席', price: '¥ 128,000 / 年', features: '高级自定义 BI + 收益预测 + 专属客户成功专家 + SLA 保障' },
        { name: '私有化部署定制版', seats: '无限坐席', price: '¥ 380,000 起', features: '独立私有化服务器集群部署 + 源码级定制 + 局域网离线运行' },
    ];

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            产品详情与阶梯定价配置
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            配置产品售卖规格、坐席阶梯计费与增购服务包
                        </p>
                    </div>
                </div>

                <div className="flex gap-2.5">
                    <Button icon={<Edit2 className="w-3.5 h-3.5" />} className="!rounded-xl !text-xs !h-9">
                        编辑产品基础信息
                    </Button>
                    <Button type="primary" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => message.info('添加定价档位')} className="!rounded-xl !bg-blue-600 !font-bold !text-xs !h-9">
                        新增阶梯规格
                    </Button>
                </div>
            </div>

            {/* 产品总览卡片 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <Package className="w-12 h-12 text-blue-600 dark:text-blue-400 flex-shrink-0" strokeWidth={2.2} />
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                ShopPro AI 智销中枢平台
                            </h2>
                            <Tag color="success" className="!rounded-md !m-0 !text-[10px] !font-bold">在售中</Tag>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            以 5 大原生智能体为核心，深度集成企微的下一代 B2B 智能销售与客户增长平台。
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-right">
                    <div className="text-[11px] text-slate-400">标准年费起价</div>
                    <div className="text-xl font-black font-mono text-blue-600 mt-0.5">¥ 29,800 <span className="text-xs font-normal text-slate-400">/ 年起</span></div>
                </div>
            </div>

            {/* 阶梯定价配置矩阵 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="font-bold text-xs text-slate-900 dark:text-white">版本规格与阶梯报价矩阵</div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tiers.map((t, idx) => (
                        <div key={idx} className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-4 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</div>
                                <div className="text-lg font-black font-mono text-blue-600">{t.price}</div>
                                <Tag color="blue" className="!rounded-md !m-0 !text-[10px]">{t.seats}</Tag>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-2">
                                    {t.features}
                                </p>
                            </div>

                            <Button size="small" block className="!rounded-xl !text-xs !font-bold">
                                配置增购项
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
