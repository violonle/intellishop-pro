import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { acquisitionService, type ChannelCode } from '../../services/acquisitionService';
import { ArrowLeft, Plus, QrCode, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';

const ChannelCodeList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [codes, setCodes] = useState<ChannelCode[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            loadCodes();
        }
    }, [user?.id]);

    const loadCodes = async () => {
        try {
            const res = await acquisitionService.listChannelCodes(Number(user!.id));
            setCodes(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        const name = prompt("请输入渠道名称 (如: 微信-个人号)");
        if (name) {
            try {
                await acquisitionService.createChannelCode({
                    userId: Number(user!.id),
                    channelName: name
                });
                loadCodes();
            } catch (error) {
                alert("创建失败");
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("确定删除吗?")) {
            await acquisitionService.deleteChannelCode(id);
            loadCodes();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <button onClick={() => navigate(-1)}><ArrowLeft /></button>
                <h1 className="text-lg font-bold">渠道二维码</h1>
                <button onClick={handleCreate}><Plus /></button>
            </div>

            <div className="p-4 space-y-4">
                {codes.map(code => (
                    <div key={code.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <QrCode className="text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold">{code.channelName}</h3>
                                <p className="text-xs text-gray-500">{code.createdAt}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 text-gray-400 hover:text-red-500" onClick={() => handleDelete(code.id)}>
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
                {codes.length === 0 && !loading && (
                    <div className="text-center text-gray-400 mt-10">暂无渠道码</div>
                )}
            </div>
        </div>
    );
};

export default ChannelCodeList;
