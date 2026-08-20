import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PhoneLogin: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isValid, setIsValid] = useState(false);

    // Check if this is the registration flow
    const isRegisterFlow = location.pathname.includes('register-phone');

    const validatePhone = (value: string) => {
        const phone = value.replace(/\D/g, '');
        setPhoneNumber(phone);
        setIsValid(phone.length === 11);
    };

    const handleContinue = () => {
        if (isValid) {
            // In a real app, you would send an API request here
            // Convert to format +86 138 0000 0000 for display/api
            localStorage.setItem('phoneNumber', phoneNumber);
            navigate('/verification', { state: { phone: phoneNumber, isRegister: isRegisterFlow } });
        }
    };

    // Auto focus
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans">
            {/* Back Button */}
            <div className="px-6 py-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 py-8">
                {/* Title Section */}
                <div className="animate-slide-in mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        {isRegisterFlow ? '输入手机号码' : '登录账户'}
                    </h1>
                    <p className="text-gray-500 text-base leading-relaxed">
                        {isRegisterFlow ?
                            '我们将向您的手机号码发送验证码\n以确保账户安全' :
                            '请输入您的手机号码\n我们将发送验证码进行身份验证'}
                    </p>
                </div>

                {/* Phone Input Section */}
                <div className="animate-slide-in delay-100 mb-8">
                    {/* Country Code Selector */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-900 mb-2">国家/地区</label>
                        <div className="relative">
                            <button className="w-full p-4 border border-gray-200 rounded-[30px] flex items-center justify-between bg-white hover:border-gray-300 transition-colors group">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">🇨🇳</span>
                                    <span className="text-gray-900 font-medium">中国</span>
                                    <span className="text-gray-500">+86</span>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Phone Number Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 mb-2">手机号码</label>
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => validatePhone(e.target.value)}
                                placeholder="请输入您的手机号码"
                                maxLength={11}
                                className="w-full p-4 border border-gray-200 rounded-[30px] text-gray-900 placeholder-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none"
                            />
                            {isValid && (
                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 animate-fade-in">
                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            请输入11位手机号码
                        </p>
                    </div>

                    {/* Terms for Register Flow */}
                    {isRegisterFlow && (
                        <div className="flex items-start space-x-3 mb-8">
                            <input type="checkbox" id="terms" className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary" />
                            <label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed">
                                我已阅读并同意 <button type="button" onClick={() => alert('【ShopPro AI CRM 服务条款】\n1. 严格遵守企业数据安全规范；\n2. 仅用于企业销售与业务流转；\n3. 系统提供全链路数据加密与权限隔离。')} className="text-primary font-medium underline">服务条款</button> 和 <button type="button" onClick={() => alert('【ShopPro 隐私政策】\n我们严格遵循国家合规与企业级数据隔离标准，绝不向第三方泄露您的客户资料与企业业务信息。')} className="text-primary font-medium underline">隐私政策</button>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="px-6 pb-8">
                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={!isValid}
                    className={`w-full py-4 rounded-[30px] font-semibold text-lg transition-all duration-200 active:scale-[0.98] ${isValid
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isRegisterFlow ? '继续' : '获取验证码'}
                </button>

                {/* Alternative Login */}
                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm mb-4">或者使用其他方式登录</p>
                    <button className="w-full border border-gray-200 py-4 rounded-[30px] flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors">
                        <span className="text-xl">🏢</span>
                        <span className="text-gray-900 font-medium">使用企业微信登录</span>
                    </button>
                </div>

                {/* Register Link */}
                {!isRegisterFlow && (
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            还没有账户？ <button onClick={() => navigate('/register')} className="text-primary font-medium hover:underline">立即注册</button>
                        </p>
                    </div>
                )}
                {/* Login Link for Register Flow */}
                {isRegisterFlow && (
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            已有账户？ <button onClick={() => navigate('/login')} className="text-primary font-medium hover:underline">立即登录</button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhoneLogin;
