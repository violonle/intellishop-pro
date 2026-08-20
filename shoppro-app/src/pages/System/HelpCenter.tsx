import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Headphones, ChevronDown, ChevronLeft } from 'lucide-react';

const HelpCenter: React.FC = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        { id: 1, q: "如何添加新的销售线索？", a: "您可以在'线索管理'页面点击右上角的'+ 新增线索'按钮，填写相关信息后保存即可。" },
        { id: 2, q: "系统支持导出数据吗？", a: "支持。在客户、线索、产品等列表页面的右上角通常都有'导出'按钮，支持导出为 Excel 格式。" },
        { id: 3, q: "忘记密码怎么办？", a: "请联系系统管理员重置密码，或在登录页面点击'忘记密码'通过验证码找回。" },
        { id: 4, q: "AI 推荐功能如何使用？", a: "在部分页面（如营销自动化、线索详情），点击'AI 洞察'或'智能推荐'按钮，系统会根据数据自动生成建议。" },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900">帮助中心</h1>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Search */}
                <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">有什么可以帮您？</h2>
                    <p className="text-sm text-gray-500 mb-4">搜索问题、功能介绍或常见疑问</p>
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#4640DE] transition-all outline-none"
                            placeholder="搜索关键词，如'导出'..."
                        />
                        <span className="absolute left-3 top-3 text-gray-400">
                            <Search className="w-5 h-5" />
                        </span>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-4 rounded-xl text-center cursor-pointer hover:bg-blue-100 transition-colors flex flex-col items-center">
                        <div className="mb-2 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="font-medium text-gray-900">使用手册</div>
                        <div className="text-xs text-gray-500 mt-1">查看详细文档</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-xl text-center cursor-pointer hover:bg-purple-100 transition-colors flex flex-col items-center">
                        <div className="mb-2 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                            <Headphones className="w-6 h-6" />
                        </div>
                        <div className="font-medium text-gray-900">联系客服</div>
                        <div className="text-xs text-gray-500 mt-1">在线咨询支持</div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">常见问题</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {faqs.map(faq => (
                            <div key={faq.id} className="bg-white transition-colors">
                                <button
                                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                                    className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                                >
                                    <span className="font-medium text-gray-800 text-sm">{faq.q}</span>
                                    <span className={`transform transition-transform text-gray-400 ${openFaq === faq.id ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-4 h-4" />
                                    </span>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === faq.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="px-4 pb-4 text-sm text-gray-600 bg-gray-50 pt-2">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback */}
                <div className="text-center py-4">
                    <p className="text-xs text-gray-500 mb-2">没找到想要的答案？</p>
                    <button className="text-[#4640DE] text-sm font-medium">
                        提交反馈或建议 →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
