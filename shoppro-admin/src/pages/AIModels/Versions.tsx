import React, { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';

const Versions: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const columns = [
        { title: '策略名称', dataIndex: 'name', key: 'name', render: (text: string) => <span className="font-bold">{text}</span> },
        { title: '适用版本', dataIndex: 'plan', key: 'plan', render: (plan: string) => <Tag color="blue">{plan}</Tag> },
        {
            title: '允许模型', dataIndex: 'models', key: 'models', render: (models: string[]) => (
                <Space size={[0, 8]} wrap>
                    {models.map(m => <Tag key={m}>{m}</Tag>)}
                </Space>
            )
        },
        { title: 'Token限额', dataIndex: 'limit', key: 'limit' },
        { title: '操作', key: 'action', render: (record: any) => <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} /> }
    ];

    const data = [
        { key: '1', name: 'Standard Policy', plan: 'Standard', models: ['GPT-3.5', 'Gemini Pro'], limit: '1M / Month' },
        { key: '2', name: 'Pro Policy', plan: 'Pro', models: ['GPT-4', 'Claude 3', 'Gemini Pro'], limit: '5M / Month' },
        { key: '3', name: 'Enterprise Policy', plan: 'Enterprise', models: ['ALL'], limit: 'Unlimited' },
    ];

    const handleEdit = (record: any) => {
        form.setFieldsValue({
            name: record.name,
            plan: record.plan,
            limit: record.limit
        });
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        message.success('策略已更新');
        setIsModalOpen(false);
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">模型版本策略控制</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setIsModalOpen(true); }}>新增策略</Button>
            </div>
            <Table columns={columns} dataSource={data} />

            <Modal title="配置策略" open={isModalOpen} onOk={handleSubmit} onCancel={() => setIsModalOpen(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="策略名称" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="plan" label="关联订阅版本">
                        <Select>
                            <Select.Option value="Standard">Standard</Select.Option>
                            <Select.Option value="Pro">Pro</Select.Option>
                            <Select.Option value="Enterprise">Enterprise</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="limit" label="Token 限额">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Versions;
