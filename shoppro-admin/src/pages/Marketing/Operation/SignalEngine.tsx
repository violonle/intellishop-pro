import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Tag, Space, Typography, Tabs, message } from 'antd';
import { SyncOutlined, AlertOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const SignalEngine: React.FC = () => {
    const [activeTab, setActiveTab] = useState('types');
    const [signalTypes, setSignalTypes] = useState<any[]>([]);
    const [triggerRules, setTriggerRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || '';
            const [typesRes, rulesRes] = await Promise.all([
                fetch('/api/ai/signal-types', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/ai/trigger-rules', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const typesJson = await typesRes.json();
            const rulesJson = await rulesRes.json();
            if (typesJson.data) setSignalTypes(typesJson.data);
            if (rulesJson.data) setTriggerRules(rulesJson.data);
        } catch (e) {
            message.error('加载信号配置失败');
        } finally {
            setLoading(false);
        }
    };

    const typeColumns = [
        {
            title: '信号标识 (Code)',
            dataIndex: 'code',
            key: 'code',
            render: (text: string) => <Tag color="blue">{text}</Tag>
        },
        {
            title: '信号名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <strong>{text}</strong>
        },
        {
            title: '默认优先级',
            dataIndex: 'priority',
            key: 'priority',
            render: (p: string) => <Tag color={p === 'high' ? 'red' : p === 'medium' ? 'orange' : 'blue'}>{p.toUpperCase()}</Tag>
        },
        {
            title: '信号描述',
            dataIndex: 'description',
            key: 'description',
        }
    ];

    const ruleColumns = [
        {
            title: '规则名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <strong>{text}</strong>
        },
        {
            title: '监听信号类型',
            dataIndex: 'signalType',
            key: 'signalType',
            render: (text: string) => <Tag color="purple">{text}</Tag>
        },
        {
            title: '触发条件表达式',
            dataIndex: 'conditionExpr',
            key: 'conditionExpr',
            render: (expr: string) => <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{expr}</code>
        },
        {
            title: '自动执行动作',
            dataIndex: 'actionType',
            key: 'actionType',
            render: (action: string) => <Tag color="green">{action}</Tag>
        }
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>📡 智能信号与自动化触发引擎 (Signal Engine)</Title>
                        <Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                            监听客户行为信号（如报价单查看、商机超期沉默、决策人变更），并自动化触发 SOP 跟进或智能体分派。
                        </Paragraph>
                    </div>
                    <Space>
                        <Button icon={<SyncOutlined />} onClick={loadData}>刷新</Button>
                    </Space>
                </div>

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'types',
                            label: <span><AlertOutlined /> 信号类型定义 ({signalTypes.length})</span>,
                            children: <Table columns={typeColumns} dataSource={signalTypes} rowKey="id" loading={loading} pagination={false} />
                        },
                        {
                            key: 'rules',
                            label: <span><ThunderboltOutlined /> 自动化触发规则 ({triggerRules.length})</span>,
                            children: <Table columns={ruleColumns} dataSource={triggerRules} rowKey="id" loading={loading} pagination={false} />
                        }
                    ]}
                />
            </Card>
        </div>
    );
};

export default SignalEngine;
