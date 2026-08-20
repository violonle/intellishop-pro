import React from 'react';
import { Button, Tag, Progress } from 'antd';
import { Trophy, TrendingUp, DollarSign, Target, Award, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/contexts/ThemeContext';

export const MyPerformancePage: React.FC = () => {
    const navigate = useNavigate();
    const { themeMode } = useTheme();
    const isDark = themeMode === 'dark';

    const myPerformanceOption = {
        grid: { top: 20, right: 20, bottom: 20, left: 40 },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: ['第1周', '第2周', '第3周', '第4周'],
            axisLine: { lineStyle: { color: isDark ? '#334155' : '#E2E8F0' } },
            axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, formatter: (v: number) => `${v / 10000}万` },
            splitLine: { lineStyle: { color: isDark ? '#1E293B' : '#F1F5F9' } }
        },
        series: [
            { name: '实际完成', type: 'bar', barWidth: '35%', data: [120000, 240000, 380000, 510000], itemStyle: { color: '#2563EB', borderRadius: [4, 4, 0, 0] } }
        ]
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    我的个人业绩看板
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    追踪个人月度/季度目标完成度与提成预测
                </p>
            </div>

            {/* 4 大核心指标 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">本月个人目标</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">¥ 750,000</div>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">已完成销售额</div>
                    <div className="text-2xl font-black text-blue-600 font-mono mt-0.5">¥ 510,000</div>
                    <div className="text-[11px] text-emerald-600 mt-0.5">完成率 68.0%</div>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">成交订单数</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">4 单</div>
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="text-xs text-slate-400">预估提成佣金</div>
                    <div className="text-2xl font-black text-emerald-600 font-mono mt-0.5">¥ 35,700</div>
                </div>
            </div>

            {/* 趋势图 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="font-bold text-xs text-slate-900 dark:text-white">本月每周业绩冲刺轨迹</div>
                <div className="h-[240px]">
                    <ReactECharts option={myPerformanceOption} style={{ height: '100%', width: '100%' }} />
                </div>
            </div>
        </div>
    );
};

export default MyPerformancePage;
