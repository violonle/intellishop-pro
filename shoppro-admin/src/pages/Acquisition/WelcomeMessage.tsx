import React, { useState } from 'react';
import { Button, Input, Select, Radio, Tag, message } from 'antd';
import { MessageSquare, Bot, Image, FileText, Link2, Smartphone, Save, CheckCircle2 } from 'lucide-react';
import { getWelcomeMessages, saveWelcomeMessage } from '@/services/acquisition';

export const WelcomeMessagePage: React.FC = () => {
    const [welcomeType, setWelcomeType] = useState('new');
    const [msgText, setMsgText] = useState('');
    const [channelCodeId, setChannelCodeId] = useState<number>();
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        getWelcomeMessages().then((items) => {
            const list = items as unknown as any[];
            const item = list?.[0];
            if (item) {
                setMsgText(item.content || '');
                setChannelCodeId(item.channelCodeId);
            }
        }).catch(() => message.error('欢迎语加载失败'));
    }, []);

    const handleAiOptimize = () => {
        message.info('请先选择具体客户渠道后再生成个性化欢迎语。');
    };

    return (
        <div className="space-y-6 animate-fade-in font-sans max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        加微欢迎语与触达配置
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        配置新客扫码添加企微后的自动欢迎语与资料分发
                    </p>
                </div>

                <Button
                    type="primary"
                    icon={<Save className="w-3.5 h-3.5" />}
                    loading={loading}
                    onClick={() => {
                        if (!channelCodeId || !msgText.trim()) {
                            message.warning('请先选择渠道并填写欢迎语');
                            return;
                        }
                        setLoading(true);
                        saveWelcomeMessage({ channelCodeId, msgType: 'text', content: msgText, isActive: true })
                            .then(() => message.success('欢迎语已保存'))
                            .catch(() => message.error('欢迎语保存失败'))
                            .finally(() => setLoading(false));
                    }}
                    className="!rounded-xl !bg-blue-600 !font-bold !text-xs !h-9 !px-6"
                >
                    保存并同步企微
                </Button>
            </div>

            {/* 双栏配置：左侧表单，右侧微信聊天气泡预览 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 左侧表单 (7列) */}
                <div className="lg:col-span-7 bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 text-xs">
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2">触发场景类型</label>
                        <Radio.Group value={welcomeType} onChange={e => setWelcomeType(e.target.value)} buttonStyle="solid">
                            <Radio.Button value="new" className="!rounded-l-xl text-xs">新客初次添加</Radio.Button>
                            <Radio.Button value="fission" className="text-xs">裂变活动扫码</Radio.Button>
                            <Radio.Button value="night" className="!rounded-r-xl text-xs">非工作时间自动应答</Radio.Button>
                        </Radio.Group>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="font-bold text-slate-700 dark:text-slate-300">欢迎语文案内容</label>
                            <Button
                                size="small"
                                type="text"
                                icon={<Bot className="w-3.5 h-3.5 text-blue-600" />}
                                onClick={handleAiAutoFill => handleAiOptimize()}
                                className="!text-blue-600 !text-xs !font-bold"
                            >
                                AI 润色话术
                            </Button>
                        </div>
                        <Input.TextArea
                            rows={5}
                            value={msgText}
                            onChange={e => setMsgText(e.target.value)}
                            className="!rounded-2xl text-xs leading-relaxed"
                        />
                        <div className="flex gap-2 text-[11px] text-slate-400">
                            <span>点击快速插入变量:</span>
                            <span className="text-blue-600 cursor-pointer font-bold" onClick={() => setMsgText(msgText + ' [客户昵称]')}>+ [客户昵称]</span>
                            <span className="text-blue-600 cursor-pointer font-bold" onClick={() => setMsgText(msgText + ' [销售姓名]')}>+ [销售姓名]</span>
                            <span className="text-blue-600 cursor-pointer font-bold" onClick={() => setMsgText(msgText + ' [企业名称]')}>+ [企业名称]</span>
                        </div>
                    </div>

                    {/* 附件添加 */}
                    <div className="space-y-3 pt-2">
                        <div className="font-bold text-slate-700 dark:text-slate-300">自动附加物料 (可选)</div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center cursor-pointer hover:border-blue-500 transition-all space-y-1">
                                <Image className="w-5 h-5 text-slate-400 mx-auto" />
                                <div className="text-slate-600 dark:text-slate-400">添加海报图片</div>
                            </div>
                                <div className="p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
                                <FileText className="w-5 h-5 text-blue-600 mx-auto" />
                                <div className="text-slate-400">暂无附件</div>
                            </div>
                            <div className="p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center cursor-pointer hover:border-blue-500 transition-all space-y-1">
                                <Link2 className="w-5 h-5 text-slate-400 mx-auto" />
                                <div className="text-slate-600 dark:text-slate-400">网页链接卡片</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 右侧手机企微聊天界面预览 (5列) */}
                <div className="lg:col-span-5 flex justify-center">
                    <div className="w-[320px] rounded-[36px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-800 text-slate-900">
                        {/* 手机屏幕 */}
                        <div className="bg-[#EDEDED] rounded-[28px] overflow-hidden flex flex-col h-[520px]">
                            {/* 微信顶部导航 */}
                            <div className="bg-[#EDEDED] px-4 py-3 border-b border-slate-200 text-center text-xs font-bold text-slate-800">
                                销售顾问
                            </div>

                            {/* 聊天内容区 */}
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto font-sans">
                                <div className="text-center text-[10px] text-slate-400">上午 10:30</div>

                                {/* 顾问发送欢迎语 */}
                                <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        销
                                    </div>
                                    <div className="space-y-2 max-w-[210px]">
                                        <div className="p-3 rounded-2xl rounded-tl-none bg-white text-xs text-slate-800 leading-relaxed shadow-xs">
                                            {msgText || '暂无欢迎语'}
                                        </div>

                                        <div className="text-[11px] text-slate-400">暂无附件</div>
                                    </div>
                                </div>
                            </div>

                            {/* 底部输入框 */}
                            <div className="bg-[#F7F7F7] px-3 py-2 border-t border-slate-200 flex items-center gap-2">
                                <div className="flex-1 bg-white h-7 rounded-lg border border-slate-300"></div>
                                <div className="w-7 h-7 rounded-full bg-slate-300"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeMessagePage;
