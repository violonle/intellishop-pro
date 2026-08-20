import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Play, Pause, Trash2, Clock, FileText, Loader2, XCircle } from 'lucide-react';
import { http } from '../../services/http';

interface SopTemplate {
    id: number;
    name: string;
    description: string;
    triggerType: string;
    steps: SopStep[];
    isActive: boolean;
    createdAt: string;
}

interface SopStep {
    id: number;
    stepName: string;
    stepOrder: number;
    actionType: string;
    actionConfig: string;
    delayDays: number;
}

const SopManagement: React.FC = () => {
    const navigate = useNavigate();
    const [sopList, setSopList] = useState<SopTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        triggerType: 'manual',
        steps: [{ stepName: '', actionType: 'notification', delayDays: 0 }]
    });

    useEffect(() => {
        fetchSopList();
    }, []);

    const fetchSopList = async () => {
        setLoading(true);
        try {
            const result = await http.get<SopTemplate[]>('/operation/sop');
            setSopList(result || []);
        } catch (error) {
            console.error('获取SOP列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            alert('请输入SOP名称');
            return;
        }
        setSubmitting(true);
        try {
            await http.post('/operation/sop', {
                    name: formData.name,
                    description: formData.description,
                    triggerType: formData.triggerType,
                    steps: formData.steps.map((step, index) => ({
                        stepName: step.stepName,
                        stepOrder: index + 1,
                        actionType: step.actionType,
                        actionConfig: '{}',
                        delayDays: step.delayDays
                    }))
            });
            alert('SOP创建成功');
            setShowModal(false);
            resetForm();
            fetchSopList();
        } catch (error) {
            console.error('创建SOP失败:', error);
            alert('创建失败，请重试');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除这个SOP吗？')) return;
        try {
            await http.delete(`/operation/sop/${id}`);
            alert('删除成功');
            fetchSopList();
        } catch (error) {
            console.error('删除失败:', error);
        }
    };

    const handleToggleActive = async (sop: SopTemplate) => {
        try {
            await http.put(`/operation/sop/${sop.id}`, { isActive: !sop.isActive });
            fetchSopList();
        } catch (error) {
            console.error('更新状态失败:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            triggerType: 'manual',
            steps: [{ stepName: '', actionType: 'notification', delayDays: 0 }]
        });
    };

    const addStep = () => {
        setFormData({
            ...formData,
            steps: [...formData.steps, { stepName: '', actionType: 'notification', delayDays: 0 }]
        });
    };

    const updateStep = (index: number, field: string, value: any) => {
        const newSteps = [...formData.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setFormData({ ...formData, steps: newSteps });
    };

    const removeStep = (index: number) => {
        if (formData.steps.length <= 1) return;
        const newSteps = formData.steps.filter((_, i) => i !== index);
        setFormData({ ...formData, steps: newSteps });
    };

    const getTriggerTypeText = (type: string) => {
        const map: Record<string, string> = {
            'manual': '手动触发',
            'lead_created': '线索创建时',
            'customer_created': '客户创建时',
            'follow_up_due': '跟进到期时'
        };
        return map[type] || type;
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
        <div className="min-h-screen bg-gray-50 pb-10">
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">SOP 标准化运营</h1>
                                <p className="text-sm text-gray-500 mt-1">创建和管理客户跟进流程自动化</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            <span>创建SOP</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {sopList.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无SOP模板</h3>
                        <p className="text-gray-500 mb-6">创建您的第一个标准化运营流程</p>
                        <button
                            onClick={() => { resetForm(); setShowModal(true); }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            创建SOP
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sopList.map(sop => (
                            <div key={sop.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${sop.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                            <h3 className="font-semibold text-gray-900">{sop.name}</h3>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => handleToggleActive(sop)}
                                                className="p-1 text-gray-400 hover:text-blue-600"
                                                title={sop.isActive ? '停用' : '启用'}
                                            >
                                                {sop.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sop.id)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                title="删除"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{sop.description || '暂无描述'}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-400 mb-4">
                                        <span className="flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {getTriggerTypeText(sop.triggerType)}
                                        </span>
                                        <span className="flex items-center">
                                            <FileText className="w-3 h-3 mr-1" />
                                            {sop.steps?.length || 0} 步骤
                                        </span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <button className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                            查看详情
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">创建SOP模板</h2>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SOP名称 *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="例如：新客户7日跟进流程"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={2}
                                    placeholder="描述这个SOP的用途"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">触发类型</label>
                                <select
                                    value={formData.triggerType}
                                    onChange={(e) => setFormData({ ...formData, triggerType: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="manual">手动触发</option>
                                    <option value="lead_created">线索创建时</option>
                                    <option value="customer_created">客户创建时</option>
                                    <option value="follow_up_due">跟进到期时</option>
                                </select>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700">执行步骤</label>
                                    <button
                                        onClick={addStep}
                                        type="button"
                                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> 添加步骤
                                    </button>
                                </div>
                                {formData.steps.map((step, index) => (
                                    <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-gray-700">步骤 {index + 1}</span>
                                            {formData.steps.length > 1 && (
                                                <button
                                                    onClick={() => removeStep(index)}
                                                    type="button"
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">步骤名称</label>
                                                <input
                                                    type="text"
                                                    value={step.stepName}
                                                    onChange={(e) => updateStep(index, 'stepName', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                                                    placeholder="例如：发送欢迎短信"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">操作类型</label>
                                                <select
                                                    value={step.actionType}
                                                    onChange={(e) => updateStep(index, 'actionType', e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                                                >
                                                    <option value="notification">发送通知</option>
                                                    <option value="sms">发送短信</option>
                                                    <option value="email">发送邮件</option>
                                                    <option value="task">创建任务</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">延迟天数</label>
                                                <input
                                                    type="number"
                                                    value={step.delayDays}
                                                    onChange={(e) => updateStep(index, 'delayDays', parseInt(e.target.value) || 0)}
                                                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-2">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                            >
                                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                创建
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SopManagement;
