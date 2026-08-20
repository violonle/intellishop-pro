import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, clearError } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import { type RootState } from '../../store';
import logoImg from '../../assets/logo.png';
import MobileContainer from '../../components/layout/MobileContainer';
import { Shield, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState<string | null>(null);

    const handleLogin = async (e?: React.FormEvent | React.MouseEvent, overrideUser?: string, overridePwd?: string) => {
        if (e) e.preventDefault();
        dispatch(clearError());
        setSuccess(null);

        const targetUser = overrideUser || username.trim();
        const targetPwd = overridePwd || password;

        if (!targetUser) {
            dispatch(loginFailure('请输入用户名、邮箱或手机号'));
            return;
        }
        if (!targetPwd) {
            dispatch(loginFailure('请输入密码'));
            return;
        }

        dispatch(loginStart());

        try {
            const response = await authService.login({ username: targetUser, password: targetPwd, sysCode: 'APP' });
            if (!response?.accessToken) throw new Error('登录响应无效');
            const userObj = {
                id: response.userId,
                username: response.username,
                realName: response.realName || response.username,
                avatarUrl: response.avatarUrl,
                role: response.role,
                phone: response.phone,
                email: response.email,
                status: 1
            };
            dispatch(loginSuccess({ user: userObj, token: response.accessToken }));

            setSuccess('登录成功，正在进入销售智能工作台...');
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 300);

        } catch (err: any) {
            const errorMsg = err.message || '登录失败，请检查账号密码';
            dispatch(loginFailure(errorMsg));
        }
    };

    return (
        <MobileContainer>
            <div className="bg-slate-50 font-sans min-h-screen flex flex-col justify-between p-6">
                <div>
                    {/* Header Logo */}
                    <div className="pt-8 pb-6 flex items-center gap-3">
                        <img src={logoImg} alt="ShopPro Logo" className="w-10 h-10 object-contain" />
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">ShopPro 移动工作台</h1>
                            <p className="text-xs text-slate-400 font-medium">AI 驱动的一体化销售智能 CRM</p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">销售账号 / 手机号</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="请输入用户名、邮箱或手机号"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-bold text-slate-700">登录密码</label>
                                <span className="text-[11px] text-slate-400">请使用管理员分配的密码</span>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="请输入密码"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>

                        {/* Error & Success Alerts */}
                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium animate-fade-in">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium animate-fade-in">
                                {success}
                            </div>
                        )}

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white py-3.5 rounded-xl font-bold text-xs shadow-sm shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <span>正在验证并加载工作台...</span>
                            ) : (
                                <>
                                    <span>登录进入销售工作台</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>

                </div>

                {/* Footer Security Badge */}
                <div className="py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span>ShopPro Enterprise Data Security Guard</span>
                    </div>
                </div>
            </div>
        </MobileContainer>
    );
};

export default Login;
