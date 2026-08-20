import React, { useState } from 'react';
import { Button, Select, Tag, Checkbox } from 'antd';
import { SlidersHorizontal, BarChart3, PieChart, LineChart, Table, Download, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/contexts/ThemeContext';

export const CustomBIPage: React.FC = () => {
    const navigate = useNavigate();
    const { themeMode } = useTheme();
    const isDark = themeMode === 'dark';

    const [dimensionX, setDimensionX] = useState('industry');
    const [dimensionY, setDimensionY] = useState('source');
    const [metric, setMetric] = useState('amount');

    const biChartOption = {
        grid: { top: 30, right: 30, bottom: 30, left: 50 },
        tooltip: { trigger: 'axis' },
        legend: { data: ['官网留资', '营销活动', '转介绍'], textStyle: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 } },
        xAxis: {
            type: 'category',
            data: ['IT/软件', '制造', '金融服务', '品牌零售', '教育医疗'],
            axisLine: { lineStyle: { color: isDark ? '#334155' : '#E2E8F0' } },
            axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, formatter: (v: number) => `${v / 10000}万` },
            splitLine: { lineStyle: { color: isDark ? '#1E293B' : '#F1F5F9' } }
        },
        series: [
            { name: '官网留资', type: 'bar', stack: 'total', data: [320000, 180000, 240000, 150000, 90000], itemStyle: { color: '#2563EB' } },
            { name: '营销活动', type: 'bar', stack: 'total', data: [150000, 260000, 120000, 80000, 60000], itemStyle: { color: '#06B6D4' } },
            { name: '转介绍', type: 'bar', stack: 'total', data: [90000, 120000, 180000, 110000, 40000], itemStyle: { color: '#10B981' } },
        ]
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/analytics/overview')}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            高级自定义多维分析 (BI)
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            支持自由交叉维度、度量指标与透视分析
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button icon={<Download className="w-3.5 h-3.5" />} className="!rounded-xl !text-xs !h-9">
                        导出透视表
                    </Button>
                    <Button type="primary" icon={<Plus className="w-3.5 h-3.5" />} className="!rounded-xl !bg-blue-600 !font-bold !text-xs !h-9">
                        保存自定义看板
                    </Button>
                </div>
            </div>

            {/* 维度与指标配置栏 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    透视分析配置 (拖拽 / 交叉分析)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-slate-500 mb-1 font-medium">X 轴维度 (横轴):</label>
                        <Select
                            value={dimensionX}
                            onChange={setDimensionX}
                            className="w-full !rounded-xl"
                            options={[
                                { value: 'industry', label: '客户行业 (5大类)' },
                                { value: 'region', label: '客户区域 (省份/城市)' },
                                { value: 'rep', label: '销售顾问' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-slate-500 mb-1 font-medium">堆叠对比维度 (分组):</label>
                        <Select
                            value={dimensionY}
                            onChange={setDimensionY}
                            className="w-full !rounded-xl"
                            options={[
                                { value: 'source', label: '线索来源 (官网/活动/转介绍)' },
                                { value: 'product', label: '意向产品模块' },
                                { value: 'stage', label: '当前所处阶段' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-slate-500 mb-1 font-medium">度量指标 (数值):</label>
                        <Select
                            value={metric}
                            onChange={setMetric}
                            className="w-full !rounded-xl"
                            options={[
                                { value: 'amount', label: '销售总金额 (¥)' },
                                { value: 'count', label: '订单/商机数量' },
                                { value: 'avgDeal', label: '平均客单价' },
                                { value: 'convRate', label: '综合转化率 (%)' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* 图表展示区 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">按行业与来源交叉分析销售额分布</span>
                    <div className="flex gap-2">
                        <Button size="small" type="primary" icon={<BarChart3 className="w-3.5 h-3.5" />} className="!rounded-lg !text-xs !bg-blue-600">柱状图</Button>
                        <Button size="small" icon={<LineChart className="w-3.5 h-3.5" />} className="!rounded-lg !text-xs">折线图</Button>
                        <Button size="small" icon={<Table className="w-3.5 h-3.5" />} className="!rounded-lg !text-xs">明细表</Button>
                    </div>
                </div>

                <div className="h-[320px]">
                    <ReactECharts option={biChartOption} style={{ height: '100%', width: '100%' }} />
                </div>
            </div>
        </div>
    );
};

export default CustomBIPage;
