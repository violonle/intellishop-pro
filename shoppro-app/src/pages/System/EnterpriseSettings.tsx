import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, Users, Save, ShieldCheck, Plus, Trash2, Edit2 } from 'lucide-react';
import systemService, { type Enterprise, type Role } from '../../services/systemService';
import type { User } from '../../services/authService';

const EnterpriseSettings: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'enterprise' | 'team'>('enterprise');
    const [loading, setLoading] = useState(false);

    // Enterprise State
    const [enterprise, setEnterprise] = useState<Partial<Enterprise>>({
        name: '',
        shortName: '',
        isCertified: false
    });

    // Team State
    const [positions, setPositions] = useState<Role[]>([]);
    const [staffList, setStaffList] = useState<User[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [entRes, rolesRes, staffRes] = await Promise.all([
                systemService.getEnterpriseInfo().catch(() => ({ name: '未命名企业', shortName: '', isCertified: false } as Enterprise)),
                systemService.getRoles().catch(() => [] as Role[]),
                systemService.getStaffList().catch(() => ({ records: [], total: 0 }))
            ]);

            if (entRes) setEnterprise(entRes);
            if (Array.isArray(rolesRes)) setPositions(rolesRes);

            // Handle staff list response structure
            if (staffRes && 'records' in staffRes) {
                setStaffList(staffRes.records);
            } else if (Array.isArray(staffRes)) {
                setStaffList(staffRes);
            }

        } catch (error) {
            console.error('Failed to fetch system settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const [showAddStaffModal, setShowAddStaffModal] = useState(false);
    const [newStaff, setNewStaff] = useState<Partial<User> & { target?: any; password?: string }>({
        target: { weekly: 0, monthly: 0, quarterly: 0 }
    });

    const handleSaveEnterprise = async () => {
        try {
            await systemService.updateEnterpriseInfo(enterprise);
            alert('企业设置已保存');
        } catch (error) {
            alert('保存失败');
        }
    };

    const handleSavePosition = async (id: number, newName: string) => {
        try {
            await systemService.updateRole(id, { name: newName });
            setPositions(positions.map(p => p.id === id ? { ...p, name: newName } : p));
        } catch (error) {
            console.error('Failed to update position', error);
        }
    };

    const handleAddStaff = async () => {
        if (newStaff.realName && newStaff.phone && newStaff.password) {
            try {
                // Ensure targets are properly formatted
                const staffData = {
                    ...newStaff,
                    username: newStaff.phone, // Use phone as username default
                    password: newStaff.password,
                    salesTargets: newStaff.target // Map temporary target field to salesTargets
                };

                await systemService.addStaff(staffData);

                // Refresh list
                const res = await systemService.getStaffList();
                setStaffList(res.records);

                setShowAddStaffModal(false);
                setNewStaff({ target: { weekly: 0, monthly: 0, quarterly: 0 } });
            } catch (error) {
                alert('添加员工失败');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-safe">
            {/* Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 ml-2">企业设置 {loading && <span className="text-sm font-normal text-gray-400 ml-2">(加载中...)</span>}</h1>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white px-4 border-b border-gray-200 sticky top-[57px] z-10">
                <div className="flex space-x-6">
                    <button
                        onClick={() => setActiveTab('enterprise')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'enterprise'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Building2 className="w-4 h-4 mr-2" />
                        企业信息
                    </button>
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'team'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        团队设置
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {activeTab === 'enterprise' ? (
                    /* Enterprise Tab */
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <h3 className="text-base font-bold text-gray-900 mb-4">基本信息</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">企业名称</label>
                                    <input
                                        type="text"
                                        value={enterprise.name}
                                        onChange={(e) => setEnterprise({ ...enterprise, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">企业简称</label>
                                    <input
                                        type="text"
                                        value={enterprise.shortName}
                                        onChange={(e) => setEnterprise({ ...enterprise, shortName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={handleSaveEnterprise}
                                    className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center justify-center"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    保存基本信息
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <h3 className="text-base font-bold text-gray-900 mb-4">企业认证</h3>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${enterprise.isCertified ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                        <ShieldCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {enterprise.isCertified ? '已认证' : '未认证'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {enterprise.isCertified ? '企业身份已核验' : '完成认证解锁更多权益'}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/enterprise/certification')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${enterprise.isCertified
                                        ? 'text-green-600 bg-green-50 hover:bg-green-100'
                                        : 'text-primary bg-blue-50 hover:bg-blue-100'
                                        }`}
                                >
                                    {enterprise.isCertified ? '查看详情' : '去认证'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Team Tab */
                    <div className="space-y-4">
                        {/* Position Settings */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <h3 className="text-base font-bold text-gray-900 mb-4">职位设置 (三级架构)</h3>
                            <div className="space-y-3">
                                {positions.map((pos) => (
                                    <div key={pos.id} className="flex items-center space-x-3">
                                        <span className="text-xs font-medium text-gray-500 w-12">{pos.levelName}</span>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={pos.name}
                                                onChange={(e) => handleSavePosition(pos.id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all pr-8"
                                            />
                                            <Edit2 className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Staff Management */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-base font-bold text-gray-900">人员管理</h3>
                                <button
                                    onClick={() => setShowAddStaffModal(true)}
                                    className="text-sm text-primary font-medium hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    新增人员
                                </button>
                            </div>

                            <div className="space-y-3">
                                {staffList.map((staff) => (
                                    <div key={staff.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-gray-900 flex items-center">
                                                    {staff.realName || staff.username}
                                                    <span className="ml-2 px-1.5 py-0.5 bg-white text-xs text-gray-500 border border-gray-200 rounded">
                                                        {staff.role}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">{staff.phone}</div>
                                            </div>
                                            <button className="text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {/* Display targets if available (User entity usually JSON string or mapped object) 
                                            We need to safely handle if salesTargets is string or object.
                                        */}
                                        <div className="grid grid-cols-3 gap-2 text-xs border-t border-gray-200 pt-2 mt-2">
                                            <div>
                                                <span className="text-gray-400 block">周任务</span>
                                                <span className="font-medium text-gray-900">¥{(staff.salesTargets as any)?.weekly || 0}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block">月任务</span>
                                                <span className="font-medium text-gray-900">¥{(staff.salesTargets as any)?.monthly || 0}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-400 block">季任务</span>
                                                <span className="font-medium text-gray-900">¥{(staff.salesTargets as any)?.quarterly || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Staff Modal */}
            {showAddStaffModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl animate-scale-in">
                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">新增人员</h3>
                            <button onClick={() => setShowAddStaffModal(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">姓名</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                    value={newStaff.realName || ''}
                                    onChange={e => setNewStaff({ ...newStaff, realName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">手机号</label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                    value={newStaff.phone || ''}
                                    onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">职位</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                                    value={newStaff.role || ''}
                                    onChange={e => {
                                        const selectedRole = positions.find(p => p.id === Number(e.target.value));
                                        // Store role code/name, assuming role.name or role.code is what we save
                                        // Since User.role is string, we save the role ID or Code. 
                                        // BE uses string, let's use role name or a mapped code.
                                        setNewStaff({ ...newStaff, role: selectedRole ? (selectedRole.name === '销售经理' ? 'manager' : 'sales') : 'user' });
                                    }}
                                >
                                    <option value="">请选择</option>
                                    {positions.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">初始密码</label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                    value={newStaff.password || ''}
                                    onChange={e => setNewStaff({ ...newStaff, password: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">周任务</label>
                                    <input
                                        type="number"
                                        className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm"
                                        value={newStaff.target?.weekly}
                                        onChange={e => setNewStaff({
                                            ...newStaff,
                                            target: { ...newStaff.target!, weekly: Number(e.target.value) }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">月任务</label>
                                    <input
                                        type="number"
                                        className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm"
                                        value={newStaff.target?.monthly}
                                        onChange={e => setNewStaff({
                                            ...newStaff,
                                            target: { ...newStaff.target!, monthly: Number(e.target.value) }
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">季任务</label>
                                    <input
                                        type="number"
                                        className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm"
                                        value={newStaff.target?.quarterly}
                                        onChange={e => setNewStaff({
                                            ...newStaff,
                                            target: { ...newStaff.target!, quarterly: Number(e.target.value) }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex space-x-3">
                            <button
                                onClick={() => setShowAddStaffModal(false)}
                                className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAddStaff}
                                className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
                            >
                                确认添加
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnterpriseSettings;
