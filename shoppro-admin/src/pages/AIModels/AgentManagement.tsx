import React, { useState, useEffect } from 'react';
import { Table, Card, Switch, Button, Tag, Space, Typography, Form, Input, InputNumber, Select, message, Modal } from 'antd';
import { RobotOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface AgentConfig {
    id: number;
    agentType: string;
    name: string;
    description: string;
    isEnabled: number;
    executionFrequency: string;
    triggerThreshold: number;
    requireConfirmation: number;
    promptTemplateCode: string;
}

const AgentManagement: React.FC = () => {
    const [configs, setConfigs] = useState<AgentConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingConfig, setEditingConfig] = useState<AgentConfig | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || '';
            const res = await fetch('/api/ai/agents/configs', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.data) setConfigs(json.data);
        } catch (e) {
            message.error('加载智能体配置失败');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (record: AgentConfig, checked: boolean) => {
        try {
            const token = localStorage.getItem('token') || '';
            await fetch(`/api/ai/agents/configs/${record.agentType}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ isEnabled: checked ? 1 : 0 })
            });
            message.success(`${record.name} 状态已更新为 ${checked ? '启用' : '停用'}`);
            loadConfigs();
        } catch (e) {
            message.error('更新失败');
        }
    };

    const handleEdit = (record: AgentConfig) => {
        setEditingConfig(record);
        form.setFieldsValue({
            name: record.name,
            description: record.description,
            executionFrequency: record.executionFrequency,
            triggerThreshold: record.triggerThreshold,
            requireConfirmation: record.requireConfirmation
        });
        setModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const token = localStorage.getItem('token') || '';
            await fetch(`/api/ai/agents/configs/${editingConfig?.agentType}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });
            message.success('智能体配置保存成功');
            setModalVisible(false);
            loadConfigs();
        } catch (e) {
            message.error('保存失败');
        }
    };

    const columns = [
        {
            title: '智能体名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: AgentConfig) => (
                <Space>
                    <RobotOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                    <div>
                        <strong>{text}</strong>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>Type: {record.agentType}</div>
                    </div>
                </Space>
            )
        },
        {
            title: '业务说明',
            dataIndex: 'description',
            key: 'description',
            width: 300,
        },
        {
            title: '执行巡检频率',
            dataIndex: 'executionFrequency',
            key: 'executionFrequency',
            render: (freq: string) => <Tag color="blue">{freq}</Tag>
        },
        {
            title: '触发阈值',
            dataIndex: 'triggerThreshold',
            key: 'triggerThreshold',
            render: (val: number) => <span>评分 &gt; {val}</span>
        },
        {
            title: '执行模式',
            dataIndex: 'requireConfirmation',
            key: 'requireConfirmation',
            render: (val: number) => (
                <Tag color={val === 1 ? 'orange' : 'green'}>
                    {val === 1 ? '人工确认模式' : '全自主执行'}
                </Tag>
            )
        },
        {
            title: '启停开关',
            dataIndex: 'isEnabled',
            key: 'isEnabled',
            render: (val: number, record: AgentConfig) => (
                <Switch
                    checked={val === 1}
                    onChange={(checked) => handleToggle(record, checked)}
                />
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: AgentConfig) => (
                <Button type="link" icon={<SettingOutlined />} onClick={() => handleEdit(record)}>
                    参数配置
                </Button>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>🤖 AI 销售智能体管理 (Agentic CRM)</Title>
                        <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                            统一配置 SDR 获客开发、智能跟进提醒与成单教练三大自主执行智能体的运行策略与触发规则。
                        </Paragraph>
                    </div>
                    <Button icon={<SyncOutlined />} onClick={loadConfigs}>刷新数据</Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={configs}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>

            <Modal
                title={`配置 ${editingConfig?.name}`}
                open={modalVisible}
                onOk={handleSave}
                onCancel={() => setModalVisible(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="智能体名称" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="功能描述">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="executionFrequency" label="自动巡检周期" rules={[{ required: true }]}>
                        <Select options={[
                            { label: '每 30 分钟 (实时性高)', value: '30m' },
                            { label: '每 1 小时', value: '1h' },
                            { label: '每 2 小时 (推荐)', value: '2h' },
                            { label: '每日一次 (低频)', value: 'daily' },
                        ]} />
                    </Form.Item>
                    <Form.Item name="triggerThreshold" label="线索评分触发阈值">
                        <InputNumber min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="requireConfirmation" label="执行确认机制">
                        <Select options={[
                            { label: '人工确认模式 (推荐：由销售审阅一键发送)', value: 1 },
                            { label: '全自主模式 (AI 直接通过企微/短信发送)', value: 0 },
                        ]} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AgentManagement;
