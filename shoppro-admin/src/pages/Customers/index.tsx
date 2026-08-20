import React, { useState, useEffect } from 'react';
import { Button, Input, Tag, Rate, Empty, Spin, message } from 'antd';
import {
    Plus,
    Search,
    RotateCcw,
    Users,
    UserCheck,
    Star,
    Clock,
    Tag as TagIcon,
    Bot,
    Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '@/services/customer';

interface CustomerItem {
    id: string;
    name: string;
    contact: string;
    phone: string;
    stage: string;
    rating: number;
    lastFollow: string;
    predictedAmount: string;
    owner: string;
    level: string;
}

export const CustomersPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchVal, setSearchVal] = useState('');
    const [tab, setTab] = useState<'all' | 'key' | 'new' | 'dormant'>('all');
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<CustomerItem[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        newThisMonth: 0,
        vipCount: 0,
        dormantCount: 0
    });

    useEffect(() => {
        loadCustomers();
    }, [tab]);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const data: any = await customerService.getCustomers({
                pageNo: 1,
                pageSize: 20,
                keyword: searchVal || undefined,
                level: tab === 'key' ? 'vip' : undefined
            }).catch(() => null);

            const custData = (data as any)?.data || data;
            const records = custData?.records || custData?.items || (Array.isArray(custData) ? custData : []);

            if (records.length > 0) {
                const mapped: CustomerItem[] = records.map((c: any) => ({
                    id: String(c.id),
                    name: c.name || c.customerName || '企业客户',
                    contact: c.contact || c.contactPerson || c.name?.slice(0, 2) + '经理',
                    phone: c.phone || c.contactPhone || '未登记',
                    stage: c.stage || (c.status === 'active' ? '商务谈判中' : '需求分析'),
                    rating: c.level === 'vip' ? 5 : (c.rating || 4),
                    lastFollow: c.updatedAt ? new Date(c.updatedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '刚刚',
                    predictedAmount: c.budget ? `¥ ${Number(c.budget).toLocaleString()}` : (c.predictedAmount || '¥ 0'),
                    owner: c.ownerName || c.owner || '销售顾问',
                    level: c.level || '标准'
                }));
                setCustomers(mapped);
                setStats({
                    total: custData.total || mapped.length,
                    newThisMonth: mapped.filter(c => c.stage === '需求分析').length,
                    vipCount: mapped.filter(c => c.rating >= 4).length,
                    dormantCount: mapped.filter(c => c.stage === '已归档' || c.level === '休眠').length
                });
            } else {
                setCustomers([]);
                setStats({
                    total: 0,
                    newThisMonth: 0,
                    vipCount: 0,
                    dormantCount: 0
                });
            }
        } catch (error) {
            console.error('Failed to load customers', error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c => {
        if (!searchVal) return true;
        return c.name.toLowerCase().includes(searchVal.toLowerCase()) || c.contact.toLowerCase().includes(searchVal.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            {/* 顶栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        客户全景档案
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        统一管理企业正式客户、360° 画像、跟进阶段与商机价值（真实后端数据）
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        icon={<TagIcon className="w-3.5 h-3.5 text-blue-600" />}
                        onClick={() => navigate('/customers/tags')}
                        className="!rounded-xl !text-xs !h-9"
                    >
                        标签画像库
                    </Button>
                    <Button
                        icon={<Bot className="w-3.5 h-3.5 text-indigo-600" />}
                        onClick={() => navigate('/agents/customer')}
                        className="!rounded-xl !text-xs !h-9 !border-indigo-200 hover:!border-indigo-500"
                    >
                        客户画像智能体
                    </Button>
                </div>
            </div>

            {/* 4 大统计看板 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                    <div className="shoppro-icon w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div>
                        <div className="text-[11px] text-slate-400 font-semibold">客户档案总数</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">{stats.total}</div>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                    <div className="shoppro-icon w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div>
                        <div className="text-[11px] text-slate-400 font-semibold">本月新拓客户</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">{stats.newThisMonth}</div>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                    <div className="shoppro-icon w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div>
                        <div className="text-[11px] text-slate-400 font-semibold">VIP 核心客户</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">{stats.vipCount}</div>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                    <div className="shoppro-icon w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <div>
                        <div className="text-[11px] text-slate-400 font-semibold">流失预警客户</div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">{stats.dormantCount}</div>
                    </div>
                </div>
            </div>

            {/* 列表主体 */}
            <div className="bg-white dark:bg-[#0D121F] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
                {/* 过滤筛选 */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto">
                        {(['all', 'key', 'new', 'dormant'] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                {t === 'all' ? '全部客户' : t === 'key' ? '重点客户 (VIP)' : t === 'new' ? '近期新增' : '流失预警'}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto">
                        <Input
                            placeholder="搜索客户名称、联系人或电话..."
                            prefix={<Search className="w-4 h-4 text-slate-400 mr-1" />}
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadCustomers()}
                            className="!rounded-xl !w-full sm:!w-72 !bg-slate-50 dark:!bg-slate-800/40 text-xs"
                        />
                        <Button
                            icon={<RotateCcw className="w-3.5 h-3.5" />}
                            onClick={() => { setSearchVal(''); setTab('all'); }}
                            className="!rounded-xl !text-xs"
                        >
                            重置
                        </Button>
                    </div>
                </div>

                {/* 客户卡片列表 */}
                <div className="space-y-3 pt-2">
                    {filteredCustomers.length === 0 ? (
                        <Empty description="暂无符合条件的客户档案数据" className="py-12" />
                    ) : (
                        filteredCustomers.map((cust) => (
                            <div
                                key={cust.id}
                                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-800/80 bg-white dark:bg-[#111622] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-xs text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                                            {cust.name}
                                        </h4>
                                        <Tag className="!rounded-md !text-[10px] !bg-blue-50 !text-blue-600 !border-blue-200">
                                            {cust.level}
                                        </Tag>
                                        <Tag className="!rounded-md !text-[10px] !bg-emerald-50 !text-emerald-600 !border-emerald-200">
                                            {cust.stage}
                                        </Tag>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
                                        <span>对接人：<strong className="text-slate-700 dark:text-slate-300">{cust.contact}</strong></span>
                                        <span>联系电话：{cust.phone}</span>
                                        <span>跟进人：{cust.owner}</span>
                                        <span>预估价值：<strong className="text-slate-700 dark:text-slate-300">{cust.predictedAmount}</strong></span>
                                        <span>最后跟进：{cust.lastFollow}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 justify-between md:justify-end">
                                    <div className="text-center">
                                        <div className="text-[10px] text-slate-400 mb-0.5">意向评级</div>
                                        <Rate disabled defaultValue={cust.rating} className="text-xs !text-amber-400" />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="small"
                                            icon={<Eye className="w-3.5 h-3.5" />}
                                            onClick={() => navigate(`/customers/detail?id=${cust.id}`)}
                                            className="!rounded-lg text-xs"
                                        >
                                            360° 画像
                                        </Button>
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

export default CustomersPage;
