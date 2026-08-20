import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Brain, Sparkles, MessageSquare, Copy, Check } from 'lucide-react';
import { aiService } from '../../services/aiService';
import customerService from '../../services/customerService';
import type { CustomerProfileResponse } from '../../services/aiService';

const AIPersonaAnalysis: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [customer, setCustomer] = useState<any>(null);
    const [analysis, setAnalysis] = useState<CustomerProfileResponse | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            try {
                if (!id) throw new Error('缺少客户ID');
                const currentCustomer = await customerService.getCustomerDetail(Number(id));
                setCustomer(currentCustomer);

                const payload = {
                    customerId: id,
                    customerName: currentCustomer.name,
                    level: currentCustomer.level,
                    recentBehaviors: [],
                    demographics: {}
                };

                const data = await aiService.analyzeCustomerProfile(payload);
                setAnalysis(data);
            } catch (error) {
                console.error("Failed to analyze persona", error);
                setAnalysis(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();
    }, [id]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Sparkles className="w-8 h-8 text-cyan-600 animate-pulse mx-auto mb-4" />
                    <p className="text-xs text-gray-500 font-medium">正在调取客户画像智能体进行深度分析...</p>
                </div>
            </div>
        );
    }

    const openingScript = `${customer?.name || '客户'}负责人您好，${analysis?.suggestedStrategy || '欢迎联系我们，方便安排时间沟通您的业务需求吗？'}`;

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
                            <Brain className="w-5 h-5 text-cyan-600" /> 深度画像分析 {customer?.name ? `· ${customer.name}` : ''}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-4">
                <div className="bg-gradient-to-br from-cyan-500/10 via-blue-50 to-indigo-50 rounded-2xl p-5 border border-cyan-100 shadow-xs">
                    <h2 className="text-sm font-bold text-cyan-950 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-600" /> AI 客户性格与决策模型
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {analysis?.summary}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {analysis?.tags?.map((t, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-cyan-700 border border-cyan-200 shadow-2xs">
                                #{t}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                    <h3 className="font-bold text-gray-900 text-sm mb-4">沟通推进策略建议</h3>
                    <ul className="space-y-3">
                        {analysis?.suggestedStrategy?.split('。').filter(s => s.trim()).map((s, i) => (
                            <li key={i} className="flex gap-3 text-xs text-gray-700 items-start">
                                <span className="w-5 h-5 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5">
                                    {i + 1}
                                </span>
                                <span className="leading-relaxed">{s}。</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                    <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-cyan-600" /> AI 推荐定制开场白
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed italic">
                        "{openingScript}"
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button 
                            onClick={() => handleCopy(openingScript)}
                            className="py-2.5 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 flex items-center justify-center gap-1.5 text-slate-700"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? '已复制到剪贴板' : '复制推荐话术'}
                        </button>
                        <button 
                            onClick={() => navigate('/ai/chat')}
                            className="py-2.5 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 transition-colors shadow-sm shadow-cyan-500/20"
                        >
                            与 AI 助手深度对练
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIPersonaAnalysis;
