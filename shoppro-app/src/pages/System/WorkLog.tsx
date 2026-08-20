import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService';

const WorkLog: React.FC = () => {
    const navigate = useNavigate();
    const [generating, setGenerating] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [logs] = useState<Array<{ id: number; type: string; content: string; time: string; duration: string; customer: string }>>([]);

    const handleGenerateDaily = async () => {
        setGenerating(true);
        try {
            const prompt = `请根据今天已保存的 ${logs.length} 条跟进记录生成销售日报，不要补造任何不存在的客户、金额或结果。`;
            const res = await aiService.chat(prompt);
            setAiSummary(res || '当前没有可生成的跟进记录');
        } catch (e) {
            setAiSummary('日报生成失败，请检查 AI 服务或先保存真实跟进记录。');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans">
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 shadow-xs">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-xl">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-base font-bold text-gray-900 ml-2">销售工作日志</h1>
                </div>
                <button 
                    onClick={handleGenerateDaily}
                    disabled={generating}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    {generating ? '正在生成...' : 'AI一键生成日报'}
                </button>
            </div>

            <div className="p-4 space-y-4">
                {/* Date Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center text-gray-800">
                        <CalendarIcon className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="font-bold text-xs">{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-full">已保存 {logs.length} 条跟进</span>
                </div>

                {/* AI Generated Daily Report Section */}
                {aiSummary && (
                    <div className="bg-gradient-to-br from-blue-500/10 via-indigo-50 to-purple-50 rounded-2xl p-5 border border-blue-200/80 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-blue-600" /> AI 智能生成的销售日报
                            </h3>
                        </div>
                        <textarea
                            value={aiSummary}
                            onChange={(e) => setAiSummary(e.target.value)}
                            rows={6}
                            className="w-full p-3 bg-white rounded-xl text-xs text-gray-800 border border-blue-200/80 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed resize-none font-sans"
                        />
                    </div>
                )}

                {/* Log List */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-gray-500 ml-1">今日自动归集跟进轨迹</h3>
                    {logs.map(log => (
                        <div key={log.id} className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] rounded-md font-bold">
                                    {log.type}
                                </span>
                                <span className="text-gray-400 text-[11px] font-medium flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {log.time}
                                </span>
                            </div>
                            <p className="text-gray-900 font-bold text-xs mb-2 leading-relaxed">{log.content}</p>
                            <div className="flex justify-between items-center text-[11px] text-gray-400 font-medium">
                                <span>关联客户: <strong className="text-gray-700">{log.customer}</strong></span>
                                <span>耗时: {log.duration}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkLog;
