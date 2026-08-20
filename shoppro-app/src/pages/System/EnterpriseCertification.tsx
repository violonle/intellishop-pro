import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Upload, AlertCircle } from 'lucide-react';

const EnterpriseCertification: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 ml-2">企业认证</h1>
                </div>
            </div>

            <div className="p-4 space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-primary text-sm mb-1">为什么需要企业认证？</h3>
                        <p className="text-xs text-blue-800 leading-relaxed">
                            完成企业认证后，您将获得"已认证"标识，提升客户信任度。同时解锁更多高级功能，包括无限量席位、高级数据分析报表等权益。
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">上传认证资料</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">营业执照</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <span className="text-sm text-gray-600 font-medium">点击上传营业执照</span>
                                <span className="text-xs text-gray-400 mt-1">支持 JPG, PNG, PDF 格式 (最大5MB)</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">法人身份证 (人像面)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <span className="text-sm text-gray-600 font-medium">点击上传身份证正面</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-xs mb-4 border border-amber-100">
                            <AlertCircle className="w-4 h-4 ml-2" />
                            <span>提交后我们将在 1-3 个工作日内完成审核</span>
                        </div>
                        <button className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-sm">
                            提交认证申请
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnterpriseCertification;
