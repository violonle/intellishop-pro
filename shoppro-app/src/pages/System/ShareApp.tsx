import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2 } from 'lucide-react';

const ShareApp: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 ml-2">分享推荐</h1>
            </div>

            <div className="p-8 flex flex-col items-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center w-full max-w-sm">
                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-blue-100">
                        <Share2 className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">ShopPro 销售助手</h2>
                    <p className="text-gray-500 text-center text-sm mb-6">
                        邀请好友使用 ShopPro，提升团队销售效率
                    </p>

                    <div className="bg-gray-50 p-8 rounded-xl mb-6 border border-gray-100 text-center text-sm text-gray-500">
                        邀请链接尚未配置
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-6 w-full max-w-sm">
                    <button disabled className="flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
                        <div className="w-12 h-12 bg-[#07C160] rounded-full flex items-center justify-center text-white shadow-sm">
                            <span className="font-bold">微信</span>
                        </div>
                        <span className="text-xs text-gray-500">微信好友</span>
                    </button>
                    <button disabled className="flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white shadow-sm">
                            <div className="w-6 h-6 rounded-full border-2 border-white/50"></div>
                        </div>
                        <span className="text-xs text-gray-500">朋友圈</span>
                    </button>
                    <button disabled className="flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
                        <div className="w-12 h-12 bg-[#29A1F1] rounded-full flex items-center justify-center text-white shadow-sm">
                            <Share2 className="w-5 h-5" />
                        </div>
                        <span className="text-xs text-gray-500">更多</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareApp;
