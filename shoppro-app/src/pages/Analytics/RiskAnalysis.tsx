import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertTriangle, UserMinus, Package, CheckCircle } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';

const RiskAnalysis: React.FC = () => {
    const navigate = useNavigate();
    const [risks, setRisks] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchRisks = async () => {
            try {
                const data = await analyticsService.getAnomalyAlerts();
                if (data && Array.isArray(data)) {
                    // Map backend data to frontend model
                    const mappedRisks = data.map((item: any, index: number) => {
                        let icon = AlertTriangle;
                        let type = 'other';

                        if (item.type === '库存预警') {
                            icon = Package;
                            type = 'inventory';
                        } else if (item.type === '客户流失风险') {
                            icon = UserMinus;
                            type = 'churn';
                        } else if (item.type === '业绩达成风险') {
                            icon = AlertTriangle;
                            type = 'target';
                        }

                        return {
                            id: index + 1,
                            type: type,
                            title: item.title || item.type, // Use specific title if available
                            desc: item.message,
                            level: item.severity === 'high' ? 'high' : 'medium',
                            icon: icon
                        };
                    });
                    setRisks(mappedRisks);
                }
            } catch (error) {
                console.error('Failed to fetch risk alerts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRisks();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-10 border-b border-gray-100">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 ml-2">风险预警分析</h1>
            </div>

            <div className="p-4 space-y-4">
                {/* Summary */}
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-red-900">当前存在 {risks.length} 个风险项</h3>
                        <p className="text-sm text-red-700 mt-1">建议立即处理高风险警报，以免造成客户流失。</p>
                    </div>
                </div>

                {/* Risk List */}
                <div className="space-y-3">
                    {risks.length > 0 ? risks.map((risk) => (
                        <div key={risk.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${risk.level === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                    <risk.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-gray-900">{risk.title}</h4>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${risk.level === 'high' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {risk.level === 'high' ? '高风险' : '中风险'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{risk.desc}</p>
                                    <button className="mt-3 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-lg transition-colors">
                                        查看详情
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-white rounded-xl text-gray-400">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />
                            <p>暂无风险需处理</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiskAnalysis;
