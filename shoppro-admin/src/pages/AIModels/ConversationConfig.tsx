import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Form, Input, Select, Tag, Switch, Space, Typography, Modal, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ConversationConfig: React.FC = () => {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRule, setEditingRule] = useState<any>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || '';
            const res = await fetch('/api/ai/coaching/rules', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.data) setRules(json.data);
        } catch (e) {
            message.error('加载辅导规则失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const token = localStorage.getItem('token') || '';
            await fetch('/api/ai/coaching/rules', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...editingRule, ...values, isEnabled: 1 })
            });
            message.success('规则保存成功');
            setModalVisible(false);
            loadRules();
        } catch (e) {
            message.error('保存失败');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const token = localStorage.getItem('token') || '';
            await fetch(`/api/ai/coaching/rules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            message.success('规则删除成功');
            loadRules();
        } catch (e) {
            message.error('删除失败');
        }
    };

    const columns = [
        {
            title: '触发关键词/意图',
            dataIndex: 'keyword',
            key: 'keyword',
            render: (text: string) => <Tag color="geekblue">{text}</Tag>
        },
        {
            title: '业务沟通场景',
            dataIndex: 'scenario',
            key: 'scenario',
            render: (text: string) => <strong>{text}</strong>
        },
        {
            title: 'AI 实时耳语应对话术卡片',
            dataIndex: 'suggestedResponse',
            key: 'suggestedResponse',
            ellipsis: true,
            width: 350
        },
        {
            title: '提示形式',
            dataIndex: 'actionType',
            key: 'actionType',
            render: (type: string) => (
                <Tag color={type === 'whisper' ? 'purple' : 'cyan'}>
                    {type === 'whisper' ? '实时耳语 (Whisper)' : '话术卡片 (Card)'}
                </Tag>
            )
        },
        {
            title: '状态',
            dataIndex: 'isEnabled',
            key: 'isEnabled',
            render: (val: number) => <Switch checked={val === 1} disabled />
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    <Button type="link" onClick={() => {
                        setEditingRule(record);
                        form.setFieldsValue(record);
                        setModalVisible(true);
                    }}>
                        编辑
                    </Button>
                    <Popconfirm title="确定删除该辅导规则吗？" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>🎙️ 会话智能与实时辅导规则配置</Title>
                        <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                            配置销售顾问在与客户电话或在线会议中，AI 实时捕获关键词时触发的应对话术与促成策略。
                        </Paragraph>
                    </div>
                    <Space>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                            setEditingRule(null);
                            form.resetFields();
                            setModalVisible(true);
                        }}>
                            新增辅导规则
                        </Button>
                        <Button icon={<SyncOutlined />} onClick={loadRules}>刷新</Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={rules}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>

            <Modal
                title={editingRule ? '编辑辅导规则' : '新增辅导规则'}
                open={modalVisible}
                onOk={handleSave}
                onCancel={() => setModalVisible(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="keyword" label="触发关键词 (如：价格太高、对比竞品、数据安全)" rules={[{ required: true }]}>
                        <Input placeholder="输入客户常提及的异议或关键词" />
                    </Form.Item>
                    <Form.Item name="scenario" label="适用业务场景" rules={[{ required: true }]}>
                        <Input placeholder="如：价格异议处理、竞品差异化、安全背书" />
                    </Form.Item>
                    <Form.Item name="suggestedResponse" label="建议应对话术卡片内容" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} placeholder="输入销售员可直接参考宣讲的最佳应对话术..." />
                    </Form.Item>
                    <Form.Item name="actionType" label="提示形式" initialValue="script_card">
                        <Select options={[
                            { label: '话术卡片 (高亮显示可复制)', value: 'script_card' },
                            { label: '实时耳语 (紧凑型浮窗提示)', value: 'whisper' },
                        ]} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ConversationConfig;
