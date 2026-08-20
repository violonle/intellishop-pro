import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const totalSteps = 5;

    useEffect(() => {
        // Check if already completed
        if (localStorage.getItem('onboardingCompleted') === 'true') {
            if (window.confirm('您已经完成过新手引导，是否直接进入主页？')) {
                navigate('/dashboard');
            }
        }
    }, [navigate]);

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSkip = () => {
        if (window.confirm('确定要跳过新手引导吗？您可以稍后在帮助中心重新查看。')) {
            navigate('/dashboard');
        }
    };

    const handleFinish = () => {
        localStorage.setItem('onboardingCompleted', 'true');
        navigate('/dashboard');
    };

    const steps = [
        {
            icon: '🚀',
            title: '欢迎使用 ShopPro',
            desc: '智能销售管理系统，让您的销售工作更高效、更智能。\n让我们用几分钟时间了解主要功能。',
            color: 'from-blue-500 to-indigo-600',
            bgIcon: 'bg-blue-100 text-blue-600'
        },
        {
            icon: '🧠',
            title: 'AI大脑',
            desc: '强大的AI引擎为您提供：智能话术推荐、用户画像分析、销售行为分析、数据统计分析。',
            color: 'from-purple-500 to-fuchsia-600',
            bgIcon: 'bg-purple-100 text-purple-600'
        },
        {
            icon: '👥',
            title: '客户管理',
            desc: '全方位的客户管理功能：客户档案、用户画像、跟进记录、智能提醒。',
            color: 'from-green-500 to-teal-600',
            bgIcon: 'bg-green-100 text-green-600'
        },
        {
            icon: '📊',
            title: '数据分析',
            desc: '查看线索、客户、跟进与销售结果等真实业务数据，帮助团队做出更及时的判断。',
            color: 'from-orange-500 to-red-600',
            bgIcon: 'bg-orange-100 text-orange-600'
        },
        {
            icon: '🏁',
            title: '准备就绪！',
            desc: '恭喜您完成了新手引导！现在可以开始使用 ShopPro 的强大功能了。',
            color: 'from-green-500 to-blue-600',
            bgIcon: 'bg-green-100 text-green-600',
            isFinal: true
        }
    ];

    const currentData = steps[step - 1];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col overflow-hidden font-sans">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
                <div
                    className="h-full bg-gradient-to-r from-[#4640DE] to-[#8B5CF6] transition-all duration-300 ease-out"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
            </div>

            {/* Skip Button */}
            {!currentData.isFinal && (
                <button onClick={handleSkip} className="fixed top-4 right-4 z-50 text-gray-500 hover:text-gray-700 transition-colors flex items-center bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50">
                    <span className="text-sm font-medium">跳过</span>
                    <span className="ml-1 text-lg">×</span>
                </button>
            )}

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center animate-fade-in-up">
                    {/* Icon */}
                    <div className="mb-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-2xl opacity-30 transform scale-150 animate-pulse"></div>
                        <div className={`w-24 h-24 mx-auto ${currentData.bgIcon} rounded-[2rem] flex items-center justify-center text-4xl shadow-xl transform transition-transform hover:scale-110 duration-300 relative z-10`}>
                            {currentData.icon}
                        </div>
                    </div>

                    {/* Text */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentData.title}</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed whitespace-pre-line text-lg">
                        {currentData.desc}
                    </p>

                    {/* Special Content for Step 2 */}
                    {step === 2 && (
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-8 text-left border border-gray-100">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">💬</span>
                                    <span className="text-gray-700 font-medium">智能话术推荐</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">👤</span>
                                    <span className="text-gray-700 font-medium">用户画像分析</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">📊</span>
                                    <span className="text-gray-700 font-medium">数据统计分析</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Special Content for Step 5 */}
                    {step === 5 && (
                        <div className="bg-white rounded-xl p-4 shadow-sm mb-8 text-left border border-gray-100 space-y-3">
                            <button onClick={() => navigate('/dashboard')} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 flex items-center space-x-3 group">
                                <span className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">📈</span>
                                <div>
                                    <div className="font-medium text-gray-900">查看数据看板</div>
                                    <div className="text-xs text-gray-500">了解业务概况</div>
                                </div>
                            </button>
                            <button onClick={() => navigate('/ai/brain')} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 flex items-center space-x-3 group">
                                <span className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">🧠</span>
                                <div>
                                    <div className="font-medium text-gray-900">体验AI大脑</div>
                                    <div className="text-xs text-gray-500">获取智能建议</div>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex space-x-3">
                        {step > 1 && (
                            <button
                                onClick={handlePrev}
                                className="flex-1 py-3 px-6 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                上一步
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium text-white shadow-lg transform transition-all active:scale-95 bg-gradient-to-r ${currentData.color} hover:shadow-xl hover:-translate-y-1`}
                        >
                            {currentData.isFinal ? '开始使用' : '下一步'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Dots */}
            <div className="pb-8 flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-[#4640DE]' : 'w-2 bg-gray-300'
                            }`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default Onboarding;
