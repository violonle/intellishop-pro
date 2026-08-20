import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobileContainer from '../../components/layout/MobileContainer';

const Splash: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MobileContainer>
            <div className="flex flex-col justify-center items-center px-6 relative overflow-hidden h-full">
                {/* Logo Section */}
                <div className="mb-24 flex flex-col items-center animate-fade-in-up">
                    <div className="flex items-center gap-1.5">
                        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-primary italic">Intelli</h1>
                        <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-[#1D1D1F]">Shop</h1>
                        <div className="bg-primary text-white text-sm font-bold px-2.5 py-0.5 rounded-md ml-1.5 self-start mt-1 shadow-sm shadow-blue-500/20">PRO</div>
                    </div>
                    <p className="text-sm text-slate-400 mt-3.5 font-medium tracking-wider">全域智能销售与营销决策平台</p>
                </div>

                {/* Buttons Section */}
                <div className="w-full max-w-sm space-y-4 animate-fade-in-up delay-100 px-4">
                    {/* Create Account Button */}
                    <button
                        onClick={() => navigate('/register')}
                        className="w-full text-white py-4 rounded-[30px] font-semibold text-lg transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-blue-200 bg-primary"
                    >
                        创建账户
                    </button>

                    {/* Log In Button */}
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-[#F5F5F7] text-[#1D1D1F] py-4 rounded-[30px] font-semibold text-lg hover:bg-gray-200 transition-all active:scale-95"
                    >
                        登录
                    </button>
                </div>

                {/* Footer Info */}
                <div className="absolute bottom-10 text-center text-xs text-gray-400">
                    Designed for ShopPro
                </div>
            </div>
        </MobileContainer>
    );
};

export default Splash;
