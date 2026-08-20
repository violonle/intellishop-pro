import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import wechatIcon from '../../assets/comwechat.png';
import MobileContainer from '../../components/layout/MobileContainer';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
            alert('请填写所有必填字段');
            return;
        }

        if (!formData.agreeToTerms) {
            alert('请同意服务条款和隐私政策');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('两次输入的密码不一致');
            return;
        }

        try {
            // 1. Register
            await authService.register({
                username: formData.phone, // 使用手机号作为用户名
                password: formData.password,
                realName: formData.name,
                phone: formData.phone,
                email: formData.email
            });

            // 2. Auto Login
            const loginResponse = await authService.login({
                username: formData.phone,
                password: formData.password,
                sysCode: 'APP'
            });

            // 3. Update Redux State & LocalStorage
            const user = {
                id: loginResponse.userId,
                username: loginResponse.username,
                role: loginResponse.role,
                realName: loginResponse.realName,
                avatarUrl: loginResponse.avatarUrl,
                phone: loginResponse.phone,
                email: loginResponse.email
            };
            dispatch(loginSuccess({ user, token: loginResponse.accessToken }));

            alert('注册成功！正在进入系统...');
            navigate('/dashboard');
        } catch (error: any) {
            alert(error.message || '注册失败，请重试');
        }
    };

    return (

        <MobileContainer>
            <div className="bg-white font-sans min-h-screen flex flex-col">
                <div className="px-6 py-4 flex-1">
                    {/* Back Button */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-12 h-12 border border-gray-200 rounded-[30px] flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>

                    {/* Title Section */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">创建账户</h1>
                        <p className="text-gray-400 text-base">请填写您的信息以创建新账户</p>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">姓名</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="请输入您的姓名"
                                    className="w-full border border-gray-200 rounded-[30px] bg-white px-4 py-4 text-primary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">手机号</label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="请输入手机号"
                                    className="w-full border border-gray-200 rounded-[30px] bg-white px-4 py-4 text-primary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">邮箱</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="请输入邮箱地址"
                                    className="w-full border border-gray-200 rounded-[30px] bg-white px-4 py-4 text-primary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">密码</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="请输入密码"
                                    className="w-full border border-gray-200 rounded-[30px] bg-white px-4 py-4 pr-12 text-primary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-3">确认密码</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="请再次输入密码"
                                    className="w-full border border-gray-200 rounded-[30px] bg-white px-4 py-4 pr-12 text-primary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 transition-all font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={showConfirmPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                className="mt-1 w-4 h-4 text-primary border-gray-200 rounded focus:ring-primary focus:ring-2"
                            />
                            <label className="text-sm text-gray-500">
                                我同意 <button type="button" onClick={() => alert('【ShopPro AI CRM 服务条款】\n1. 严格遵守企业数据安全规范；\n2. 仅用于企业销售与业务流转；\n3. 系统提供全链路数据加密与权限隔离。')} className="text-primary underline font-medium">服务条款</button> 和 <button type="button" onClick={() => alert('【ShopPro 隐私政策】\n我们严格遵循国家合规与企业级数据隔离标准，绝不向第三方泄露您的客户资料与企业业务信息。')} className="text-primary underline font-medium">隐私政策</button>
                            </label>
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-4 rounded-[30px] font-semibold text-lg mt-8 mb-6 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 active:scale-[0.98]"
                        >
                            创建账户
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center mb-6">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="px-4 text-gray-400 text-sm">或注册方式</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* WeChat Work Register Button */}
                    <button
                        onClick={() => console.log('WeChat Register')}
                        className="w-full bg-white border border-gray-200 py-4 rounded-[30px] flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all mb-6 active:scale-[0.98]"
                    >
                        <img src={wechatIcon} alt="企业微信" className="w-5 h-5" />
                        <span className="text-gray-900 font-medium">使用企业微信注册</span>
                    </button>

                    {/* Login Link */}
                    <div className="text-center pb-8">
                        <p className="text-sm text-gray-400">
                            已有账户？
                            <button onClick={() => navigate('/login')} className="text-primary font-medium ml-1 hover:underline">
                                立即登录
                            </button>
                        </p>
                    </div>
                </div>

                {/* Bottom Indicator */}
                <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 pointer-events-none">
                    <div className="w-32 h-1 bg-black rounded-full opacity-10"></div>
                </div>
            </div>
        </MobileContainer>
    );
};

export default Register;
