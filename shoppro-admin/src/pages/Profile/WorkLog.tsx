import React, { useState } from 'react';
import { Button, Input, DatePicker, Tag, message } from 'antd';
import { FileText, Bot, Plus, Calendar, CheckCircle2, PhoneCall, Video, ArrowRight, Save } from 'lucide-react';

export const WorkLogPage: React.FC = () => {
    const [logContent, setLogContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAiGenerateDaily = () => {
        message.info('当前暂无工作日志聚合接口，请先录入内容后保存。');
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        销售工作日志与 AI 日报
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        基于全天 CRM 行为自动生成工作日志与复盘报告
                    </p>
                </div>

                <div className="flex gap-2.5">
                    <Button
                        icon={<Bot className="w-3.5 h-3.5 text-blue-600" />}
                        onClick={handleAiGenerateDaily}
                        className="!rounded-xl !text-xs !font-bold !h-9 !border-blue-200 text-blue-600 bg-blue-50/50"
                    >
                        AI 智能一键生成日报
                    </Button>
                    <Button
                        type="primary"
                        icon={<Save className="w-3.5 h-3.5" />}
                        onClick={() => message.warning('工作日志归档接口尚未接入，当前内容不会被伪造为已保存。')}
                        className="!rounded-xl !bg-blue-600 !font-bold !text-xs !h-9 !px-5"
                    >
                        提交日志
                    </Button>
                </div>
            </div>

            {/* 日志编辑卡片 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">日志日期: 2026年08月19日 (星期三)</span>
                    </div>
                    <Tag color="default" className="!rounded-md !m-0 !text-[10px]">暂无自动汇总数据</Tag>
                </div>

                <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">工作日志详情</label>
                    <Input.TextArea
                        rows={10}
                        value={logContent}
                        onChange={e => setLogContent(e.target.value)}
                        className="!rounded-2xl text-xs font-mono leading-relaxed"
                    />
                </div>
            </div>
        </div>
    );
};

export default WorkLogPage;
