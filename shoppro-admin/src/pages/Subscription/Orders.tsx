import React, { useState } from 'react';
import { Table, Tag, Card, Input, DatePicker, Space, Button, Modal, Descriptions, message } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';

const Orders: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<any>(null);

    const handleSearch = () => {
        message.loading('查询中...', 0.5);
    };

    const handleExport = () => {
        message.success('报表导出中...');
    };

    const showDetail = (record: any) => {
        setCurrentOrder(record);
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: '订单号',
            dataIndex: 'id',
            render: (text: string, record: any) => (
                <a className="text-primary font-bold hover:underline" onClick={() => showDetail(record)}>{text}</a>
            )
        },
        { title: '租户名称', dataIndex: 'tenant' },
        { title: '订阅版本', dataIndex: 'plan', render: (text: string) => <Tag color="blue">{text}</Tag> },
        { title: '金额', dataIndex: 'amount', render: (val: number) => `¥ ${val.toLocaleString()}` },
        { title: '支付方式', dataIndex: 'payment' },
        { title: '状态', dataIndex: 'status', render: (status: string) => <Tag color="success">{status}</Tag> },
        { title: '支付时间', dataIndex: 'date' },
    ];

    const data = Array.from({ length: 10 }).map((_, i) => ({
        id: `ORD-${20240101 + i}`,
        tenant: `Tenant ${i + 1}`,
        plan: i % 2 === 0 ? 'Pro' : 'Standard',
        amount: i % 2 === 0 ? 19999 : 9999,
        payment: 'Alipay',
        status: 'Paid',
        date: '2024-01-15 10:00:00',
    }));

    return (
        <div className="animate-fade-in">
            <Card bordered={false} className="shadow-sm">
                <div className="flex justify-between mb-4">
                    <Space>
                        <Input placeholder="订单号/租户" prefix={<SearchOutlined />} />
                        <DatePicker.RangePicker />
                        <Button type="primary" onClick={handleSearch}>查询</Button>
                    </Space>
                    <Button icon={<DownloadOutlined />} onClick={handleExport}>导出报表</Button>
                </div>
                <Table columns={columns} dataSource={data} rowKey="id" />
            </Card>

            <Modal title="订单详情" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={600}>
                {currentOrder && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="订单号">{currentOrder.id}</Descriptions.Item>
                        <Descriptions.Item label="租户名称">{currentOrder.tenant}</Descriptions.Item>
                        <Descriptions.Item label="订阅版本">{currentOrder.plan}</Descriptions.Item>
                        <Descriptions.Item label="支付金额">¥ {currentOrder.amount}</Descriptions.Item>
                        <Descriptions.Item label="支付方式">{currentOrder.payment}</Descriptions.Item>
                        <Descriptions.Item label="支付时间">{currentOrder.date}</Descriptions.Item>
                        <Descriptions.Item label="交易流水号">TRX_88293847293</Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default Orders;
