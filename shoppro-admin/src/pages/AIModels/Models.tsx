import React, { useState, useEffect } from 'react';
import { Card, Table, Switch, Button, Tag, Space, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, ApiOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllAiModels, createAiModel, updateAiModel, toggleAiModelStatus, deleteAiModel } from '@/services/aimodel';
import type { AiModel } from '@/services/aimodel';

const Models: React.FC = () => {
    const [modelForm] = Form.useForm();
    const [isModelModalOpen, setIsModelModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AiModel[]>([]);

    const fetchModels = async () => {
        setLoading(true);
        try {
            const res = await getAllAiModels();
            const response = res as any;
            if (Array.isArray(response)) {
                setData(response);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    const handleToggleStatus = async (id: number) => {
        try {
            await toggleAiModelStatus(id);
            message.success('状态已切换');
            fetchModels();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: '确认删除',
            content: '删除后该模型配置将失效，确定吗？',
            onOk: async () => {
                try {
                    await deleteAiModel(id);
                    message.success('已删除');
                    fetchModels();
                } catch (error) {
                    console.error(error);
                }
            }
        });
    };

    const columns = [
        { title: '模型名称', dataIndex: 'name', render: (text: string) => <div className="font-bold flex items-center gap-2"><ApiOutlined /> {text}</div> },
        { title: '供应商', dataIndex: 'provider', render: (text: string) => <Tag>{text}</Tag> },
        { title: '版本', dataIndex: 'version' },
        { title: '状态', dataIndex: 'status', render: (status: number, record: AiModel) => <Switch checked={status === 1} onChange={() => handleToggleStatus(record.id)} /> },
        { title: 'RPM限制', dataIndex: 'rpm' },
        {
            title: '操作',
            render: (record: AiModel) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => openModelModal('edit', record)} />
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                </Space>
            )
        }
    ];

    const openModelModal = (mode: 'add' | 'edit', record?: AiModel) => {
        setModalMode(mode);
        if (mode === 'edit' && record) {
            setEditingId(record.id);
            modelForm.setFieldsValue(record);
        } else {
            setEditingId(null);
            modelForm.resetFields();
        }
        setIsModelModalOpen(true);
    };

    const handleModelSubmit = async () => {
        try {
            const values = await modelForm.validateFields();
            if (modalMode === 'add') {
                await createAiModel({ ...values, status: 1 });
                message.success('模型已接入');
            } else if (editingId) {
                await updateAiModel(editingId, values);
                message.success('配置已保存');
            }
            setIsModelModalOpen(false);
            fetchModels();
        } catch (error) {
            console.error(error);
        }
    };



    const [categoryConfigs, setCategoryConfigs] = useState<Record<string, string>>({});



    const handleCategoryConfigChange = (category: string, value: string) => {
        setCategoryConfigs(prev => ({ ...prev, [category]: value }));
    };

    const handleSaveCategoryPolicy = async (category: string) => {
        const modelName = categoryConfigs[category];
        if (!modelName) {
            message.warning('请先选择模型');
            return;
        }
        try {
            const { updateScenarioCategory } = await import('@/services/aimodel');
            await updateScenarioCategory(category, modelName);
            message.success('策略已更新');
        } catch (error) {
            console.error(error);
            message.error('更新失败');
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">大模型管理</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModelModal('add')}>接入新模型</Button>
            </div>

            <Card title="已接入模型列表" variant="borderless" className="shadow-sm">
                <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={false} />
                {data.length === 0 && !loading && <div className="py-10 text-center text-gray-400">暂无接入模型，请点击上方按钮接入</div>}
            </Card>

            <Card title="全局场景策略配置" variant="borderless" className="shadow-sm mt-6">
                <div className="space-y-6">
                    {[
                        {
                            key: 'conversation',
                            name: '对话场景',
                            description: '包含：AI 智能助理、智能话术推荐等场景',
                            icon: '💬'
                        },
                        {
                            key: 'analysis',
                            name: '分析场景',
                            description: '包含：销售团队洞察、用户画像分析、线索智能评估、AI 智能洞察等场景',
                            icon: '📊'
                        },
                        {
                            key: 'prediction',
                            name: '预测场景',
                            description: '包含：智能风险预警等场景',
                            icon: '🔮'
                        }
                    ].map(category => {
                        const currentModel = categoryConfigs[category.key] || '未配置';

                        return (
                            <div key={category.key} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                                            <span>{category.icon}</span>
                                            <span>{category.name}</span>
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-3">{category.description}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-600">当前模型：</span>
                                            <Select
                                                style={{ width: 280 }}
                                                placeholder="选择大模型"
                                                value={currentModel}
                                                onChange={(value) => handleCategoryConfigChange(category.key, value)}
                                            >
                                                {data.map(model => (
                                                    <Select.Option key={model.id} value={model.version}>
                                                        {model.name} ({model.provider})
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={() => handleSaveCategoryPolicy(category.key)}
                                            >
                                                保存
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Modal
                title={modalMode === 'add' ? '接入新模型' : '编辑模型配置'}
                open={isModelModalOpen}
                onOk={handleModelSubmit}
                onCancel={() => setIsModelModalOpen(false)}
                okText="确定"
                cancelText="取消"
            >
                <Form form={modelForm} layout="vertical">
                    <Form.Item name="name" label="模型显示名称" rules={[{ required: true }]}>
                        <Input placeholder="e.g. GPT-4 生产环境" />
                    </Form.Item>
                    <Form.Item name="provider" label="供应商" rules={[{ required: true }]}>
                        <Select placeholder="选择供应商">
                            <Select.Option value="OpenAI">OpenAI</Select.Option>
                            <Select.Option value="Anthropic">Anthropic</Select.Option>
                            <Select.Option value="Google">Google</Select.Option>
                            <Select.Option value="Moonshot">Moonshot AI</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="version" label="API Model ID" rules={[{ required: true }]}>
                        <Input placeholder="e.g. gpt-4-turbo-preview" />
                    </Form.Item>
                    <Form.Item name="rpm" label="RPM 限制 (每分钟请求数)">
                        <Input placeholder="e.g. 10000" />
                    </Form.Item>
                    <Form.Item name="baseUrl" label="API Base URL (可选)">
                        <Input placeholder="https://api.openai.com/v1" />
                    </Form.Item>
                    <Form.Item name="apiKey" label="API Key">
                        <Input.Password placeholder="sk-..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Models;
