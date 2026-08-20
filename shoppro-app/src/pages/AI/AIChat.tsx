import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Sparkles, User, Bot, RefreshCw } from 'lucide-react';
import { aiService } from '../../services/aiService';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isTyping?: boolean;
}

const AIChat: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: '你好！我是 ShopPro 智能销售助理。我可以帮你分析客户画像、评估线索价值、生成营销话术，或者解答关于销售数据的任何问题。',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isSending) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsSending(true);

        const loadingMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, {
            id: loadingMsgId,
            role: 'assistant',
            content: 'Thinking...',
            timestamp: new Date(),
            isTyping: true
        }]);

        try {
            const response = await aiService.chat(userMsg.content);

            setMessages(prev => prev.map(msg =>
                msg.id === loadingMsgId
                    ? { ...msg, content: response, isTyping: false }
                    : msg
            ));
        } catch (error) {
            setMessages(prev => prev.map(msg =>
                msg.id === loadingMsgId
                    ? { ...msg, content: '抱歉，我现在遇到一点连接问题，请稍后再试。', isTyping: false }
                    : msg
            ));
        } finally {
            setIsSending(false);
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        setInputValue(prompt);
        // Optional: auto-send
        // handleSend();
    };

    const quickPrompts = [
        "分析今日的高意向线索",
        "生成一份针对Model Y的营销话术",
        "目前销售团队的业绩瓶颈在哪里？",
        "解读最新的风险预警信息"
    ];

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col pb-safe">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                                <Sparkles className="w-5 h-5 text-primary" />
                                AI 销售助理
                            </h1>
                            <p className="text-xs text-green-600 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                在线
                            </p>
                        </div>
                    </div>
                    <div>
                        <button onClick={() => setMessages([messages[0]])} className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="清空对话">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 bg-gray-50/50">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white text-primary border border-gray-100'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
                            </div>
                            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-primary text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                    }`}>
                                    {msg.isTyping ? (
                                        <div className="flex space-x-1 h-5 items-center">
                                            <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    ) : (
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1 px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-100 p-4 pb-8 sticky bottom-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="max-w-3xl mx-auto">
                    {/* Quick Prompts - only show if messages are few or user hasn't typed */}
                    {messages.length < 3 && (
                        <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
                            {quickPrompts.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickPrompt(prompt)}
                                    className="whitespace-nowrap px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-colors duration-200"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary block w-full p-4 pl-5 shadow-sm outline-none transition-all"
                            placeholder="输入您的问题..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isSending}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isSending}
                            className={`p-4 rounded-xl transition-all shadow-md ${inputValue.trim() && !isSending
                                ? 'bg-primary hover:bg-primary-dark text-white transform hover:scale-105 active:scale-95'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
