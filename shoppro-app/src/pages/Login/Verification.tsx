import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Verification: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [code, setCode] = useState(['', '', '', '']);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // Get phone from state or local storage
    const statePhone = location.state?.phone;
    const isRegister = location.state?.isRegister;
    const [displayPhone, setDisplayPhone] = useState(statePhone || '');

    useEffect(() => {
        if (!displayPhone) {
            const stored = localStorage.getItem('phoneNumber');
            if (stored) setDisplayPhone(stored);
        }
        // Focus first input
        if (inputsRef.current[0]) {
            inputsRef.current[0].focus();
        }
    }, [displayPhone]);

    const handleInput = (index: number, value: string) => {
        // Only allow numbers
        const val = value.replace(/[^0-9]/g, '');
        if (!val) {
            // Handle deletion
            const newCode = [...code];
            newCode[index] = '';
            setCode(newCode);
            return;
        }

        const newCode = [...code];
        newCode[index] = val.slice(-1); // Take last char if multiple
        setCode(newCode);

        // Move to next input
        if (index < 3 && val) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            // Move back on backspace if empty
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
        if (pastedData) {
            const newCode = [...code];
            pastedData.split('').forEach((char, i) => {
                if (i < 4) newCode[i] = char;
            });
            setCode(newCode);
            // Focus appropriate input
            const nextIndex = Math.min(pastedData.length, 3);
            inputsRef.current[nextIndex]?.focus();
        }
    };

    const isComplete = code.every(c => c !== '');

    const handleContinue = () => {
        if (isComplete) {
            const verificationCode = code.join('');
            console.log('Verifying code:', verificationCode);

            // Navigate based on flow
            if (isRegister) {
                navigate('/register');
            } else {
                navigate('/dashboard'); // Or wherever login goes
            }
        }
    };

    const handleResend = () => {
        alert('验证码已重新发送');
        setCode(['', '', '', '']);
        inputsRef.current[0]?.focus();
    };

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
            <div className="flex-1 px-6">
                {/* Title Section */}
                <div className="animate-slide-in mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">验证码</h1>
                    <p className="text-gray-500 text-base leading-relaxed">
                        我们已向您的手机号码发送验证码<br />
                        {displayPhone ? `(+86) ${displayPhone.slice(0, 3)}-****-${displayPhone.slice(-4)}` : '(+86) ...'}
                    </p>
                </div>

                {/* Verification Code Input */}
                <div className="animate-slide-in delay-100 mb-8">
                    <div className="flex justify-center space-x-4 mb-6">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputsRef.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInput(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className={`w-[60px] h-[60px] rounded-[60px] border text-center text-2xl font-normal text-gray-900 focus:outline-none transition-all duration-200 ${digit
                                    ? 'bg-white border-[#6366F1] shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'
                                    : 'bg-[#F8F9FA] border-[#E5E7EB] focus:bg-white focus:border-[#6366F1] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]'
                                    }`}
                            />
                        ))}
                    </div>

                    <p className="text-center text-gray-500 text-sm mb-6">
                        没有收到验证码？ <button onClick={handleResend} className="text-[#4640DE] font-medium hover:underline">重新发送</button>
                    </p>
                </div>

                {/* Continue Button */}
                <div className="animate-slide-in delay-200 mb-8">
                    <button
                        onClick={handleContinue}
                        disabled={!isComplete}
                        className={`w-full py-4 rounded-[30px] font-semibold text-lg transition-all duration-200 active:scale-[0.98] ${isComplete
                            ? 'bg-[#4640DE] text-white shadow-lg shadow-[#4640DE]/20 hover:bg-[#3b36db]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        继续
                    </button>
                </div>
            </div>

            {/* Bottom Spacing */}
            <div className="pb-8"></div>
        </div>
    );
};

export default Verification;
