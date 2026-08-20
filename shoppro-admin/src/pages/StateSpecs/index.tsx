import React from 'react';
import { Button } from 'antd';
import { FileQuestion, Lock, SearchX, WifiOff, RotateCcw, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StateSpecsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    页面状态规范
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    统一页面空状态、无权限、404 及加载失败的展示规范，便于前端统一实现。
                </p>
            </div>

            {/* 3 列状态卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. 数据为空 */}
                <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm text-center flex flex-col justify-between min-h-[360px]">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                        <span className="text-xs font-bold text-slate-500">数据为空</span>
                    </div>

                    <div className="py-6 space-y-3">
                        <FileQuestion className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" strokeWidth={1.8} />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">暂无数据</h3>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            当前筛选条件下没有匹配记录
                        </p>
                    </div>

                    <div className="flex justify-center gap-3">
                        <Button className="!rounded-xl !text-xs">
                            清除筛选
                        </Button>
                        <Button type="primary" icon={<Plus className="w-3.5 h-3.5" />} className="!rounded-xl !bg-blue-600 !text-xs">
                            新建记录
                        </Button>
                    </div>
                </div>

                {/* 2. 无权限 */}
                <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm text-center flex flex-col justify-between min-h-[360px]">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                        <span className="text-xs font-bold text-slate-500">无权限</span>
                    </div>

                    <div className="py-6 space-y-3">
                        <Lock className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" strokeWidth={1.8} />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">暂无访问权限</h3>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            请联系企业管理员申请数据访问权限
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <Button onClick={() => navigate('/dashboard')} className="!rounded-xl !text-xs !px-6">
                            返回工作台
                        </Button>
                    </div>
                </div>

                {/* 3. 404 */}
                <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm text-center flex flex-col justify-between min-h-[360px]">
                    <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                        <span className="text-xs font-bold text-slate-500">页面不存在 / 404</span>
                    </div>

                    <div className="py-6 space-y-3">
                        <SearchX className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto" strokeWidth={1.8} />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">页面不存在</h3>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            你访问的页面可能已被移动或删除
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <Button type="primary" onClick={() => navigate('/dashboard')} className="!rounded-xl !bg-blue-600 !text-xs !px-6">
                            返回首页
                        </Button>
                    </div>
                </div>
            </div>

            {/* 4. 加载失败 */}
            <div className="bg-white dark:bg-[#111622] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <WifiOff className="w-10 h-10 text-rose-500 flex-shrink-0" strokeWidth={2} />
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">加载失败</h4>
                        <p className="text-xs text-slate-400 mt-0.5">网络开小差了，请检查网络后重试</p>
                    </div>
                </div>

                <Button
                    icon={<RotateCcw className="w-3.5 h-3.5" />}
                    onClick={() => window.location.reload()}
                    className="!rounded-xl !text-xs !px-6 !h-9"
                >
                    重新加载
                </Button>
            </div>
        </div>
    );
};

export default StateSpecsPage;
