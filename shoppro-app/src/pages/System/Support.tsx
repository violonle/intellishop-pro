import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, MessageCircle, Mail } from 'lucide-react';

const Support: React.FC = () => {
    const navigate = useNavigate();

    const ContactItem: React.FC<{ icon: React.ReactNode; label: string; value: string; action: string; color: string }> = ({ icon, label, value, action, color }) => (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
                    {icon}
                </div>
                <div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-500">{value}</div>
                </div>
            </div>
            <button className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-lg font-medium hover:bg-gray-100 transition-colors">
                {action}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 ml-2">联系客服</h1>
            </div>

            <div className="p-4 space-y-4">
                <div className="bg-[#4640DE] rounded-xl p-6 text-white text-center mb-6 shadow-lg shadow-[#4640DE]/20">
                    <h2 className="text-2xl font-bold mb-2">我们随时为您服务</h2>
                    <p className="text-white/80 text-sm">工作时间: 周一至周日 9:00 - 21:00</p>
                </div>

                <div className="space-y-3">
                    <ContactItem
                        icon={<Phone className="w-5 h-5 text-green-600" />}
                        label="电话客服"
                        value="联系方式未配置"
                        action="未配置"
                        color="bg-green-100"
                    />
                    <ContactItem
                        icon={<MessageCircle className="w-5 h-5 text-blue-600" />}
                        label="在线咨询"
                        value="服务渠道未配置"
                        action="未配置"
                        color="bg-blue-100"
                    />
                    <ContactItem
                        icon={<Mail className="w-5 h-5 text-purple-600" />}
                        label="邮件反馈"
                        value="联系方式未配置"
                        action="未配置"
                        color="bg-purple-100"
                    />
                </div>

                <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-500 mb-3 px-1">常见问题</h3>
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {[
                            '如何修改登录密码？',
                            '数据导出功能在哪里？',
                            '如何添加新的团队成员？'
                        ].map((q, i) => (
                            <div key={i} className="p-4 border-b border-gray-100 last:border-0 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                                <span className="text-sm text-gray-700">{q}</span>
                                <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;
