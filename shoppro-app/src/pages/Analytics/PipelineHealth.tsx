import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    AlertTriangle
} from 'lucide-react';

const PipelineHealth: React.FC = () => {
    const navigate = useNavigate();
    const [pipeline, setPipeline] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            const res = await fetch('/api/ai/revenue/pipeline', { headers: { 'Authorization': `Bearer ${token}` } });
            const json = await res.json();
            if (json.data) setPipeline(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !pipeline) {
        return <div className="p-8 text-center text-gray-400">加载管道全景中...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-gray-900">销售管道健康度与阶段流速</h1>
                <div className="w-8"></div>
            </div>

            <div className="p-4 space-y-4">
                {/* 阶段卡片列表 */}
                <div className="space-y-3">
                    {pipeline.stages.map((stage: any, index: number) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${stage.isStuck ? 'border-red-300 bg-red-50/20' : 'border-gray-200'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                                        {index + 1}
                                    </span>
                                    <h3 className="font-bold text-sm text-gray-900">{stage.stage}</h3>
                                </div>
                                <span className="font-mono font-bold text-xs text-amber-700">
                                    ¥{(stage.amount / 10000).toFixed(1)}万 ({stage.count}单)
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-gray-50 rounded-xl px-3 border border-gray-100 mb-2">
                                <div>
                                    <span className="text-gray-400">阶段转化率: </span>
                                    <span className="font-bold text-gray-800">{(stage.conversionRate * 100).toFixed(0)}%</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">平均停留: </span>
                                    <span className={`font-bold ${stage.isStuck ? 'text-red-600' : 'text-gray-800'}`}>
                                        {stage.avgStayDays}天 (基准{stage.benchmarkStayDays}天)
                                    </span>
                                </div>
                            </div>

                            {stage.isStuck && (
                                <div className="text-[11px] text-red-600 flex items-center gap-1 font-medium">
                                    <AlertTriangle className="w-3.5 h-3.5" /> 存在卡滞项目，平均超期 3 天！
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PipelineHealth;
