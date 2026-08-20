import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Target, TrendingUp, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { leadService } from '../../services/leadService';
import type { SalesPredictionResponse } from '../../services/aiService';

const AILeadPrediction: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [lead, setLead] = useState<any>(null);
    const [prediction, setPrediction] = useState<SalesPredictionResponse | null>(null);

    useEffect(() => {
        const fetchPrediction = async () => {
            setLoading(true);
            try {
                if (!id) throw new Error('缺少线索ID');
                const currentLead = await leadService.getLeadDetail(Number(id));
                setLead(currentLead);

                const historyPayload = {
                    leadId: id,
                    interactions: 0,
                    lastContact: currentLead.followUpDate,
                    value: currentLead.estimatedValue,
                    title: currentLead.title,
                    source: currentLead.source
                };

                const data = await aiService.predictSales(historyPayload);
                setPrediction(data);
            } catch (error) {
                console.error("Failed to predict sales", error);
                setPrediction(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPrediction();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Sparkles className="w-8 h-8 text-blue-600 animate-pulse mx-auto mb-4" />
                    <p className="text-xs text-gray-500 font-medium">正在调取 AI 模型进行转化预测...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-base font-bold text-gray-900 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" /> AI 转化预测 {lead?.title ? `· ${lead.title}` : ''}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-blue-100 text-xs mb-1 font-medium">预测成交概率</div>
                    <div className="text-5xl font-black mb-4">
                        {(prediction?.confidenceLevel ? prediction.confidenceLevel * 100 : (lead?.successProbability || 0)).toFixed(0)}%
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                        <TrendingUp className="w-5 h-5 text-emerald-300" />
                        <span className="text-xs font-medium">{prediction ? `模型趋势：${prediction.trend}` : '暂无趋势数据'}</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">关键转化驱动因素</h3>
                    <div className="space-y-3.5">
                        {prediction?.factors?.length ? prediction.factors.map((factor, index) => (
                            <div key={index} className="flex items-start gap-3.5">
                                <div className="mt-0.5 flex-shrink-0">
                                    {index % 2 === 0 ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-800">关键判定维度 {index + 1}</div>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{factor}</p>
                                </div>
                            </div>
                        )) : <p className="text-xs text-gray-400">暂无模型驱动因素</p>}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                    <h3 className="font-bold text-gray-900 text-sm mb-2">AI 智能攻坚策略</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{prediction ? '请结合模型驱动因素和当前线索信息制定下一步跟进动作。' : '暂无模型策略建议'}</p>
                    <button 
                        onClick={() => navigate('/ai/scripts')}
                        className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                    >
                        生成针对性攻坚话术
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AILeadPrediction;
