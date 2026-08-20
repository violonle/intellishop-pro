import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { http } from '../../services/http';

interface Lead {
    id: number;
    title: string;
    description: string;
    priority: string;
    source: string;
    status: string;
    stage: string;
    assignedTo: number | null;
    assignedToName: string | null;
}

interface SalesPerson {
    id: number;
    name: string;
    position: string;
}

const LeadAssign: React.FC = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [salesPeople, setSalesPeople] = useState<SalesPerson[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
    const [mode, setMode] = useState<'single' | 'batch'>('single');
    const [showModal, setShowModal] = useState(false);
    const [currentLeadId, setCurrentLeadId] = useState<number | null>(null);
    const [assignee, setAssignee] = useState<number | ''>('');
    const [batchAssignee, setBatchAssignee] = useState<number | ''>('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leadsData, usersData] = await Promise.all([
                http.get<any>('/leads/list', { params: { pageNo: 1, pageSize: 100 } }),
                http.get<any>('/users/list', { params: { pageNo: 1, pageSize: 100, role: 'sales' } })
            ]);
            setLeads(leadsData.records || []);
            setSalesPeople((usersData.records || usersData || []).map((user: any) => ({
                id: user.id,
                name: user.realName || user.username,
                position: user.role || '销售专员'
            })));
        } catch (error) {
            console.error('获取数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const assignLead = async (leadId: number, userId: number) => {
        setSubmitting(true);
        try {
            await http.post(`/leads/${leadId}/assign`, null, { params: { assignTo: userId } });
            return true;
        } catch (error) {
            console.error('分配失败:', error);
            alert('分配失败，请重试');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const batchAssignLeads = async (leadIds: number[], userId: number) => {
        setSubmitting(true);
        try {
            await http.post('/leads/batch-assign', leadIds, { params: { assignTo: userId } });
            return true;
        } catch (error) {
            console.error('批量分配失败:', error);
            alert('批量分配失败，请重试');
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.title.includes(searchTerm) || lead.description.includes(searchTerm);
        const matchesPriority = priorityFilter ? lead.priority === priorityFilter : true;
        const matchesSource = sourceFilter ? lead.source === sourceFilter : true;
        return matchesSearch && matchesPriority && matchesSource;
    });

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSelected = new Set(leads.map(l => l.id));
            setSelectedLeads(newSelected);
        } else {
            setSelectedLeads(new Set());
        }
    };

    const handleSelectLead = (id: number, checked: boolean) => {
        const newSelected = new Set(selectedLeads);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        setSelectedLeads(newSelected);
    };

    const openAssignModal = (id: number) => {
        setCurrentLeadId(id);
        setAssignee('');
        setShowModal(true);
    };

    const confirmAssign = async () => {
        if (!assignee) {
            alert('请选择销售人员');
            return;
        }
        if (currentLeadId === null) return;

        const success = await assignLead(currentLeadId, assignee as number);
        if (success) {
            setLeads(leads.map(lead => 
                lead.id === currentLeadId ? { ...lead, assignedTo: assignee as number, assignedToName: salesPeople.find(s => s.id === assignee)?.name || '' } : lead
            ));
            setShowModal(false);
            setCurrentLeadId(null);
            alert('分配成功');
        }
    };

    const batchAssign = async () => {
        if (selectedLeads.size === 0) {
            alert('请先选择线索');
            return;
        }
        if (!batchAssignee) {
            alert('请选择销售人员');
            return;
        }

        const leadIds = Array.from(selectedLeads);
        const success = await batchAssignLeads(leadIds, batchAssignee as number);
        if (success) {
            setLeads(leads.map(lead => 
                selectedLeads.has(lead.id) ? { ...lead, assignedTo: batchAssignee as number, assignedToName: salesPeople.find(s => s.id === batchAssignee)?.name || '' } : lead
            ));
            setSelectedLeads(new Set());
            alert(`${selectedLeads.size} 条线索已批量分配`);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setPriorityFilter('');
        setSourceFilter('');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-gray-500">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-10 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">线索分配</h1>
                                <p className="text-sm text-gray-500 mt-1">为销售人员分配线索，支持单个分配或批量分配</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">分配方式：</div>
                            <div className="mt-2 flex space-x-2">
                                <button onClick={() => setMode('single')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'single' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    单个分配
                                </button>
                                <button onClick={() => setMode('batch')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'batch' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                                    批量分配
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Batch Action Bar */}
            {mode === 'batch' && (
                <div className="sticky top-[88px] z-40 bg-blue-50 border-b border-blue-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700">
                                    已选择 <span className="font-bold text-blue-600">{selectedLeads.size}</span> 条线索
                                </span>
                                <button onClick={() => handleSelectAll(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    全选
                                </button>
                                <button onClick={() => handleSelectAll(false)} className="text-sm text-gray-600 hover:text-gray-700">
                                    取消
                                </button>
                            </div>
                            <div className="flex space-x-2">
                                <select
                                    value={batchAssignee}
                                    onChange={(e) => setBatchAssignee(e.target.value ? Number(e.target.value) : '')}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">-- 选择销售人员 --</option>
                                    {salesPeople.map(sp => <option key={sp.id} value={sp.id}>{sp.name} ({sp.position || '销售'})</option>)}
                                </select>
                                <button onClick={batchAssign} disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : '批量分配'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">搜索线索</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="姓名、公司、电话"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                            >
                                <option value="">全部优先级</option>
                                <option value="high">高优先级</option>
                                <option value="medium">中优先级</option>
                                <option value="low">低优先级</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">来源</label>
                            <select
                                value={sourceFilter}
                                onChange={(e) => setSourceFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                            >
                                <option value="">全部来源</option>
                                <option value="website">官网</option>
                                <option value="phone">电话咨询</option>
                                <option value="email">邮件</option>
                                <option value="referral">转介绍</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
                            <button onClick={clearFilters} className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 font-medium transition-colors">
                                清除筛选
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lead List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={filteredLeads.length > 0 && selectedLeads.size === filteredLeads.length}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">线索信息</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">优先级</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">来源</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">当前分配</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredLeads.length > 0 ? (
                                    filteredLeads.map(lead => (
                                        <tr key={lead.id} className={`hover:bg-gray-50 transition-colors ${selectedLeads.has(lead.id) ? 'bg-blue-50' : ''}`}>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.has(lead.id)}
                                                    onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
                                                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{lead.title}</div>
                                                <div className="text-sm text-gray-500">{lead.description?.substring(0, 50)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${lead.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                    lead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {{ high: '高', medium: '中', low: '低' }[lead.priority] || lead.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                                    {{ website: '官网', phone: '电话', email: '邮件', referral: '转介绍', online: '线上推广', offline: '线下推广' }[lead.source] || lead.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {lead.assignedToName ? (
                                                    <>
                                                        <div className="text-sm text-gray-900 font-medium">{lead.assignedToName}</div>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-400">未分配</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button onClick={() => openAssignModal(lead.id)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                    分配
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            未找到线索
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">分配线索</h2>
                            <p className="text-sm text-gray-500 mt-1">线索：{leads.find(l => l.id === currentLeadId)?.title}</p>
                        </div>
                        <div className="px-6 py-4">
                            <label className="block text-sm font-medium text-gray-700 mb-3">选择销售人员</label>
                            <select
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value ? Number(e.target.value) : '')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">-- 选择销售人员 --</option>
                                {salesPeople.map(sp => <option key={sp.id} value={sp.id}>{sp.name} ({sp.position || '销售'})</option>)}
                            </select>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-700 mb-2">分配历史</p>
                                <div className="space-y-2 text-xs text-gray-500">
                                    <p>暂无分配记录</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
                                取消
                            </button>
                            <button onClick={confirmAssign} className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors">
                                确认分配
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadAssign;
