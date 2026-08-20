import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Space, Modal, Form, Input, message, Tag, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, CodeOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface PromptTemplate {
    id: number;
    name: string;
    code: string;
    content: string;
    description: string;
    variables: string | string[]; // Can be JSON string or array
    createdAt: string;
    updatedAt: string;
}

const PromptTemplates: React.FC = () => {
    const [data, setData] = useState<PromptTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PromptTemplate | null>(null);
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await request.get('/ai/prompt-templates');
            setData(res as any);
        } catch (error) {
            console.error('Failed to fetch prompt templates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAdd = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record: PromptTemplate) => {
        setEditingItem(record);
        form.setFieldsValue({
            ...record,
            variables: typeof record.variables === 'string' ? record.variables : JSON.stringify(record.variables)
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除这个提示词模板吗？这可能会导致相关的 AI 功能失效。',
            onOk: async () => {
                try {
                    await request.delete(`/ai/prompt-templates/${id}`);
                    message.success('删除成功');
                    fetchData();
                } catch (error) {
                    message.error('删除失败');
                }
            },
        });
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // Handle variables format
            let variables = values.variables;
            try {
                if (typeof variables === 'string' && variables.trim().startsWith('[')) {
                    variables = JSON.parse(variables);
                }
            } catch (e) {
                // Keep as string if not valid JSON array
            }

            const payload = { ...values, variables: JSON.stringify(variables) };

            if (editingItem) {
                await request.put(`/ai/prompt-templates/${editingItem.id}`, payload);
                message.success('更新成功');
            } else {
                await request.post('/ai/prompt-templates', payload);
                message.success('创建成功');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const columns = [
        {
            title: '模板名称',
            dataIndex: 'name',
            key: 'name',
            width: 150,
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: '唯一标识',
            dataIndex: 'code',
            key: 'code',
            width: 200,
            render: (code: string) => <Tag color="blue" icon={<CodeOutlined />}>{code}</Tag>
        },
        {
            title: '提示词内容',
            dataIndex: 'content',
            key: 'content',
            ellipsis: {
                showTitle: false,
            },
            render: (content: string) => (
                <Tooltip title={content}>
                    <div style={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {content}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: '变量',
            dataIndex: 'variables',
            key: 'variables',
            width: 150,
            render: (vars: any) => {
                let list = [];
                try {
                    list = typeof vars === 'string' ? JSON.parse(vars) : vars;
                } catch (e) {
                    list = [];
                }
                return (
                    <Space size={[0, 4]} wrap>
                        {Array.isArray(list) && list.map((v: string) => (
                            <Tag key={v} color="green">{`{${v}}`}</Tag>
                        ))}
                    </Space>
                );
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (_: any, record: PromptTemplate) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="text-blue-600"
                    />
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDelete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4">
            <Card
                title={
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>提示词模板管理</Title>
                        <Tooltip title="在这里配置所有 AI 功能的提示词，支持动态变量替换。">
                            <InfoCircleOutlined className="text-gray-400" />
                        </Tooltip>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        新增模板
                    </Button>
                }
                className="shadow-sm rounded-lg"
            >
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingItem ? '编辑提示词模板' : '新增提示词模板'}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                width={800}
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="name"
                            label="模板名称"
                            rules={[{ required: true, message: '请输入模板名称' }]}
                        >
                            <Input placeholder="例如：客户画像分析" />
                        </Form.Item>
                        <Form.Item
                            name="code"
                            label="唯一标识 (Code)"
                            rules={[{ required: true, message: '请输入唯一标识' }]}
                        >
                            <Input placeholder="例如：customer_profile" disabled={!!editingItem} />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="description"
                        label="描述"
                    >
                        <Input placeholder="模板用途简述" />
                    </Form.Item>

                    <Form.Item
                        name="variables"
                        label="支持变量"
                        tooltip="请输入 JSON 数组，例如: ['data', 'context']"
                    >
                        <Input placeholder="['data', 'user_info']" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="提示词内容 (Prompt Content)"
                        rules={[{ required: true, message: '请输入提示词内容' }]}
                        help="使用 {变量名} 作为占位符，例如：请分析以下数据：{data}"
                    >
                        <TextArea rows={10} placeholder="在这里编写 AI 提示词..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PromptTemplates;
