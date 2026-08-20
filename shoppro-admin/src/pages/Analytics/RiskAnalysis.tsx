import React, { useState, useEffect } from 'react';
import { Button, Tag, Empty } from 'antd';
import { ArrowLeft, AlertCircle, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRiskAnalysis } from '@/services/analytics';

export const RiskAnalysisPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [risks, setRisks] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res: any = await getRiskAnalysis();
            const data = res?.data || res;
            if (Array.isArray(data)) {
                setRisks(data);
            } else if (data && data.risks) {
                setRisks(data.risks);
            } else {
                setRisks([]);
            }
        } catch (error) {
            console.error('Failed to load risk analysis', error);
            setRisks([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans">
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
                        销售风险与流失预警分析
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        实时识别长期未跟进客户、竞品截流风险与即将丢单商机（真实后端数据）
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#111622] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900 dark:text-white">高风险客户与商机雷达</h3>
                {risks.length === 0 ? (
                    <Empty description="太棒了！当前没有任何高风险或流失告警项目" className="py-12" />
                ) : (
                    <div className="space-y-3">
                        {risks.map((r, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-xs text-rose-900 dark:text-rose-200">{r.customerName || r.title}</div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">{r.riskReason || r.description || '存在长期未沟通风险'}</div>
                                </div>
                                <Tag color="error" className="!rounded-md">风险评级：{r.riskLevel || '高'}</Tag>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiskAnalysisPage;
