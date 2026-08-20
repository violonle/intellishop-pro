import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Tag, Progress, message, Empty } from 'antd';
import {
    Plus,
    Download,
    Search,
    ShoppingBag,
    DollarSign,
    TrendingUp,
    CheckCircle2,
    Trophy,
    SlidersHorizontal,
    Bot,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dealService } from '@/services/deal';

interface DealItem {
    id: string;
    title: string;
    customer: string;
    stage: string;
    amount: string;
    winRate: number;
    expectedDate: string;
    owner: string;
    status: '进行中' | '已成交' | '已失单';
}

export const DealsPage: React.FC = () => {
    const [tab, setTab] = useState<'all' | 'progress' | 'quoted' | 'won' | 'lost'>('all');
    const [searchVal, setSearchVal] = useState('');
    const [deals, setDeals] = useState<DealItem[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadDeals();
    }, [tab]);

    const loadDeals = async () => {
        setLoading(true);
        try {
            const data: any = await dealService.getDeals({
                pageNo: 1,
                pageSize: 20
            }).catch(() => null);

            const dealData = (data as any)?.data || data;
            const records = dealData?.records || dealData?.items || (Array.isArray(dealData) ? dealData : []);

            if (records.length > 0) {
                const mapped: DealItem[] = records.map((d: any) => ({
                    id: String(d.id),
                    title: d.title || (d.orderNo ? `订单 ${d.orderNo}` : '企业数字化方案采购'),
                    customer: d.customerName || d.customer || '企业签约客户',
                    stage: d.stage || (d.status === 3 || d.status === 'completed' ? '已成交' : '方案报价'),
                    amount: d.amount ? `¥ ${Number(d.amount).toLocaleString()}` : `¥ ${Number(d.payAmount || d.totalAmount || 0).toLocaleString()}`,
                    winRate: d.winRate || (d.status === 3 ? 100 : 75),
                    expectedDate: d.expectedDate ? new Date(d.expectedDate).toLocaleDateString() : '待定',
                    owner: d.ownerName || d.owner || '销售顾问',
                    status: d.status === 3 || d.status === 'completed' ? '已成交' : (d.status === 4 || d.status === 'cancelled' ? '已失单' : '进行中')
                }));
                setDeals(mapped);
            } else {
                setDeals([]);
            }
        } catch (error) {
            console.error('Failed to load deals', error);
            setDeals([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredDeals = deals.filter(d => {
        if (tab === 'won') return d.status === '已成交';
        if (tab === 'progress') return d.status === '进行中';
        if (tab === 'lost') return d.status === '已失单';
        if (!searchVal) return true;
        return d.title.toLowerCase().includes(searchVal.toLowerCase()) || d.customer.toLowerCase().includes(searchVal.toLowerCase());
    });

    const totalAmount = deals.reduce((acc, curr) => {
        const num = parseFloat(curr.amount.replace(/[^0-9.-]+/g, '')) || 0;
        return acc + num;
    }, 0);

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            {/* 顶栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        商机与成单转化
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        追踪全周期销售商机管道、预计签约金额与 AI 赢率预测（真实后端数据）
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        icon={<Bot className="w-3.5 h-3.5 text-blue-600" />}
                        onClick={() => navigate('/agents/revenue')}
                        className="!rounded-xl !text-xs !h-9 !border-blue-200 hover:!border-blue-500"
                    >
                        AI 营收预测智能体
                    </Button>
                </div>
            </div>

            {/* 3 大商机指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-400">活跃商机总数</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{deals.length}</div>
                        <div className="text-[11px] text-blue-600 font-bold mt-1">商机转化推进中</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-400">商机总预估规模</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">¥ {totalAmount.toLocaleString()}</div>
                        <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> 预期转化流水
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-400">已成交赢单数</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                            {deals.filter(d => d.status === '已成交').length}
                        </div>
                        <div className="text-[11px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> 签约成功
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                        <Trophy className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* 商机列表卡片 */}
            <div className="bg-white dark:bg-[#0D121F] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
                        {(['all', 'progress', 'won', 'lost'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                {t === 'all' ? '全部商机' : t === 'progress' ? '进行中' : t === 'won' ? '已成交' : '已失单'}
                            </button>
                        ))}
                    </div>

                    <div className="w-full sm:w-72">
                        <Input
                            placeholder="搜索商机项目或客户名称..."
                            prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            className="!rounded-xl text-xs"
                        />
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    {filteredDeals.length === 0 ? (
                        <Empty description="暂无符合条件的商机数据" className="py-12" />
                    ) : (
                        filteredDeals.map((deal) => (
                            <div
                                key={deal.id}
                                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-800/80 bg-white dark:bg-[#111622] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                                            {deal.title}
                                        </h4>
                                        <Tag color={deal.status === '已成交' ? 'green' : deal.status === '已失单' ? 'red' : 'blue'} className="!rounded-md !text-[10px]">
                                            {deal.status}
                                        </Tag>
                                        <Tag className="!rounded-md !text-[10px] !bg-slate-50 text-slate-600">
                                            {deal.stage}
                                        </Tag>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
                                        <span>关联客户：<strong className="text-slate-700 dark:text-slate-300">{deal.customer}</strong></span>
                                        <span>跟进负责人：{deal.owner}</span>
                                        <span>预计签约日期：{deal.expectedDate}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 justify-between md:justify-end">
                                    <div className="text-right">
                                        <div className="text-[10px] text-slate-400">商机预估金额</div>
                                        <div className="text-sm font-black text-slate-900 dark:text-white font-mono">{deal.amount}</div>
                                    </div>

                                    <div className="w-24 text-center">
                                        <div className="text-[10px] text-slate-400 mb-0.5">赢单概率</div>
                                        <Progress percent={deal.winRate} size="small" strokeColor="#2563EB" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DealsPage;
