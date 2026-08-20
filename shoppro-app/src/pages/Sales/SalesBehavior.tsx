import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';

interface BehaviorMetrics {
    conversionRate?: number;
    avgFollowUp?: number;
    responseRate?: number;
    avgCycle?: number;
    recommendations?: string[];
}

interface SalesPerson {
    name: string;
    userId?: number;
}

const SalesBehavior: React.FC = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('today');
    const [salesPerson, setSalesPerson] = useState('all');
    const [metrics, setMetrics] = useState<BehaviorMetrics>({});
    const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getDates = () => {
        const days = timeRange === 'today' ? 1 : timeRange === 'week' ? 7 : timeRange === 'quarter' ? 90 : 30;
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { startDate, endDate };
    };

    const loadData = async () => {
        setLoading(true);
        setError('');
        const { startDate, endDate } = getDates();
        try {
            const [data, ranking] = await Promise.all([
                analyticsService.getSalesBehaviorAnalysis(startDate, endDate, salesPerson === 'all' ? undefined : Number(salesPerson)),
                analyticsService.getSalesPersonRanking(100),
            ]);
            setMetrics(data || {});
            setSalesPeople((ranking || []).map(person => ({ name: person.name, userId: person.userId })));
        } catch (requestError) {
            console.error('Failed to load behavior data', requestError);
            setMetrics({});
            setError('销售行为数据加载失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [timeRange, salesPerson]);

    const handleExport = async () => {
        const { startDate, endDate } = getDates();
        try {
            const blob = await analyticsService.generateSalesReport(startDate, endDate);
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `sales-behavior-${startDate}-${endDate}.xlsx`;
            anchor.click();
            URL.revokeObjectURL(url);
        } catch (requestError) {
            console.error('Failed to export behavior report', requestError);
            setError('销售行为报表导出失败');
        }
    };

    const cards = [
        ['销售转化率', metrics.conversionRate, '%'],
        ['平均跟进次数', metrics.avgFollowUp, ' 次/客户'],
        ['客户响应率', metrics.responseRate, '%'],
        ['平均成交周期', metrics.avgCycle, ' 天'],
    ] as const;

    return (
        <div className="bg-gray-50 min-h-screen pb-20 font-sans">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3"><button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><span className="text-gray-600 text-lg">←</span></button><h1 className="text-lg font-semibold text-gray-900">销售行为分析</h1></div>
                    <div className="flex space-x-2"><button onClick={loadData} disabled={loading} className="px-3 py-1.5 border border-[#4640DE] text-[#4640DE] rounded-lg text-sm disabled:opacity-50">刷新分析</button><button onClick={handleExport} className="px-3 py-1.5 bg-[#4640DE] text-white rounded-lg text-sm">导出数据</button></div>
                </div>
            </div>

            <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2 overflow-x-auto"><span className="text-sm font-medium text-gray-700 whitespace-nowrap">时间范围:</span>{[['today','今日'],['week','本周'],['month','本月'],['quarter','本季度']].map(([value, label]) => <button key={value} onClick={() => setTimeRange(value)} className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${timeRange === value ? 'bg-[#4640DE] text-white' : 'bg-gray-100 text-gray-600'}`}>{label}</button>)}</div>
                <div className="flex items-center space-x-2"><span className="text-sm text-gray-600">销售员:</span><select value={salesPerson} onChange={event => setSalesPerson(event.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"><option value="all">全部销售员</option>{salesPeople.filter(person => person.userId).map(person => <option key={person.userId} value={person.userId}>{person.name}</option>)}</select></div>
            </div>

            <div className="px-4 space-y-4">
                {error && <div className="bg-red-50 text-red-700 rounded-xl p-3 text-sm">{error}</div>}
                <div className="grid grid-cols-2 gap-3">{cards.map(([label, value, suffix]) => <div key={label} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"><div className="text-sm font-medium text-gray-900 mb-2">{label}</div><div className="text-2xl font-bold text-gray-900">{value ?? '暂无'}{value !== undefined ? suffix : ''}</div></div>)}</div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"><h3 className="font-semibold text-gray-900 mb-4">行为改进建议</h3>{metrics.recommendations?.length ? <ul className="space-y-2 text-sm text-gray-700">{metrics.recommendations.map((item, index) => <li key={index} className="border-l-2 border-indigo-300 pl-3">{item}</li>)}</ul> : <div className="text-sm text-gray-400">暂无可用建议</div>}</div>
            </div>
        </div>
    );
};

export default SalesBehavior;
