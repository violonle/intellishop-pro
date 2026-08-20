import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Select, Space, Typography, Button } from 'antd';
import { SyncOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const AgentLogs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterAgent, setFilterAgent] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        loadLogs();
    }, [filterAgent, filterStatus]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || '';
            const res = await fetch(`/api/ai/agents/logs?agentType=${filterAgent}&status=${filterStatus}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.data) setLogs(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: '智能体类型',
            dataIndex: 'agentType',
            key: 'agentType',
            render: (type: string) => {
                switch (type) {
                    case 'sdr': return <Tag color="blue">SDR 智能体</Tag>;
                    case 'follow_up': return <Tag color="green">跟进智能体</Tag>;
                    case 'deal_coach': return <Tag color="purple">成单教练</Tag>;
                    default: return <Tag>{type}</Tag>;
                }
            }
        },
        {
            title: '任务标题',
            dataIndex: 'title',
            key: 'title',
            width: 250,
        },
        {
            title: '关联对象',
            dataIndex: 'targetName',
            key: 'targetName',
        },
        {
            title: '指派销售',
            dataIndex: 'assignedSalesName',
            key: 'assignedSalesName',
            render: (text: string) => text || '暂无'
        },
        {
            title: 'AI 生成方案概览',
            dataIndex: 'generatedContent',
            key: 'generatedContent',
            ellipsis: true,
            width: 300,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                switch (status) {
                    case 'confirmed': return <Tag icon={<CheckCircleOutlined />} color="success">已确认执行</Tag>;
                    case 'rejected': return <Tag icon={<CloseCircleOutlined />} color="error">已驳回</Tag>;
                    default: return <Tag icon={<ClockCircleOutlined />} color="warning">待审阅</Tag>;
                }
            }
        },
        {
            title: '时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text: string) => text || '暂无'
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>📋 智能体执行审计日志</Title>
                        <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                            实时审计与回溯全租户各业务智能体的任务生成、方案采纳与执行记录。
                        </Paragraph>
                    </div>
                    <Space>
                        <Select
                            value={filterAgent}
                            onChange={setFilterAgent}
                            style={{ width: 140 }}
                            options={[
                                { label: '全部智能体', value: 'all' },
                                { label: 'SDR 智能体', value: 'sdr' },
                                { label: '跟进智能体', value: 'follow_up' },
                                { label: '成单教练', value: 'deal_coach' }
                            ]}
                        />
                        <Select
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: 120 }}
                            options={[
                                { label: '全部状态', value: 'all' },
                                { label: '待审阅', value: 'pending' },
                                { label: '已确认', value: 'confirmed' },
                                { label: '已驳回', value: 'rejected' }
                            ]}
                        />
                        <Button icon={<SyncOutlined />} onClick={loadLogs}>刷新</Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default AgentLogs;
