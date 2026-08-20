import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { acquisitionService, type ChannelCode } from '../../services/acquisitionService';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import {
    ArrowLeft,
    QrCode,
    Download,
    Share2,
    Copy,
    Edit3,
    TrendingUp,
    Users,
    Eye,
    MessageSquare,
    CheckCircle
} from 'lucide-react';

const CHANNEL_CONFIG: Record<string, {
    name: string;
    color: string;
    bgGradient: string;
    borderColor: string;
    textColor: string;
}> = {
    offline: {
        name: '线下门店',
        color: 'amber',
        bgGradient: 'from-amber-50 to-orange-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-600',
    },
    wechat: {
        name: '微信渠道',
        color: 'green',
        bgGradient: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-600',
    },
    douyin: {
        name: '抖音渠道',
        color: 'gray',
        bgGradient: 'from-slate-50 to-gray-100',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-800',
    },
    xiaohongshu: {
        name: '小红书渠道',
        color: 'red',
        bgGradient: 'from-red-50 to-rose-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-500',
    }
};

const ChannelQRDetail: React.FC = () => {
    const navigate = useNavigate();
    const { channelType } = useParams<{ channelType: string }>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [channelData, setChannelData] = useState<ChannelCode | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditingWelcome, setIsEditingWelcome] = useState(false);
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [trendData] = useState<any[]>([]);

    const channelConfig = useMemo(() => {
        return CHANNEL_CONFIG[channelType || 'offline'] || CHANNEL_CONFIG.offline;
    }, [channelType]);

    useEffect(() => {
        loadChannelDetail();
    }, [user?.id, channelType]);

    const loadChannelDetail = async () => {
        setLoading(true);
        try {
            if (!user?.id) {
                setChannelData(null);
                return;
            }
            const userId = Number(user.id);
            const data = await acquisitionService.getChannelByType(userId, channelType || 'offline').catch(() => null);
            setChannelData(data);

            if (data) {
                const welcome = await acquisitionService.getWelcomeMessage(data.id).catch(() => null);
                setWelcomeMessage(welcome?.content || '');
            } else {
                setWelcomeMessage('');
            }
        } catch (error) {
            console.error('Failed to load channel details', error);
            setWelcomeMessage('');
        } finally {
            setLoading(false);
        }
    };

    const maxValue = Math.max(...trendData.map(d => d.value), 10);

    const handleCopyLink = () => {
        if (!channelData?.codeUrl) {
            alert('当前渠道尚未生成引流链接');
            return;
        }
        navigator.clipboard.writeText(channelData.codeUrl);
        alert('渠道专属引流短链已复制！');
    };

    const handleDownload = () => {
        if (!channelData?.codeUrl) {
            alert('当前渠道尚未生成二维码');
            return;
        }
        const link = document.createElement('a');
        link.href = channelData.codeUrl;
        link.download = `${channelType || 'channel'}-qr`;
        link.click();
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `${channelConfig.name} - ShopPro 获客码`,
                url: channelData?.codeUrl || window.location.href
            }).catch(() => {});
        } else {
            handleCopyLink();
        }
    };

    const handleSaveWelcome = async () => {
        if (!channelData?.id) {
            alert('请先创建并配置渠道码');
            return;
        }
        if (!welcomeMessage.trim()) {
            alert('欢迎语不能为空');
            return;
        }
        try {
            await acquisitionService.saveWelcomeMessage({
                channelCodeId: channelData.id,
                msgType: 'text',
                content: welcomeMessage.trim()
            });
            setIsEditingWelcome(false);
            alert('欢迎语配置已保存');
        } catch (error) {
            alert("保存失败，请检查网络连接");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans">
            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className={`bg-gradient-to-br ${channelConfig.bgGradient} pt-4 pb-8 px-4 border-b border-slate-200/60`}>
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <h1 className="text-base font-bold text-gray-900">{channelConfig.name} · 专属获客活码</h1>
                            <div className="w-10" />
                        </div>

                        {/* Large QR Code */}
                        <div className="flex justify-center">
                            <div className={`bg-white p-6 rounded-3xl shadow-lg ${channelConfig.borderColor} border-2`}>
                                <div className={`w-48 h-48 bg-gradient-to-br ${channelConfig.bgGradient} rounded-2xl flex items-center justify-center overflow-hidden`}>
                                    {channelData?.codeUrl ? (
                                        <img src={channelData.codeUrl} alt="QR Code" className="w-full h-full object-cover" />
                                    ) : (
                                        <QrCode className={`w-28 h-28 ${channelConfig.textColor}`} strokeWidth={1.8} />
                                    )}
                                </div>
                                <p className="text-center text-xs text-gray-500 mt-3 font-medium">扫码自动分配专属销售顾问</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 -mt-4 space-y-4">
                        {/* Action Buttons */}
                        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="flex flex-col items-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                                >
                                    <Download className="w-5 h-5 text-blue-600 mb-1" />
                                    <span className="text-xs font-bold text-gray-700">下载活码</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex flex-col items-center p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                                >
                                    <Share2 className="w-5 h-5 text-emerald-600 mb-1" />
                                    <span className="text-xs font-bold text-gray-700">一键分享</span>
                                </button>
                                <button
                                    onClick={handleCopyLink}
                                    className="flex flex-col items-center p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                                >
                                    <Copy className="w-5 h-5 text-purple-600 mb-1" />
                                    <span className="text-xs font-bold text-gray-700">复制短链</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Eye className="w-4 h-4 text-blue-500" />
                                </div>
                                <div className="text-xl font-black text-gray-900">{channelData?.scanCount ?? 0}</div>
                                <div className="text-[11px] text-gray-400 font-medium">今日扫码</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Users className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="text-xl font-black text-gray-900">{channelData?.followCount ?? 0}</div>
                                <div className="text-[11px] text-gray-400 font-medium">累计获客</div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <TrendingUp className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="text-xl font-black text-gray-900">
                                    {channelData?.scanCount ? ((channelData.followCount / channelData.scanCount) * 100).toFixed(1) + '%' : '暂无'}
                                </div>
                                <div className="text-[11px] text-gray-400 font-medium">加微转化率</div>
                            </div>
                        </div>

                        {/* Weekly Trend Chart */}
                        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
                            <h3 className="font-bold text-gray-900 text-xs mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                本周扫码加微趋势
                            </h3>
                            <div className="flex items-end justify-between h-24 gap-2">
                                {trendData.map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-md transition-all`}
                                            style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '8px' }}
                                        />
                                        <span className="text-[10px] text-gray-400 mt-1 font-medium">{item.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Welcome Message */}
                        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 text-xs flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-blue-600" />
                                    加微自动欢迎语
                                </h3>
                                {isEditingWelcome ? (
                                    <button
                                        onClick={handleSaveWelcome}
                                        className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        保存配置
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditingWelcome(true)}
                                        className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        编辑
                                    </button>
                                )}
                            </div>

                            {isEditingWelcome ? (
                                <textarea
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                    className="w-full p-3 bg-gray-50 rounded-xl text-xs text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed"
                                    rows={4}
                                />
                            ) : (
                                <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 leading-relaxed font-normal">
                                    {welcomeMessage || '尚未配置欢迎语'}
                                </div>
                            )}

                            {/* Preview */}
                            <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100/80">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[11px] font-bold text-emerald-800 mb-0.5">客户扫码添加企微后实时收到：</p>
                                        <p className="text-xs text-emerald-700 italic">{welcomeMessage ? `"${welcomeMessage}"` : '尚未配置，客户不会收到自动欢迎语'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChannelQRDetail;
