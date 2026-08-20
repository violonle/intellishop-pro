import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, Bell, Shield, ArrowUpRight } from 'lucide-react';

const AIAlerts: React.FC = () => {
    const navigate = useNavigate();

    const [alerts, setAlerts] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchAlerts = async () => {
            try {
                // Dynamic import to avoid circular dependency issues if any, or just standard import
                const { analyticsService } = await import('../../services/analyticsService');
                const data = await analyticsService.getAnomalyAlerts();
                if (data && Array.isArray(data)) {
                    const mappedAlerts = data.map((item: any, index: number) => ({
                        id: index + 1,
                        title: item.title || item.type,
                        desc: item.message,
                        level: item.severity === 'high' ? 'high' : 'medium',
                        time: item.createdAt || item.updatedAt || '暂无时间'
                    }));
                    setAlerts(mappedAlerts);
                }
            } catch (error) {
                console.error('Failed to fetch alerts:', error);
            }
        };
        fetchAlerts();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header - White Style */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                            <AlertTriangle className="w-6 h-6" /> 智能预警引擎
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Overview - Cleaner card */}
                <div className="bg-white border border-orange-100 rounded-xl p-6 mb-8 flex items-start gap-5 shadow-sm">
                    <div className="p-3 bg-orange-50 rounded-xl text-orange-600 shadow-sm border border-orange-100">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">今日风险监控日报</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            当前已加载 <span className="font-bold text-gray-900">{alerts.length}</span> 条风险信息。
                            其中 <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{alerts.filter((alert) => alert.level === 'high').length} 条高优风险</span> 需要关注。
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/30">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-gray-500" />
                            <h3 className="font-bold text-gray-900">实时预警列表</h3>
                        </div>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full font-medium border border-red-100">
                                高风险 {alerts.filter((alert) => alert.level === 'high').length}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-medium border border-orange-100">
                                中风险 {alerts.filter((alert) => alert.level === 'medium').length}
                            </span>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${alert.level === 'high' ? 'bg-red-500 shadow-red-200 shadow' : alert.level === 'medium' ? 'bg-orange-500 shadow-orange-200 shadow' : 'bg-blue-500'}`}></div>
                                        <h4 className="font-bold text-gray-900 text-base group-hover:text-[#4640DE] transition-colors">{alert.title}</h4>
                                        {alert.level === 'high' && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold border border-red-100">重要</span>}
                                    </div>
                                    <span className="text-xs text-gray-400">{alert.time}</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-4 pl-5 leading-relaxed">{alert.desc}</p>
                                <div className="pl-5 flex gap-3">
                                    <button className="text-sm text-[#4640DE] font-medium hover:text-[#3733b5] flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                        查看详情 <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                    <button className="text-sm text-gray-500 font-medium hover:text-gray-700 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                        忽略
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAlerts;
