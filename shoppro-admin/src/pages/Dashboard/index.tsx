import React, { useState, useEffect } from 'react';
import { Button, Tag, Rate, Checkbox, message, Empty, Spin } from 'antd';
import {
    Plus,
    UserCheck,
    CheckSquare,
    ShoppingBag,
    DollarSign,
    TrendingUp,
    Building2,
    Calendar,
    Phone,
    Video,
    Send,
    ChevronRight,
    ArrowRight,
    Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getUser } from '@/utils/storage';
import { getSalesDashboard, getSalesTrend } from '@/services/analytics';
import { leadService } from '@/services/lead';
import { customerService } from '@/services/customer';
import { agentService } from '@/services/agent';

export const DashboardPage: React.FC = () => {
    const { themeMode } = useTheme();
    const isDark = themeMode === 'dark';
    const navigate = useNavigate();

    const currentUser = getUser();
    const [todoFilter, setTodoFilter] = useState<'all' | 'follow' | 'meeting' | 'task'>('all');
    const [loading, setLoading] = useState(false);

    // KPI 实时统计（完全从后端接口读取，初始为0）
    const [stats, setStats] = useState({
        newLeads: 0,
        followUps: 0,
        dealCount: 0,
        salesAmount: '¥ 0',
        completionRate: '0.0%'
    });

    // 重点客户（真实后端列表）
    const [keyCustomers, setKeyCustomers] = useState<any[]>([]);

    // 待办事项与智能体待确认任务（真实后端列表）
    const [todoList, setTodoList] = useState<any[]>([]);

    // 销售趋势数据（真实后端折线数据）
    const [trendData, setTrendData] = useState<{ dates: string[]; values: number[] }>({
        dates: [],
        values: []
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const today = new Date();
            const past30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const formatDate = (d: Date) => d.toISOString().split('T')[0];

            const [salesRes, custRes, leadRes, trendRes, taskRes] = await Promise.allSettled([
                getSalesDashboard(),
                customerService.getCustomers({ pageNo: 1, pageSize: 5 }),
                leadService.getLeads({ pageNo: 1, pageSize: 10 }),
                getSalesTrend({ startDate: formatDate(past30), endDate: formatDate(today), granularity: 'day' }),
                agentService.getTasks({ status: 'pending' })
            ]);

            // 1. 解析销售仪表板 KPI
            if (salesRes.status === 'fulfilled' && salesRes.value) {
                const s = (salesRes.value as any).data || salesRes.value as any;
                setStats({
                    newLeads: Number(s.newLeadsCount || s.newLeads || 0),
                    followUps: Number(s.followUpCount || s.followUps || 0),
                    dealCount: Number(s.totalOrdersThisMonth || s.dealCount || 0),
                    salesAmount: s.monthlyRevenue ? `¥ ${Number(s.monthlyRevenue).toLocaleString()}` : (s.totalSalesAmount ? `¥ ${Number(s.totalSalesAmount).toLocaleString()}` : '¥ 0'),
                    completionRate: s.targetCompletionRate ? `${(Number(s.targetCompletionRate) * 100).toFixed(1)}%` : (s.conversionRate || '0.0%')
                });
            }

            // 2. 解析重点客户列表
            if (custRes.status === 'fulfilled' && custRes.value) {
                const custData = (custRes.value as any).data || custRes.value;
                const records = custData.records || custData.items || (Array.isArray(custData) ? custData : []);
                if (records.length > 0) {
                    const mapped = records.slice(0, 5).map((c: any) => ({
                        id: c.id,
                        name: c.name || c.customerName || '企业客户',
                        stage: c.stage || (c.status === 'active' ? '商务谈判' : '方案沟通'),
                        rating: c.level === 'vip' ? 5 : (c.rating || 4),
                        amount: c.budget ? `¥ ${Number(c.budget).toLocaleString()}` : (c.predictedAmount || '¥ 0'),
                        owner: c.ownerName || currentUser?.realName || '销售顾问',
                        status: c.status || '跟进中'
                    }));
                    setKeyCustomers(mapped);
                } else {
                    setKeyCustomers([]);
                }
            }

            // 3. 解析趋势图数据
            if (trendRes.status === 'fulfilled' && trendRes.value) {
                const t = (trendRes.value as any).data || trendRes.value as any;
                if (t.dates && t.values && t.dates.length > 0) {
                    setTrendData({
                        dates: t.dates,
                        values: t.values
                    });
                } else if (Array.isArray(t) && t.length > 0) {
                    setTrendData({
                        dates: t.map((item: any) => item.date || item.day),
                        values: t.map((item: any) => Number(item.amount || item.value || 0))
                    });
                }
            }

            // 4. 解析待办与 Agent 任务
            if (taskRes.status === 'fulfilled' && taskRes.value) {
                const tasks = (taskRes.value as any).data || taskRes.value as any;
                const taskList = Array.isArray(tasks) ? tasks : (tasks.items || []);
                if (taskList.length > 0) {
                    const mapped = taskList.map((t: any) => ({
                        id: t.id,
                        type: t.agentType === 'sdr' ? 'follow' : (t.agentType === 'coach' ? 'meeting' : 'task'),
                        title: t.taskTitle || t.title || '待处理跟进事项',
                        tag: t.agentType ? `${t.agentType.toUpperCase()} 建议` : '跟进',
                        user: t.customerName || currentUser?.realName || '销售顾问',
                        time: t.createdAt ? new Date(t.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '今日',
                        checked: t.status === 'executed'
                    }));
                    setTodoList(mapped);
                } else {
                    setTodoList([]);
                }
            }

        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleTodo = async (id: number) => {
        setTodoList(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
        try {
            await agentService.confirmTask(id);
            message.success('任务状态已更新');
        } catch {
            // 忽略微小更新失败
        }
    };

    const filteredTodos = todoList.filter(t => {
        if (todoFilter === 'all') return true;
        return t.type === todoFilter;
    });

    // 折线趋势图配置
    const trendOption = {
        grid: { top: 20, right: 20, bottom: 25, left: 45 },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: trendData.dates.length > 0 ? trendData.dates : ['近30天无成交数据'],
            axisLine: { lineStyle: { color: isDark ? '#334155' : '#E2E8F0' } },
            axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: isDark ? '#94A3B8' : '#64748B',
                fontSize: 10,
                formatter: (v: number) => `${v / 10000}万`
            },
            splitLine: { lineStyle: { color: isDark ? '#1E293B' : '#F1F5F9' } }
        },
        series: [
            {
                name: '销售成单额',
                type: 'line',
                smooth: true,
                data: trendData.values.length > 0 ? trendData.values : [0],
                itemStyle: { color: '#2563EB' },
                lineStyle: { width: 3 },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(37, 99, 235, 0.25)' },
                            { offset: 1, color: 'rgba(37, 99, 235, 0.00)' }
                        ]
                    }
                }
            }
        ]
    };

    return (
        <div className="shoppro-dashboard space-y-6 animate-fade-in font-sans">
            {/* 顶栏欢迎与操作 */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        早安，{currentUser?.realName || '销售顾问'} 💼
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        以下是您今日的销售核心指标与 AI 智能体推荐跟进任务（实时对接后端真实数据）
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        type="primary"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => navigate('/leads/create')}
                        className="shoppro-primary-action !rounded-xl !bg-blue-600 hover:!bg-blue-700 !text-xs !h-9 shadow-xs"
                    >
                        录入新线索
                    </Button>
                    <Button
                        icon={<Bot className="w-3.5 h-3.5 text-blue-600" />}
                        onClick={() => navigate('/agents/leads')}
                        className="!rounded-xl !text-xs !h-9 !border-blue-200 hover:!border-blue-500"
                    >
                        AI 智能 SDR 辅导
                    </Button>
                </div>
            </div>

            {/* 4 大核心 KPI 统计卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">本月新增线索</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{stats.newLeads}</div>
                        <div className="text-[11px] text-blue-600 font-bold mt-1 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            实时线索池接入
                        </div>
                    </div>
                    <div className="shoppro-icon w-12 h-12 flex items-center justify-center">
                        <UserCheck className="w-6 h-6" strokeWidth={1.8} />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">累计跟进记录</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{stats.followUps}</div>
                        <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                            <CheckSquare className="w-3 h-3" />
                            全渠道跟进日志
                        </div>
                    </div>
                    <div className="shoppro-icon w-12 h-12 flex items-center justify-center">
                        <CheckSquare className="w-6 h-6" strokeWidth={1.8} />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">本月成单总数</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{stats.dealCount}</div>
                        <div className="text-[11px] text-amber-600 font-bold mt-1 flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3" />
                            签约转化完成
                        </div>
                    </div>
                    <div className="shoppro-icon w-12 h-12 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6" strokeWidth={1.8} />
                    </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">本月营收金额</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">{stats.salesAmount}</div>
                        <div className="text-[11px] text-indigo-600 font-bold mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            目标达成率 {stats.completionRate}
                        </div>
                    </div>
                    <div className="shoppro-icon w-12 h-12 flex items-center justify-center">
                        <DollarSign className="w-6 h-6" strokeWidth={1.8} />
                    </div>
                </div>
            </div>

            {/* 中间图表与 AI 辅导栏 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 销售业绩趋势图 (8列) */}
                <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                销售业绩实时走势
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">近 30 天真实成交订单流水聚合分析</p>
                        </div>
                        <Button size="small" type="text" onClick={() => navigate('/analytics/overview')} className="text-xs text-blue-600 font-bold">
                            查看全域分析 →
                        </Button>
                    </div>
                    <div className="h-64 w-full">
                        <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                </div>

                {/* AI 销售大脑推荐 (4列) */}
                <div className="shoppro-ai-panel lg:col-span-4 p-6 rounded-3xl text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
                                <Bot className="w-3.5 h-3.5" />
                                AI 成单建议引擎
                            </span>
                            <Bot className="w-6 h-6 text-blue-200" />
                        </div>
                        <h3 className="text-xl font-black leading-snug">
                            全流程销售智能体已就绪
                        </h3>
                        <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                            系统已接入 5 大销售智能体（SDR 智能预测、360° 画像、销售教练、自动化营销与营收预测），自动分析商机意向与成单概率。
                        </p>
                    </div>

                    <div className="pt-6 border-t border-white/20 mt-4 flex items-center justify-between">
                        <div className="text-xs text-blue-100">
                            当前待确认方案：<span className="font-black text-white text-sm">{todoList.length} 项</span>
                        </div>
                        <Button
                            size="small"
                            onClick={() => navigate('/agents/leads')}
                            className="!rounded-xl !bg-white !text-blue-600 !font-bold !border-none text-xs hover:!bg-blue-50"
                        >
                            进入智能体
                        </Button>
                    </div>
                </div>
            </div>

            {/* 下半部分：重点客户列表 + 待办任务 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 重点客户追踪 (7列) */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                重点客户跟踪
                            </h3>
                        </div>
                        <Button size="small" type="text" onClick={() => navigate('/customers')} className="text-xs text-blue-600 font-bold">
                            全部客户档案 →
                        </Button>
                    </div>

                    {keyCustomers.length === 0 ? (
                        <Empty description="暂无重点客户数据，请在客户中心录入或分配" className="py-8" />
                    ) : (
                        <div className="space-y-3">
                            {keyCustomers.map((c, i) => (
                                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between hover:border-blue-200 transition-all">
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {c.name}
                                            <Tag color="blue" className="text-[10px] !border-none !rounded-md font-semibold">{c.stage}</Tag>
                                        </div>
                                        <div className="text-[11px] text-slate-400">负责人：{c.owner} · 预估金额：<span className="font-semibold text-slate-600 dark:text-slate-300">{c.amount}</span></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Rate disabled defaultValue={c.rating} className="text-xs !text-amber-400" />
                                        <Button size="small" onClick={() => navigate(`/customers`)} className="!rounded-lg text-xs">
                                            详情
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* SOP 待办与任务 (5列) */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#0D121F] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                今日 SOP 待办
                            </h3>
                        </div>
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px]">
                            <button
                                onClick={() => setTodoFilter('all')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${todoFilter === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}`}
                            >
                                全部
                            </button>
                            <button
                                onClick={() => setTodoFilter('follow')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${todoFilter === 'follow' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}`}
                            >
                                跟进
                            </button>
                            <button
                                onClick={() => setTodoFilter('meeting')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${todoFilter === 'meeting' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}`}
                            >
                                会议
                            </button>
                        </div>
                    </div>

                    {filteredTodos.length === 0 ? (
                        <Empty description="今日暂无待办事项，太棒了！" className="py-8" />
                    ) : (
                        <div className="space-y-2.5">
                            {filteredTodos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${todo.checked ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 text-slate-400 line-through' : 'bg-white dark:bg-slate-900 border-slate-200/70'}`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                        <Checkbox checked={todo.checked} onChange={() => handleToggleTodo(todo.id)} />
                                        <div className="truncate">
                                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                                {todo.title}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                {todo.user} · {todo.time}
                                            </div>
                                        </div>
                                    </div>
                                    <Tag className="text-[10px] !rounded-md font-semibold flex-shrink-0">{todo.tag}</Tag>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
