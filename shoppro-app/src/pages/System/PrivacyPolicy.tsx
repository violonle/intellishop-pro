import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 ml-2">隐私保护</h1>
            </div>

            <div className="p-4">
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-16 h-16 bg-[#F59E0B]/10 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-8 h-8 text-[#F59E0B]" />
                        </div>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900">隐私政策摘要</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        ShopPro 非常重视您的隐私。本隐私政策旨在说明我们如何收集、使用和披露您的个人信息。
                    </p>

                    <h3 className="font-semibold text-gray-900 pt-2">1. 信息收集</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        我们收集的信息包括但不限于您的姓名、联系方式、设备信息以及您在使用我们服务过程中产生的数据。
                    </p>

                    <h3 className="font-semibold text-gray-900 pt-2">2. 信息使用</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        我们会使用您的信息来提供、维护和改进我们的服务，包括个性化推荐、客户支持和安全保障。
                    </p>

                    <h3 className="font-semibold text-gray-900 pt-2">3. 信息共享</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        除非征得您的同意或法律法规另有规定，我们不会向第三方出售或共享您的个人信息。
                    </p>

                    <div className="pt-4 text-xs text-gray-400 text-center">
                        更新日期: 2024年12月17日
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
