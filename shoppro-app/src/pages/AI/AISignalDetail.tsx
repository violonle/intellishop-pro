import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    PhoneCall,
    Sparkles
} from 'lucide-react';

const AISignalDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [signal, setSignal] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDetail();
    }, [id]);

    const loadDetail = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            const res = await fetch(`/api/ai/signals/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.data) setSignal(json.data);
        } catch (e) {
            console.error('Failed to load signal detail', e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        try {
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
            await fetch(`/api/ai/signals/${id}/handle`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('信号已标记为已处理');
            navigate(-1);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading || !signal) {
        return <div className="p-8 text-center text-gray-400">加载信号详情中...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-gray-900">客户行为信号详情</h1>
                <div className="w-8"></div>
            </div>

            <div className="p-4 space-y-4">
                {/* 信号基本信息 */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            {signal.priority === 'high' ? '高优先级信号' : '常规信号'}
                        </span>
                        <span className="text-xs text-gray-400">{signal.createdAt}</span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900">{signal.title}</h2>
                    <p className="text-xs text-gray-600 leading-relaxed">{signal.description}</p>
                </div>

                {/* 关联对象 */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-400">目标客户/商机</span>
                        <span className="font-bold text-gray-800">{signal.targetName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                        <span className="text-gray-400">信号识别类型</span>
                        <span className="font-semibold text-gray-700">{signal.signalType}</span>
                    </div>
                </div>

                {/* 建议行动 */}
                <div className="bg-rose-50/70 rounded-2xl p-5 border border-rose-200/80 space-y-2.5">
                    <h3 className="font-bold text-sm text-rose-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-rose-600" />
                        AI 推荐快速跟进动作
                    </h3>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                        {signal.recommendedAction}
                    </p>
                </div>

                {/* 底部操作 */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[480px] mx-auto z-40">
                    <button
                        onClick={handleAction}
                        className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
                    >
                        <PhoneCall className="w-4 h-4" />
                        立即执行推荐动作并完成跟进
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AISignalDetail;
