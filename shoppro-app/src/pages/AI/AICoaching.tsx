import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Sparkles, Copy } from 'lucide-react';
import { http } from '../../services/http';
import { customerService, type Customer } from '../../services/customerService';

interface CoachingAdvice {
    scenario?: string;
    suggestedResponse?: string;
}

const AICoaching: React.FC = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const customerId = params.get('customerId');
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [keyword, setKeyword] = useState('');
    const [advice, setAdvice] = useState<CoachingAdvice | null>(null);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if (!customerId) return;
        customerService.getCustomerDetail(Number(customerId)).then(setCustomer).catch(() => setCustomer(null));
    }, [customerId]);

    const fetchAdvice = async () => {
        if (!customerId || !keyword.trim()) return;
        setLoading(true);
        try {
            const data = await http.post<CoachingAdvice>('/ai/coaching/advice', {
                customerId: Number(customerId),
                keywords: keyword.trim(),
            });
            setAdvice(data);
        } catch (error) {
            console.error('获取辅导建议失败', error);
            setAdvice(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!advice?.suggestedResponse) return;
        await navigator.clipboard.writeText(advice.suggestedResponse);
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24 font-sans">
            <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700"><ArrowLeft className="w-5 h-5" /></button>
                <div className="text-center">
                    <h1 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 justify-center"><span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-500 animate-ping' : 'bg-gray-300'}`} />AI 通话实时辅导</h1>
                    <p className="text-[11px] text-gray-400">{customer ? `当前客户：${customer.name}` : '请从客户详情进入并选择客户'}</p>
                </div>
                <button onClick={() => setIsListening(value => !value)} className="p-2 rounded-full border bg-white text-gray-600">{isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}</button>
            </div>

            <div className="p-4 space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-3">
                    <label className="text-xs text-gray-600 font-medium" htmlFor="coaching-keyword">输入当前客户异议或沟通关键词</label>
                    <div className="flex gap-2">
                        <input id="coaching-keyword" value={keyword} onChange={event => setKeyword(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') fetchAdvice(); }} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm" placeholder="例如：价格、交付周期、数据安全" />
                        <button onClick={fetchAdvice} disabled={!customerId || !keyword.trim() || loading} className="px-4 py-2 rounded-xl bg-primary text-white text-sm disabled:opacity-50">{loading ? '分析中' : '获取建议'}</button>
                    </div>
                    {!customerId && <p className="text-xs text-amber-600">缺少客户 ID，当前页面不会调用业务接口。</p>}
                </div>

                <div className="bg-white rounded-2xl p-5 border border-primary/30 shadow-md space-y-3">
                    <div className="flex items-center justify-between"><span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" />{advice?.scenario || '暂无匹配场景'}</span><span className="text-[11px] text-gray-400">基于已配置辅导规则</span></div>
                    <div className="bg-slate-50 rounded-xl p-4 text-xs text-gray-800 leading-relaxed border border-slate-200 whitespace-pre-wrap font-medium">{advice?.suggestedResponse || '暂无可用建议，请先输入关键词并确保后台已配置辅导规则。'}</div>
                    <button disabled={!advice?.suggestedResponse} onClick={handleCopy} className="text-primary text-xs font-semibold flex items-center gap-1 disabled:text-gray-400"><Copy className="w-3 h-3" />复制建议</button>
                </div>
            </div>
        </div>
    );
};

export default AICoaching;
