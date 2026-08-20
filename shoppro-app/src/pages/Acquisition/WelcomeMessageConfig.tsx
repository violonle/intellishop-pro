import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { acquisitionService, type ChannelCode } from '../../services/acquisitionService';
import { type RootState } from '../../store';

const WelcomeMessageConfig: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [channels, setChannels] = useState<ChannelCode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        acquisitionService.listChannelCodes(Number(user.id))
            .then(setChannels)
            .catch(() => setChannels([]))
            .finally(() => setLoading(false));
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)}><ArrowLeft /></button>
                <h1 className="text-lg font-bold">欢迎语配置</h1>
                <div className="w-6" />
            </div>
            <div className="p-4 space-y-3">
                {loading ? <div className="text-center text-gray-400 py-10">加载中...</div> : channels.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">暂无渠道码，请先创建渠道码</div>
                ) : channels.map(channel => (
                    <button
                        key={channel.id}
                        onClick={() => channel.channelType
                            ? navigate(`/acquisition/channel/${channel.channelType}`)
                            : undefined}
                        disabled={!channel.channelType}
                        title={!channel.channelType ? '该渠道尚未配置渠道类型' : undefined}
                        className="w-full bg-white rounded-xl p-4 flex items-center gap-3 text-left shadow-sm"
                    >
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{channel.channelName}</span>
                        <span className={`ml-auto text-xs ${channel.channelType ? 'text-blue-600' : 'text-gray-400'}`}>
                            {channel.channelType ? '配置欢迎语' : '待配置渠道类型'}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WelcomeMessageConfig;
