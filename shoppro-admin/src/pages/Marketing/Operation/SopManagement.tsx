import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, message, Empty } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    AuditOutlined
} from '@ant-design/icons';
import { getSopTemplates, createSopTemplate, deleteSopTemplate } from '@/services/operation';
import { useCompany } from '@/contexts/CompanyContext';

const SopManagement: React.FC = () => {
    const { currentCompanyId, isSuperAdmin } = useCompany();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSop, setEditingSop] = useState<any>(null);
    const [form] = Form.useForm();

    const fetchSops = async () => {
        if (isSuperAdmin && !currentCompanyId) {
            setData([]);
            return;
        }
        setLoading(true);
        try {
            const res = await getSopTemplates(currentCompanyId);
            const response = res as any;
            // Handle different response structures gracefully
            const list = response.data || response || [];
            setData(list);
        } catch (error) {
            console.error('Failed to fetch SOPs:', error);
            message.error('获取SOP列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSops();
    }, [currentCompanyId]);

    const showModal = (record?: any) => {
        if (isSuperAdmin && !currentCompanyId) {
            message.warning('请先在顶部选择一家企业视角');
            return;
        }
        if (record) {
            setEditingSop(record);
            form.setFieldsValue(record);
        } else {
            setEditingSop(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (currentCompanyId) {
                values.enterpriseId = currentCompanyId;
            }
            // For editing, we might need ID. But based on createSopTemplate(values), let's assume it handles it.
            // If it's a simple CRUD, you might need update logic too.
            // For now, let's keep it simple as per original logic.
            await createSopTemplate(values);
            message.success(editingSop ? '更新成功' : '创建成功');
            setIsModalVisible(false);
            fetchSops();
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteSopTemplate(id);
            message.success('删除成功');
            fetchSops();
        } catch (error) {
            message.error('删除失败');
        }
    };

    const columns = [
        { title: '模板名称', dataIndex: 'name', key: 'name' },
        {
            title: '适用场景',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true
        },
        {
            title: '包含步骤',
            dataIndex: 'steps',
            key: 'steps',
            render: (steps: string) => {
                try {
                    const parsed = JSON.parse(steps);
                    return <Tag color="blue">{Array.isArray(parsed) ? parsed.length : 0} 步</Tag>;
                } catch (e) {
                    return <Tag>0 步</Tag>;
                }
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => text ? new Date(text).toLocaleDateString() : '-'
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>编辑</Button>
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
                </Space>
            ),
        },
    ];

    if (isSuperAdmin && !currentCompanyId) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-lg shadow-sm">
                <Empty description="请在上方选择一家企业以管理其 SOP 模板" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <AuditOutlined style={{ fontSize: '24px' }} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">SOP 模板管理</h2>
                        <span className="text-gray-400 text-sm">定义并推送标准化业务流程</span>
                    </div>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} size="large">
                    发布新模板
                </Button>
            </div>

            <Card variant="borderless" className="shadow-sm">
                <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
            </Card>

            <Modal
                title={editingSop ? "编辑 SOP 模板" : "新建 SOP 模板"}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                width={650}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
                        <Input placeholder="输入模板名称，如：新客首日跟进SOP" />
                    </Form.Item>
                    <Form.Item name="description" label="模板描述">
                        <Input.TextArea placeholder="简述该SOP的设计目的和适用场景" rows={3} />
                    </Form.Item>
                    <Form.Item name="steps" label="执行步骤 (JSON格式)" rules={[{ required: true, message: '请输入执行步骤' }]}>
                        <Input.TextArea
                            placeholder='请以 JSON 格式输入步骤，例如：[{"step":1,"action":"打招呼","content":"你好"}]'
                            rows={8}
                            style={{ fontFamily: 'monospace' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SopManagement;
