import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UserPlus, Phone } from 'lucide-react';
import systemService from '../../services/systemService';
import analyticsService from '../../services/analyticsService';
import type { User } from '../../services/authService';

const TeamManagement: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [staffList, setStaffList] = useState<User[]>([]);
    const [rankings, setRankings] = useState<Record<string, number>>({});
    const [stats, setStats] = useState({ totalMembers: 0, totalSales: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffRes, rankRes, dashboardRes] = await Promise.all([
                systemService.getStaffList(1, 100), // Get all staff
                analyticsService.getSalesPersonRanking(100),
                analyticsService.getSalesDashboard()
            ]);

            if (staffRes && staffRes.records) {
                setStaffList(staffRes.records);
                setStats(prev => ({ ...prev, totalMembers: staffRes.total }));
            }

            // Map ranking data for easy lookup
            const rankMap: Record<string, number> = {};
            if (Array.isArray(rankRes)) {
                rankRes.forEach(item => {
                    // Assuming item.name is username or realName, ideally item.userId is better
                    rankMap[item.name] = item.value;
                    // If item has userId, use that. Backend: List<Map<String, Object>>
                });
            }
            setRankings(rankMap);

            if (dashboardRes && dashboardRes.totalSales) {
                setStats(prev => ({ ...prev, totalSales: dashboardRes.totalSales }));
            }

        } catch (error) {
            console.error('Failed to fetch team data', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-100">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900 ml-2">团队管理 {loading && <span className="text-sm font-normal text-gray-400 ml-2">(加载中...)</span>}</h1>
                </div>
                <button className="text-[#10B981] text-sm font-medium flex items-center">
                    <UserPlus className="w-4 h-4 mr-1" />
                    添加
                </button>
            </div>

            <div className="p-4">
                <div className="mb-4 flex gap-4">
                    <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border-t-4 border-[#10B981]">
                        <div className="text-xs text-gray-500 mb-1">团队总人数</div>
                        <div className="text-xl font-bold text-gray-900">{stats.totalMembers}</div>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border-t-4 border-blue-500">
                        <div className="text-xs text-gray-500 mb-1">本月总业绩</div>
                        <div className="text-xl font-bold text-gray-900">¥{(stats.totalSales / 10000).toFixed(1)}w</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 font-medium text-gray-900">
                        成员列表
                    </div>
                    <div className="divide-y divide-gray-100">
                        {staffList.map(member => (
                            <div key={member.id} className="p-4 flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold mr-3 overflow-hidden">
                                    {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover" /> : (member.realName?.[0] || member.username?.[0])}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <div className="font-medium text-gray-900 mr-2">{member.realName || member.username}</div>
                                        <span className={`w-2 h-2 rounded-full ${member.status !== 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {member.role === 'super_admin' ? '超级管理员' :
                                            member.role === 'platform_admin' ? '平台管理员' :
                                                member.role === 'enterprise_admin' ? '企业管理员' :
                                                    member.role === 'admin' ? '管理员' :
                                                        member.role === 'manager' ? '经理' :
                                                            member.role === 'sales' ? '销售顾问' :
                                                                member.role === 'user' ? '用户' : '未知角色'}
                                    </div>
                                </div>
                                <div className="text-right mr-4">
                                    <div className="text-sm font-bold text-gray-900">¥{rankings[member.realName || member.username] || 0}</div>
                                    <div className="text-xs text-gray-400">业绩</div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => window.location.href = `tel:${member.phone}`}
                                        className="p-2 text-gray-400 hover:text-blue-500 bg-gray-50 rounded-lg"
                                    >
                                        <Phone className="w-4 h-4" />
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

export default TeamManagement;
