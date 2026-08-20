import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronLeft, Save, Camera } from 'lucide-react';
import { type RootState } from '../../store';
import { loginSuccess } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import type { User } from '../../services/authService';

const ProfileEdit: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, token } = useSelector((state: RootState) => state.auth);

    const [realName, setRealName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setRealName(user.realName || '');
            setPhone(user.phone || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSave = async () => {
        if (!user || !user.id) return;
        setLoading(true);
        setMessage(null);

        try {
            const updatedData: Partial<User> = {
                realName,
                phone,
                email
            };

            // Backend update
            const updatedUser = await authService.updateProfile(user.id, updatedData);

            // Redux store update - preserve role and token
            // Ensure token is passed if required by slice, though often we just update user
            if (token) {
                dispatch(loginSuccess({ user: { ...user, ...updatedUser }, token }));
            }

            setMessage({ type: 'success', text: '保存成功' });
            setTimeout(() => navigate(-1), 1000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || '保存失败' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="p-4">请先登录</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            {/* Header */}
            <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-200">
                <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">编辑资料</h1>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="text-primary font-medium text-sm flex items-center hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-1" />
                    {loading ? '保存中...' : '保存'}
                </button>
            </div>

            <div className="p-4 space-y-6 max-w-lg mx-auto">
                {/* Message Toast */}
                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* Avatar */}
                <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-gray-400">{user.realName?.[0] || user.username?.[0]}</span>
                            )}
                        </div>
                        <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full text-primary border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">用户名 (不可修改)</label>
                            <input
                                type="text"
                                value={user.username}
                                disabled
                                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">姓名</label>
                            <input
                                type="text"
                                value={realName}
                                onChange={(e) => setRealName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">手机号</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">邮箱</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-1.5">角色</label>
                            <input
                                type="text"
                                value={user.role}
                                disabled
                                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-500 cursor-not-allowed uppercase"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileEdit;
